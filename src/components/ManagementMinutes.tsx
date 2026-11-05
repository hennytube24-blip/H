/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Calendar, 
  UserCheck, 
  Link2, 
  CheckCircle, 
  Clock, 
  X,
  FileText
} from 'lucide-react';

export const ManagementMinutes: React.FC<{ onNavigateToTracker?: (planId: string) => void }> = ({ onNavigateToTracker }) => {
  const { meetingMinutes, createMeetingMinute, deleteMeetingMinute, actionPlans, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('EPSS AA2 Hub Executive Conference Hall');
  const [newChairperson, setNewChairperson] = useState('Muluken Moges (Branch Manager)');
  const [newSecretary, setNewSecretary] = useState('Henok Akalu (Quality Control & Assurance Head)');
  const [newAttendees, setNewAttendees] = useState('Muluken Moges, Shiferaw Bekele, Henok Akalu, Dejene Teklemariam, Habtam Oumer, Desta Getye, Haregewoin Abere, Mekbeb Woldesenbet, Wendimagegn Ashenafi, Moges Gulilat');
  const [newAgenda, setNewAgenda] = useState('1. Monthly performance and action plan audit review\n2. Supply fulfillment for public hospitals\n3. Warehouse cold-chain monitoring');
  const [newDiscussion, setNewDiscussion] = useState('');
  
  // Decisions
  const [decisionsList, setDecisionsList] = useState<{
    id: string;
    description: string;
    responsiblePerson: string;
    dueDate: string;
    linkedActionPlanId?: string;
    status: 'Pending' | 'In Progress' | 'Resolved';
  }[]>([
    {
      id: 'd1',
      description: 'Audit and approve cold-chain temperature logger calibration certification',
      responsiblePerson: 'Henok Akalu',
      dueDate: '2026-05-15',
      linkedActionPlanId: actionPlans[0]?.id || '',
      status: 'In Progress'
    }
  ]);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const canManageMinutes = isSuperAdmin || 
    (currentUser?.role === 'RESTRICTED_ADMIN' && currentUser?.permissions?.manageMinutes);

  const filteredMinutes = meetingMinutes.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.title.toLowerCase().includes(q) || 
      m.discussionSummary.toLowerCase().includes(q) ||
      m.chairperson.toLowerCase().includes(q);
  });

  const handleAddDecisionRow = () => {
    setDecisionsList(prev => [
      ...prev,
      {
        id: `d_${Date.now()}`,
        description: '',
        responsiblePerson: '',
        dueDate: '2026-06-30',
        linkedActionPlanId: '',
        status: 'Pending'
      }
    ]);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await createMeetingMinute({
      title: newTitle,
      meetingDate: newDate,
      location: newLocation,
      chairperson: newChairperson,
      secretary: newSecretary,
      attendees: newAttendees.split(',').map(s => s.trim()).filter(Boolean),
      agendaItems: newAgenda.split('\n').map(s => s.trim()).filter(Boolean),
      discussionSummary: newDiscussion,
      decisions: decisionsList.filter(d => d.description.trim())
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDiscussion('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Executive Governance</span>
            <span>·</span>
            <span>Decision Registry</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Management Meeting Minutes & Decisions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Audited records of executive resolutions directly linked to Action Plan Tracker deliverables.
          </p>
        </div>

        {canManageMinutes && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record Meeting Minutes</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search meeting minutes by title, agenda, attendee..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          {filteredMinutes.length} Meeting Records Retained
        </span>
      </div>

      {/* Minutes List */}
      <div className="space-y-6">
        {filteredMinutes.map(minute => (
          <div
            key={minute.id}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                  Official Record
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {minute.title}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-mono-numbers">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  {minute.meetingDate}
                </span>
                <span>·</span>
                <span>{minute.location}</span>
                {canManageMinutes && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete meeting minutes "${minute.title}"?`)) {
                        deleteMeetingMinute(minute.id);
                      }
                    }}
                    className="ml-2 px-2 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition text-[11px] font-medium"
                    title="Delete meeting minutes record"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Leadership Personnel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[11px]">Chairperson:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{minute.chairperson}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Secretary:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{minute.secretary}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Attendees:</span>
                <span className="text-slate-700 dark:text-slate-300">{minute.attendees.length} Leadership Officials</span>
              </div>
            </div>

            {/* Discussion Summary */}
            <div className="text-xs space-y-1">
              <span className="font-semibold uppercase tracking-wider text-slate-500 text-[10px]">
                Executive Discussion Summary:
              </span>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {minute.discussionSummary}
              </p>
            </div>

            {/* Linked Decisions & Action Plans */}
            <div className="space-y-2">
              <span className="font-semibold uppercase tracking-wider text-slate-500 text-[10px] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-sky-500" />
                Executive Decisions & Linked Action Items ({minute.decisions.length})
              </span>

              <div className="grid grid-cols-1 gap-2">
                {minute.decisions.map(dec => {
                  const linkedPlan = actionPlans.find(p => p.id === dec.linkedActionPlanId);

                  return (
                    <div
                      key={dec.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {dec.description}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Lead: <strong>{dec.responsiblePerson}</strong></span>
                          <span>·</span>
                          <span>Due: <strong>{dec.dueDate}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {linkedPlan ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/50 text-sky-700 dark:text-sky-300 text-[11px]">
                            <Link2 className="w-3 h-3 text-sky-500" />
                            <span className="font-medium truncate max-w-[140px] sm:max-w-xs">{linkedPlan.title}</span>
                            <span className="font-bold font-mono">({linkedPlan.status})</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No plan linked</span>
                        )}

                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          dec.status === 'Resolved' 
                            ? 'bg-emerald-500/10 text-emerald-600' 
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {dec.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Record Minutes Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto text-slate-900 dark:text-slate-100 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold">Record Management Meeting Minutes</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q2 Directorate Review & Performance Audit"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Chairperson
                  </label>
                  <input
                    type="text"
                    value={newChairperson}
                    onChange={(e) => setNewChairperson(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Secretary
                  </label>
                  <input
                    type="text"
                    value={newSecretary}
                    onChange={(e) => setNewSecretary(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Attendees (comma separated)
                </label>
                <input
                  type="text"
                  value={newAttendees}
                  onChange={(e) => setNewAttendees(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Discussion Summary
                </label>
                <textarea
                  value={newDiscussion}
                  onChange={(e) => setNewDiscussion(e.target.value)}
                  rows={3}
                  required
                  placeholder="Record executive discussions, supply chain challenges, and key resolutions..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              {/* Decisions Table with Action Plan Linker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Decisions & Link to Action Plan Tracker
                  </label>
                  <button
                    type="button"
                    onClick={handleAddDecisionRow}
                    className="text-sky-600 hover:underline font-bold text-xs"
                  >
                    + Add Decision Row
                  </button>
                </div>

                <div className="space-y-3">
                  {decisionsList.map((dec, i) => (
                    <div key={dec.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <input
                        type="text"
                        value={dec.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          setDecisionsList(prev => prev.map((item, idx) => idx === i ? { ...item, description: val } : item));
                        }}
                        placeholder="Decision description / deliverable"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={dec.responsiblePerson}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDecisionsList(prev => prev.map((item, idx) => idx === i ? { ...item, responsiblePerson: val } : item));
                          }}
                          placeholder="Responsible Lead"
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px]"
                        />
                        <input
                          type="date"
                          value={dec.dueDate}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDecisionsList(prev => prev.map((item, idx) => idx === i ? { ...item, dueDate: val } : item));
                          }}
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px]"
                        />
                        <select
                          value={dec.linkedActionPlanId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDecisionsList(prev => prev.map((item, idx) => idx === i ? { ...item, linkedActionPlanId: val } : item));
                          }}
                          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px]"
                        >
                          <option value="">Link to Action Plan...</option>
                          {actionPlans.map(p => (
                            <option key={p.id} value={p.id}>{p.departmentName}: {p.title.slice(0, 30)}...</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium shadow-sm"
                >
                  Save Meeting Minutes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
