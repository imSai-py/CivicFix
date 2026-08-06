import os

from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple
import uuid
from src.domain.common.exceptions import DomainException
from src.infrastructure.storage.interface import StorageAdapterInterface


class LocalStorageAdapter(StorageAdapterInterface):
    """
    Local Filesystem Storage Adapter.
    Validates file sizes, mime types, sanitizes filenames, and stores on disk.
    """
    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB limit

    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_upload_dir = Path(base_upload_dir)

    async def save_file(
        self,
        file_bytes: bytes,
        file_name: str,
        mime_type: str
    ) -> Tuple[str, str, int]:
        if mime_type not in self.ALLOWED_MIME_TYPES:
            raise DomainException(f"Unsupported media MIME type: '{mime_type}'. Only JPEG and PNG allowed.")

        file_size = len(file_bytes)
        if file_size > self.MAX_FILE_SIZE_BYTES:
            raise DomainException(f"File size {file_size} bytes exceeds maximum allowed limit of 10 MB.")

        now = datetime.now(timezone.utc)
        sub_dir = self.base_upload_dir / str(now.year) / f"{now.month:02d}"
        os.makedirs(sub_dir, exist_ok=True)

        ext = Path(file_name).suffix.lower() or (".jpg" if mime_type == "image/jpeg" else ".png")
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        target_path = sub_dir / unique_filename

        with open(target_path, "wb") as f:
            f.write(file_bytes)

        relative_path = f"/uploads/{now.year}/{now.month:02d}/{unique_filename}"
        return relative_path, file_name, file_size

    async def upload(
        self,
        file_bytes: bytes,
        file_name: str,
        mime_type: str
    ) -> str:
        relative_path, _, _ = await self.save_file(file_bytes, file_name, mime_type)
        return relative_path
