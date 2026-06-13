import React from "react";
import { Wallet, LogOut, Radio, Coins } from "lucide-react";

/**
 * Top navigation component.
 * Displays dApp branding, network status, active wallet badge, and quick disconnect actions.
 */
export default function Navbar({ publicKey, walletType, onOpenConnectModal, onDisconnect, isConnecting }) {
  // Format long public key: GABCD...WXYZ
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="w-full border-b border-white/5 bg-stellar-navy/30 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Branding */}
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-stellar-accent to-stellar-secondary p-2 rounded-xl shadow-lg shadow-stellar-accent/25">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-stellar-secondary bg-clip-text text-transparent">
                StellarPay
              </span>
              <span className="ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stellar-accent/15 text-stellar-accent border border-stellar-accent/20">
                TESTNET
              </span>
            </div>
          </div>

          {/* Connection Actions */}
          <div className="flex items-center gap-4">
            {publicKey ? (
              <div className="flex items-center gap-3">
                {/* Wallet Type Badge */}
                <span className={`hidden md:inline-block text-[10px] font-semibold px-2 py-1 border rounded-lg ${
                  walletType === "freighter"
                    ? "bg-stellar-accent/10 text-stellar-accent border-stellar-accent/20"
                    : "bg-stellar-secondary/10 text-stellar-secondary border-stellar-secondary/20"
                }`}>
                  {walletType === "freighter" ? "Freighter" : "Albedo"}
                </span>

                {/* Active Network Indicator */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Horizon Connected</span>
                </div>

                {/* Shortened Public Key Box */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                  <span>{formatAddress(publicKey)}</span>
                </div>

                {/* Disconnect Icon Button */}
                <button
                  onClick={onDisconnect}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-rose-500/20 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 transition-all duration-200"
                  title="Disconnect Wallet"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenConnectModal}
                disabled={isConnecting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-stellar-accent to-stellar-secondary hover:from-stellar-accent/90 hover:to-stellar-secondary/90 text-white font-medium text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-stellar-accent/20 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
