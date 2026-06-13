/**
 /**
 * Error representing when the selected browser extension/wallet is not detected.
 */
export class WalletNotInstalledError extends Error {
  constructor(walletType, message = "") {
    super(message || `${walletType} wallet is not installed. Please install the extension or ensure the app is configured.`);
    this.name = "WalletNotInstalledError";
    this.walletType = walletType;
  }
}

/**
 * Error representing when the user cancels or rejects transaction signing.
 */
export class UserRejectedTransactionError extends Error {
  constructor(message = "Transaction signing was declined by the user.") {
    super(message);
    this.name = "UserRejectedTransactionError";
  }
}

/**
 * Error representing network loss or unreachable Horizon/Soroban RPC endpoints.
 */
export class NetworkError extends Error {
  constructor(message = "Stellar network node or RPC endpoint is currently unreachable. Please check your internet connection and try again.") {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Error representing when inputs or conditions fail the transaction requirements.
 */
export class InvalidAmountError extends Error {
  constructor(message = "The tip or payment amount must be a positive number.") {
    super(message);
    this.name = "InvalidAmountError";
  }
}

/**
 * Error representing smart contract logic reverts or simulation failures.
 */
export class ContractExecutionError extends Error {
  constructor(message = "Soroban smart contract execution failed. Ensure arguments are valid.") {
    super(message);
    this.name = "ContractExecutionError";
  }
}

/**
 * Error representing when an account has insufficient XLM balance.
 */
export class InsufficientBalanceError extends Error {
  constructor(message = "Your account has insufficient XLM balance to complete this transaction (including gas/network fees).") {
    super(message);
    this.name = "InsufficientBalanceError";
  }
}

/**
 * Maps raw library or network errors to user-friendly error classes.
 * @param {Error|any} error - The caught error object or message
 * @param {string} context - Context descriptor (e.g. Freighter, Albedo, Payment)
 * @returns {Error} The normalized error class instance
 */
export const mapRawError = (error, context = "") => {
  if (!error) return new Error("An unknown error occurred.");
  
  const errMsg = error.message || String(error);
  const errMsgLower = errMsg.toLowerCase();

  // 1. Wallet Not Installed Detect
  if (
    errMsgLower.includes("not installed") || 
    errMsgLower.includes("freighter wallet is not installed") ||
    errMsgLower.includes("extension not found")
  ) {
    return new WalletNotInstalledError(context || "Freighter");
  }

  // 2. User Signature Rejection Detect
  if (
    errMsgLower.includes("user rejected") ||
    errMsgLower.includes("user declined") ||
    errMsgLower.includes("declined") ||
    errMsgLower.includes("cancel") ||
    errMsgLower.includes("closed by user") ||
    errMsgLower.includes("reject") ||
    errMsgLower.includes("cancelled") ||
    errMsgLower.includes("user abort")
  ) {
    return new UserRejectedTransactionError();
  }

  // 3. Network Outage or Fetch Failed Detect
  if (
    errMsgLower.includes("fetch") ||
    errMsgLower.includes("network") ||
    errMsgLower.includes("rpc") ||
    errMsgLower.includes("horizon") ||
    errMsgLower.includes("timeout") ||
    errMsgLower.includes("failed to load account") ||
    errMsgLower.includes("unreachable")
  ) {
    return new NetworkError();
  }

  // 4. Insufficient Balance Detect
  if (
    errMsgLower.includes("insufficient balance") ||
    errMsgLower.includes("underfunded") ||
    errMsgLower.includes("op_underfunded") ||
    errMsgLower.includes("tx_insufficient_balance")
  ) {
    return new InsufficientBalanceError();
  }

  // 5. Contract Simulation / Execution Reverts Detect
  if (
    errMsgLower.includes("simulation failed") ||
    errMsgLower.includes("execution failed") ||
    errMsgLower.includes("contract") ||
    errMsgLower.includes("revert")
  ) {
    return new ContractExecutionError(errMsg);
  }

  // Fallback: return original or simple wrapper
  return error instanceof Error ? error : new Error(errMsg);
};
