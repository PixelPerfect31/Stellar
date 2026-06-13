import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Navbar from "./components/Navbar";
import WalletCard from "./components/WalletCard";
import BalanceCard from "./components/BalanceCard";
import TipJarCard from "./components/TipJarCard";
import RecentActivity from "./components/RecentActivity";
import SendPayment from "./components/SendPayment";
import TransactionStatus from "./components/TransactionStatus";
import WalletSelectorModal from "./components/WalletSelectorModal";

import {
  fetchXlmBalance,
  sendTransactionFlow,
} from "./services/stellar";

import { connectWallet, checkWalletInstalled } from "./wallets/wallet-manager";
import { mapRawError } from "./utils/errors";

/**
 * Main App Container.
 * Orchestrates global states, wallet connections, and dashboard panels.
 */
export default function App() {
  // Connection states
  const [publicKey, setPublicKey] = useState(() => localStorage.getItem("stellar_pk") || "");
  const [walletType, setWalletType] = useState(() => localStorage.getItem("stellar_wallet_type") || "");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Balance states
  const [balanceData, setBalanceData] = useState(null);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // Transaction / Operation logging states
  const [txState, setTxState] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  // Trigger to manually refresh the Recent Activity event list
  const [refreshEventsTrigger, setRefreshEventsTrigger] = useState(0);

  /**
   * Loads the current balance of the active public key from Horizon.
   */
  const loadAccountBalance = async (keyToLoad) => {
    if (!keyToLoad) return;
    setIsBalanceLoading(true);
    try {
      const data = await fetchXlmBalance(keyToLoad);
      setBalanceData(data);
    } catch (error) {
      const mapped = mapRawError(error, "Horizon");
      toast.error(mapped.message);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  // Phase 1: Auto-reconnect wallet on revisit if credentials exist in localStorage
  useEffect(() => {
    const autoReconnect = async () => {
      const savedPk = localStorage.getItem("stellar_pk");
      const savedType = localStorage.getItem("stellar_wallet_type");

      if (savedPk && savedType) {
        const isInstalled = await checkWalletInstalled(savedType);
        if (isInstalled) {
          setPublicKey(savedPk);
          setWalletType(savedType);
          loadAccountBalance(savedPk);
        } else {
          // Clear localStorage if connection method is no longer present
          localStorage.removeItem("stellar_pk");
          localStorage.removeItem("stellar_wallet_type");
        }
      }
    };
    autoReconnect();
  }, []);

  // Sync balance when public key changes
  useEffect(() => {
    if (publicKey) {
      loadAccountBalance(publicKey);
    } else {
      setBalanceData(null);
    }
  }, [publicKey]);

  /**
   * Triggers when user selects a wallet option in the WalletSelectorModal.
   * @param {string} type - WalletType selected ('freighter' or 'albedo')
   */
  const handleSelectWallet = async (type) => {
    setIsWalletModalOpen(false);
    setIsConnecting(true);
    const toastId = toast.loading(`Connecting to ${type === "freighter" ? "Freighter" : "Albedo"}...`);

    try {
      const pk = await connectWallet(type);
      setPublicKey(pk);
      setWalletType(type);
      localStorage.setItem("stellar_pk", pk);
      localStorage.setItem("stellar_wallet_type", type);

      toast.update(toastId, {
        render: "Wallet connected successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Wallet connection error:", error);
      const mapped = mapRawError(error, type === "freighter" ? "Freighter" : "Albedo");
      
      toast.update(toastId, {
        render: mapped.message,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Action handler: disconnects the active wallet session.
   */
  const handleDisconnect = () => {
    setPublicKey("");
    setWalletType("");
    localStorage.removeItem("stellar_pk");
    localStorage.removeItem("stellar_wallet_type");
    setBalanceData(null);
    setTxState(null);
    toast.info("Wallet disconnected.");
  };

  /**
   * Action handler: manual balance reload.
   */
  const handleRefreshBalance = () => {
    if (!publicKey) return;
    loadAccountBalance(publicKey);
    toast.success("Balance updated!");
  };

  /**
   * Action handler: executes Horizon native XLM transfer.
   */
  const handleSendPayment = async (recipient, amount) => {
    if (!publicKey || !walletType) return;

    setIsProcessing(true);
    setTxSuccess(false);
    setTxState({ status: "preparing", message: "Preparing payment transaction..." });

    try {
      const hash = await sendTransactionFlow(
        walletType,
        publicKey,
        recipient,
        amount,
        (prog) => setTxState(prog)
      );

      setTxState({ status: "success", hash });
      setTxSuccess(true);
      toast.success("Payment sent successfully!");
      
      // Refresh balance after ledger settles
      await loadAccountBalance(publicKey);
    } catch (error) {
      console.error("Horizon payment error:", error);
      const mapped = mapRawError(error, walletType);
      
      setTxState({ status: "error", message: mapped.message });
      toast.error("Payment failed. See status card for details.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Callback fired when a Tip Jar contract deposit settles successfully.
   */
  const handleTipSuccess = () => {
    // 1. Refresh main XLM balance
    loadAccountBalance(publicKey);
    // 2. Trigger RecentActivity polling updates
    setRefreshEventsTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-mesh flex flex-col selection:bg-stellar-accent/30 selection:text-white pb-16">
      {/* Navbar */}
      <Navbar
        publicKey={publicKey}
        walletType={walletType}
        onOpenConnectModal={() => setIsWalletModalOpen(true)}
        onDisconnect={handleDisconnect}
        isConnecting={isConnecting}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 flex-1 w-full animate-fadeIn">
        {/* Title branding header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-3 bg-gradient-to-r from-white via-slate-100 to-stellar-secondary bg-clip-text text-transparent">
            StellarPay
          </h1>
          <p className="text-md sm:text-lg text-slate-400 max-w-xl mx-auto">
            Vibrant multi-wallet payments and interactive Soroban tip jars.
          </p>
        </section>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left Column: Connection status, balances, and tip jars */}
          <div className="space-y-8">
            <WalletCard
              publicKey={publicKey}
              walletType={walletType}
              isConnecting={isConnecting}
              onOpenConnectModal={() => setIsWalletModalOpen(true)}
              onDisconnect={handleDisconnect}
            />

            <BalanceCard
              publicKey={publicKey}
              balanceData={balanceData}
              isLoading={isBalanceLoading}
              onRefresh={handleRefreshBalance}
            />

            <TipJarCard
              publicKey={publicKey}
              walletType={walletType}
              onTipSuccess={handleTipSuccess}
              onProgressChange={(prog) => setTxState(prog)}
            />
          </div>

          {/* Right Column: Send forms, event logs, and status tracker */}
          <div className="space-y-8">
            <SendPayment
              publicKey={publicKey}
              balanceData={balanceData}
              onSubmit={handleSendPayment}
              isProcessing={isProcessing}
              txSuccess={txSuccess}
            />

            <RecentActivity refreshTrigger={refreshEventsTrigger} />

            <TransactionStatus txState={txState} />
          </div>
        </div>
      </main>

      {/* Wallet Connection Modal */}
      <WalletSelectorModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={handleSelectWallet}
        isConnecting={isConnecting}
      />

      {/* Toast Notification system */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}
