/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, requestPasswordReset } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotNotes, setForgotNotes] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.error || 'Authentication failed.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername.trim()) return;

    const res = await requestPasswordReset(forgotUsername, forgotNotes);
    if (res.success) {
      setForgotSuccessMessage(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950 text-slate-100">
      {/* Left Column: Authentic High-Resolution Pharmaceutical Supply Chain Visual & Strategic Context */}
      <div className="relative lg:w-7/12 min-h-[340px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-8 lg:p-14">
        {/* Real Generated Pharma Logistics Warehouse Backdrop */}
        <img 
          src="/src/assets/images/epss_pharma_warehouse_logistics_1793880229145.jpg" 
          alt="Ethiopian Pharmaceutical Supply Service Central Cold-Chain Logistics Hub"
          className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Measured dark overlay scrim for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-lg border border-white/20 inline-flex items-center justify-center">
            <img 
              src="/public/assets/aistudio/IMG-20261105-WA0001_9d4bea79.jpg" 
              alt="EPSS Official Logo" 
              className="h-10 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              EPSS STRATEX
              <span className="text-xs uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-400/30 px-2 py-0.5 rounded">
                Addis Ababa 2 Hub
              </span>
            </h1>
            <p className="text-xs text-slate-300">Ethiopian Pharmaceutical Supply Service · Strategic Action & KPI Monitoring</p>
          </div>
        </div>

        {/* Middle/Bottom Strategic Narrative */}
        <div className="relative z-10 mt-auto pt-12 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Enterprise Strategic Governance Platform
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white leading-tight">
            Accountable Execution, Quality-Assured Supply Chains & Verified Health Milestones.
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Coordinating inter-departmental action plans, cold-chain monitoring, PPL 3rd edition alignment, and verified performance auditing across public health delivery networks.
          </p>

          <div className="pt-2 flex items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
            <div>
              <span className="text-white font-semibold">Hub:</span> AA2 Branch
            </div>
            <div>
              <span className="text-white font-semibold">Catalogue:</span> PPL 3rd Edition (782 Items)
            </div>
            <div>
              <span className="text-white font-semibold">Standard:</span> WHO & EFDA GDP
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Strict Uncluttered Login Form (Only Username, Password, Forgot Password) */}
      <div className="lg:w-5/12 flex flex-col justify-between p-8 lg:p-14 bg-slate-900 border-l border-slate-800">
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">Restricted Access</span>
              <span className="text-xs text-slate-400 font-mono">v3.2 Secure</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Sign In to STRATEX</h2>
            <p className="text-sm text-slate-400 mt-1">
              Authorized EPSS Addis Ababa 2 leadership, department heads, and coordinators.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Sign in error</p>
                <p className="text-xs text-red-300/90 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. henok.akalu or desta.getye"
                  required
                  autoFocus
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSuccessMessage(null);
                    setShowForgotModal(true);
                  }}
                  className="text-xs text-sky-400 hover:text-sky-300 hover:underline transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel for Auditor Review */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-2">
            <p className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              Evaluation & Audit Test Logins
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-sky-400 font-medium">Super Admin:</span><br />
                User: <code className="text-white">henok.akalu</code><br />
                Pass: <code className="text-white">EPSSlogin</code>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-emerald-400 font-medium">Warehouse Head:</span><br />
                User: <code className="text-white">desta.getye</code><br />
                Pass: <code className="text-white">EPSSlogin</code> (Forced 1st change)
              </div>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Initial password for all newly created accounts is strictly <code className="text-slate-300">EPSSlogin</code>. First login enforces mandatory password reset.
            </p>
          </div>
        </div>

        {/* Required Mandatory Footer */}
        <footer className="mt-8 text-center text-xs text-slate-500 border-t border-slate-800 pt-4">
          Developed By Henok Akalu
        </footer>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" />
              Account Recovery
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Per EPSS security protocol, password recovery is centrally governed by Super Admin Henok Akalu with strict audit logging.
            </p>

            {forgotSuccessMessage ? (
              <div className="my-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Request Transmitted
                </div>
                <p>{forgotSuccessMessage}</p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="mt-3 w-full bg-slate-800 hover:bg-slate-700 text-white py-2 rounded-lg text-xs font-medium transition"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Username
                  </label>
                  <input
                    type="text"
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    placeholder="e.g. desta.getye"
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Verification Note (Optional)
                  </label>
                  <textarea
                    value={forgotNotes}
                    onChange={(e) => setForgotNotes(e.target.value)}
                    rows={2}
                    placeholder="e.g. Department coordinator phone number or office extension"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[11px] text-sky-200">
                  Super Admin Contact: <br />
                  <strong>Henok Akalu</strong> · Phone: <strong>0907014688</strong> · Email: <strong>Henok0750@gmail.com</strong>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-medium transition shadow-md"
                  >
                    Send Recovery Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
