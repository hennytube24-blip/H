/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KPIItem, ReportingPeriod } from '../types';
import { 
  BarChart3, 
  Plus, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Filter,
  X,
  Edit3,
  Trash2,
  ShieldCheck,
  Calculator
} from 'lucide-react';

export const KPIs: React.FC = () => {
  const { kpis, departments, currentUser, createKPI, updateKPI, deleteKPI } = useApp();

  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingKPI, setEditingKPI] = useState<KPIItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [definition, setDefinition] = useState('');
  const [deptId, setDeptId] = useState(currentUser?.departmentId || 'dept_qms');
  const [target, setTarget] = useState<number>(90);
  const [actual, setActual] = useState<number>(85);
  const [unit, setUnit] = useState('%');
  const [frequency, setFrequency] = useState<KPIItem['reportingFrequency']>('Quarterly');
  const [period, setPeriod] = useState<ReportingPeriod>('First Quarter');
  const [dataSource, setDataSource] = useState<KPIItem['dataSource']>('HCMIS Verified Ledger');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const canManageKPIs = isSuperAdmin || 
    (currentUser?.role === 'RESTRICTED_ADMIN' && currentUser?.permissions?.manageKPIs);

  const filteredKPIs = kpis.filter(item => {
    if (selectedDept !== 'ALL' && item.departmentId !== selectedDept) return false;
    if (selectedPeriod !== 'ALL' && item.reportingPeriod !== selectedPeriod) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingKPI(null);
    setName('');
    setDefinition('');
    setDeptId(currentUser?.departmentId || 'dept_qms');
    setTarget(90);
    setActual(85);
    setUnit('%');
    setFrequency('Quarterly');
    setPeriod('First Quarter');
    setDataSource('HCMIS Verified Ledger');
    setShowCreateModal(true);
  };

  const handleOpenEdit = (kpi: KPIItem) => {
    setEditingKPI(kpi);
    setName(kpi.name);
    setDefinition(kpi.definition);
    setDeptId(kpi.departmentId);
    setTarget(kpi.target);
    setActual(kpi.actualResult);
    setUnit(kpi.unitOfMeasure);
    setFrequency(kpi.reportingFrequency);
    setPeriod((kpi.reportingPeriod as ReportingPeriod) || 'First Quarter');
    setDataSource(kpi.dataSource);
    setShowCreateModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const deptObj = departments.find(d => d.id === deptId);
    if (!deptObj) return;

    const computedStatus = actual >= target 
      ? 'On Target' 
      : (actual >= target * 0.7 ? 'At Risk' : 'Critical Delay');

    if (editingKPI) {
      await updateKPI(editingKPI.id, {
        name: name.trim(),
        definition: definition.trim(),
        departmentId: deptId,
        departmentName: deptObj.name,
        target,
        actualResult: actual,
        unitOfMeasure: unit.trim(),
        reportingFrequency: frequency,
        reportingPeriod: period,
        dataSource,
        status: computedStatus
      });
    } else {
      await createKPI({
        name: name.trim(),
        definition: definition.trim(),
        departmentId: deptId,
        departmentName: deptObj.name,
        target,
        actualResult: actual,
        unitOfMeasure: unit.trim(),
        reportingFrequency: frequency,
        reportingPeriod: period,
        dataSource,
        isAutoCalculated: false,
        status: computedStatus
      });
    }

    setShowCreateModal(false);
  };

  const handleExportCSV = () => {
    const headers = ['KPI Name', 'Department', 'Target', 'Actual', 'Unit', 'Frequency', 'Period', 'Data Source', 'Status'];
    const rows = filteredKPIs.map(k => [
      `"${k.name}"`,
      `"${k.departmentName}"`,
      k.target,
      k.actualResult,
      `"${k.unitOfMeasure}"`,
      `"${k.reportingFrequency}"`,
      `"${k.reportingPeriod}"`,
      `"${k.dataSource}"`,
      `"${k.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EPSS_STRATEX_KPI_Report_${period.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Performance Governance</span>
            <span>·</span>
            <span>Admin-Configured Metrics</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Institutional KPIs & Performance Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Strategic performance indicators configured and updated directly by Admin Henok Akalu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {filteredKPIs.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          {canManageKPIs && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Configure KPI</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Notice */}
      {isSuperAdmin && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Admin Henok Akalu Control: All KPIs are added, monitored, and modified by you. Zero system-generated placeholder metrics.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-purple-200/50 dark:bg-purple-900/50 px-2 py-0.5 rounded font-bold">
            Super Admin
          </span>
        </div>
      )}

      {/* Filter Bar with First, Second, Third, Fourth Quarter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-500">
          <Filter className="w-4 h-4 text-sky-500" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Filter Live Metrics:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Dept:</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-semibold">Period:</span>
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
        </div>
      </div>

      {/* KPI Cards Grid or Empty State */}
      {filteredKPIs.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 mx-auto flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No KPIs Defined</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {canManageKPIs
              ? 'No KPIs found for the selected quarter. Admin Henok Akalu can configure new strategic indicators using "Configure KPI".'
              : 'No indicators published for this selection yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredKPIs.map(kpi => {
            const progressRatio = Math.min(Math.round((kpi.actualResult / (kpi.target || 1)) * 100), 100);

            return (
              <div
                key={kpi.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                      {kpi.departmentName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      kpi.status === 'On Target'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : kpi.status === 'At Risk'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                    }`}>
                      {kpi.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {kpi.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {kpi.definition}
                  </p>
                </div>

                {/* Numerical Scores & Progress Bar */}
                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/60">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Actual Result</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers">
                        {kpi.actualResult}
                        <span className="text-sm font-semibold text-slate-500 ml-1">{kpi.unitOfMeasure}</span>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Benchmark Target</span>
                      <span className="text-base font-bold text-slate-600 dark:text-slate-300 font-mono-numbers">
                        {kpi.target} {kpi.unitOfMeasure}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        kpi.status === 'On Target' 
                          ? 'bg-emerald-500' 
                          : kpi.status === 'At Risk' 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${progressRatio}%` }}
                    />
                  </div>
                </div>

                {/* Footer and Controls */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-sky-600 dark:text-sky-400">{kpi.reportingPeriod}</span>
                    <span className="text-[10px] text-slate-400 block">Source: {kpi.dataSource}</span>
                  </div>

                  {canManageKPIs && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(kpi)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                        title="Edit KPI"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete KPI "${kpi.name}"?`)) {
                            deleteKPI(kpi.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                        title="Delete KPI"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configure / Edit KPI Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 text-xs">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-1">
              {editingKPI ? 'Edit Organizational KPI' : 'Configure Organizational KPI'}
            </h3>
            <p className="text-slate-500 mb-4">
              Managed by Admin Henok Akalu. Assign target benchmark and quarter.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  KPI Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Health Facility Requisition Cycle Time"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Definition & Calculation Formula
                </label>
                <textarea
                  value={definition}
                  onChange={(e) => setDefinition(e.target.value)}
                  rows={2}
                  required
                  placeholder="Formula and criteria used to verify this metric..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Responsible Directorate
                  </label>
                  <select
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Reporting Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as ReportingPeriod)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="First Quarter">First Quarter</option>
                    <option value="Second Quarter">Second Quarter</option>
                    <option value="Third Quarter">Third Quarter</option>
                    <option value="Fourth Quarter">Fourth Quarter</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Target
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Actual
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={actual}
                    onChange={(e) => setActual(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    required
                    placeholder="%, Days, ETB"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Data Source
                  </label>
                  <select
                    value={dataSource}
                    onChange={(e) => setDataSource(e.target.value as KPIItem['dataSource'])}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    <option value="Action Plan Calculation">Action Plan Calculation</option>
                    <option value="HCMIS Verified Ledger">HCMIS Verified Ledger</option>
                    <option value="QMS Audit Logs">QMS Audit Logs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as KPIItem['reportingFrequency'])}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Biannual">Biannual</option>
                    <option value="Annual">Annual</option>
                  </select>
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
                  {editingKPI ? 'Update KPI' : 'Save KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
