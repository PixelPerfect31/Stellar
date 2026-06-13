import React, { useState, useEffect } from "react";
import { Send, ArrowRight, AlertCircle } from "lucide-react";
import { validateTransactionInput } from "../utils/validators";

/**
 * SendPayment Form Card.
 * Allows users to input a recipient public key and amount of XLM, validates input, and initiates payment.
 */
export default function SendPayment({
  publicKey,
  balanceData,
  onSubmit,
  isProcessing,
  txSuccess, // To trigger input clearing
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const currentBalance = balanceData?.balance ? parseFloat(balanceData.balance) : 0;

  // Clear input fields when a transaction succeeds
  useEffect(() => {
    if (txSuccess) {
      setRecipient("");
      setAmount("");
      setError("");
    }
  }, [txSuccess]);

  // Run live validation on inputs
  useEffect(() => {
    if (!recipient && !amount) {
      setError("");
      return;
    }

    const val = validateTransactionInput(recipient, amount || "0", currentBalance);
    if (!val.isValid && (recipient || amount)) {
      // Don't show balance errors if amount is empty/unfinished
      if (amount === "" && val.message.includes("Amount must be a positive number")) {
        setError("");
      } else {
        setError(val.message);
      }
    } else {
      setError("");
    }
  }, [recipient, amount, currentBalance]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const val = validateTransactionInput(recipient, amount, currentBalance);
    if (!val.isValid) {
      setError(val.message);
      return;
    }

    setError("");
    onSubmit(recipient.trim(), amount);
  };

  const handleMaxClick = () => {
    // Keep 1 XLM buffer for network fee and sequence minimums
    const maxAmount = Math.max(0, currentBalance - 1.0);
    setAmount(maxAmount.toFixed(4));
  };

  // Render disabled state if wallet not connected
  if (!publicKey) {
    return (
      <div className="w-full p-6 rounded-2xl bg-stellar-card/30 border border-white/5 backdrop-blur-md opacity-60">
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-slate-400">Send Payment</h3>
          <p className="text-sm text-slate-400">
            Connect your wallet above to start sending XLM payments on the Testnet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
      {/* Background glow */}
      <div className="absolute -left-20 -bottom-20 w-45 h-45 bg-stellar-accent/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-stellar-accent/15" />

      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
        <Send className="w-4.5 h-4.5 text-stellar-accent" />
        <span>Send XLM Payment</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
            Recipient Stellar Address
          </label>
          <input
            type="text"
            placeholder="e.g. GB...37GB"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 focus:border-stellar-accent/50 focus:ring-1 focus:ring-stellar-accent/30 rounded-xl text-sm font-mono text-slate-200 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Amount (XLM)
            </label>
            <button
              type="button"
              onClick={handleMaxClick}
              disabled={isProcessing || currentBalance <= 1}
              className="text-xs font-bold text-stellar-accent hover:text-stellar-accent/80 transition-colors disabled:opacity-50"
            >
              Use Max (with buffer)
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isProcessing}
              className="w-full pl-4 pr-16 py-3 bg-white/5 border border-white/10 focus:border-stellar-accent/50 focus:ring-1 focus:ring-stellar-accent/30 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none transition-all disabled:opacity-50"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
              XLM
            </div>
          </div>
        </div>

        {/* Live error warning box */}
        {error && (
          <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isProcessing || !recipient || !amount || !!error}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-stellar-accent to-stellar-secondary hover:from-stellar-accent/90 hover:to-stellar-secondary/90 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-stellar-accent/10"
        >
          <span>{isProcessing ? "Processing Payment..." : "Send XLM"}</span>
          <ArrowRight className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
