/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { LoginPage } from './components/LoginPage';
import { ForcePasswordChangeModal } from './components/ForcePasswordChangeModal';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { ActionPlanTracker } from './components/ActionPlanTracker';
import { BestPerformer } from './components/BestPerformer';
import { Chatroom } from './components/Chatroom';
import { Archives } from './components/Archives';
import { ManagementMinutes } from './components/ManagementMinutes';
import { KPIs } from './components/KPIs';
import { SystemAppsAndTiles } from './components/SystemAppsAndTiles';
import { UserAndRoleAdmin } from './components/UserAndRoleAdmin';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { 
  LayoutDashboard, 
  CheckSquare, 
  MessageSquare, 
  Trophy, 
  Archive, 
  ClipboardList, 
  BarChart3, 
  UserCog, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Smartphone
} from 'lucide-react';

type NavModule = 
  | 'DASHBOARD'
  | 'ACTION_PLAN_TRACKER'
  | 'CHATROOM'
  | 'BEST_PERFORMER'
  | 'ARCHIVES'
  | 'MANAGEMENT_MINUTES'
  | 'KPIS'
  | 'SYSTEM_TILES'
  | 'USER_ADMIN';

export default function App() {
  const { currentUser, logout, clearAllSystemGeneratedData } = useApp();
  const [activeModule, setActiveModule] = useState<NavModule>('DASHBOARD');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // If unauthenticated, show official login page
  if (!currentUser) {
    return <LoginPage />;
  }

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const navItems = [
    { id: 'DASHBOARD', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'ACTION_PLAN_TRACKER', label: 'Action Plan Tracker', icon: CheckSquare },
    { id: 'CHATROOM', label: 'Chatroom', icon: MessageSquare },
    { id: 'BEST_PERFORMER', label: 'Best Performer', icon: Trophy },
    { id: 'ARCHIVES', label: 'Archives', icon: Archive },
    { id: 'MANAGEMENT_MINUTES', label: 'Management Minutes', icon: ClipboardList },
    { id: 'KPIS', label: 'KPIs & Reporting', icon: BarChart3 },
    { id: 'SYSTEM_TILES', label: 'System Apps & Tiles', icon: Building2 },
    ...(isSuperAdmin ? [{ id: 'USER_ADMIN', label: 'User & Role Admin', icon: UserCog }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Mandatory Password Change Barrier on first login with EPSSlogin */}
      <ForcePasswordChangeModal />

      {/* TOP BAR CONTRACT: One-row, 3-zone standard */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark with Official EPSS Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => setActiveModule('DASHBOARD')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                <img 
                  src="/public/assets/aistudio/IMG-20261105-WA0001_9d4bea79.jpg" 
                  alt="EPSS Official Logo" 
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="flex flex-col">
                <div className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                  <span>EPSS STRATEX</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-1.5 py-0.2 rounded border border-sky-400/20">
                    AA2 Hub
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline whitespace-nowrap">
                  Strategic Action & Performance Monitoring
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.slice(0, 5).map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id as NavModule)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Android PWA Install, User Profile & Sign Out */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Install Android PWA Button */}
            <PWAInstallPrompt />

            <div className="hidden sm:flex flex-col items-end text-right border-l border-slate-200 dark:border-slate-800 pl-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 whitespace-nowrap">
                {currentUser.fullName}
                {isSuperAdmin && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
              </span>
              <span className="text-[10px] text-slate-400 whitespace-nowrap truncate max-w-[130px]">
                {currentUser.departmentName}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace with Responsive Sidebar Navigation */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav (Desktop & Mobile Drawer) */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:w-60 lg:p-0 lg:border-none lg:bg-transparent lg:shadow-none shadow-2xl
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 lg:hidden mb-4">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Navigation Menu
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveModule(item.id as NavModule);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                    isActive
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Department Scope Info Card */}
          <div className="mt-8 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Directorate Scope
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-[11px] leading-tight">
              {currentUser.departmentName}
            </div>
            <div className="text-[10px] text-slate-500">
              Role: <span className="font-semibold text-sky-600 dark:text-sky-400">{currentUser.role.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Super Admin Contact Info */}
          <div className="mt-4 p-3.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-800/30 text-xs space-y-1 text-slate-600 dark:text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
              Lead Administrator
            </span>
            <div className="font-bold text-slate-900 dark:text-white text-[11px]">
              Henok Akalu
            </div>
            <div className="text-[10px] flex items-center gap-1 text-slate-500 mt-1">
              <Phone className="w-3 h-3 text-sky-500" />
              <span>0907014688</span>
            </div>
            <div className="text-[10px] flex items-center gap-1 text-slate-500">
              <Mail className="w-3 h-3 text-sky-500" />
              <span className="truncate">Henok0750@gmail.com</span>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 min-w-0">
          {activeModule === 'DASHBOARD' && (
            <ExecutiveDashboard 
              onNavigateToTracker={() => setActiveModule('ACTION_PLAN_TRACKER')}
              onNavigateToBestPerformer={() => setActiveModule('BEST_PERFORMER')}
            />
          )}

          {activeModule === 'ACTION_PLAN_TRACKER' && (
            <ActionPlanTracker />
          )}

          {activeModule === 'CHATROOM' && (
            <Chatroom />
          )}

          {activeModule === 'BEST_PERFORMER' && (
            <BestPerformer />
          )}

          {activeModule === 'ARCHIVES' && (
            <Archives />
          )}

          {activeModule === 'MANAGEMENT_MINUTES' && (
            <ManagementMinutes onNavigateToTracker={(planId) => setActiveModule('ACTION_PLAN_TRACKER')} />
          )}

          {activeModule === 'KPIS' && (
            <KPIs />
          )}

          {activeModule === 'SYSTEM_TILES' && (
            <SystemAppsAndTiles />
          )}

          {activeModule === 'USER_ADMIN' && isSuperAdmin && (
            <UserAndRoleAdmin />
          )}
        </main>
      </div>

      {/* Mandatory Page Footer on EVERY application page */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EPSS STRATEX · Ethiopian Pharmaceutical Supply Service (Addis Ababa 2)</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Developed By Henok Akalu
          </span>
        </div>
      </footer>
    </div>
  );
}
