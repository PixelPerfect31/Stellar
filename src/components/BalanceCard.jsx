import React, { useState } from "react";
import { RefreshCw, Coins, HelpCircle, Sparkles } from "lucide-react";
import { BalanceSkeleton } from "./Loader";
import { fundAccountWithFriendbot } from "../services/stellar";
import { toast } from "react-toastify";

/**
 * Balance Card.
 * Displays current XLM balance. Handles manual reloading and Friendbot funding.
 */
export default function BalanceCard({
  publicKey,
  balanceData, // { balance: string, isFunded: boolean }
  isLoading,
  onRefresh,
}) {
  const [isFunding, setIsFunding] = useState(false);

  const handleFundAccount = async () => {
    if (!publicKey) return;
    setIsFunding(true);
    const toastId = toast.loading("Requesting 10,000 XLM from Stellar Friendbot...");
    try {
      const success = await fundAccountWithFriendbot(publicKey);
      if (success) {
        toast.update(toastId, {
          render: "Account funded successfully with 10,000 XLM!",
          type: "success",
          isLoading: false,
          autoClose: 5000,
        });
        // Reload balance
        onRefresh();
      }
    } catch (error) {
      toast.update(toastId, {
        render: error.message || "Failed to fund account.",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsFunding(false);
    }
  };

  // Case 1: Wallet not connected yet
  if (!publicKey) {
    return (
      <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-slate-400">XLM Balance</h3>
            <Coins className="w-5 h-5 text-slate-500" />
          </div>
          <div className="py-2">
            <span className="text-2xl font-bold text-slate-500">-- XLM</span>
          </div>
          <p className="text-xs text-slate-400">Connect your Freighter wallet to view your balance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -right-20 -top-20 w-45 h-45 bg-stellar-secondary/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-stellar-secondary/15" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-slate-200">XLM Balance</h3>
          <button
            onClick={onRefresh}
            disabled={isLoading || isFunding}
            className={`p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all duration-300 disabled:opacity-50 ${
              isLoading ? "animate-spin" : "hover:rotate-180"
            }`}
            title="Refresh Balance"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Display */}
        {isLoading ? (
          <BalanceSkeleton />
        ) : (
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {balanceData?.balance}
              </span>
              <span className="text-lg font-bold text-stellar-secondary">XLM</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Stellar Native Asset</span>
          </div>
        )}

        {/* Funding / Onboarding helper */}
        {!isLoading && balanceData && !balanceData.isFunded && (
          <div className="pt-2 border-t border-white/5 space-y-3">
            <div className="flex items-start gap-2 p-3 bg-gold/10 border border-gold/20 rounded-xl text-xs text-gold">
              <HelpCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Account Unfunded</span>
                This public key has not been registered on the Testnet yet. You need to fund it with XLM first.
              </div>
            </div>
            <button
              onClick={handleFundAccount}
              disabled={isFunding}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-gold to-yellow-600 hover:from-gold hover:to-yellow-500 text-slate-900 font-bold text-xs transition-all duration-200 shadow-md shadow-gold/10"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isFunding ? "Funding Account..." : "Fund with Friendbot (10k XLM)"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
