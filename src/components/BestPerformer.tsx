/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Award, Trophy, CheckCircle2, ShieldCheck, Filter, ArrowUpRight, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BestPerformer: React.FC<{ onInspectPlan?: (planId: string) => void }> = ({ onInspectPlan }) => {
  const { actionPlans, departments, currentUser } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [minTasksRequired, setMinTasksRequired] = useState<number>(1);
  const [rankingMode, setRankingMode] = useState<'COORDINATOR' | 'DEPARTMENT'>('COORDINATOR');

  // Trigger celebration confetti
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Rule 8: Strictly count ONLY administrator-finalized Completed tasks (NOT drafts, NOT submitted, NOT self-reported)
  const finalizedPlans = actionPlans.filter(p => {
    if (p.status !== 'Completed') return false;
    if (selectedPeriod !== 'ALL' && p.reportingPeriod !== selectedPeriod) return false;
    return true;
  });

  // Calculate ranking by Coordinator / Responsible Person
  const coordinatorStatsMap = new Map<string, {
    name: string;
    departmentName: string;
    finalizedCount: number;
    tasks: typeof actionPlans;
  }>();

  finalizedPlans.forEach(plan => {
    const key = plan.responsiblePerson.trim();
    if (!coordinatorStatsMap.has(key)) {
      coordinatorStatsMap.set(key, {
        name: key,
        departmentName: plan.departmentName,
        finalizedCount: 0,
        tasks: []
      });
    }
    const stat = coordinatorStatsMap.get(key)!;
    stat.finalizedCount += 1;
    stat.tasks.push(plan);
  });

  const coordinatorRankings = Array.from(coordinatorStatsMap.values())
    .filter(stat => stat.finalizedCount >= minTasksRequired)
    .sort((a, b) => b.finalizedCount - a.finalizedCount);

  // Calculate ranking by Department
  const departmentStatsMap = new Map<string, {
    departmentId: string;
    departmentName: string;
    finalizedCount: number;
    totalTasks: number;
    tasks: typeof actionPlans;
  }>();

  departments.forEach(dept => {
    const deptAllTasks = actionPlans.filter(p => p.departmentId === dept.id);
    const deptFinalized = finalizedPlans.filter(p => p.departmentId === dept.id);
    departmentStatsMap.set(dept.id, {
      departmentId: dept.id,
      departmentName: dept.name,
      finalizedCount: deptFinalized.length,
      totalTasks: deptAllTasks.length,
      tasks: deptFinalized
    });
  });

  const departmentRankings = Array.from(departmentStatsMap.values())
    .filter(stat => stat.finalizedCount >= minTasksRequired)
    .sort((a, b) => b.finalizedCount - a.finalizedCount);

  const topCoordinator = coordinatorRankings[0];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Verified Meritocracy</span>
            <span>·</span>
            <span>Audited Recognition</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Best Performer Recognition Module
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rankings derived strictly from tasks formally reviewed and finalized as Completed by the Super Admin.
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <Trophy className="w-4 h-4" />
          <span>Celebrate Top Performers</span>
        </button>
      </div>

      {/* Strict Methodology Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-xs text-sky-900 dark:text-sky-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Transparent Verification Standard (EPSS Stratex Rule 8):</p>
          <p className="text-slate-600 dark:text-sky-200/90 leading-relaxed">
            Performance scoring strictly excludes self-reported progress bars, draft plans, chat engagement, or unapproved submissions. Only tasks that underwent rigorous evidence audit and received formal approval by Super Admin Henok Akalu qualify for recognition.
          </p>
        </div>
      </div>

      {/* Control Bar: Mode Toggle, Period Filter, and Min Threshold */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">View By:</span>
          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setRankingMode('COORDINATOR')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                rankingMode === 'COORDINATOR' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Lead Coordinators
            </button>
            <button
              onClick={() => setRankingMode('DEPARTMENT')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                rankingMode === 'DEPARTMENT' 
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Directorates
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Period:</span>
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
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Min. Completed Tasks:</span>
            <select
              value={minTasksRequired}
              onChange={(e) => setMinTasksRequired(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value={1}>At least 1 task</option>
              <option value={2}>At least 2 tasks</option>
              <option value={3}>At least 3 tasks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Featured Top Performer Spotlight Card (If data exists) */}
      {rankingMode === 'COORDINATOR' && topCoordinator && (
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
                <Trophy className="w-9 h-9 text-yellow-200 animate-bounce" />
              </div>
              <div>
                <span className="inline-block text-[11px] uppercase tracking-wider font-extrabold bg-white/20 px-2.5 py-0.5 rounded-full mb-1">
                  Highest Verified Milestone Accomplishments
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {topCoordinator.name}
                </h2>
                <p className="text-sm text-yellow-100 font-medium">
                  {topCoordinator.departmentName}
                </p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">Verified Completed Tasks</span>
              <div className="text-3xl font-black font-mono-numbers mt-0.5">
                {topCoordinator.finalizedCount}
              </div>
              <span className="text-[10px] text-yellow-100 block mt-0.5">100% Admin Audited</span>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Breakdown List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          {rankingMode === 'COORDINATOR' ? 'Coordinators & Responsible Persons Leaderboard' : 'Directorates Implementation Leaderboard'}
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Every ranking entry displays the exact underlying finalized tasks used for verification.
        </p>

        {rankingMode === 'COORDINATOR' ? (
          coordinatorRankings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-600 dark:text-slate-300">No verified best performers for this quarter yet.</p>
              <p>Rankings are generated dynamically based strictly on actual tasks completed and audited by Super Admin Henok Akalu.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coordinatorRankings.map((stat, idx) => (
                <div 
                  key={stat.name}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        idx === 0 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : idx === 1 
                          ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white' 
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {stat.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {stat.departmentName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Finalized Deliverables:</span>
                        <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
                          {stat.finalizedCount} Completed Tasks
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Underlying Verified Tasks (Transparency mandate) */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                      Underlying Verified Action Tasks:
                    </span>
                    <div className="space-y-1.5">
                      {stat.tasks.map(t => (
                        <div key={t.id} className="flex items-center justify-between bg-white dark:bg-slate-900/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px]">
                          <div className="flex items-center gap-2 truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            Audited: {t.finalizedAt?.split('T')[0] || 'Verified'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Department Ranking */
          departmentRankings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No departments have finalized tasks for this filter.
            </div>
          ) : (
            <div className="space-y-4">
              {departmentRankings.map((stat, idx) => (
                <div 
                  key={stat.departmentId}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center text-sm">
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {stat.departmentName}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {stat.finalizedCount} of {stat.totalTasks} Total Directorate Tasks Finalized
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
                        {stat.totalTasks > 0 ? Math.round((stat.finalizedCount / stat.totalTasks) * 100) : 0}% Accomplished
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};
