/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  Department, 
  ActionPlanItem, 
  ChatMessage, 
  ArchiveFile, 
  MeetingMinute, 
  KPIItem, 
  AuditLogEntry,
  Role,
  AdminPermissions,
  ActionPlanStatus,
  EvidenceAttachment,
  ReviewHistoryEntry
} from '../types';
import { 
  INITIAL_DEPARTMENTS, 
  INITIAL_USER_SEEDS, 
  INITIAL_ACTION_PLANS, 
  INITIAL_ARCHIVES, 
  INITIAL_MINUTES, 
  INITIAL_KPIS, 
  INITIAL_AUDIT_LOGS 
} from '../data/seedData';
import { hashPassword, generateSalt } from '../utils/crypto';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; requiresPasswordChange?: boolean }>;
  logout: () => void;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordReset: (username: string, notes?: string) => Promise<{ success: boolean; message: string }>;
  
  // Real-time data state
  users: User[];
  departments: Department[];
  actionPlans: ActionPlanItem[];
  chatMessages: ChatMessage[];
  archives: ArchiveFile[];
  meetingMinutes: MeetingMinute[];
  kpis: KPIItem[];
  auditLogs: AuditLogEntry[];
  
  // Action Plan operations
  createActionPlan: (plan: Omit<ActionPlanItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewHistory' | 'evidenceAttachments' | 'status'>) => Promise<void>;
  updateActionPlan: (id: string, updates: Partial<ActionPlanItem>) => Promise<void>;
  deleteActionPlan: (id: string) => Promise<void>;
  submitActionPlanForReview: (id: string, notes: string, evidence?: EvidenceAttachment) => Promise<void>;
  reviewActionPlan: (id: string, decision: 'APPROVE' | 'REVISE', comment: string) => Promise<void>;
  reopenActionPlan: (id: string, reason: string) => Promise<void>;
  
  // Chat operations
  sendChatMessage: (messageText: string) => Promise<void>;
  
  // User & Role admin operations (Super Admin)
  createUser: (user: Omit<User, 'id' | 'passwordHash' | 'salt' | 'requiresPasswordChange' | 'createdAt'>) => Promise<void>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<void>;
  updateUserRoleAndPermissions: (id: string, role: Role, departmentId: string, departmentName: string, permissions?: AdminPermissions) => Promise<void>;
  updateUserProfileAndAdmin: (id: string, updates: {
    fullName?: string;
    phone?: string;
    email?: string;
    jobTitle?: string;
    departmentId?: string;
    departmentName?: string;
    role?: Role;
    permissions?: AdminPermissions;
  }) => Promise<void>;
  adminResetUserPassword: (id: string) => Promise<{ tempPassword: string }>;
  
  // Archive operations
  uploadArchiveFile: (file: Omit<ArchiveFile, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => Promise<void>;
  deleteArchiveFile: (id: string) => Promise<void>;
  
  // Minutes operations
  createMeetingMinute: (minute: Omit<MeetingMinute, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  deleteMeetingMinute: (id: string) => Promise<void>;
  
  // Custom App Tiles & Apps
  appTiles: import('../types').CustomAppTile[];
  createAppTile: (tile: Omit<import('../types').CustomAppTile, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>;
  updateAppTile: (id: string, updates: Partial<import('../types').CustomAppTile>) => Promise<void>;
  deleteAppTile: (id: string) => Promise<void>;

  // KPI operations
  createKPI: (kpi: Omit<KPIItem, 'id' | 'lastUpdatedAt'>) => Promise<void>;
  updateKPI: (id: string, updates: Partial<KPIItem>) => Promise<void>;
  deleteKPI: (id: string) => Promise<void>;
  
  // Database utilities
  resetDatabaseToDefault: () => Promise<void>;
  clearAllSystemGeneratedData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY_PREFIX = 'epss_stratex_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}current_user`);
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [actionPlans, setActionPlans] = useState<ActionPlanItem[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [archives, setArchives] = useState<ArchiveFile[]>([]);
  const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
  const [kpis, setKpis] = useState<KPIItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [appTiles, setAppTiles] = useState<import('../types').CustomAppTile[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize or hydrate repository
  useEffect(() => {
    async function initStorage() {
      // Check if cleaned flag is set; if not set, do a clean initialization without system-generated records
      const hasCleanedV3 = localStorage.getItem(`${STORAGE_KEY_PREFIX}cleaned_v3`);
      if (!hasCleanedV3) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}action_plans`);
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}archives`);
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}minutes`);
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}chat`);
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}kpis`);
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}app_tiles`);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}cleaned_v3`, 'true');
      }

      // Users
      const savedUsers = localStorage.getItem(`${STORAGE_KEY_PREFIX}users`);
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      } else {
        // Hash initial accounts with "EPSSlogin"
        const preparedUsers: User[] = [];
        for (const u of INITIAL_USER_SEEDS) {
          const salt = generateSalt();
          const passwordHash = await hashPassword('EPSSlogin', salt);
          preparedUsers.push({
            ...u,
            salt,
            passwordHash,
            requiresPasswordChange: u.id === 'usr_henok_akalu' ? false : true
          });
        }
        setUsers(preparedUsers);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(preparedUsers));
      }

      // Action plans - start clean, only created by Admin Henok Akalu or department leads
      const savedPlans = localStorage.getItem(`${STORAGE_KEY_PREFIX}action_plans`);
      if (savedPlans) {
        setActionPlans(JSON.parse(savedPlans));
      } else {
        setActionPlans([]);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}action_plans`, JSON.stringify([]));
      }

      // Archives - start clean, uploaded by Admin Henok Akalu via Google Drive
      const savedArchives = localStorage.getItem(`${STORAGE_KEY_PREFIX}archives`);
      if (savedArchives) {
        setArchives(JSON.parse(savedArchives));
      } else {
        setArchives([]);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}archives`, JSON.stringify([]));
      }

      // Minutes - start clean, recorded by Admin Henok Akalu
      const savedMinutes = localStorage.getItem(`${STORAGE_KEY_PREFIX}minutes`);
      if (savedMinutes) {
        setMeetingMinutes(JSON.parse(savedMinutes));
      } else {
        setMeetingMinutes([]);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}minutes`, JSON.stringify([]));
      }

      // KPIs - start clean, added by Admin Henok Akalu
      const savedKpis = localStorage.getItem(`${STORAGE_KEY_PREFIX}kpis`);
      if (savedKpis) {
        setKpis(JSON.parse(savedKpis));
      } else {
        setKpis([]);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}kpis`, JSON.stringify([]));
      }

      // Audit logs
      const savedLogs = localStorage.getItem(`${STORAGE_KEY_PREFIX}audit_logs`);
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      } else {
        setAuditLogs(INITIAL_AUDIT_LOGS);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(INITIAL_AUDIT_LOGS));
      }

      // Chat - start completely clean (no bot or automated system messages)
      const savedChat = localStorage.getItem(`${STORAGE_KEY_PREFIX}chat`);
      if (savedChat) {
        setChatMessages(JSON.parse(savedChat));
      } else {
        setChatMessages([]);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}chat`, JSON.stringify([]));
      }

      // App Tiles & Apps - start completely clean, added only by Admin Henok Akalu
      const savedTiles = localStorage.getItem(`${STORAGE_KEY_PREFIX}app_tiles`);
      if (savedTiles) {
        setAppTiles(JSON.parse(savedTiles));
      } else {
        setAppTiles([]);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}app_tiles`, JSON.stringify([]));
      }

      setIsInitialized(true);
    }

    initStorage();
  }, []);

  // Sync state changes to storage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}users`, JSON.stringify(users));
  }, [users, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}action_plans`, JSON.stringify(actionPlans));
  }, [actionPlans, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}archives`, JSON.stringify(archives));
  }, [archives, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}minutes`, JSON.stringify(meetingMinutes));
  }, [meetingMinutes, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}kpis`, JSON.stringify(kpis));
  }, [kpis, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}audit_logs`, JSON.stringify(auditLogs));
  }, [auditLogs, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}chat`, JSON.stringify(chatMessages));
  }, [chatMessages, isInitialized]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}current_user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}current_user`);
    }
  }, [currentUser]);

  // Recalculate auto KPIs when action plans update
  useEffect(() => {
    if (actionPlans.length === 0) return;
    setKpis(prevKpis => {
      return prevKpis.map(kpi => {
        if (kpi.isAutoCalculated && kpi.dataSource === 'Action Plan Calculation') {
          const totalPlans = actionPlans.length;
          const completedPlans = actionPlans.filter(p => p.status === 'Completed').length;
          const calculatedPct = Math.round((completedPlans / (totalPlans || 1)) * 1000) / 10;
          return {
            ...kpi,
            actualResult: calculatedPct,
            status: calculatedPct >= kpi.target ? 'On Target' : (calculatedPct >= kpi.target * 0.7 ? 'At Risk' : 'Critical Delay'),
            lastUpdatedAt: new Date().toISOString()
          };
        }
        return kpi;
      });
    });
  }, [actionPlans]);

  // Helper for audit logging
  const logAudit = (actionType: AuditLogEntry['actionType'], description: string, targetEntityId?: string) => {
    if (!currentUser) return;
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      userDepartment: currentUser.departmentName,
      actionType,
      description,
      targetEntityId
    };
    setAuditLogs(prev => [entry, ...prev]);
  };

  // Auth: Login
  const login = async (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === trimmedUser);

    if (!user) {
      return { success: false, error: 'Invalid username or password.' };
    }

    if (!user.isActive) {
      return { success: false, error: 'This account has been deactivated. Please contact Super Admin Henok Akalu.' };
    }

    const computedHash = await hashPassword(password, user.salt);
    if (computedHash !== user.passwordHash) {
      return { success: false, error: 'Invalid username or password.' };
    }

    // Success
    const updatedUser = {
      ...user,
      lastLoginAt: new Date().toISOString()
    };
    
    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    logAudit('AUTH_LOGIN', `User ${user.fullName} logged in successfully.`);

    return { 
      success: true, 
      requiresPasswordChange: user.requiresPasswordChange 
    };
  };

  // Auth: Logout
  const logout = () => {
    if (currentUser) {
      logAudit('AUTH_LOGOUT', `User ${currentUser.fullName} signed out.`);
    }
    setCurrentUser(null);
  };

  // Auth: Mandatory Password Change
  const changePassword = async (newPassword: string) => {
    if (!currentUser) {
      return { success: false, error: 'No active session.' };
    }

    if (newPassword.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' };
    }

    if (newPassword === 'EPSSlogin') {
      return { success: false, error: 'You cannot use the initial default password "EPSSlogin" as your new password.' };
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);

    const updatedUser: User = {
      ...currentUser,
      passwordHash: newHash,
      salt: newSalt,
      requiresPasswordChange: false
    };

    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    logAudit('AUTH_PASSWORD_CHANGE', `User ${currentUser.fullName} changed their password.`);
    return { success: true };
  };

  // Auth: Forgot password request
  const requestPasswordReset = async (username: string, notes?: string) => {
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Account not found with this username.' };
    }

    // Record an audit log for identity verification
    const entry: AuditLogEntry = {
      id: `aud_${Date.now()}_req`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      userDepartment: user.departmentName,
      actionType: 'AUTH_PASSWORD_RESET',
      description: `Password recovery requested for @${user.username} (${user.fullName}). Verified contact: ${user.phone || user.email}. Notes: ${notes || 'Standard self-request'}`
    };
    setAuditLogs(prev => [entry, ...prev]);

    return { 
      success: true, 
      message: `Password reset request submitted for ${user.fullName}. Super Admin Henok Akalu (Phone: 0907014688, Email: Henok0750@gmail.com) has received an audit notification to verify identity and issue temporary credentials.` 
    };
  };

  // Action Plans: Create
  const createActionPlan = async (planData: Omit<ActionPlanItem, 'id' | 'createdAt' | 'updatedAt' | 'reviewHistory' | 'evidenceAttachments' | 'status'>) => {
    if (!currentUser) throw new Error('Unauthorized');

    const newId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    const newPlan: ActionPlanItem = {
      ...planData,
      id: newId,
      status: 'Not Started',
      reviewHistory: [],
      evidenceAttachments: [],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setActionPlans(prev => [newPlan, ...prev]);
    logAudit('ACTION_PLAN_CREATED', `Created new Action Plan: "${newPlan.title}" for department ${newPlan.departmentName}`, newId);
  };

  // Action Plans: Update
  const updateActionPlan = async (id: string, updates: Partial<ActionPlanItem>) => {
    if (!currentUser) throw new Error('Unauthorized');
    const existing = actionPlans.find(p => p.id === id);
    if (!existing) throw new Error('Action plan not found');

    // Access control: only same department or super admin/authorized admin
    const canEdit = currentUser.role === 'SUPER_ADMIN' || 
      (currentUser.role === 'RESTRICTED_ADMIN' && currentUser.permissions?.viewAllDepartments) || 
      currentUser.departmentId === existing.departmentId;

    if (!canEdit) {
      throw new Error('Access denied: You cannot edit records belonging to another department.');
    }

    if (existing.status === 'Completed' && currentUser.role !== 'SUPER_ADMIN') {
      throw new Error('This action plan is finalized as Completed and locked. Only the Super Admin may reopen it.');
    }

    const updated: ActionPlanItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setActionPlans(prev => prev.map(p => p.id === id ? updated : p));
    logAudit('ACTION_PLAN_UPDATED', `Updated Action Plan: "${existing.title}". Fields altered: ${Object.keys(updates).join(', ')}`, id);
  };

  // Action Plans: Submit for Review
  const submitActionPlanForReview = async (id: string, notes: string, evidence?: EvidenceAttachment) => {
    if (!currentUser) throw new Error('Unauthorized');
    const existing = actionPlans.find(p => p.id === id);
    if (!existing) throw new Error('Action plan not found');

    const canSubmit = currentUser.role === 'SUPER_ADMIN' || currentUser.departmentId === existing.departmentId;
    if (!canSubmit) {
      throw new Error('Access denied: You can only submit action plans for your assigned department.');
    }

    const updatedAttachments = evidence 
      ? [...existing.evidenceAttachments, evidence] 
      : existing.evidenceAttachments;

    const reviewEntry: ReviewHistoryEntry = {
      id: `rev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName,
      previousStatus: existing.status,
      newStatus: 'Submitted for Review',
      comment: notes || 'Submitted status and completion evidence for administrative audit.'
    };

    const updated: ActionPlanItem = {
      ...existing,
      status: 'Submitted for Review',
      progressPercentage: 100,
      completionNotes: notes || existing.completionNotes,
      evidenceAttachments: updatedAttachments,
      reviewHistory: [...existing.reviewHistory, reviewEntry],
      updatedAt: new Date().toISOString()
    };

    setActionPlans(prev => prev.map(p => p.id === id ? updated : p));
    logAudit('ACTION_PLAN_SUBMITTED', `Submitted Action Plan "${existing.title}" for review with ${evidence ? 'new evidence file: ' + evidence.fileName : 'existing evidence'}.`, id);
  };

  // Action Plans: Review (Henok Akalu / Authorized Auditor)
  const reviewActionPlan = async (id: string, decision: 'APPROVE' | 'REVISE', comment: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    const existing = actionPlans.find(p => p.id === id);
    if (!existing) throw new Error('Action plan not found');

    const canReview = currentUser.role === 'SUPER_ADMIN' || 
      (currentUser.role === 'RESTRICTED_ADMIN' && currentUser.permissions?.auditSubmissions);

    if (!canReview) {
      throw new Error('Access denied: Only authorized administrators (Super Admin Henok Akalu) can audit and approve action plans.');
    }

    const newStatus: ActionPlanStatus = decision === 'APPROVE' ? 'Completed' : 'Returned for Revision';
    const reviewEntry: ReviewHistoryEntry = {
      id: `rev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName,
      previousStatus: existing.status,
      newStatus,
      comment: comment || (decision === 'APPROVE' ? 'Audited and approved as Completed.' : 'Returned for departmental revision.')
    };

    const updated: ActionPlanItem = {
      ...existing,
      status: newStatus,
      finalizedAt: decision === 'APPROVE' ? new Date().toISOString() : undefined,
      finalizedBy: decision === 'APPROVE' ? `${currentUser.fullName} (${currentUser.role})` : undefined,
      reviewHistory: [...existing.reviewHistory, reviewEntry],
      updatedAt: new Date().toISOString()
    };

    setActionPlans(prev => prev.map(p => p.id === id ? updated : p));
    logAudit(
      decision === 'APPROVE' ? 'ACTION_PLAN_FINALIZED' : 'ACTION_PLAN_REVISION_REQUESTED',
      `Audit decision for "${existing.title}": ${decision === 'APPROVE' ? 'Approved & Finalized as Completed' : 'Returned for Revision'}. Note: ${comment}`,
      id
    );
  };

  // Action Plans: Reopen Finalized
  const reopenActionPlan = async (id: string, reason: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    const existing = actionPlans.find(p => p.id === id);
    if (!existing) throw new Error('Action plan not found');

    const canReopen = currentUser.role === 'SUPER_ADMIN' || 
      (currentUser.role === 'RESTRICTED_ADMIN' && currentUser.permissions?.reopenFinalized);

    if (!canReopen) {
      throw new Error('Access denied: Only Super Admin Henok Akalu can reopen finalized action plans.');
    }

    const reviewEntry: ReviewHistoryEntry = {
      id: `rev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      reviewerId: currentUser.id,
      reviewerName: currentUser.fullName,
      previousStatus: existing.status,
      newStatus: 'In Progress',
      comment: `Action plan reopened by administrator. Reason: ${reason}`,
      isReopened: true
    };

    const updated: ActionPlanItem = {
      ...existing,
      status: 'In Progress',
      finalizedAt: undefined,
      finalizedBy: undefined,
      reopenedReason: reason,
      reviewHistory: [...existing.reviewHistory, reviewEntry],
      updatedAt: new Date().toISOString()
    };

    setActionPlans(prev => prev.map(p => p.id === id ? updated : p));
    logAudit('ACTION_PLAN_REOPENED', `Reopened finalized plan "${existing.title}". Reason: ${reason}`, id);
  };

  // Chat: Send User-Authored message only (No bots or system messages)
  const sendChatMessage = async (messageText: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    if (!messageText.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      senderRole: currentUser.role,
      senderDepartment: currentUser.departmentName,
      message: messageText.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);
  };

  // Admin: Create User
  const createUser = async (userData: Omit<User, 'id' | 'passwordHash' | 'salt' | 'requiresPasswordChange' | 'createdAt'>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may create users and assign roles.');
    }

    const exists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
    if (exists) {
      throw new Error(`Username "${userData.username}" is already taken.`);
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword('EPSSlogin', salt);
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser: User = {
      ...userData,
      id: newId,
      passwordHash,
      salt,
      requiresPasswordChange: true, // must change on first login
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, newUser]);
    logAudit('USER_CREATED', `Super Admin created new user ${newUser.fullName} (@${newUser.username}) with initial temporary password "EPSSlogin". Assigned role: ${newUser.role}, Dept: ${newUser.departmentName}.`, newId);
  };

  // Admin: Toggle user status
  const toggleUserStatus = async (id: string, isActive: boolean) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may deactivate or activate users.');
    }

    if (id === currentUser.id && !isActive) {
      throw new Error('Cannot deactivate your own Super Admin account.');
    }

    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
    logAudit('USER_STATUS_CHANGE', `Super Admin ${isActive ? 'activated' : 'deactivated'} user account ID ${id}.`, id);
  };

  // Admin: Update role and permissions
  const updateUserRoleAndPermissions = async (
    id: string, 
    role: Role, 
    departmentId: string, 
    departmentName: string, 
    permissions?: AdminPermissions
  ) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may assign or modify roles.');
    }

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          role,
          departmentId,
          departmentName,
          permissions: role === 'RESTRICTED_ADMIN' ? permissions : (role === 'SUPER_ADMIN' ? {
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
          } : undefined)
        };
      }
      return u;
    }));

    logAudit('USER_ROLE_CHANGE', `Super Admin updated user ID ${id} to role ${role} in department ${departmentName}.`, id);
  };

  // Admin: Update user personal information (name, phone, email, job title) and set as new admin
  const updateUserProfileAndAdmin = async (
    id: string,
    updates: {
      fullName?: string;
      phone?: string;
      email?: string;
      jobTitle?: string;
      departmentId?: string;
      departmentName?: string;
      role?: Role;
      permissions?: AdminPermissions;
    }
  ) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu can edit user personal details and administrator status.');
    }

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextRole = updates.role || u.role;
        const nextDeptId = updates.departmentId || u.departmentId;
        const nextDeptName = updates.departmentName || u.departmentName;
        return {
          ...u,
          fullName: updates.fullName !== undefined ? updates.fullName.trim() : u.fullName,
          phone: updates.phone !== undefined ? updates.phone.trim() : u.phone,
          email: updates.email !== undefined ? updates.email.trim() : u.email,
          jobTitle: updates.jobTitle !== undefined ? updates.jobTitle.trim() : u.jobTitle,
          departmentId: nextDeptId,
          departmentName: nextDeptName,
          role: nextRole,
          permissions: nextRole === 'RESTRICTED_ADMIN' 
            ? (updates.permissions || u.permissions) 
            : (nextRole === 'SUPER_ADMIN' ? {
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
              } : undefined)
        };
      }
      return u;
    }));

    logAudit('USER_PROFILE_UPDATED', `Super Admin Henok Akalu updated account details for user ID ${id}. Modified: ${Object.keys(updates).join(', ')}`, id);
  };

  // Admin: Reset user password
  const adminResetUserPassword = async (id: string) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may trigger credential resets.');
    }

    const tempPassword = `EPSS_${Math.random().toString(36).substring(2, 6).toUpperCase()}#2026`;
    const newSalt = generateSalt();
    const newHash = await hashPassword(tempPassword, newSalt);

    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return {
          ...u,
          salt: newSalt,
          passwordHash: newHash,
          requiresPasswordChange: true
        };
      }
      return u;
    }));

    logAudit('AUTH_PASSWORD_RESET', `Super Admin issued a temporary reset credential for user ID ${id}. User forced to reset on next login.`, id);
    return { tempPassword };
  };

  // Archives: Upload
  const uploadArchiveFile = async (fileData: Omit<ArchiveFile, 'id' | 'uploadedAt' | 'uploadedBy' | 'uploadedByName'>) => {
    if (!currentUser) throw new Error('Unauthorized');
    const canUpload = currentUser.role === 'SUPER_ADMIN' || 
      (currentUser.role === 'RESTRICTED_ADMIN' && currentUser.permissions?.manageArchives);

    if (!canUpload) {
      throw new Error('Access denied: Only authorized administrators may upload archived documents.');
    }

    const newId = `arc_${Date.now()}`;
    const newFile: ArchiveFile = {
      ...fileData,
      id: newId,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.fullName
    };

    setArchives(prev => [newFile, ...prev]);
    logAudit('ARCHIVE_UPLOADED', `Uploaded archive document: "${newFile.title}" (${newFile.fileName}). Category: ${newFile.category}. Access: ${newFile.accessLevel}.`, newId);
  };

  // Archives: Delete
  const deleteArchiveFile = async (id: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    const canDelete = currentUser.role === 'SUPER_ADMIN' || 
      (currentUser.role === 'RESTRICTED_ADMIN' && currentUser.permissions?.manageArchives);

    if (!canDelete) {
      throw new Error('Access denied: Only authorized administrators may delete archived documents.');
    }

    const target = archives.find(a => a.id === id);
    setArchives(prev => prev.filter(a => a.id !== id));
    logAudit('ARCHIVE_DELETED', `Deleted archive document ID ${id} ("${target?.title || 'Unknown'}").`, id);
  };

  // Minutes: Create
  const createMeetingMinute = async (minuteData: Omit<MeetingMinute, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!currentUser) throw new Error('Unauthorized');
    const canManage = currentUser.role === 'SUPER_ADMIN' || 
      (currentUser.role === 'RESTRICTED_ADMIN' && currentUser.permissions?.manageMinutes);

    if (!canManage) {
      throw new Error('Access denied: Only authorized administrators may record management minutes.');
    }

    const newId = `min_${Date.now()}`;
    const newMinute: MeetingMinute = {
      ...minuteData,
      id: newId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    setMeetingMinutes(prev => [newMinute, ...prev]);
    logAudit('MINUTES_RECORDED', `Recorded management meeting minutes: "${newMinute.title}" on date ${newMinute.meetingDate}.`, newId);
  };

  // KPI: Create & Update
  const createKPI = async (kpiData: Omit<KPIItem, 'id' | 'lastUpdatedAt'>) => {
    if (!currentUser) throw new Error('Unauthorized');
    if (currentUser.role !== 'SUPER_ADMIN' && !currentUser.permissions?.manageKPIs) {
      throw new Error('Access denied: Only authorized administrators can configure KPIs.');
    }

    const newId = `kpi_${Date.now()}`;
    const newKpi: KPIItem = {
      ...kpiData,
      id: newId,
      lastUpdatedAt: new Date().toISOString()
    };

    setKpis(prev => [...prev, newKpi]);
    logAudit('KPI_CONFIG_UPDATED', `Created KPI parameter "${newKpi.name}". Target: ${newKpi.target}${newKpi.unitOfMeasure}.`, newId);
  };

  const updateKPI = async (id: string, updates: Partial<KPIItem>) => {
    if (!currentUser) throw new Error('Unauthorized');
    if (currentUser.role !== 'SUPER_ADMIN' && !currentUser.permissions?.manageKPIs) {
      throw new Error('Access denied: Only authorized administrators can modify KPIs.');
    }

    setKpis(prev => prev.map(k => k.id === id ? { ...k, ...updates, lastUpdatedAt: new Date().toISOString() } : k));
    logAudit('KPI_CONFIG_UPDATED', `Updated KPI ID ${id}. Modified fields: ${Object.keys(updates).join(', ')}`, id);
  };

  const deleteKPI = async (id: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    if (currentUser.role !== 'SUPER_ADMIN' && !currentUser.permissions?.manageKPIs) {
      throw new Error('Access denied: Only authorized administrators can delete KPIs.');
    }

    const existing = kpis.find(k => k.id === id);
    setKpis(prev => prev.filter(k => k.id !== id));
    logAudit('KPI_DELETED', `Deleted KPI ID ${id} ("${existing?.name || ''}").`, id);
  };

  // Sync appTiles to storage
  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem(`${STORAGE_KEY_PREFIX}app_tiles`, JSON.stringify(appTiles));
  }, [appTiles, isInitialized]);

  // Action Plans: Delete (Admin Henok Akalu full control)
  const deleteActionPlan = async (id: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    const existing = actionPlans.find(p => p.id === id);
    if (!existing) return;

    if (currentUser.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Admin Henok Akalu can delete action plan tasks.');
    }

    setActionPlans(prev => prev.filter(p => p.id !== id));
    logAudit('ACTION_PLAN_DELETED', `Admin Henok Akalu deleted action plan: "${existing.title}"`, id);
  };

  // Minutes: Delete (Admin Henok Akalu full control)
  const deleteMeetingMinute = async (id: string) => {
    if (!currentUser) throw new Error('Unauthorized');
    const existing = meetingMinutes.find(m => m.id === id);
    if (!existing) return;

    if (currentUser.role !== 'SUPER_ADMIN' && !currentUser.permissions?.manageMinutes) {
      throw new Error('Access denied: Only authorized administrators may delete meeting minutes.');
    }

    setMeetingMinutes(prev => prev.filter(m => m.id !== id));
    logAudit('MINUTES_DELETED', `Deleted meeting minutes record: "${existing.title}" (${existing.meetingDate})`, id);
  };

  // App Tiles: Create
  const createAppTile = async (tileData: Omit<import('../types').CustomAppTile, 'id' | 'createdAt' | 'createdBy'>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may configure apps and tiles.');
    }

    const newId = `tile_${Date.now()}`;
    const newTile: import('../types').CustomAppTile = {
      ...tileData,
      id: newId,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id
    };

    setAppTiles(prev => [...prev, newTile]);
    logAudit('APP_TILE_CONFIG', `Admin Henok Akalu added new application tile: "${newTile.name}"`, newId);
  };

  // App Tiles: Update
  const updateAppTile = async (id: string, updates: Partial<import('../types').CustomAppTile>) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may edit apps and tiles.');
    }

    setAppTiles(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    logAudit('APP_TILE_CONFIG', `Admin Henok Akalu updated application tile ID: ${id}`, id);
  };

  // App Tiles: Delete
  const deleteAppTile = async (id: string) => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu may delete apps and tiles.');
    }

    const target = appTiles.find(t => t.id === id);
    setAppTiles(prev => prev.filter(t => t.id !== id));
    logAudit('APP_TILE_CONFIG', `Admin Henok Akalu removed application tile: "${target?.name || id}"`, id);
  };

  // Clear all system-generated items immediately on button click
  const clearAllSystemGeneratedData = async () => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu can execute system data purging.');
    }

    setActionPlans([]);
    setArchives([]);
    setMeetingMinutes([]);
    setChatMessages([]);

    localStorage.setItem(`${STORAGE_KEY_PREFIX}action_plans`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}archives`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}minutes`, JSON.stringify([]));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}chat`, JSON.stringify([]));

    logAudit('ARCHIVE_DELETED', 'Admin Henok Akalu cleared all mock/system-generated tasks, archives, and minutes.');
  };

  // Utility: Reset database to initial seed
  const resetDatabaseToDefault = async () => {
    if (currentUser?.role !== 'SUPER_ADMIN') {
      throw new Error('Access denied: Only Super Admin Henok Akalu can reset system data.');
    }

    localStorage.clear();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      changePassword,
      requestPasswordReset,
      users,
      departments,
      actionPlans,
      chatMessages,
      archives,
      meetingMinutes,
      kpis,
      auditLogs,
      createActionPlan,
      updateActionPlan,
      deleteActionPlan,
      submitActionPlanForReview,
      reviewActionPlan,
      reopenActionPlan,
      sendChatMessage,
      createUser,
      toggleUserStatus,
      updateUserRoleAndPermissions,
      updateUserProfileAndAdmin,
      adminResetUserPassword,
      uploadArchiveFile,
      deleteArchiveFile,
      createMeetingMinute,
      deleteMeetingMinute,
      appTiles,
      createAppTile,
      updateAppTile,
      deleteAppTile,
      createKPI,
      updateKPI,
      deleteKPI,
      resetDatabaseToDefault,
      clearAllSystemGeneratedData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
