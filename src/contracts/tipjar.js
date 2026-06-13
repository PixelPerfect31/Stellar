import { rpc, TransactionBuilder, Networks, Contract, nativeToScVal, scValToNative } from "@stellar/stellar-sdk";
import { CONTRACT_ID } from "../config/contract";
import { signTx } from "../wallets/wallet-manager";
import { mapRawError } from "../utils/errors";

const RPC_URL = "https://soroban-testnet.stellar.org";
const rpcServer = new rpc.Server(RPC_URL);

// Fallback funded address to allow reading contract total when wallet is not connected
const FALLBACK_READ_ACCOUNT = "GBRPYH6QC6WLU24OPTH75D33RPWUA6E4H3UGVGYC5Z5PH6YZ3GXTWSOO";

/**
 * Fetches the total amount of tips in the Tip Jar contract (simulation call).
 * @param {string} userPk - Connected user public key (optional)
 * @returns {Promise<number>} Total XLM amount in the jar
 */
export const getJarTotal = async (userPk = "") => {
  if (!CONTRACT_ID) {
    console.warn("Tip Jar contract ID not configured.");
    return 0;
  }

  const queryPk = userPk || FALLBACK_READ_ACCOUNT;
  const contract = new Contract(CONTRACT_ID);

  try {
    // 1. Fetch sequence account
    let sourceAccount;
    try {
      sourceAccount = await rpcServer.getAccount(queryPk);
    } catch (err) {
      // If userPk not found or not funded, fallback to known funded account
      if (queryPk !== FALLBACK_READ_ACCOUNT) {
        sourceAccount = await rpcServer.getAccount(FALLBACK_READ_ACCOUNT);
      } else {
        throw err;
      }
    }

    // 2. Build the transaction
    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(contract.call("get_total"))
      .setTimeout(30)
      .build();

    // 3. Simulate
    const simulation = await rpcServer.simulateTransaction(tx);
    if (simulation.error || !simulation.results) {
      throw new Error(`Simulation failed: ${simulation.error || "no results returned"}`);
    }

    const retval = simulation.result?.retval;
    if (!retval) {
      return 0;
    }

    // 4. Decode the result (i128)
    const nativeVal = scValToNative(retval);
    
    // Divide by 10^7 to convert Stroops to XLM
    const xlmTotal = Number(nativeVal) / 10000000;
    return xlmTotal;
  } catch (error) {
    console.error("Error fetching getJarTotal:", error);
    const mapped = mapRawError(error, "Soroban RPC");
    throw mapped;
  }
};

/**
 * Calls the deposit function on the Soroban Tip Jar contract.
 * 
 * @param {string} walletType - Active wallet type ('freighter' or 'albedo')
 * @param {string} senderPk - Sender public key
 * @param {string|number} amount - Amount in XLM to tip
 * @param {function} onProgress - Progress status callback
 * @returns {Promise<{txHash: string, newTotal: number}>} Transaction receipt
 */
export const depositTip = async (walletType, senderPk, amount, onProgress) => {
  if (!CONTRACT_ID) {
    throw new Error("CONTRACT_ID is not configured. Please paste your deployed Soroban contract ID in src/config/contract.js.");
  }

  const contract = new Contract(CONTRACT_ID);

  // Convert amount to Stroops (7 decimal places)
  const amountInStroops = BigInt(Math.floor(parseFloat(amount) * 10000000));

  onProgress({ status: "preparing", message: "Fetching account sequence and preparing contract invocation..." });

  try {
    // 1. Get sender account
    let sourceAccount;
    try {
      sourceAccount = await rpcServer.getAccount(senderPk);
    } catch (error) {
      console.error("Failed to fetch account sequence:", error);
      throw new Error("Failed to load account from Soroban RPC. Ensure your account is funded with XLM.");
    }

    // 2. Build transaction
    // deposit(sender, amount)
    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100", // placeholder, will be updated by assembleTransaction
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "deposit",
          nativeToScVal(senderPk, { type: "address" }),
          nativeToScVal(amountInStroops, { type: "i128" })
        )
      )
      .setTimeout(300) // 5 minutes
      .build();

    // 3. Simulate transaction to calculate fees and authorization footprint
    onProgress({ status: "simulating", message: "Simulating transaction on Soroban RPC..." });
    const simulation = await rpcServer.simulateTransaction(tx);
    
    if (simulation.error || !simulation.results) {
      throw new Error(`Simulation failed: ${simulation.error || "no execution results returned"}`);
    }

    // 4. Assemble simulation results into transaction
    const assembledTx = rpc.assembleTransaction(tx, simulation).build();
    const txXdr = assembledTx.toXDR();

    // 5. Ask wallet to sign
    onProgress({ status: "signing", message: `Awaiting signature from ${walletType === "freighter" ? "Freighter" : "Albedo"}...` });
    const signedXdr = await signTx(walletType, txXdr, Networks.TESTNET);

    // 6. Submit to Soroban RPC
    onProgress({ status: "submitting", message: "Submitting signed transaction to Soroban RPC..." });
    const signedTxObj = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    const sendResponse = await rpcServer.sendTransaction(signedTxObj);

    if (sendResponse.status === "ERROR") {
      throw new Error(`Transaction rejected by RPC: ${sendResponse.errorResultXdr || "unknown error"}`);
    }

    const txHash = sendResponse.hash;
    let status = sendResponse.status;
    let getTxResponse;

    onProgress({ status: "submitting", message: "Waiting for transaction consensus..." });

    // Poll for status
    for (let i = 0; i < 15; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        getTxResponse = await rpcServer.getTransaction(txHash);
        status = getTxResponse.status;
        if (status === "SUCCESS" || status === "FAILED") {
          break;
        }
      } catch (err) {
        console.warn("Polling error, continuing...", err);
      }
    }

    if (status !== "SUCCESS") {
      throw new Error(`Transaction consensus status: ${status}.`);
    }

    // 7. Extract new total from the contract return value
    let newTotal = 0;
    try {
      const resultValue = getTxResponse.resultMetaXdr
        ?.v3()
        ?.sorobanMeta()
        ?.returnValue();
        
      if (resultValue) {
        const nativeVal = scValToNative(resultValue);
        newTotal = Number(nativeVal) / 10000000;
      }
    } catch (err) {
      console.warn("Could not extract new total from return value:", err);
    }

    return { txHash, newTotal };
  } catch (error) {
    console.error("depositTip error:", error);
    const mapped = mapRawError(error, walletType);
    throw mapped;
  }
};
