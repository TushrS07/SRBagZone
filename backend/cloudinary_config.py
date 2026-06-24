import cloudinary
from config import settings


def init_cloudinary() -> None:
    if not settings.cloudinary_cloud_name:
        print("[cloudinary] Skipped (no credentials configured)")
        return
    cloudinary.config(
        cloud_name=settings.cloudinary_cloud_name,
        api_key=settings.cloudinary_api_key,
        api_secret=settings.cloudinary_api_secret,
        secure=True,
    )
    print("[cloudinary] Initialized")
