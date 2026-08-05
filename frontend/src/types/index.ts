export type UserRole = 'CITIZEN' | 'OFFICIAL' | 'ADMIN';

export type IssueStatus = 'SUBMITTED' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  is_active: boolean;
  xp_points?: number;
  reputation_rank?: string;
  created_at: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface Attachment {
  id: string;
  issue_id: string;
  file_path: string;
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
  created_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  category_id: string;
  assigned_department_id: string;
  reporter_id: string;
  location: Coordinates;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolution_photo_url?: string;
  resolution_notes?: string;
  citizen_rating?: number;
  citizen_feedback?: string;
  reopen_count?: number;
  attachments: Attachment[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  default_department_id: string;
  default_sla_hours: number;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface AuditLog {
  id: string;
  issue_id: string;
  actor_id: string;
  action: string;
  previous_state?: string;
  new_state?: string;
  remarks?: string;
  created_at: string;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    category_id: string;
    assigned_department_id: string;
    reporter_id: string;
    address?: string;
    upvote_count: number;
    created_at: string;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  meta: {
    query: {
      center_latitude: number;
      center_longitude: number;
      radius_km: number;
    };
    count: number;
    total_matching: number;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_seconds: number;
}
