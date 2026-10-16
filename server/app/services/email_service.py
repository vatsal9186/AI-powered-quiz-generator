import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
from app.utils.email_helper import send_otp_email as helper_send_otp_email

class EmailService:
    """
    Reusable email service for dispatching verification and system emails via SMTP.
    Supports STARTTLS on port 587 (Gmail SMTP compatible).
    """

    @staticmethod
    def send_verification_otp(target_email: str, otp_code: str) -> dict:
        """
        Sends a 6-digit OTP code to a user's email address via Gmail SMTP.
        """
        return helper_send_otp_email(target_email, otp_code)

def send_otp_email(target_email: str, otp_code: str) -> dict:
    """
    Convenience function wrapper for sending OTP email.
    """
    return EmailService.send_verification_otp(target_email, otp_code)
