/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomAppTile } from '../types';
import { 
  LayoutGrid, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  X, 
  Boxes, 
  ShieldCheck, 
  ThermometerSnowflake, 
  FileText, 
  Database,
  Truck,
  Building,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';

export const SystemAppsAndTiles: React.FC = () => {
  const { appTiles, createAppTile, updateAppTile, deleteAppTile, currentUser } = useApp();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTile, setEditingTile] = useState<CustomAppTile | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CustomAppTile['category']>('Supply Chain & Inventory');
  const [iconName, setIconName] = useState('Boxes');
  const [url, setUrl] = useState('');
  const [target, setTarget] = useState<'_blank' | '_self'>('_blank');
  const [badgeText, setBadgeText] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const iconOptions = [
    { label: 'Boxes (Logistics/Stock)', value: 'Boxes', icon: Boxes },
    { label: 'Shield (Compliance/Quality)', value: 'ShieldCheck', icon: ShieldCheck },
    { label: 'Cold Chain (Sensors)', value: 'ThermometerSnowflake', icon: ThermometerSnowflake },
    { label: 'File (Documents/Catalogues)', value: 'FileText', icon: FileText },
    { label: 'Database (ERP/HCMIS)', value: 'Database', icon: Database },
    { label: 'Fleet (Distribution)', value: 'Truck', icon: Truck },
    { label: 'Facility (Branches)', value: 'Building', icon: Building },
    { label: 'Activity (KPIs/Metrics)', value: 'Activity', icon: Activity }
  ];

  const getIconComponent = (iconKey: string) => {
    switch (iconKey) {
      case 'ShieldCheck': return ShieldCheck;
      case 'ThermometerSnowflake': return ThermometerSnowflake;
      case 'FileText': return FileText;
      case 'Database': return Database;
      case 'Truck': return Truck;
      case 'Building': return Building;
      case 'Activity': return Activity;
      default: return Boxes;
    }
  };

  const handleOpenAdd = () => {
    setName('');
    setDescription('');
    setCategory('Supply Chain & Inventory');
    setIconName('Boxes');
    setUrl('');
    setTarget('_blank');
    setBadgeText('');
    setIsEnabled(true);
    setEditingTile(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (tile: CustomAppTile) => {
    setEditingTile(tile);
    setName(tile.name);
    setDescription(tile.description);
    setCategory(tile.category);
    setIconName(tile.iconName);
    setUrl(tile.url);
    setTarget(tile.target);
    setBadgeText(tile.badgeText || '');
    setIsEnabled(tile.isEnabled);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingTile) {
      await updateAppTile(editingTile.id, {
        name: name.trim(),
        description: description.trim(),
        category,
        iconName,
        url: url.trim() || '#',
        target,
        badgeText: badgeText.trim() || undefined,
        isEnabled
      });
    } else {
      await createAppTile({
        name: name.trim(),
        description: description.trim(),
        category,
        iconName,
        url: url.trim() || '#',
        target,
        badgeText: badgeText.trim() || undefined,
        isEnabled,
        order: appTiles.length + 1
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>EPSS Ecosystem Apps</span>
            <span>·</span>
            <span>Admin Managed Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            System Applications & Quick Launch Tiles
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Authorized portal tiles for EPSS AA2 inventory, cold-chain sensors, EFDA compliance, and external portals.
          </p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application Tile</span>
          </button>
        )}
      </div>

      {/* Admin Notice */}
      {isSuperAdmin && (
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              Admin Henok Akalu Access: You have full permissions to add new external or internal application tiles, modify URLs and badges, or remove redundant tiles.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-purple-200/50 dark:bg-purple-900/50 px-2 py-0.5 rounded font-bold">
            Super Admin
          </span>
        </div>
      )}

      {/* Tiles Grid or Empty State */}
      {appTiles.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-500 mx-auto flex items-center justify-center">
            <LayoutGrid className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Application Tiles Added</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isSuperAdmin 
              ? 'Zero pre-filled system tiles. Admin Henok Akalu can configure custom branch portal tiles using "Add Application Tile" above.' 
              : 'No external or internal application tiles have been published by Admin Henok Akalu yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {appTiles.map(tile => {
          const IconComp = getIconComponent(tile.iconName);

          return (
            <div
              key={tile.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                tile.isEnabled 
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-400 dark:hover:border-sky-700' 
                  : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/40">
                    <IconComp className="w-6 h-6" />
                  </div>
                  {tile.badgeText && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                      {tile.badgeText}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {tile.category}
                </span>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                  {tile.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {tile.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={tile.url}
                  target={tile.target}
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  <span>Launch Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {isSuperAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tile)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit app tile"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove application tile "${tile.name}"?`)) {
                          deleteAppTile(tile.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Delete app tile"
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

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 text-xs">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold mb-1">
              {editingTile ? 'Edit Application Tile' : 'Add New Application Tile'}
            </h3>
            <p className="text-slate-500 mb-4">
              Configured by Admin Henok Akalu for direct launch across EPSS branch systems.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Application Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. HCMIS Electronic Ledger"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  required
                  placeholder="Brief description of application capabilities..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CustomAppTile['category'])}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    <option value="Supply Chain & Inventory">Supply Chain & Inventory</option>
                    <option value="Regulatory & Quality">Regulatory & Quality</option>
                    <option value="Facility Operations">Facility Operations</option>
                    <option value="Finance & Admin">Finance & Admin</option>
                    <option value="External Portals">External Portals</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Icon Theme
                  </label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    {iconOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  Portal URL / Route
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://... or /route"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Badge Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. Core ERP, 24/7"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Link Target
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as '_blank' | '_self')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs"
                  >
                    <option value="_blank">New Tab (_blank)</option>
                    <option value="_self">Same Window (_self)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="enabledCheck"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <label htmlFor="enabledCheck" className="text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                  Tile is active and visible to branch users
                </label>
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
                  {editingTile ? 'Update Tile' : 'Create Tile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
