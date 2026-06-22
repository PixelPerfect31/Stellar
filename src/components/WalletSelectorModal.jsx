import { useEffect, useState } from "react";
import { X, Wallet, ShieldCheck, ShieldAlert, ChevronRight, Activity } from "lucide-react";
import { checkWalletInstalled, WALLET_TYPES } from "../wallets/wallet-manager";

/**
 * Wallet Connection Selector Modal.
 * Prompts user to select their wallet type, detects installation, and handles loading.
 */
export default function WalletSelectorModal({ isOpen, onClose, onSelectWallet, isConnecting }) {
  const [freighterInstalled, setFreighterInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const checkWallets = async () => {
      setIsChecking(true);
      const isFreighter = await checkWalletInstalled(WALLET_TYPES.FREIGHTER);
      setFreighterInstalled(isFreighter);
      setIsChecking(false);
    };

    checkWallets();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stellar-navy/80 backdrop-blur-sm" 
        onClick={isConnecting ? null : onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-stellar-dark/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md overflow-hidden animate-fadeIn">
        {/* Glow Effects */}
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-stellar-accent/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-stellar-secondary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-stellar-accent" />
            <h3 className="text-lg font-bold text-white">Connect a Wallet</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isConnecting}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wallet Options */}
        <div className="space-y-3.5 pt-5 relative z-10">
          {isChecking ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Activity className="w-6 h-6 text-stellar-accent animate-spin" />
              <p className="text-xs text-slate-400">Detecting installed wallets...</p>
            </div>
          ) : (
            <>
              {/* Option 1: Freighter */}
              <button
                onClick={() => freighterInstalled && onSelectWallet(WALLET_TYPES.FREIGHTER)}
                disabled={isConnecting}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 group ${
                  freighterInstalled
                    ? "bg-white/5 border-white/10 hover:border-stellar-accent/40 hover:bg-white/10 cursor-pointer"
                    : "bg-white/5 border-rose-500/10 opacity-70 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-stellar-accent/10 border border-stellar-accent/20 text-stellar-accent group-hover:scale-105 transition-transform">
                    <img 
                      src="https://www.freighter.app/favicon.ico" 
                      alt="Freighter" 
                      className="w-5 h-5 rounded" 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    {/* Fallback icon if favicon fails */}
                    <Wallet className="w-5 h-5 freighter-fallback-icon hidden" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Freighter Wallet</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Official extension for Stellar web app builders.</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      {freighterInstalled ? (
                        <span className="text-[10px] font-semibold flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Installed & Ready</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold flex items-center gap-1 text-rose-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Not Installed</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {freighterInstalled ? (
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                ) : (
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-bold px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                  >
                    Install
                  </a>
                )}
              </button>

              {/* Option 2: Albedo */}
              <button
                onClick={() => onSelectWallet(WALLET_TYPES.ALBEDO)}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:border-stellar-secondary/40 hover:bg-white/10 text-left transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-stellar-secondary/10 border border-stellar-secondary/20 text-stellar-secondary group-hover:scale-105 transition-transform">
                    <img 
                      src="https://albedo.link/favicon.ico" 
                      alt="Albedo" 
                      className="w-5 h-5 rounded"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <Wallet className="w-5 h-5 albedo-fallback-icon hidden" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Albedo Wallet</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Secure web-based Stellar signer. No extension needed.</p>
                    <div className="mt-1.5 flex items-center gap-1">
                      <span className="text-[10px] font-semibold flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Available (Web Signer)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center gap-2 justify-center text-[10px] text-slate-500 text-center relative z-10">
          <span>Your keys never leave your device. Connection is fully secure.</span>
        </div>
      </div>
    </div>
  );
}
