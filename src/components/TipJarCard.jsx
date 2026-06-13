import React, { useState, useEffect } from "react";
import { Coins, Heart, AlertTriangle, ArrowRight, RefreshCw, Star } from "lucide-react";
import { getJarTotal, depositTip } from "../contracts/tipjar";
import { CONTRACT_ID } from "../config/contract";
import { toast } from "react-toastify";

/**
 * TipJarCard component.
 * Displays total tipped amounts, allows depositing a tip, and shows setup guidelines.
 */
export default function TipJarCard({ publicKey, walletType, onTipSuccess, onProgressChange }) {
  const [tipAmount, setTipAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [totalTips, setTotalTips] = useState(0);
  const [isTotalLoading, setIsTotalLoading] = useState(false);
  const [lastTip, setLastTip] = useState(() => localStorage.getItem("last_tip_amount") || "");

  // Load contract total tips
  const loadTotalTips = async () => {
    if (!CONTRACT_ID) return;
    setIsTotalLoading(true);
    try {
      const total = await getJarTotal(publicKey);
      setTotalTips(total);
    } catch (error) {
      console.error("Failed to load total tips:", error);
      // We don't toast errors repeatedly during background polls, but log it
    } finally {
      setIsTotalLoading(false);
    }
  };

  useEffect(() => {
    if (CONTRACT_ID) {
      loadTotalTips();
    }
  }, [publicKey]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!publicKey || !walletType || !CONTRACT_ID) return;

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a positive amount of XLM.");
      return;
    }

    setIsDepositing(true);
    onProgressChange({ status: "preparing", message: "Initiating Soroban Tip Jar deposit..." });

    try {
      const response = await depositTip(
        walletType,
        publicKey,
        amount,
        (prog) => onProgressChange(prog)
      );

      setTotalTips(response.newTotal);
      setLastTip(amount.toString());
      localStorage.setItem("last_tip_amount", amount.toString());
      setTipAmount("");
      
      onProgressChange({ status: "success", hash: response.txHash });
      toast.success(`Successfully tipped ${amount} XLM!`);
      
      if (onTipSuccess) {
        onTipSuccess(); // Callback to refresh main XLM balance
      }
    } catch (err) {
      console.error("Tip Jar deposit error:", err);
      onProgressChange({ status: "error", message: err.message || "Failed to submit tip." });
      toast.error(err.message || "Transaction failed.");
    } finally {
      setIsDepositing(false);
    }
  };

  // Case 1: Contract not configured yet
  if (!CONTRACT_ID) {
    return (
      <div className="w-full p-6 rounded-2xl bg-stellar-card border border-amber-500/20 backdrop-blur-md relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-45 h-45 bg-amber-500/10 rounded-full blur-3xl" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-md font-bold">Soroban Tip Jar Inactive</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Tip Jar smart contract is not yet configured. Please deploy the contract to the Stellar Testnet, then paste the returned Contract ID in:
            <code className="block mt-2 p-2 bg-black/40 border border-white/5 rounded-lg text-[10px] font-mono break-all text-slate-300">
              src/config/contract.js
            </code>
          </p>
          <div className="pt-1 text-[11px] text-slate-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
            <span className="font-semibold text-amber-300 block mb-1">How to Deploy:</span>
            1. Run `cargo build --target wasm32-unknown-unknown --release` inside the contract dir.<br />
            2. Run the `soroban contract deploy` CLI command (commands are in README).
          </div>
        </div>
      </div>
    );
  }

  // Render disabled state if wallet not connected
  if (!publicKey) {
    return (
      <div className="w-full p-6 rounded-2xl bg-stellar-card/30 border border-white/5 backdrop-blur-md opacity-60">
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-slate-400">Tip Jar Smart Contract</h3>
          <p className="text-sm text-slate-400">
            Connect your wallet to tip the developer directly using Soroban smart contracts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -right-20 -bottom-20 w-45 h-45 bg-stellar-accent/15 rounded-full blur-3xl transition-all duration-500 group-hover:bg-stellar-accent/20" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Heart className="w-4.5 h-4.5 text-stellar-accent animate-pulse" />
          <span>Soroban Tip Jar</span>
        </h3>
        <button
          onClick={loadTotalTips}
          disabled={isTotalLoading || isDepositing}
          className="p-1 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all hover:rotate-180 duration-300"
          title="Refresh total"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Total Tips */}
        <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Total Tips
          </span>
          <div className="flex items-baseline gap-1">
            {isTotalLoading ? (
              <span className="h-6 w-12 bg-white/10 rounded animate-pulse inline-block" />
            ) : (
              <span className="text-lg font-bold text-white tracking-tight">
                {totalTips.toFixed(2)}
              </span>
            )}
            <span className="text-xs text-stellar-accent font-bold">XLM</span>
          </div>
        </div>

        {/* Last Tipped */}
        <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl space-y-1">
          <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
            Your Last Tip
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white tracking-tight">
              {lastTip ? parseFloat(lastTip).toFixed(2) : "0.00"}
            </span>
            <span className="text-xs text-stellar-secondary font-bold">XLM</span>
          </div>
        </div>
      </div>

      {/* Tip Form */}
      <form onSubmit={handleDeposit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Tip Amount (XLM)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0.0001"
              placeholder="0.00"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              disabled={isDepositing}
              className="w-full pl-4 pr-16 py-3 bg-white/5 border border-white/10 focus:border-stellar-accent/50 focus:ring-1 focus:ring-stellar-accent/30 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              XLM
            </div>
          </div>
        </div>

        {/* Tip Now Button */}
        <button
          type="submit"
          disabled={isDepositing || !tipAmount || parseFloat(tipAmount) <= 0}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-stellar-accent to-stellar-secondary hover:from-stellar-accent/90 hover:to-stellar-secondary/90 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-stellar-accent/15"
        >
          <span>{isDepositing ? "Submitting Tip..." : "Deposit Tip"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
