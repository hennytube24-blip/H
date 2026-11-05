/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role, User, AdminPermissions } from '../types';
import { 
  ShieldCheck, 
  UserPlus, 
  KeyRound, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  RotateCcw, 
  FileText, 
  AlertTriangle,
  X,
  Search,
  Check,
  Trash2,
  Edit3
} from 'lucide-react';

export const UserAndRoleAdmin: React.FC = () => {
  const { 
    users, 
    departments, 
    currentUser, 
    createUser, 
    toggleUserStatus, 
    updateUserProfileAndAdmin,
    adminResetUserPassword,
    auditLogs,
    clearAllSystemGeneratedData
  } = useApp();

  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'AUDIT_LOGS'>('USERS');
  const [searchUser, setSearchUser] = useState('');
  
  // Modals
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resetFeedback, setResetFeedback] = useState<{ username: string; tempPass: string } | null>(null);

  // New User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<Role>('DEPARTMENT_COORDINATOR');
  const [newDeptId, setNewDeptId] = useState('dept_warehouse');
  const [newJobTitle, setNewJobTitle] = useState('');

  // Editing User Profile & Admin Role State
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editRole, setEditRole] = useState<Role>('DEPARTMENT_COORDINATOR');
  const [editDeptId, setEditDeptId] = useState('');
  const [editPermissions, setEditPermissions] = useState<AdminPermissions>({
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
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  if (!isSuperAdmin) {
    return (
      <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Restricted Administrator Console</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Access to User & Role Administration is strictly reserved for Super Admin Henok Akalu. Contact Henok0750@gmail.com for access credentials.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => {
    if (!searchUser.trim()) return true;
    const q = searchUser.toLowerCase();
    return u.username.toLowerCase().includes(q) || 
      u.fullName.toLowerCase().includes(q) || 
      u.departmentName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
  });

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim()) return;

    const deptObj = departments.find(d => d.id === newDeptId);
    if (!deptObj) return;

    try {
      await createUser({
        username: newUsername.trim().toLowerCase(),
        fullName: newFullName.trim(),
        email: newEmail.trim() || `${newUsername.trim().toLowerCase()}@epss.gov.et`,
        phone: newPhone.trim(),
        role: newRole,
        departmentId: newDeptId,
        departmentName: deptObj.name,
        jobTitle: newJobTitle.trim() || `${deptObj.name} Officer`,
        isActive: true,
        permissions: newRole === 'RESTRICTED_ADMIN' ? {
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
        } : undefined
      });

      setShowCreateUserModal(false);
      setNewUsername('');
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      setNewJobTitle('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error creating user');
    }
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditPhone(u.phone || '');
    setEditEmail(u.email || '');
    setEditJobTitle(u.jobTitle || '');
    setEditRole(u.role);
    setEditDeptId(u.departmentId);
    if (u.permissions) {
      setEditPermissions(u.permissions);
    } else {
      setEditPermissions({
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
      });
    }
  };

  const handleSaveUserProfileAndAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const deptObj = departments.find(d => d.id === editDeptId) || departments.find(d => d.id === editingUser.departmentId);
    if (!deptObj) return;

    await updateUserProfileAndAdmin(editingUser.id, {
      fullName: editFullName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      jobTitle: editJobTitle.trim(),
      departmentId: deptObj.id,
      departmentName: deptObj.name,
      role: editRole,
      permissions: editRole === 'RESTRICTED_ADMIN' ? editPermissions : undefined
    });

    setEditingUser(null);
  };

  const handleAdminReset = async (user: User) => {
    if (confirm(`Reset credentials for ${user.fullName} (@${user.username})? A temporary password will be generated and the user forced to update it on next login.`)) {
      const res = await adminResetUserPassword(user.id);
      setResetFeedback({ username: user.username, tempPass: res.tempPassword });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Executive Governance</span>
            <span>·</span>
            <span>Super Admin Exclusive</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            User and Role Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Managed by Super Admin Henok Akalu (Email: Henok0750@gmail.com · Phone: 0907014688)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm('Admin Henok Akalu: Do you want to purge all system mock tasks, files, and minutes? This ensures 100% of items are added only by you or your department users.')) {
                clearAllSystemGeneratedData();
                alert('System mock tasks, files, and minutes successfully purged. Clean database state active.');
              }
            }}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/40 dark:text-slate-300 dark:hover:text-rose-400 px-3 py-2 rounded-xl text-xs font-semibold transition border border-slate-200 dark:border-slate-700"
            title="Purge all system-generated items"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge System Data</span>
          </button>

          <button
            onClick={() => setShowCreateUserModal(true)}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision New User</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'USERS'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          User Accounts Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'ROLES'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Role & Access Matrix
        </button>
        <button
          onClick={() => setActiveTab('AUDIT_LOGS')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'AUDIT_LOGS'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Immutable Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* Password Reset Feedback Alert */}
      {resetFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-start justify-between">
          <div className="space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Temporary Credentials Issued for @{resetFeedback.username}
            </span>
            <p>
              Temporary Password: <code className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded font-mono font-bold text-slate-900 dark:text-white border border-emerald-500/20">{resetFeedback.tempPass}</code>
            </p>
            <p className="text-[11px] text-slate-500">
              Provide this temporary credential securely to the user. They will be forced to change it on their next login.
            </p>
          </div>
          <button onClick={() => setResetFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: USERS LIST */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search accounts by name, username, dept..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs"
              />
            </div>
            <span className="text-slate-400 text-[11px]">
              Henok Akalu has full access to edit user details and appoint new administrators.
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">User Details</th>
                    <th className="py-3 px-3">Contact (Phone / Email)</th>
                    <th className="py-3 px-3">Username & Role</th>
                    <th className="py-3 px-3">Assigned Directorate</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Admin Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredUsers.map(u => {
                    const isSelf = u.id === currentUser?.id;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{u.fullName}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-sky-500/10 text-sky-600 px-1.5 py-0.2 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.jobTitle}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 font-medium">{u.phone || 'No phone'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{u.email}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <code className="text-slate-700 dark:text-slate-300 font-semibold font-mono">@{u.username}</code>
                          <div className="mt-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'SUPER_ADMIN'
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                                : u.role === 'RESTRICTED_ADMIN'
                                ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                            }`}>
                              {u.role.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {u.departmentName}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.isActive
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-rose-500/10 text-rose-600'
                          }`}>
                            {u.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Edit User Info & Set Admin */}
                            <button
                              onClick={() => handleOpenEditUser(u)}
                              className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 text-sky-700 dark:text-sky-300 rounded-lg text-[11px] font-medium transition flex items-center gap-1 border border-sky-200/60 dark:border-sky-800/40"
                              title="Edit user personal information & set admin role"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit Info & Role</span>
                            </button>

                            {/* Reset Password Button */}
                            <button
                              onClick={() => handleAdminReset(u)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition"
                              title="Generate temporary password & force reset"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Toggle Active/Inactive */}
                            {!isSelf && (
                              <button
                                onClick={() => toggleUserStatus(u.id, !u.isActive)}
                                className={`p-1.5 rounded-lg transition ${
                                  u.isActive 
                                    ? 'text-rose-500 hover:bg-rose-50' 
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={u.isActive ? 'Disable account' : 'Activate account'}
                              >
                                {u.isActive ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & EXPLICIT PERMISSION MATRIX */}
      {activeTab === 'ROLES' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Role-Based Access Control Architecture
            </h3>
            <p className="text-slate-500">
              Explicit permission enforcement configured across three structural tiers in EPSS STRATEX.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 space-y-2">
              <span className="font-bold text-purple-900 dark:text-purple-300 text-sm">Super Admin (Henok Akalu)</span>
              <p className="text-slate-600 dark:text-purple-200/80 leading-relaxed text-[11px]">
                Full unrestricted cross-department authority. Can add, edit, and deactivate users, update user phone/email/name, appoint new administrators, audit evidence submissions, approve/finalize action plans, manage archives, and reopen finalized records.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 space-y-2">
              <span className="font-bold text-sky-900 dark:text-sky-300 text-sm">Restricted Admin</span>
              <p className="text-slate-600 dark:text-sky-200/80 leading-relaxed text-[11px]">
                Appointed by Super Admin Henok Akalu with individually granular checkboxes (e.g. view-only cross-department oversight, minutes recording, KPI configuration). Does NOT receive automated full privileges.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Department Coordinator / User</span>
              <p className="text-slate-600 dark:text-slate-300/80 leading-relaxed text-[11px]">
                Strictly confined to own assigned directorate. Can create, edit, progress, and submit action items and evidence. Cannot view or alter restricted files or data belonging to another department.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">EPSS Audit Trail</h3>
              <p className="text-[11px] text-slate-500">
                Tamper-evident system logs recording logins, user creations, profile edits, evidence uploads, approvals, and credential resets.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-3">Actor & Role</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-4">Audit Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 dark:text-white font-sans">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">({log.userRole})</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 dark:text-slate-300 font-sans">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create User */}
      {showCreateUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 text-xs">
            <button
              onClick={() => setShowCreateUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-1">Provision New EPSS User</h3>
            <p className="text-slate-500 mb-4">
              Newly created accounts are initialized with temporary password <code>EPSSlogin</code> and forced to reset upon first login.
            </p>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Username (Login Identifier)
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. solomon.emiru"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Solomon Emiru"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Assigned Directorate
                  </label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    System Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as Role)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    <option value="DEPARTMENT_COORDINATOR">Department Coordinator</option>
                    <option value="DEPARTMENT_USER">Department User</option>
                    <option value="RESTRICTED_ADMIN">Restricted Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@epss.gov.et"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0911000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. QMS Officer / Pharmacist"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium shadow-sm"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User Information & Set New Admin */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 text-xs">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-1">
              Edit User Details & Admin Roles (@{editingUser.username})
            </h3>
            <p className="text-slate-500 mb-4">
              Admin Henok Akalu Access: Modify personal information (Name, Phone, Email, Job Title) and appoint as administrator.
            </p>

            <form onSubmit={handleSaveUserProfileAndAdmin} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={editJobTitle}
                    onChange={(e) => setEditJobTitle(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="e.g. 0911000000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    System Role / Set New Admin
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold"
                  >
                    <option value="DEPARTMENT_USER">Department User</option>
                    <option value="DEPARTMENT_COORDINATOR">Department Coordinator</option>
                    <option value="RESTRICTED_ADMIN">Restricted Admin (Appointed)</option>
                    <option value="SUPER_ADMIN">Super Admin (Lead Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Assigned Directorate
                  </label>
                  <select
                    value={editDeptId}
                    onChange={(e) => setEditDeptId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editRole === 'RESTRICTED_ADMIN' && (
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[10px]">
                    Admin Grants for this Appointed Administrator:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editPermissions.viewAllDepartments}
                        onChange={(e) => setEditPermissions(p => ({ ...p, viewAllDepartments: e.target.checked }))}
                        className="rounded text-sky-600"
                      />
                      <span>View All Departments</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editPermissions.auditSubmissions}
                        onChange={(e) => setEditPermissions(p => ({ ...p, auditSubmissions: e.target.checked }))}
                        className="rounded text-sky-600"
                      />
                      <span>Audit & Review Submissions</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editPermissions.manageArchives}
                        onChange={(e) => setEditPermissions(p => ({ ...p, manageArchives: e.target.checked }))}
                        className="rounded text-sky-600"
                      />
                      <span>Manage Archives & Documents</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editPermissions.manageMinutes}
                        onChange={(e) => setEditPermissions(p => ({ ...p, manageMinutes: e.target.checked }))}
                        className="rounded text-sky-600"
                      />
                      <span>Record Management Minutes</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editPermissions.manageKPIs}
                        onChange={(e) => setEditPermissions(p => ({ ...p, manageKPIs: e.target.checked }))}
                        className="rounded text-sky-600"
                      />
                      <span>Configure KPIs</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                      <input
                        type="checkbox"
                        checked={editPermissions.viewAuditLogs}
                        onChange={(e) => setEditPermissions(p => ({ ...p, viewAuditLogs: e.target.checked }))}
                        className="rounded text-sky-600"
                      />
                      <span>View Audit Logs</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium shadow-sm"
                >
                  Save User & Admin Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
