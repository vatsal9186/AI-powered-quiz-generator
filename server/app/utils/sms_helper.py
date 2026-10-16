import urllib.request
import urllib.parse
import urllib.error
import base64
import json
import smtplib
from email.mime.text import MIMEText
from app.config import settings

def normalize_phone_number(identifier: str) -> tuple[bool, str, str]:
    """
    Normalizes input identifier (email or mobile number).
    Returns: (is_email, e164_phone, ten_digit_phone)
    """
    identifier = identifier.strip()
    if "@" in identifier:
        return True, identifier, identifier

    has_plus = identifier.startswith("+")
    digits = ''.join(filter(str.isdigit, identifier))

    if not digits:
        return False, "", ""

    # Strip leading zero if 11 digits (e.g. 09876543210 -> 9876543210)
    if not has_plus and len(digits) == 11 and digits.startswith("0"):
        digits = digits[1:]

    # Calculate E.164 and 10-digit number
    if has_plus:
        e164_phone = f"+{digits}"
    elif len(digits) == 10:
        # Default to Indian country code +91 for standard 10-digit numbers
        e164_phone = f"+91{digits}"
    elif len(digits) > 10 and digits.startswith("91"):
        e164_phone = f"+{digits}"
    else:
        e164_phone = f"+{digits}"

    ten_digit_phone = digits[-10:] if len(digits) >= 10 else digits
    return False, e164_phone, ten_digit_phone


def send_otp_sms(identifier: str, otp_code: str) -> dict:
    """
    Dispatches a real 6-digit OTP code to a mobile number via configured SMS provider.
    Supports Fast2SMS API, Twilio SMS API, Textbelt API, 2Factor API, or custom HTTP SMS API.
    """
    identifier = identifier.strip()
    is_email, e164_phone, ten_digit_phone = normalize_phone_number(identifier)

    message_text = f"Your AI Quiz Generator password reset OTP is: {otp_code}. This OTP is valid for 5 minutes. Do not share this OTP with anyone."
    
    last_error = None

    # 1. EMAIL DISPATCH VIA SMTP
    if is_email and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            msg = MIMEText(message_text)
            msg["Subject"] = "AI Quiz Generator Password Reset OTP Code"
            msg["From"] = settings.SMTP_USER
            msg["To"] = identifier

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            print(f"[EMAIL SERVICE] Dispatched OTP to {identifier} via SMTP ({settings.SMTP_HOST})")
            return {
                "sent": True,
                "provider": "SMTP Email Gateway",
                "channel": "Email"
            }
        except Exception as e:
            print(f"[EMAIL SERVICE ERROR] Failed to send email to {identifier}: {e}")
            last_error = f"Email delivery failed: {e}"

    # 2. CUSTOM GENERIC SMS API PROVIDER
    if not is_email and settings.SMS_PROVIDER and settings.SMS_API_KEY:
        try:
            url = settings.SMS_PROVIDER
            params = {
                "api_key": settings.SMS_API_KEY,
                "to": e164_phone,
                "message": message_text,
                "sender": settings.SMS_SENDER_ID or "QUIZAI"
            }
            if settings.SMS_API_SECRET:
                params["api_secret"] = settings.SMS_API_SECRET

            data = urllib.parse.urlencode(params).encode("utf-8")
            req = urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                print(f"[GENERIC SMS PROVIDER] Dispatched OTP SMS to {e164_phone}")
                return {"sent": True, "provider": settings.SMS_PROVIDER, "channel": "SMS"}
        except Exception as e:
            print(f"[GENERIC SMS PROVIDER ERROR] {e}")
            last_error = f"Generic SMS error: {e}"

    # 3. FAST2SMS API (Indian Mobile Numbers)
    if not is_email and settings.FAST2SMS_API_KEY:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            headers = {
                "authorization": settings.FAST2SMS_API_KEY,
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }

            # Try OTP Route
            payload = json.dumps({
                "route": "otp",
                "variables_values": otp_code,
                "numbers": ten_digit_phone
            }).encode("utf-8")

            req = urllib.request.Request(url, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                if res_data.get("return") is True or res_data.get("status_code") == 200:
                    print(f"[FAST2SMS API] Successfully dispatched SMS OTP to {ten_digit_phone}")
                    return {
                        "sent": True,
                        "provider": "Fast2SMS API",
                        "channel": "SMS"
                    }
                else:
                    msg = res_data.get("message", res_data)
                    print(f"[FAST2SMS API NOTICE] {msg}")
                    last_error = f"Fast2SMS API Notice: {msg}"
        except urllib.error.HTTPError as http_err:
            try:
                err_body = http_err.read().decode("utf-8")
                err_json = json.loads(err_body)
                msg = err_json.get("message", err_body)
                code = err_json.get("status_code", http_err.code)
                print(f"[FAST2SMS API ERROR {code}] {msg}")
                last_error = f"Fast2SMS Notice ({code}): {msg}"
            except Exception:
                print(f"[FAST2SMS HTTP ERROR] {http_err}")
                last_error = f"Fast2SMS HTTP Error: {http_err}"
        except Exception as e:
            print(f"[FAST2SMS ERROR] {e}")
            last_error = f"Fast2SMS Connection Error: {e}"

    # 4. TWILIO SMS API
    if not is_email and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_PHONE_NUMBER:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
            data = urllib.parse.urlencode({
                "To": e164_phone,
                "From": settings.TWILIO_PHONE_NUMBER,
                "Body": message_text
            }).encode("utf-8")

            req = urllib.request.Request(url, data=data, method="POST")
            auth_header = base64.b64encode(f"{settings.TWILIO_ACCOUNT_SID}:{settings.TWILIO_AUTH_TOKEN}".encode("utf-8")).decode("utf-8")
            req.add_header("Authorization", f"Basic {auth_header}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            req.add_header("User-Agent", "Mozilla/5.0")

            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                print(f"[TWILIO SMS API] Dispatched SMS OTP to {e164_phone} (SID: {result.get('sid')})")
                return {
                    "sent": True,
                    "provider": "Twilio SMS API",
                    "channel": "SMS"
                }
        except Exception as e:
            print(f"[TWILIO ERROR] {e}")
            last_error = f"Twilio SMS Error: {e}"

    # 5. 2FACTOR SMS API
    if not is_email and settings.TWOFACTOR_API_KEY:
        try:
            url = f"https://2factor.in/API/V1/{settings.TWOFACTOR_API_KEY}/SMS/{ten_digit_phone}/{otp_code}/AUTOGEN"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}, method="GET")
            with urllib.request.urlopen(req, timeout=8) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                if res_data.get("Status") == "Success":
                    print(f"[2FACTOR SMS API] Dispatched SMS OTP to {ten_digit_phone}")
                    return {
                        "sent": True,
                        "provider": "2Factor SMS API",
                        "channel": "SMS"
                    }
                else:
                    last_error = f"2Factor Error: {res_data.get('Details')}"
        except Exception as e:
            print(f"[2FACTOR ERROR] {e}")
            last_error = f"2Factor Connection Error: {e}"

    # 6. TEXTBELT SMS API
    if not is_email and settings.TEXTBELT_API_KEY:
        try:
            url = "https://textbelt.com/text"
            data = urllib.parse.urlencode({
                "phone": e164_phone,
                "message": message_text,
                "key": settings.TEXTBELT_API_KEY
            }).encode("utf-8")

            req = urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}, method="POST")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")

            with urllib.request.urlopen(req, timeout=8) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                if res_data.get("success") is True:
                    print(f"[TEXTBELT SMS API] Successfully dispatched SMS OTP to {e164_phone}")
                    return {
                        "sent": True,
                        "provider": "Textbelt SMS API",
                        "channel": "SMS"
                    }
                else:
                    last_error = f"Textbelt Error: {res_data.get('error')}"
        except Exception as e:
            print(f"[TEXTBELT ERROR] {e}")

    # Developer Fallback & Log Output
    destination = identifier if is_email else f"{e164_phone} (Raw: {ten_digit_phone})"
    print(f"\n============================================================")
    print(f"[SMS SERVICE OTP LOG]")
    print(f"Destination Mobile : {destination}")
    print(f"Generated OTP Code : {otp_code}")
    if last_error:
        print(f"SMS Gateway Notice : {last_error}")
    print(f"Dev Info           : Enter code '{otp_code}' directly in UI for testing.")
    print(f"============================================================\n")

    return {
        "sent": False if last_error else True,
        "provider": "Fast2SMS / SMS Gateway",
        "channel": "SMS",
        "error": last_error or "SMS Gateway notice. Check server console for OTP code.",
        "otp_code_dev": otp_code
    }


def send_dynamic_otp(identifier: str, otp_code: str) -> dict:
    return send_otp_sms(identifier, otp_code)



