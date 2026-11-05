/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  FileText, 
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const ExecutiveDashboard: React.FC<{ onNavigateToTracker: () => void; onNavigateToBestPerformer: () => void }> = ({ 
  onNavigateToTracker,
  onNavigateToBestPerformer
}) => {
  const { actionPlans, departments, currentUser } = useApp();

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Filtered dataset
  const filteredPlans = actionPlans.filter(item => {
    if (selectedDept !== 'ALL' && item.departmentId !== selectedDept) return false;
    if (selectedPeriod !== 'ALL' && item.reportingPeriod !== selectedPeriod) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    return true;
  });

  // Strict Real-Data Calculations
  const totalItems = filteredPlans.length;
  const completedItems = filteredPlans.filter(p => p.status === 'Completed').length;
  const inProgressItems = filteredPlans.filter(p => p.status === 'In Progress').length;
  const submittedItems = filteredPlans.filter(p => p.status === 'Submitted for Review').length;
  const returnedItems = filteredPlans.filter(p => p.status === 'Returned for Revision').length;
  const notStartedItems = filteredPlans.filter(p => p.status === 'Not Started').length;
  const pendingItems = submittedItems + returnedItems + notStartedItems;

  // Overdue calculation (target completion date < today and not completed)
  const todayStr = '2026-11-05'; // local runtime reference date
  const overdueItems = filteredPlans.filter(p => p.status !== 'Completed' && p.targetCompletionDate < todayStr).length;

  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 1000) / 10 : 0;

  // Departmental Progress Breakdown
  const deptBreakdown = departments.map(dept => {
    const deptPlans = actionPlans.filter(p => p.departmentId === dept.id);
    const completed = deptPlans.filter(p => p.status === 'Completed').length;
    const total = deptPlans.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      ...dept,
      total,
      completed,
      pct
    };
  }).sort((a, b) => b.completed - a.completed);

  // Recent Submissions
  const recentSubmissions = actionPlans
    .filter(p => p.status === 'Submitted for Review' || (p.reviewHistory && p.reviewHistory.length > 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Ethiopian Pharmaceutical Supply Service</span>
            <span>·</span>
            <span>Addis Ababa 2 Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Executive Action Plan & Implementation Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time verified status compiled across all 10 departmental directorates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToTracker}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-medium transition shadow-sm"
          >
            <span>Open Tracker</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Filter className="w-4 h-4 text-sky-500" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Filter Live Data:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Reporting Period Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Quarters</option>
              <option value="First Quarter">First Quarter</option>
              <option value="Second Quarter">Second Quarter</option>
              <option value="Third Quarter">Third Quarter</option>
              <option value="Fourth Quarter">Fourth Quarter</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Submitted for Review">Submitted for Review</option>
              <option value="Completed">Completed</option>
              <option value="Returned for Revision">Returned for Revision</option>
            </select>
          </div>

          {(selectedDept !== 'ALL' || selectedPeriod !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSelectedDept('ALL');
                setSelectedPeriod('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-sky-600 dark:text-sky-400 hover:underline px-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Actions</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono-numbers">
            {totalItems}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Targeted tasks</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
            {completedItems}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Admin finalized</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono-numbers">
            {inProgressItems}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Active execution</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono-numbers">
            {submittedItems}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting audit</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold">Overdue / Alert</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono-numbers">
            {overdueItems}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Past target date</p>
        </div>

        <div className="bg-gradient-to-br from-sky-600 to-blue-700 text-white p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <span className="text-xs font-semibold">Completion %</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-2xl font-extrabold font-mono-numbers">
            {completionPercentage}%
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-white h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(completionPercentage, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Departmental Performance Progress & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Departmental Completion Matrix */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Departmental Implementation Progress
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified task completion ratio calculated from finalized audit records.
              </p>
            </div>
            <button
              onClick={onNavigateToBestPerformer}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>View Best Performer Rankings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {deptBreakdown.map((dept, index) => (
              <div key={dept.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{dept.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">({dept.code})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Coordinator: {dept.headName} · {dept.headRole}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white font-mono-numbers">
                      {dept.completed} / {dept.total} Done
                    </span>
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold font-mono-numbers ml-2">
                      ({dept.pct}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      dept.pct === 100 
                        ? 'bg-emerald-500' 
                        : dept.pct >= 50 
                        ? 'bg-sky-500' 
                        : 'bg-amber-500'
                    }`} 
                    style={{ width: `${dept.pct}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Submissions & Pending Audits */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Recent Submissions & Audits
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Latest status updates awaiting or recently finalized
                </p>
              </div>
            </div>

            {recentSubmissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No recent submissions to display.
              </div>
            ) : (
              <div className="space-y-3">
                {recentSubmissions.map(item => (
                  <div 
                    key={item.id} 
                    onClick={onNavigateToTracker}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-sky-400 cursor-pointer transition text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                        item.status === 'Completed' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : item.status === 'Submitted for Review' 
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{item.departmentName}</span>
                      <span>Target: {item.targetCompletionDate}</span>
                    </div>

                    {item.evidenceAttachments.length > 0 && (
                      <div className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>{item.evidenceAttachments.length} Evidence Document Attached</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-800 dark:text-sky-300">
            <p className="font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Auditor Note
            </p>
            <p className="text-[11px] mt-1 text-sky-700 dark:text-sky-300/90 leading-relaxed">
              Submissions require signed proof of completion before final approval. Super Admin Henok Akalu performs formal verification against EPSS AA2 Quality SOPs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
