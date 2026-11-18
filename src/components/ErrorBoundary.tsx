import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { AlertTriangle, Download, RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ScholarBand ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let parsedDetails: Record<string, unknown> | null = null;
      try {
        parsedDetails = JSON.parse(this.state.errorMessage);
      } catch {
        parsedDetails = null;
      }

      const isQuotaError = this.state.errorMessage.includes('Quota exceeded');

      return (
        <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#0B0F17] text-[#18181B] dark:text-[#F3F0E6] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-[#991B1B] dark:text-[#F87171]">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-xl font-semibold font-serif-editorial">
                {isQuotaError ? 'Daily Cloud Database Quota Reached' : 'Workspace Synchronization Notice'}
              </h2>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {isQuotaError
                ? 'Your Firebase Spark plan daily read/write quota has been reached and will reset tomorrow. You can continue studying using local cached mode.'
                : 'An unexpected data synchronization error occurred while communicating with the workspace.'}
            </p>
            {parsedDetails && (
              <pre className="text-xs font-mono-tabular bg-[#FAF8F5] dark:bg-[#0B0F17] p-3 rounded-lg border border-[#E6E2DA] dark:border-[#263042] overflow-x-auto text-zinc-700 dark:text-zinc-300">
                {JSON.stringify(parsedDetails, null, 2)}
              </pre>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, errorMessage: '' });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#991B1B] hover:bg-[#7F1D1D] rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// PWA Install Hook & Button
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    if (compact) return null;
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Installed as Standalone App
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowModal(true);
          }
        }}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#E6E2DA] dark:border-[#263042] bg-white dark:bg-[#151C28] text-[#18181B] dark:text-[#F3F0E6] hover:border-[#991B1B] dark:hover:border-[#D97706] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Install ScholarBand for offline mobile & desktop study"
      >
        <Download className="w-3.5 h-3.5 text-[#991B1B] dark:text-[#D97706]" />
        <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-[#FAF8F5] dark:bg-[#151C28] border border-[#E6E2DA] dark:border-[#263042] p-6 space-y-4">
            <h3 className="text-lg font-semibold font-serif-editorial text-[#18181B] dark:text-[#F3F0E6]">
              Install ScholarBand on Your Device
            </h3>
            {isIOS ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                1. Tap the <strong>Share</strong> icon in your Safari toolbar.<br />
                2. Scroll down and select <strong>Add to Home Screen</strong> to launch ScholarBand in full-screen standalone mode with offline flashcard access.
              </p>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                To install ScholarBand as a standalone desktop or Android app, open this application in a top-level browser tab and click the <strong>Install ScholarBand</strong> icon in your browser’s address bar, or use the <strong>Download Offline Pack</strong> button in the SRS &amp; Reminders tab to cache all flashcards locally right now.
              </p>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium bg-[#18181B] text-white dark:bg-[#F3F0E6] dark:text-[#0B0F17] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-[#D97706] px-3.5 py-2 text-xs font-medium text-white shadow-md">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Study Mode · Using Locally Cached SRS Deck &amp; Curriculum</span>
    </div>
  );
};
