/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArchiveFile } from '../types';
import { 
  FileText, 
  Plus, 
  ExternalLink, 
  Search, 
  Trash2, 
  ShieldCheck, 
  Filter, 
  X,
  Link2,
  FolderOpen
} from 'lucide-react';

export const Archives: React.FC = () => {
  const { archives, uploadArchiveFile, deleteArchiveFile, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New archive form state with Google Drive Link
  const [newTitle, setNewTitle] = useState('');
  const [newGoogleDriveUrl, setNewGoogleDriveUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<ArchiveFile['category']>('Procurement Lists');
  const [newAccessLevel, setNewAccessLevel] = useState<ArchiveFile['accessLevel']>('All Staff');

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const canUploadOrDelete = isSuperAdmin || 
    (currentUser?.role === 'RESTRICTED_ADMIN' && currentUser?.permissions?.manageArchives);

  const filteredArchives = archives.filter(item => {
    // Access permission check
    if (item.accessLevel === 'Executive & Admins' && !isSuperAdmin && currentUser?.role !== 'RESTRICTED_ADMIN') {
      return false;
    }
    if (item.accessLevel === 'Department Heads' && currentUser?.role === 'DEPARTMENT_USER') {
      return false;
    }

    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newGoogleDriveUrl.trim()) return;

    await uploadArchiveFile({
      title: newTitle.trim(),
      googleDriveUrl: newGoogleDriveUrl.trim(),
      description: newDescription.trim(),
      category: newCategory,
      accessLevel: newAccessLevel,
      fileName: `${newTitle.trim().replace(/\s+/g, '_')}_GoogleDrive`
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewGoogleDriveUrl('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Institutional Repository</span>
            <span>·</span>
            <span>Google Drive Archives</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Official Archives & Regulatory Repository
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official documents, procurement lists, and audit guidelines managed directly via Google Drive links by Admin Henok Akalu.
          </p>
        </div>

        {canUploadOrDelete && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Google Drive Document</span>
          </button>
        )}
      </div>

      {/* Admin Notice */}
      {isSuperAdmin && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Admin Henok Akalu Control: All repository documents are linked to Google Drive without automated system files. You can add, manage, and delete documents at any time.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-purple-200/50 dark:bg-purple-900/50 px-2 py-0.5 rounded font-bold">
            Super Admin
          </span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archived documents by title or keyword..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value="Procurement Lists">Procurement Lists</option>
            <option value="Standard Operating Procedures">Standard Operating Procedures</option>
            <option value="Policy & Guidelines">Policy & Guidelines</option>
            <option value="Audit & Compliance">Audit & Compliance</option>
            <option value="Annual Reports">Annual Reports</option>
            <option value="Templates">Templates</option>
          </select>
        </div>
      </div>

      {/* Archives Document Grid or Empty State */}
      {filteredArchives.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 mx-auto flex items-center justify-center">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Archived Files</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {canUploadOrDelete 
              ? 'No documents currently saved. Use "Add Google Drive Document" above to register files with your Google Drive shareable links.'
              : 'No official documents have been published by Admin Henok Akalu yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArchives.map(doc => (
            <div
              key={doc.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-800 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Access: {doc.accessLevel}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div className="text-[11px]">
                  <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Google Drive Document</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Added by {doc.uploadedByName} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={doc.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 hover:bg-sky-100 transition font-medium text-xs border border-sky-200/60 dark:border-sky-800/40"
                    title="Open document in Google Drive"
                  >
                    <span>Open in Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {canUploadOrDelete && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
                          deleteArchiveFile(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition border border-transparent hover:border-rose-200"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Google Drive Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 text-xs">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold mb-1">Add Google Drive Archive File</h3>
            <p className="text-slate-500 mb-4">
              Managed by Admin Henok Akalu. Provide the shareable Google Drive link for direct institutional access.
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. EPSS AA2 Quality Audit SOP 2026"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Google Drive Shareable Link
                </label>
                <input
                  type="url"
                  value={newGoogleDriveUrl}
                  onChange={(e) => setNewGoogleDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or link"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Paste the Google Drive link with viewing permissions enabled.
                </span>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Description & Context
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  required
                  placeholder="Brief description of the document purpose and audience..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ArchiveFile['category'])}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="Procurement Lists">Procurement Lists</option>
                    <option value="Standard Operating Procedures">Standard Operating Procedures</option>
                    <option value="Policy & Guidelines">Policy & Guidelines</option>
                    <option value="Audit & Compliance">Audit & Compliance</option>
                    <option value="Annual Reports">Annual Reports</option>
                    <option value="Templates">Templates</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Access Level
                  </label>
                  <select
                    value={newAccessLevel}
                    onChange={(e) => setNewAccessLevel(e.target.value as ArchiveFile['accessLevel'])}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="All Staff">All Staff</option>
                    <option value="Department Heads">Department Heads</option>
                    <option value="Executive & Admins">Executive & Admins</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-medium shadow-sm"
                >
                  Save Google Drive File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
