/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'SUPER_ADMIN' | 'RESTRICTED_ADMIN' | 'DEPARTMENT_COORDINATOR' | 'DEPARTMENT_USER';

export interface AdminPermissions {
  manageUsers: boolean;
  manageRoles: boolean;
  viewAllDepartments: boolean;
  auditSubmissions: boolean;
  finalizeActionPlans: boolean;
  manageArchives: boolean;
  manageMinutes: boolean;
  manageKPIs: boolean;
  viewAuditLogs: boolean;
  reopenFinalized: boolean;
}

export interface User {
  id: string;
  username: string; // e.g. "henok.akalu", "muluken.moges"
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  departmentId: string;
  departmentName: string;
  jobTitle: string;
  requiresPasswordChange: boolean;
  passwordHash: string; // SHA-256 hashed password with salt
  salt: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  permissions?: AdminPermissions;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headName: string;
  headRole: string;
  description: string;
  order: number;
}

export type ActionPlanPriority = 'High' | 'Medium' | 'Low';

export type ActionPlanStatus = 
  | 'Not Started' 
  | 'In Progress' 
  | 'Submitted for Review' 
  | 'Completed' 
  | 'Returned for Revision';

export interface EvidenceAttachment {
  id: string;
  fileName: string;
  fileSize: number; // in bytes
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  dataUrl?: string; // stored base64 or secure link
  notes?: string;
}

export interface ReviewHistoryEntry {
  id: string;
  timestamp: string;
  reviewerId: string;
  reviewerName: string;
  previousStatus: ActionPlanStatus;
  newStatus: ActionPlanStatus;
  comment: string;
  isReopened?: boolean;
}

export interface ActionPlanItem {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  departmentName: string;
  responsiblePerson: string;
  assignedDate: string;
  targetCompletionDate: string;
  reportingPeriod: string; // e.g. "2026/27 Q1", "2026/27 Annual"
  priority: ActionPlanPriority;
  status: ActionPlanStatus;
  progressPercentage: number; // 0 - 100
  completionNotes?: string;
  challenges?: string;
  evidenceAttachments: EvidenceAttachment[];
  reviewHistory: ReviewHistoryEntry[];
  finalizedAt?: string;
  finalizedBy?: string;
  reopenedReason?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  senderDepartment: string;
  message: string;
  timestamp: string;
}

export type ReportingPeriod = 'First Quarter' | 'Second Quarter' | 'Third Quarter' | 'Fourth Quarter';

export interface ArchiveFile {
  id: string;
  title: string;
  description: string;
  category: 'Policy & Guidelines' | 'Procurement Lists' | 'Standard Operating Procedures' | 'Audit & Compliance' | 'Annual Reports' | 'Templates';
  fileName?: string;
  googleDriveUrl: string; // Managed via Google Drive link by Admin Henok Akalu
  fileSize?: number;
  fileType?: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  accessLevel: 'All Staff' | 'Department Heads' | 'Executive & Admins';
  downloadUrl?: string;
  isOfficialPublication?: boolean;
}

export interface MeetingMinute {
  id: string;
  title: string;
  meetingDate: string;
  location: string;
  chairperson: string;
  secretary: string;
  attendees: string[]; // names
  agendaItems: string[];
  discussionSummary: string;
  decisions: {
    id: string;
    description: string;
    responsiblePerson: string;
    dueDate: string;
    linkedActionPlanId?: string;
    status: 'Pending' | 'In Progress' | 'Resolved';
  }[];
  createdBy: string;
  createdAt: string;
}

export interface KPIItem {
  id: string;
  name: string;
  definition: string;
  departmentId: string;
  departmentName: string;
  target: number;
  actualResult: number;
  unitOfMeasure: string; // '%', 'Days', 'ETB', 'Ratio'
  reportingFrequency: 'Monthly' | 'Quarterly' | 'Biannual' | 'Annual';
  reportingPeriod: string;
  dataSource: 'Action Plan Calculation' | 'HCMIS Verified Ledger' | 'QMS Audit Logs';
  isAutoCalculated: boolean;
  status: 'On Target' | 'At Risk' | 'Critical Delay';
  notes?: string;
  lastUpdatedAt: string;
}

export interface CustomAppTile {
  id: string;
  name: string;
  description: string;
  category: 'Supply Chain & Inventory' | 'Regulatory & Quality' | 'Facility Operations' | 'Finance & Admin' | 'External Portals';
  iconName: string; // lucide icon identifier
  url: string;
  target: '_blank' | '_self';
  badgeText?: string;
  isEnabled: boolean;
  order: number;
  createdAt: string;
  createdBy: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: Role;
  userDepartment?: string;
  actionType: 
    | 'AUTH_LOGIN' 
    | 'AUTH_LOGOUT' 
    | 'AUTH_PASSWORD_CHANGE' 
    | 'AUTH_PASSWORD_RESET'
    | 'USER_CREATED' 
    | 'USER_STATUS_CHANGE' 
    | 'USER_ROLE_CHANGE' 
    | 'USER_PROFILE_UPDATED'
    | 'ACTION_PLAN_CREATED' 
    | 'ACTION_PLAN_UPDATED' 
    | 'ACTION_PLAN_DELETED'
    | 'ACTION_PLAN_SUBMITTED' 
    | 'ACTION_PLAN_FINALIZED' 
    | 'ACTION_PLAN_REVISION_REQUESTED' 
    | 'ACTION_PLAN_REOPENED' 
    | 'ARCHIVE_UPLOADED' 
    | 'ARCHIVE_DELETED' 
    | 'KPI_CONFIG_UPDATED'
    | 'KPI_DELETED'
    | 'MINUTES_RECORDED'
    | 'MINUTES_DELETED'
    | 'APP_TILE_CONFIG';
  description: string;
  targetEntityId?: string;
  ipAddress?: string;
}
