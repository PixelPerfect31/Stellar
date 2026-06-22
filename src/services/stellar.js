import { Horizon, TransactionBuilder, Networks, Operation, Asset } from "@stellar/stellar-sdk";
import { signTx } from "../wallets/wallet-manager";
import { mapRawError } from "../utils/errors";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

/**
 * Fetches the XLM balance of a Stellar public key on the Testnet.
 * Handles the case where the account does not exist (unfunded) on Testnet.
 * 
 * @param {string} publicKey - Stellar public key
 * @returns {Promise<{balance: string, isFunded: boolean}>} Object containing balance and funding status
 */
export const fetchXlmBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeAsset = account.balances.find((b) => b.asset_type === "native");
    return {
      balance: nativeAsset ? parseFloat(nativeAsset.balance).toFixed(4) : "0.0000",
      isFunded: true
    };
  } catch (error) {
    // If account not found (404), it has not been created/funded on Testnet yet
    if (error.status === 404 || (error.response && error.response.status === 404)) {
      return {
        balance: "0.0000",
        isFunded: false
      };
    }
    console.error("Error fetching account balance:", error);
    throw mapRawError(error, "Horizon");
  }
};

/**
 * Funds an account on the Testnet using the SDF Friendbot.
 * Useful for beginner-friendly testnet onboarding.
 * 
 * @param {string} publicKey - Stellar public key
 * @returns {Promise<boolean>} True if funding succeeded
 */
export const fundAccountWithFriendbot = async (publicKey) => {
  try {
    const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
    if (response.ok) {
      return true;
    }
    throw new Error("Friendbot request failed.");
  } catch (error) {
    console.error("Friendbot error:", error);
    throw mapRawError(error, "Friendbot");
  }
};

/**
 * Prepares, signs, and submits a payment transaction on the Stellar Testnet.
 * Dynamically routes signing based on the selected wallet type (Freighter or Albedo).
 * 
 * @param {string} walletType - The selected wallet type ('freighter' or 'albedo')
 * @param {string} senderPk - Sender's public key
 * @param {string} receiverPk - Recipient's public key
 * @param {string} amount - Amount of XLM to send
 * @param {function} onProgress - Status update callback
 * @returns {Promise<string>} Transaction hash
 */
export const sendTransactionFlow = async (walletType, senderPk, receiverPk, amount, onProgress) => {
  onProgress({ status: "preparing", message: "Fetching account sequence and fee details..." });
  
  let account;
  let baseFee;
  try {
    account = await server.loadAccount(senderPk);
    baseFee = await server.fetchBaseFee();
  } catch (error) {
    console.error("Preparation error:", error);
    throw mapRawError(new Error("Failed to load account sequence from Testnet. Ensure your account is funded.", { cause: error }), "Horizon");
  }

  // Build transaction
  let tx;
  try {
    tx = new TransactionBuilder(account, {
      fee: baseFee.toString(),
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: receiverPk.trim(),
          asset: Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(300) // 5 minutes validity
      .build();
  } catch (error) {
    console.error("Build error:", error);
    throw mapRawError(new Error(`Failed to build transaction: ${error.message}`, { cause: error }), "Horizon");
  }

  const txXdr = tx.toXDR();

  // Awaiting signature using selected wallet
  onProgress({ status: "signing", message: `Awaiting signature from ${walletType === "freighter" ? "Freighter" : "Albedo"}...` });
  
  let signedXdr;
  try {
    signedXdr = await signTx(walletType, txXdr, Networks.TESTNET);
  } catch (error) {
    console.error("Signing error:", error);
    throw mapRawError(error, walletType);
  }

  if (!signedXdr) {
    throw new Error(`${walletType === "freighter" ? "Freighter" : "Albedo"} did not return a signed transaction.`);
  }

  // Submitting to network
  onProgress({ status: "submitting", message: "Submitting transaction to Horizon Testnet..." });

  try {
    const transactionToSubmit = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const result = await server.submitTransaction(transactionToSubmit);
    
    if (result.successful) {
      return result.hash;
    } else {
      throw new Error("Transaction submission was not successful.");
    }
  } catch (error) {
    console.error("Submission error details:", error);
    let detailedMsg = "Failed to submit transaction to the network.";
    if (error.response?.data?.extras?.result_codes) {
      const codes = error.response.data.extras.result_codes;
      const opCodes = codes.operations ? codes.operations.join(", ") : "";
      detailedMsg = `Horizon transaction failed: ${codes.transaction}${opCodes ? ` (Operation code: ${opCodes})` : ""}`;
    } else if (error.message) {
      detailedMsg = error.message;
    }
    throw mapRawError(new Error(detailedMsg, { cause: error }), "Horizon");
  }
};
