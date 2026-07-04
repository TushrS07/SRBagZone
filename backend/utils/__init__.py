import asyncio
import logging
from dataclasses import dataclass
from typing import List, Optional
import cloudinary.uploader
from fastapi import UploadFile, HTTPException, status

logger = logging.getLogger(__name__)

MAX_UPLOAD_BYTES = 30 * 1024 * 1024  # 30 MB


@dataclass
class MediaAsset:
    """Lightweight uploaded-asset value object (decoupled from any DB model)."""
    url: str
    public_id: str
    resource_type: str = "image"


def check_upload_size(file: UploadFile) -> None:
    """Reject uploads larger than MAX_UPLOAD_BYTES with HTTP 413."""
    if file.size and file.size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail={
                "message": f"File '{file.filename}' is too large. "
                f"Maximum size is {MAX_UPLOAD_BYTES // (1024 * 1024)} MB."
            },
        )


async def upload_file(
    file: UploadFile,
    folder: str = "srbagzone/products",
) -> Optional[MediaAsset]:
    check_upload_size(file)
    """Upload a single file to Cloudinary in a thread pool (SDK is sync)."""
    content = await file.read()
    if not content:
        logger.warning("[cloudinary] Empty file skipped: %s", file.filename)
        return None

    content_type = file.content_type or ""
    resource_type = "video" if content_type.startswith("video/") else "image"

    loop = asyncio.get_running_loop()

    def _upload():
        return cloudinary.uploader.upload(
            content,
            folder=folder,
            resource_type=resource_type,
            quality="auto",
            fetch_format="auto",
        )

    try:
        result = await loop.run_in_executor(None, _upload)
    except Exception as e:
        logger.error("[cloudinary] Upload FAILED for %s: %s", file.filename, e)
        raise

    return MediaAsset(
        url=result["secure_url"],
        public_id=result["public_id"],
        resource_type=resource_type,
    )


async def upload_files(
    files: List[UploadFile],
    folder: str = "srbagzone/products",
) -> List[MediaAsset]:
    """Upload multiple files concurrently."""
    # Reject the whole batch upfront if any file is too large
    for f in files:
        check_upload_size(f)
    tasks = [upload_file(f, folder) for f in files]
    results = await asyncio.gather(*tasks)
    return [r for r in results if r is not None]


async def delete_asset(public_id: str, resource_type: str = "image") -> None:
    loop = asyncio.get_running_loop()

    def _delete():
        cloudinary.uploader.destroy(public_id, resource_type=resource_type)

    await loop.run_in_executor(None, _delete)


async def delete_assets(assets: List[MediaAsset]) -> None:
    """Delete many assets concurrently; failures don't cancel siblings."""
    tasks = [delete_asset(a.public_id, a.resource_type) for a in assets]
    await asyncio.gather(*tasks, return_exceptions=True)
