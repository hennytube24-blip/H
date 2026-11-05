/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, User, ActionPlanItem, ArchiveFile, MeetingMinute, KPIItem, AuditLogEntry } from '../types';

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept_branch_mgmt',
    code: 'BM',
    name: 'Branch Management',
    headName: 'Muluken Moges',
    headRole: 'Branch Manager',
    description: 'Executive stewardship, organizational governance, external institutional liaison, and strategy realization for EPSS AA2 Hub.',
    order: 1
  },
  {
    id: 'dept_deputy_mgmt',
    code: 'DBM',
    name: 'Deputy Branch Management',
    headName: 'Shiferaw Bekele',
    headRole: 'Deputy Branch Manager',
    description: 'Operational coordination, inter-departmental synergy, and executive field operations supervision.',
    order: 2
  },
  {
    id: 'dept_qms',
    code: 'QMS',
    name: 'Quality Control & Assurance',
    headName: 'Henok Akalu',
    headRole: 'Quality Control & Assurance Head',
    description: 'Pharmaceutical quality compliance, inspection, ISO standards, cold chain verification, and system audit.',
    order: 3
  },
  {
    id: 'dept_demand',
    code: 'DM',
    name: 'Demand Management',
    headName: 'Dejene Teklemariam',
    headRole: 'Demand Management Head',
    description: 'Health facility quantification, forecasting, requisition aggregation, and supply alignment.',
    order: 4
  },
  {
    id: 'dept_marketing',
    code: 'MCX',
    name: 'Marketing & Customer Experience',
    headName: 'Habtam Oumer',
    headRole: 'Marketing & Customer Experience Head',
    description: 'Customer service delivery, health facility relations, complaint resolution, and market shaping.',
    order: 5
  },
  {
    id: 'dept_warehouse',
    code: 'WS',
    name: 'Warehouse & Shipping',
    headName: 'Desta Getye',
    headRole: 'Warehouse & Shipping Head',
    description: 'Central warehousing, good storage practices (GSP), batch staging, inventory picking, and dispatch.',
    order: 6
  },
  {
    id: 'dept_distribution',
    code: 'DIST',
    name: 'Distribution',
    headName: 'Haregewoin Abere',
    headRole: 'Distribution Head',
    description: 'Fleet logistics, timely delivery routes, last-mile distribution to public hospitals and health centers.',
    order: 7
  },
  {
    id: 'dept_general_service',
    code: 'GS',
    name: 'General Service',
    headName: 'Moges Gulilat',
    headRole: 'General Service Head',
    description: 'Infrastructure upkeep, utilities, fleet maintenance, facility security, and auxiliary administration.',
    order: 8
  },
  {
    id: 'dept_hr',
    code: 'HR',
    name: 'Human Resource',
    headName: 'Mekbeb Woldesenbet',
    headRole: 'Human Resource Head',
    description: 'Talent recruitment, workforce development, training certifications, staff performance management.',
    order: 9
  },
  {
    id: 'dept_finance',
    code: 'FIN',
    name: 'Finance',
    headName: 'Wendimagegn Ashenafi',
    headRole: 'Finance Head',
    description: 'Revolving Drug Fund (RDF) budget management, accounts payable, receivables, and statutory audits.',
    order: 10
  }
];

// Seed initial users with default password "EPSSlogin"
// Note: Each user will be initialized with a salt and hash of "EPSSlogin"
export const INITIAL_USER_SEEDS: Omit<User, 'passwordHash' | 'salt'>[] = [
  {
    id: 'usr_henok_akalu',
    username: 'henok.akalu',
    fullName: 'Henok Akalu',
    email: 'Henok0750@gmail.com',
    phone: '0907014688',
    role: 'SUPER_ADMIN',
    departmentId: 'dept_qms',
    departmentName: 'Quality Control & Assurance',
    jobTitle: 'Quality Control & Assurance Head / System Administrator',
    requiresPasswordChange: false, // pre-configured admin
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    permissions: {
      manageUsers: true,
      manageRoles: true,
      viewAllDepartments: true,
      auditSubmissions: true,
      finalizeActionPlans: true,
      manageArchives: true,
      manageMinutes: true,
      manageKPIs: true,
      viewAuditLogs: true,
      reopenFinalized: true
    }
  },
  {
    id: 'usr_muluken_moges',
    username: 'muluken.moges',
    fullName: 'Muluken Moges',
    email: 'muluken.m@epss.gov.et',
    phone: '0911000001',
    role: 'RESTRICTED_ADMIN',
    departmentId: 'dept_branch_mgmt',
    departmentName: 'Branch Management',
    jobTitle: 'Branch Manager',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    permissions: {
      manageUsers: false,
      manageRoles: false,
      viewAllDepartments: true,
      auditSubmissions: true,
      finalizeActionPlans: false,
      manageArchives: true,
      manageMinutes: true,
      manageKPIs: true,
      viewAuditLogs: true,
      reopenFinalized: false
    }
  },
  {
    id: 'usr_shiferaw_bekele',
    username: 'shiferaw.bekele',
    fullName: 'Shiferaw Bekele',
    email: 'shiferaw.b@epss.gov.et',
    phone: '0911000002',
    role: 'RESTRICTED_ADMIN',
    departmentId: 'dept_deputy_mgmt',
    departmentName: 'Deputy Branch Management',
    jobTitle: 'Deputy Branch Manager',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z',
    permissions: {
      manageUsers: false,
      manageRoles: false,
      viewAllDepartments: true,
      auditSubmissions: false,
      finalizeActionPlans: false,
      manageArchives: true,
      manageMinutes: true,
      manageKPIs: true,
      viewAuditLogs: true,
      reopenFinalized: false
    }
  },
  {
    id: 'usr_desta_getye',
    username: 'desta.getye',
    fullName: 'Desta Getye',
    email: 'desta.g@epss.gov.et',
    phone: '0911000003',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_warehouse',
    departmentName: 'Warehouse & Shipping',
    jobTitle: 'Warehouse & Shipping Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_haregewoin_abere',
    username: 'haregewoin.abere',
    fullName: 'Haregewoin Abere',
    email: 'haregewoin.a@epss.gov.et',
    phone: '0911000004',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_distribution',
    departmentName: 'Distribution',
    jobTitle: 'Distribution Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_dejene_teklemariam',
    username: 'dejene.teklemariam',
    fullName: 'Dejene Teklemariam',
    email: 'dejene.t@epss.gov.et',
    phone: '0911000005',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_demand',
    departmentName: 'Demand Management',
    jobTitle: 'Demand Management Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_habtam_oumer',
    username: 'habtam.oumer',
    fullName: 'Habtam Oumer',
    email: 'habtam.o@epss.gov.et',
    phone: '0911000006',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_marketing',
    departmentName: 'Marketing & Customer Experience',
    jobTitle: 'Marketing & Customer Experience Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_wendimagegn_ashenafi',
    username: 'wendimagegn.ashenafi',
    fullName: 'Wendimagegn Ashenafi',
    email: 'wendimagegn.a@epss.gov.et',
    phone: '0911000007',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_finance',
    departmentName: 'Finance',
    jobTitle: 'Finance Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_mekbeb_woldesenbet',
    username: 'mekbeb.woldesenbet',
    fullName: 'Mekbeb Woldesenbet',
    email: 'mekbeb.w@epss.gov.et',
    phone: '0911000008',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_hr',
    departmentName: 'Human Resource',
    jobTitle: 'Human Resource Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'usr_moges_gulilat',
    username: 'moges.gulilat',
    fullName: 'Moges Gulilat',
    email: 'moges.g@epss.gov.et',
    phone: '0911000009',
    role: 'DEPARTMENT_COORDINATOR',
    departmentId: 'dept_general_service',
    departmentName: 'General Service',
    jobTitle: 'General Service Head',
    requiresPasswordChange: true,
    isActive: true,
    createdAt: '2026-01-10T08:00:00Z'
  }
];

// Clean database: No system-generated tasks. All tasks must be assigned by Admin Henok Akalu.
export const INITIAL_ACTION_PLANS: ActionPlanItem[] = [];

// Clean database: No system-generated files. All files in archives are uploaded by Admin Henok Akalu.
export const INITIAL_ARCHIVES: ArchiveFile[] = [];

// Clean database: No system-generated meeting minutes. All minutes are recorded by Admin Henok Akalu.
export const INITIAL_MINUTES: MeetingMinute[] = [];

// Clean database: No system-generated KPIs. All KPIs must be added by Admin Henok Akalu.
export const INITIAL_KPIS: KPIItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_001',
    timestamp: '2026-03-26T14:30:00Z',
    userId: 'usr_henok_akalu',
    userName: 'Henok Akalu',
    userRole: 'SUPER_ADMIN',
    userDepartment: 'Quality Control & Assurance',
    actionType: 'ACTION_PLAN_FINALIZED',
    description: 'Audited evidence and finalized Action Plan act_001 (Deployment of Continuous Temperature Data Loggers) as Completed.',
    targetEntityId: 'act_001'
  },
  {
    id: 'aud_002',
    timestamp: '2026-03-15T10:15:00Z',
    userId: 'usr_henok_akalu',
    userName: 'Henok Akalu',
    userRole: 'SUPER_ADMIN',
    userDepartment: 'Quality Control & Assurance',
    actionType: 'ACTION_PLAN_FINALIZED',
    description: 'Audited evidence and finalized Action Plan act_002 (RDF Stock Physical Reconciliation) as Completed.',
    targetEntityId: 'act_002'
  },
  {
    id: 'aud_003',
    timestamp: '2026-04-12T15:00:00Z',
    userId: 'usr_henok_akalu',
    userName: 'Henok Akalu',
    userRole: 'SUPER_ADMIN',
    userDepartment: 'Quality Control & Assurance',
    actionType: 'ACTION_PLAN_REVISION_REQUESTED',
    description: 'Returned Action Plan act_005 (Customer Complaint Ticket Tracking) for revision with comments.',
    targetEntityId: 'act_005'
  },
  {
    id: 'aud_004',
    timestamp: '2026-04-28T09:30:00Z',
    userId: 'usr_haregewoin_abere',
    userName: 'Haregewoin Abere',
    userRole: 'DEPARTMENT_COORDINATOR',
    userDepartment: 'Distribution',
    actionType: 'ACTION_PLAN_SUBMITTED',
    description: 'Submitted status and evidence for Action Plan act_003 (Fleet Route Optimization & GPS Telematics).',
    targetEntityId: 'act_003'
  }
];
