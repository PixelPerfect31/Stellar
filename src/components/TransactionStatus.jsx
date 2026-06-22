import { useState } from "react";
import { CheckCircle2, XCircle, ExternalLink, Copy, Check, Clock, Radio, KeyRound, ArrowUpRight, Activity } from "lucide-react";
import { LoadingSpinner } from "./Loader";

/**
 * TransactionStatus component.
 * Tracks and displays transaction phases in real-time for payments or contract calls.
 * 
 * Supports statuses:
 * - 'preparing' (Preparing)
 * - 'signing' (Awaiting Signature)
 * - 'submitting' (Submitting)
 * - 'confirming' (Pending Confirmation)
 * - 'success' (Confirmed)
 * - 'error' (Failed)
 */
export default function TransactionStatus({ txState }) {
  const [copied, setCopied] = useState(false);

  if (!txState) {
    return (
      <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md flex flex-col items-center justify-center text-center py-10">
        <Clock className="w-8 h-8 text-slate-500 mb-3" />
        <h4 className="text-sm font-semibold text-slate-300">Transaction Status</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Perform a payment or jar tip to track the live ledger confirmation status.
        </p>
      </div>
    );
  }

  const { status, message, hash } = txState;

  const handleCopyHash = async () => {
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy hash:", err);
    }
  };

  // Helper to map state to user-friendly label
  const getStepState = (stepId, activeStatus) => {
    const statusOrdering = ["preparing", "signing", "submitting", "confirming", "success"];
    const activeIdx = statusOrdering.indexOf(activeStatus);
    const stepIdx = statusOrdering.indexOf(stepId);

    if (activeStatus === "error") {
      // If error, mark currently active building states as failed or pending
      return "pending";
    }

    if (stepIdx < activeIdx) return "completed";
    if (stepIdx === activeIdx) return "active";
    return "pending";
  };

  const steps = [
    { id: "preparing", label: "Preparing Transaction", icon: Radio },
    { id: "signing", label: "Awaiting Signature", icon: KeyRound },
    { id: "submitting", label: "Submitting to Network", icon: ArrowUpRight },
    { id: "confirming", label: "Pending Confirmation", icon: Activity },
  ];

  return (
    <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
      {/* Background glow effects */}
      {status === "success" && (
        <div className="absolute -right-20 -top-20 w-45 h-45 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {status === "error" && (
        <div className="absolute -right-20 -top-20 w-45 h-45 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      )}
      {!["success", "error"].includes(status) && (
        <div className="absolute -right-20 -top-20 w-45 h-45 bg-stellar-accent/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Progressing Tracker (Preparing, Signing, Submitting, Confirming) */}
      {!["success", "error"].includes(status) && (
        <div className="w-full space-y-4 py-1">
          <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
            <h4 className="text-sm font-semibold text-slate-200">Processing Transaction</h4>
            <LoadingSpinner size="sm" />
          </div>

          <div className="space-y-4">
            {steps.map((step) => {
              const StepIcon = step.icon;
              const stepState = getStepState(step.id, status);

              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border transition-all duration-300 ${
                    stepState === "completed"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                      : stepState === "active"
                      ? "bg-stellar-accent/10 border-stellar-accent/30 text-stellar-accent animate-pulse"
                      : "bg-white/5 border-white/10 text-slate-500"
                  }`}>
                    <StepIcon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs font-semibold block transition-colors ${
                      stepState === "completed" ? "text-emerald-400" : stepState === "active" ? "text-white" : "text-slate-500"
                    }`}>
                      {step.label}
                    </span>
                    {stepState === "active" && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 animate-fadeIn">
                        {message}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmed State (Success) */}
      {status === "success" && (
        <div className="text-center py-2 space-y-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Transaction Confirmed!</h4>
            <p className="text-xs text-slate-400">
              The operation has been successfully written to Stellar ledger consensus.
            </p>
          </div>

          {/* Hash Box */}
          {hash && (
            <div className="space-y-1.5 text-left pt-2 relative z-10">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Transaction Hash
              </label>
              <div className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl">
                <span className="font-mono text-xs text-slate-300 break-all select-all flex-1">
                  {hash}
                </span>
                <button
                  onClick={handleCopyHash}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all animate-fadeIn"
                  title="Copy Hash"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Explorer Links */}
          {hash && (
            <div className="pt-2 relative z-10">
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-semibold transition-all hover:scale-[1.01]"
              >
                <span>View on Stellar Expert</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Failed State (Error) */}
      {status === "error" && (
        <div className="text-center py-2 space-y-4">
          <div className="inline-flex p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10 animate-bounce">
            <XCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">Transaction Failed</h4>
            <p className="text-xs text-slate-400">
              The operation was rejected or could not settle on Testnet.
            </p>
          </div>

          {/* Error Message Details */}
          <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl text-left relative z-10">
            <span className="text-xs font-semibold text-rose-400 block mb-1">
              Details:
            </span>
            <p className="text-xs text-slate-300 font-mono leading-relaxed max-h-36 overflow-y-auto break-words">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
