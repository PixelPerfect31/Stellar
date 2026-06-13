import React, { useEffect, useState } from "react";
import { Activity, Clock, Heart, User, Sparkles } from "lucide-react";
import { fetchTipEvents } from "../events/subscription";
import { CONTRACT_ID } from "../config/contract";

/**
 * RecentActivity feed component.
 * Polls the contract events in real-time and shows list of tips.
 */
export default function RecentActivity({ refreshTrigger }) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastLedger, setLastLedger] = useState(null);

  // Load events
  const loadEvents = async (showLoading = false) => {
    if (!CONTRACT_ID) return;
    if (showLoading) setIsLoading(true);
    try {
      const { events, latestLedger } = await fetchTipEvents(lastLedger);
      
      // If we already have activities, merge them (avoiding duplicates)
      setActivities(prev => {
        const merged = [...events, ...prev];
        // Deduplicate by event id
        const unique = merged.reduce((acc, current) => {
          const x = acc.find(item => item.id === current.id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);
        // Sort descending
        return unique.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
      });

      if (latestLedger) {
        setLastLedger(latestLedger);
      }
    } catch (err) {
      console.error("Failed to load tip events:", err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  // Poll for events on mount & when refreshTrigger changes
  useEffect(() => {
    if (!CONTRACT_ID) return;

    // Load initial events
    loadEvents(true);

    // Setup polling every 6 seconds
    const interval = setInterval(() => {
      loadEvents(false);
    }, 6000);

    return () => clearInterval(interval);
  }, [refreshTrigger]);

  // Format short address
  const formatAddress = (addr) => {
    if (!addr) return "Unknown";
    return `${addr.slice(0, 5)}...${addr.slice(-4)}`;
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 15) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  if (!CONTRACT_ID) return null;

  return (
    <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -left-20 -top-20 w-45 h-45 bg-stellar-secondary/5 rounded-full blur-3xl" />

      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Activity className="w-4.5 h-4.5 text-stellar-secondary" />
          <span>Recent activity</span>
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stellar-secondary/15 text-stellar-secondary border border-stellar-secondary/20 font-mono animate-pulse">
          Live feed
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-3.5 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2.5 w-2/3">
                <div className="w-8 h-8 bg-white/10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                  <div className="h-2.5 bg-white/10 rounded w-1/3" />
                </div>
              </div>
              <div className="h-4 bg-white/10 rounded w-12" />
            </div>
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5">
          <Sparkles className="w-8 h-8 text-slate-500 mb-2.5" />
          <h4 className="text-xs font-semibold text-slate-400">No Tips Deposited Yet</h4>
          <p className="text-[10px] text-slate-500 max-w-xs mt-1">
            Be the first to deposit a tip and see your activity live in this panel!
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
          {activities.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 hover:border-stellar-accent/10 transition-all duration-200 group/item animate-fadeIn"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-full bg-stellar-accent/10 border border-stellar-accent/10 text-stellar-accent">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold text-slate-300 group-hover/item:text-white transition-colors">
                      {formatAddress(act.sender)}
                    </span>
                    <span className="text-[10px] text-slate-500">tipped</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatRelativeTime(act.timestamp)}</span>
                  </div>
                </div>
              </div>

              {/* Amount Tipped */}
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold text-stellar-secondary font-sans">
                  +{act.amount}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  XLM
                </span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/10 group-hover/item:scale-110 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
