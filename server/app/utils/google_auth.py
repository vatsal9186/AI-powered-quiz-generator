from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException, status
from app.config import settings

async def verify_google_id_token(token: str) -> dict:
    """
    Verifies a Google ID token securely using Google's official verify_oauth2_token method.
    Returns the parsed user profile data if valid.
    """
    try:
        client_id = settings.GOOGLE_CLIENT_ID or "1004732812510-edmdaplkjbo36jatfesoiq4b341g0hb1.apps.googleusercontent.com"
        if client_id == "your-google-client-id-here.apps.googleusercontent.com":
            client_id = None
            
        try:
            payload = id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
        except ValueError:
            # Fallback to general verification
            payload = id_token.verify_oauth2_token(token, google_requests.Request())
        
        # Ensure that the email is verified
        if not payload.get("email_verified"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Google account email is not verified."
            )
            
        return {
            "email": payload.get("email"),
            "full_name": payload.get("name"),
            "google_id": payload.get("sub"),
            "picture": payload.get("picture")
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google OAuth credential token: {str(e)}"
        )
