import { isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";
import albedo from "@albedo-link/intent";

export const WALLET_TYPES = {
  FREIGHTER: "freighter",
  ALBEDO: "albedo",
};

/**
 * Checks if a specific wallet type is installed or available.
 * @param {string} type - Wallet type ('freighter' or 'albedo')
 * @returns {Promise<boolean>} True if available
 */
export const checkWalletInstalled = async (type) => {
  if (type === WALLET_TYPES.FREIGHTER) {
    try {
      const res = await isConnected();
      return !!res.isConnected;
    } catch (error) {
      console.error("Error checking Freighter connection status:", error);
      return false;
    }
  }
  if (type === WALLET_TYPES.ALBEDO) {
    // Albedo is web-based, so it does not require a browser extension and is always available.
    return true;
  }
  return false;
};

/**
 * Request account access (connect wallet) and return public key.
 * @param {string} type - Wallet type
 * @returns {Promise<string>} Stellar Public Key
 */
export const connectWallet = async (type) => {
  if (type === WALLET_TYPES.FREIGHTER) {
    const installed = await checkWalletInstalled(type);
    if (!installed) {
      throw new Error("Freighter wallet is not installed.");
    }

    try {
      const { address, error } = await requestAccess();
      if (error) {
        throw new Error(error || "Failed to retrieve address from Freighter.");
      }
      if (!address) {
        throw new Error("User denied access or no account is available in Freighter.");
      }
      return address;
    } catch (error) {
      console.error("Freighter connect error:", error);
      throw error;
    }
  } else if (type === WALLET_TYPES.ALBEDO) {
    try {
      // Prompt Albedo web key request
      const result = await albedo.publicKey({});
      if (!result.pubkey) {
        throw new Error("Failed to retrieve public key from Albedo.");
      }
      return result.pubkey;
    } catch (error) {
      console.error("Albedo connect error:", error);
      throw error;
    }
  }
  throw new Error("Unsupported wallet type selected.");
};

/**
 * Signs an XDR transaction using the active wallet.
 * @param {string} type - Selected wallet type
 * @param {string} txXdr - Transaction XDR string
 * @param {string} networkPassphrase - Target network passphrase
 * @returns {Promise<string>} Signed transaction XDR
 */
export const signTx = async (type, txXdr, networkPassphrase) => {
  if (type === WALLET_TYPES.FREIGHTER) {
    try {
      const result = await signTransaction(txXdr, {
        networkPassphrase,
      });
      if (result.error) {
        throw new Error(result.error);
      }
      return result.signedTxXdr;
    } catch (error) {
      console.error("Freighter signing error:", error);
      throw error;
    }
  } else if (type === WALLET_TYPES.ALBEDO) {
    try {
      const network = networkPassphrase.includes("Testnet") ? "testnet" : "public";
      const result = await albedo.tx({
        xdr: txXdr,
        network,
      });
      if (!result.signed_envelope_xdr) {
        throw new Error("Albedo did not return a signed transaction envelope.");
      }
      return result.signed_envelope_xdr;
    } catch (error) {
      console.error("Albedo signing error:", error);
      throw error;
    }
  }
  throw new Error("Unsupported wallet type for signing.");
};
