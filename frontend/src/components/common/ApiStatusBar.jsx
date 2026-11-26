/**
 * ApiStatusBar Component
 * =======================
 * Subtle technical badge indicating live API hydration vs verified offline fallback.
 * Displays connection state honestly without alarmism.
 * Clickable to trigger on-demand re-sync with the backend.
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePortfolioStatus } from '../../hooks/usePortfolio';

export const ApiStatusBar = ({ className = '' }) => {
  const { isLive, loading, refetch } = usePortfolioStatus();

  return (
    <button
      type="button"
      onClick={() => !loading && refetch()}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono border backdrop-blur-md transition-all cursor-pointer select-none group focus:outline-none focus:ring-1 focus:ring-accent-primary/40 ${
        isLive
          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/60'
          : 'bg-zinc-900/60 border-zinc-700/40 text-zinc-400 hover:border-zinc-500/60'
      } ${className}`}
      title={
        isLive
          ? 'Connected to live Django REST API (Click to re-sync)'
          : 'Serving verified local portfolio archive — Backend offline or cold-starting (Click to retry connection)'
      }
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          loading
            ? 'bg-amber-400 animate-pulse'
            : isLive
            ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'
            : 'bg-zinc-500'
        }`}
      />
      <span className="truncate">
        {loading ? 'Syncing...' : isLive ? 'API Live' : 'Archive'}
      </span>
      <RefreshCw
        className={`w-2.5 h-2.5 transition-transform duration-300 ${
          loading ? 'animate-spin text-amber-400' : 'opacity-0 group-hover:opacity-100 text-text-muted'
        }`}
      />
    </button>
  );
};

export default ApiStatusBar;
