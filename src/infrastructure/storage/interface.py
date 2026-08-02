from abc import ABC, abstractmethod
from typing import Tuple


class StorageAdapterInterface(ABC):
    """Abstract Storage Adapter Interface (Ports & Adapters)."""

    @abstractmethod
    async def save_file(
        self,
        file_bytes: bytes,
        file_name: str,
        mime_type: str
    ) -> Tuple[str, str, int]:
        """
        Saves file to underlying storage system (local disk / S3).
        Returns Tuple[relative_file_path, sanitized_file_name, file_size_bytes].
        """
        pass
