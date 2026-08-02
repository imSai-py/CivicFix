from datetime import datetime
from typing import Dict, List, Literal, Optional, Any
import uuid
from pydantic import BaseModel, ConfigDict, Field
from src.domain.issues.issue_entity import AuditAction, IssuePriority, IssueStatus


class CoordinatesDTO(BaseModel):
    """Geographic position payload."""
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinate (-90 to 90)")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinate (-180 to 180)")
    address: Optional[str] = Field(None, max_length=255, description="Physical street address")


class CreateIssueDTO(BaseModel):
    """Input payload for creating a civic issue report."""
    title: str = Field(..., min_length=5, max_length=150, description="Issue summary title")
    description: str = Field(..., min_length=10, max_length=2000, description="Detailed problem description")
    category_id: uuid.UUID = Field(..., description="UUID of selecting category")
    location: CoordinatesDTO = Field(..., description="Issue location coordinates")
    priority: Optional[IssuePriority] = Field(IssuePriority.MEDIUM, description="Urgency priority tag")


class UpdateIssueStatusDTO(BaseModel):
    """Input payload for official status state transitions."""
    status: IssueStatus = Field(..., description="Target lifecycle state")
    priority: Optional[IssuePriority] = Field(None, description="Optional updated priority")
    remarks: Optional[str] = Field(None, max_length=1000, description="Official status transition remarks")


class ApproveReportDTO(BaseModel):
    """Input payload for approving a report."""
    remarks: Optional[str] = Field(None, max_length=1000, description="Approval notes")


class RejectReportDTO(BaseModel):
    """Input payload for rejecting a report."""
    remarks: str = Field(..., min_length=5, max_length=1000, description="Rejection reason mandatory remarks")


class AssignDepartmentDTO(BaseModel):
    """Input payload for assigning a report to a municipal department/worker."""
    department_id: uuid.UUID = Field(..., description="Target department UUID")
    remarks: Optional[str] = Field(None, max_length=1000, description="Assignment remarks")


class AuditLogResponseDTO(BaseModel):
    """Audit Log output DTO."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    issue_id: uuid.UUID
    actor_id: uuid.UUID
    action: AuditAction
    previous_state: Optional[str] = None
    new_state: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime


class AttachmentResponseDTO(BaseModel):
    """Attachment output DTO."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    issue_id: uuid.UUID
    file_path: str
    file_name: str
    mime_type: str
    file_size_bytes: int
    created_at: datetime


class IssueResponseDTO(BaseModel):
    """Civic issue output payload."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    description: str
    status: IssueStatus
    priority: IssuePriority
    category_id: uuid.UUID
    assigned_department_id: uuid.UUID
    reporter_id: uuid.UUID
    location: CoordinatesDTO
    upvote_count: int
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    attachments: List[AttachmentResponseDTO] = []
    distance_km: Optional[float] = None


class CategoryResponseDTO(BaseModel):
    """Category output DTO."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: Optional[str] = None
    default_department_id: uuid.UUID
    default_sla_hours: int


class DepartmentResponseDTO(BaseModel):
    """Department output DTO."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    code: str
    description: Optional[str] = None


class PaginatedIssuesDTO(BaseModel):
    """Paginated collection response DTO."""
    items: List[IssueResponseDTO]
    total_items: int
    page: int
    per_page: int
    total_pages: int


# ==============================================================================
# RFC 7946 GeoJSON Standard DTO Definitions
# ==============================================================================

class GeoJSONGeometryDTO(BaseModel):
    """RFC 7946 GeoJSON Point Geometry."""
    type: Literal["Point"] = "Point"
    coordinates: List[float] = Field(..., description="[longitude, latitude] array")


class GeoJSONFeatureDTO(BaseModel):
    """RFC 7946 GeoJSON Feature Object."""
    type: Literal["Feature"] = "Feature"
    geometry: GeoJSONGeometryDTO
    properties: Dict[str, Any]


class GeoJSONFeatureCollectionDTO(BaseModel):
    """RFC 7946 GeoJSON FeatureCollection Object."""
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[GeoJSONFeatureDTO]
    meta: Dict[str, Any]
