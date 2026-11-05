/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Download, CheckCircle, Smartphone, Info, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone display mode (already installed APK/PWA)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowAndroidModal(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowAndroidModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5" />
        <span>Android App Installed</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <a
          href="/EPSS_STRATEX_Full_Application.zip"
          download="EPSS_STRATEX_Full_Application.zip"
          className="hidden md:inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition"
          title="Download full application source code ZIP package"
        >
          <Download className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span className="whitespace-nowrap">Download App (.ZIP)</span>
        </a>

        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition transform hover:-translate-y-0.5"
          title="Download / Install EPSS STRATEX on your Android or Mobile Device"
        >
          <Smartphone className="w-4 h-4" />
          <span className="whitespace-nowrap">Install Android App</span>
        </button>
      </div>

      {/* Android Instructions Modal when beforeinstallprompt is ambient */}
      {showAndroidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowAndroidModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base">Install on Android</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">EPSS STRATEX Mobile PWA</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-3">
              <p>
                To install <strong>EPSS STRATEX</strong> directly onto your Android device home screen:
              </p>
              <ol className="list-decimal list-inside space-y-2 pl-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <li>Tap the <strong>three dots menu (⋮)</strong> in Chrome / Browser top right corner.</li>
                <li>Select <strong>“Install app”</strong> or <strong>“Add to Home Screen”</strong>.</li>
                <li>Tap <strong>“Install”</strong> to confirm download.</li>
              </ol>
              <div className="flex items-center gap-2 text-[11px] text-sky-600 dark:text-sky-400">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>The app will launch full-screen with offline capabilities and real-time push synchronization.</span>
              </div>
            </div>

            <button
              onClick={() => setShowAndroidModal(false)}
              className="mt-5 w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium py-2 rounded-xl text-xs transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* iOS Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-900 dark:text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base mb-1">Install on iPhone / iPad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Safari Mobile Web App</p>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <p>1. Tap the <strong>Share</strong> button (box with upward arrow) at bottom of Safari.</p>
              <p>2. Scroll down and tap <strong>Add to Home Screen</strong>.</p>
              <p>3. Tap <strong>Add</strong> in the top right.</p>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full bg-slate-900 dark:bg-slate-800 text-white font-medium py-2 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
