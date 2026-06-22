import { useState } from "react";
import { AlertCircle, Check, Copy, ShieldCheck, Wallet, ArrowRight } from "lucide-react";

/**
 * Wallet Connection Card.
 * Connects Freighter or Albedo wallets, shows active details, and provides clipboard tools.
 */
export default function WalletCard({
  publicKey,
  walletType,
  isConnecting,
  onOpenConnectModal,
  onDisconnect,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicKey) return;
    try {
      await navigator.clipboard.writeText(publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // Case 1: Connected wallet
  if (publicKey) {
    const isFreighter = walletType === "freighter";

    return (
      <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
        {/* Glow backdrop */}
        <div className={`absolute -right-20 -top-20 w-45 h-45 rounded-full blur-3xl transition-all duration-500 ${
          isFreighter ? "bg-stellar-accent/10 group-hover:bg-stellar-accent/15" : "bg-stellar-secondary/10 group-hover:bg-stellar-secondary/15"
        }`} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-semibold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
              <span>Wallet Connected</span>
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium flex items-center gap-1.5 ${
              isFreighter
                ? "bg-stellar-accent/10 text-stellar-accent border-stellar-accent/20"
                : "bg-stellar-secondary/10 text-stellar-secondary border-stellar-secondary/20"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isFreighter ? "bg-stellar-accent animate-pulse" : "bg-stellar-secondary animate-pulse"}`} />
              {isFreighter ? "Freighter Active" : "Albedo Active"}
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
              Stellar Address
            </label>
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="font-mono text-xs text-slate-300 break-all select-all flex-1">
                {publicKey}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all"
                title="Copy Address"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-white/5 border border-white/5 p-3 rounded-xl">
              <AlertCircle className="w-4.5 h-4.5 text-stellar-secondary shrink-0 mt-0.5" />
              <span>
                Make sure your {isFreighter ? "Freighter wallet" : "Albedo signer"} is set to the **Stellar Testnet** before submitting transactions.
              </span>
            </div>
            <button
              onClick={onDisconnect}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 text-slate-300 font-medium text-xs transition-all duration-200"
            >
              Disconnect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Disconnected wallet (prompts connection modal)
  return (
    <div className="w-full p-6 rounded-2xl bg-stellar-card border border-white/5 backdrop-blur-md relative overflow-hidden group">
      {/* Glow backdrop */}
      <div className="absolute -right-20 -top-20 w-45 h-45 bg-stellar-accent/10 rounded-full blur-3xl transition-all duration-500 group-hover:bg-stellar-accent/15" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-slate-200 flex items-center gap-2">
            <Wallet className="w-4.5 h-4.5 text-stellar-accent" />
            <span>Connect Stellar Wallet</span>
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20 font-medium">
            Ready
          </span>
        </div>

        <p className="text-sm text-slate-400 leading-relaxed">
          Select Freighter Wallet or Albedo Wallet to fetch your XLM Testnet balance, send payments, or interact with Soroban contract tip jars.
        </p>

        <button
          onClick={onOpenConnectModal}
          disabled={isConnecting}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-stellar-accent to-stellar-secondary hover:from-stellar-accent/90 hover:to-stellar-secondary/90 text-white font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-stellar-accent/15 flex items-center justify-center gap-2"
        >
          <span>{isConnecting ? "Connecting Wallet..." : "Connect Wallet"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
