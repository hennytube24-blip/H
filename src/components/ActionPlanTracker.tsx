/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActionPlanItem, ActionPlanPriority, ActionPlanStatus, EvidenceAttachment } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  Upload, 
  FileCheck, 
  Paperclip, 
  ExternalLink,
  ShieldAlert,
  X,
  MessageSquare,
  Lock,
  Unlock,
  Check
} from 'lucide-react';

export const ActionPlanTracker: React.FC = () => {
  const { 
    actionPlans, 
    departments, 
    currentUser, 
    createActionPlan, 
    updateActionPlan, 
    deleteActionPlan,
    submitActionPlanForReview, 
    reviewActionPlan,
    reopenActionPlan
  } = useApp();

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<ActionPlanItem | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<ActionPlanItem | null>(null);
  const [showReviewModal, setShowReviewModal] = useState<ActionPlanItem | null>(null);
  const [showReopenModal, setShowReopenModal] = useState<ActionPlanItem | null>(null);

  // Form states for New Action Plan
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeptId, setNewDeptId] = useState(currentUser?.departmentId || 'dept_qms');
  const [newResponsible, setNewResponsible] = useState(currentUser?.fullName || '');
  const [newAssignedDate, setNewAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTargetDate, setNewTargetDate] = useState('2026-06-30');
  const [newReportingPeriod, setNewReportingPeriod] = useState('First Quarter');
  const [newPriority, setNewPriority] = useState<ActionPlanPriority>('High');

  // Submission form state
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);

  // Review form state
  const [reviewDecision, setReviewDecision] = useState<'APPROVE' | 'REVISE'>('APPROVE');
  const [reviewComment, setReviewComment] = useState('');

  // Reopen form state
  const [reopenReason, setReopenReason] = useState('');

  // Check if current user has cross-department view / audit privileges
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const hasCrossDeptAccess = isSuperAdmin || 
    (currentUser?.role === 'RESTRICTED_ADMIN' && currentUser?.permissions?.viewAllDepartments);

  // Department User restriction: can only see their department's action plans unless authorized
  const visiblePlans = actionPlans.filter(item => {
    if (!hasCrossDeptAccess && currentUser?.departmentId !== item.departmentId) {
      return false;
    }
    if (selectedDept !== 'ALL' && item.departmentId !== selectedDept) return false;
    if (selectedPeriod !== 'ALL' && item.reportingPeriod !== selectedPeriod) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && item.priority !== selectedPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchDept = item.departmentName.toLowerCase().includes(q);
      const matchPerson = item.responsiblePerson.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchDept && !matchPerson) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const deptObj = departments.find(d => d.id === newDeptId);
    if (!deptObj) return;

    await createActionPlan({
      title: newTitle,
      description: newDescription,
      departmentId: newDeptId,
      departmentName: deptObj.name,
      responsiblePerson: newResponsible,
      assignedDate: newAssignedDate,
      targetCompletionDate: newTargetDate,
      reportingPeriod: newReportingPeriod,
      priority: newPriority,
      progressPercentage: 0,
      createdBy: currentUser?.id || 'usr_henok_akalu'
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleSubmitReviewForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal) return;

    let evidence: EvidenceAttachment | undefined = undefined;
    if (submissionFile) {
      evidence = {
        id: `ev_${Date.now()}`,
        fileName: submissionFile.name,
        fileSize: submissionFile.size,
        fileType: submissionFile.type || 'application/octet-stream',
        uploadedBy: currentUser?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
        notes: submissionNotes
      };
    }

    await submitActionPlanForReview(showSubmitModal.id, submissionNotes, evidence);
    setShowSubmitModal(null);
    setSubmissionNotes('');
    setSubmissionFile(null);
  };

  const handleReviewDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewModal) return;

    await reviewActionPlan(showReviewModal.id, reviewDecision, reviewComment);
    setShowReviewModal(null);
    setReviewComment('');
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReopenModal || !reopenReason.trim()) return;

    await reopenActionPlan(showReopenModal.id, reopenReason);
    setShowReopenModal(null);
    setReopenReason('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Core Workflow</span>
            <span>·</span>
            <span>Audited Action Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Action Plan Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {hasCrossDeptAccess 
              ? 'Authorized Administrator View — Oversight across all 10 EPSS Directorates.' 
              : `Department Scope Restricted — Showing records for: ${currentUser?.departmentName}`}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Action Plan</span>
        </button>
      </div>

      {/* Cross-Department Access Notice */}
      {!hasCrossDeptAccess && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Role-Based Access Enforcement: Your access is strictly isolated to <strong>{currentUser?.departmentName}</strong>. You cannot access or modify records belonging to other EPSS directorates.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded">
            Restricted
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search action items by title, description, coordinator..."
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {hasCrossDeptAccess && (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            )}

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted for Review">Submitted for Review</option>
              <option value="Completed">Completed</option>
              <option value="Returned for Revision">Returned for Revision</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium"
            >
              <option value="ALL">All Quarters</option>
              <option value="First Quarter">First Quarter</option>
              <option value="Second Quarter">Second Quarter</option>
              <option value="Third Quarter">Third Quarter</option>
              <option value="Fourth Quarter">Fourth Quarter</option>
            </select>

            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Plans Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {visiblePlans.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">No Action Plans Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No action plan items match your active filters or department scope.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Action Item & Objective</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Lead Coordinator</th>
                  <th className="py-3 px-3">Target Date</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {visiblePlans.map(plan => {
                  const isDeptOwner = currentUser?.departmentId === plan.departmentId;
                  const canSubmit = isDeptOwner || isSuperAdmin;
                  const canReview = isSuperAdmin || (currentUser?.role === 'RESTRICTED_ADMIN' && currentUser?.permissions?.auditSubmissions);
                  const isFinalized = plan.status === 'Completed';

                  return (
                    <tr 
                      key={plan.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div 
                          onClick={() => setSelectedPlanDetail(plan)}
                          className="font-bold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer line-clamp-1"
                        >
                          {plan.title}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {plan.description}
                        </p>
                        {plan.evidenceAttachments.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-sky-600 dark:text-sky-400 mt-1">
                            <Paperclip className="w-3 h-3" />
                            <span>{plan.evidenceAttachments.length} evidence doc attached</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {plan.departmentName}
                        </span>
                        <div className="text-[10px] text-slate-400">{plan.reportingPeriod}</div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-700 dark:text-slate-300">{plan.responsiblePerson}</span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap font-mono-numbers">
                        <span className={plan.status !== 'Completed' && plan.targetCompletionDate < '2026-11-05' ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}>
                          {plan.targetCompletionDate}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                          plan.priority === 'High' 
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' 
                            : plan.priority === 'Medium'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                        }`}>
                          {plan.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${plan.progressPercentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`}
                              style={{ width: `${plan.progressPercentage}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono-numbers text-slate-500">
                            {plan.progressPercentage}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          plan.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                            : plan.status === 'Submitted for Review'
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                            : plan.status === 'Returned for Revision'
                            ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                            : plan.status === 'In Progress'
                            ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {plan.status === 'Completed' && <Check className="w-3 h-3 text-emerald-600" />}
                          {plan.status === 'Submitted for Review' && <Clock className="w-3 h-3 text-amber-600" />}
                          {plan.status === 'Returned for Revision' && <AlertCircle className="w-3 h-3 text-rose-600" />}
                          <span>{plan.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Detail button */}
                          <button
                            onClick={() => setSelectedPlanDetail(plan)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            title="Inspect full history and details"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Submit for review button: only if not finalized and authorized */}
                          {!isFinalized && canSubmit && (
                            <button
                              onClick={() => {
                                setShowSubmitModal(plan);
                                setSubmissionNotes(plan.completionNotes || '');
                              }}
                              className="px-2.5 py-1 bg-amber-600/10 hover:bg-amber-600 text-amber-700 hover:text-white dark:text-amber-300 rounded-lg text-[11px] font-medium border border-amber-500/30 transition flex items-center gap-1"
                              title="Submit status & evidence for Henok Akalu audit"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Submit</span>
                            </button>
                          )}

                          {/* Henok Akalu Audit button: only if submitted for review */}
                          {plan.status === 'Submitted for Review' && canReview && (
                            <button
                              onClick={() => {
                                setShowReviewModal(plan);
                                setReviewDecision('APPROVE');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-medium transition flex items-center gap-1 shadow-xs"
                              title="Audit submission and approve or return"
                            >
                              <FileCheck className="w-3 h-3" />
                              <span>Audit</span>
                            </button>
                          )}

                          {/* Super Admin Henok Akalu Remove / Delete Task Action */}
                          {isSuperAdmin && (
                            <button
                              onClick={() => {
                                if (confirm(`Remove task "${plan.title}"? This task will be deleted by Admin Henok Akalu.`)) {
                                  deleteActionPlan(plan.id);
                                }
                              }}
                              className="px-2 py-1 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-[11px] font-medium transition flex items-center gap-1 border border-rose-200 dark:border-rose-800"
                              title="Delete task from system"
                            >
                              <X className="w-3 h-3" />
                              <span>Remove</span>
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
        )}
      </div>

      {/* Modal 1: Create New Action Plan */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold">Create Department Action Plan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Formal strategic target linked to EPSS AA2 operational deliverables.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Task / Action Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Conduct cold room thermal mapping verification"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Detailed Scope & Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Detailed execution methodology, expected deliverable, and regulatory compliance targets..."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Responsible Department
                  </label>
                  <select
                    value={newDeptId}
                    onChange={(e) => setNewDeptId(e.target.value)}
                    disabled={!hasCrossDeptAccess}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white disabled:opacity-60"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Responsible Person / Lead
                  </label>
                  <input
                    type="text"
                    value={newResponsible}
                    onChange={(e) => setNewResponsible(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Assigned Date
                  </label>
                  <input
                    type="date"
                    value={newAssignedDate}
                    onChange={(e) => setNewAssignedDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Reporting Period
                  </label>
                  <select
                    value={newReportingPeriod}
                    onChange={(e) => setNewReportingPeriod(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="First Quarter">First Quarter</option>
                    <option value="Second Quarter">Second Quarter</option>
                    <option value="Third Quarter">Third Quarter</option>
                    <option value="Fourth Quarter">Fourth Quarter</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Priority Level
                </label>
                <div className="flex gap-4">
                  {(['High', 'Medium', 'Low'] as ActionPlanPriority[]).map(p => (
                    <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="priority"
                        checked={newPriority === p}
                        onChange={() => setNewPriority(p)}
                        className="text-sky-600"
                      />
                      <span>{p}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium shadow-sm"
                >
                  Create Plan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Submit Status & Evidence Attachment */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowSubmitModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold">Submit Implementation Evidence</h3>
            <p className="text-xs text-slate-500 mb-3">
              Submitting for official audit by Henok Akalu (Quality & Super Admin).
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-200">Task:</span>
              <p className="font-bold text-sky-600 dark:text-sky-400 mt-0.5">{showSubmitModal.title}</p>
            </div>

            <form onSubmit={handleSubmitReviewForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Completion Notes & Implementation Summary
                </label>
                <textarea
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                  required
                  placeholder="Detail the steps completed, verification results, and date of completion..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Supporting Evidence Attachment (PDF, Images, Report)
                </label>
                <input
                  type="file"
                  onChange={(e) => setSubmissionFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950/60 dark:file:text-sky-300 hover:file:bg-sky-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Accepted: Signed PDF certificates, photos of completed facility setup, calibration sheets (Max 25MB).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium shadow-sm flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Auditor Review & Finalization Decision (Henok Akalu) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowReviewModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-500" />
              Administrative Audit & Decision
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Super Admin Henok Akalu oversight: Inspect evidence before formal completion approval.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div>
                <span className="text-slate-500">Plan:</span> <strong>{showReviewModal.title}</strong>
              </div>
              <div>
                <span className="text-slate-500">Dept:</span> {showReviewModal.departmentName}
              </div>
              {showReviewModal.evidenceAttachments.length > 0 && (
                <div className="text-sky-600 dark:text-sky-400 font-medium">
                  {showReviewModal.evidenceAttachments.length} Evidence files attached for audit inspection.
                </div>
              )}
            </div>

            <form onSubmit={handleReviewDecisionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
                  Audit Decision
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('APPROVE')}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition ${
                      reviewDecision === 'APPROVE' 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Finalize</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('REVISE')}
                    className={`py-2.5 px-3 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition ${
                      reviewDecision === 'REVISE' 
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Return for Revision</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Written Auditor Comment / Revision Directives
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={3}
                  required
                  placeholder={
                    reviewDecision === 'APPROVE' 
                      ? 'e.g. Verified against EPSS AA2 Quality SOP standards. Evidence archived and approved as Completed.' 
                      : 'State exact deficiencies or missing documentation required before resubmission...'
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(null)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-xl font-medium shadow-sm ${
                    reviewDecision === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Reopen Finalized Plan (Super Admin Only) */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100">
            <button
              onClick={() => setShowReopenModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <Unlock className="w-5 h-5" />
              Reopen Finalized Record
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Per EPSS compliance, reopening a finalized plan reverts its status to In Progress and records an immutable audit reason.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Mandatory Audit Reason for Reopening
                </label>
                <textarea
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  rows={3}
                  required
                  placeholder="e.g. Post-audit inspection revealed non-conforming batch recall requiring revised timeline."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(null)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium shadow-sm"
                >
                  Reopen Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Comprehensive Detail & Audit History View */}
      {selectedPlanDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedPlanDetail.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : selectedPlanDetail.status === 'Submitted for Review'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                  }`}>
                    {selectedPlanDetail.status}
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {selectedPlanDetail.departmentName}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedPlanDetail.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Description & Scope
                </h4>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedPlanDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500">Lead Coordinator:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPlanDetail.responsiblePerson}</div>
                </div>
                <div>
                  <span className="text-slate-500">Target Completion:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPlanDetail.targetCompletionDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">Reporting Period:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPlanDetail.reportingPeriod}</div>
                </div>
                <div>
                  <span className="text-slate-500">Priority:</span>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">{selectedPlanDetail.priority}</div>
                </div>
              </div>

              {selectedPlanDetail.completionNotes && (
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Completion Notes & Department Remarks
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {selectedPlanDetail.completionNotes}
                  </p>
                </div>
              )}

              {/* Evidence Attachments */}
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-sky-500" />
                  <span>Evidence Documents ({selectedPlanDetail.evidenceAttachments.length})</span>
                </h4>
                {selectedPlanDetail.evidenceAttachments.length === 0 ? (
                  <p className="text-slate-400 italic">No evidence files attached yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedPlanDetail.evidenceAttachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-500" />
                          <div>
                            <span className="font-medium text-slate-900 dark:text-white">{att.fileName}</span>
                            <div className="text-[10px] text-slate-400">
                              Uploaded {new Date(att.uploadedAt).toLocaleDateString()} · {(att.fileSize / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                        </div>
                        <span className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">Verified Evidence</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit & Review History */}
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Administrative Audit History</span>
                </h4>
                {selectedPlanDetail.reviewHistory.length === 0 ? (
                  <p className="text-slate-400 italic">No previous audit review events recorded.</p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedPlanDetail.reviewHistory.map(rev => (
                      <div key={rev.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {rev.reviewerName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(rev.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Transition: <span className="font-semibold text-slate-700 dark:text-slate-300">{rev.previousStatus}</span> → <span className="font-bold text-sky-600">{rev.newStatus}</span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 italic pt-1 border-t border-slate-200 dark:border-slate-700/60">
                          "{rev.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPlanDetail(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
