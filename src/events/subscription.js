import { rpc, scValToNative } from "@stellar/stellar-sdk";
import { CONTRACT_ID } from "../config/contract";

const RPC_URL = "https://soroban-testnet.stellar.org";
const rpcServer = new rpc.Server(RPC_URL);

/**
 * Fetches recent tip events from the Soroban RPC.
 * Automatically handles pagination and decodes raw ScVal values.
 * 
 * @param {number} startLedger - Ledger number to start polling from
 * @returns {Promise<{events: Array, latestLedger: number}>}
 */
export const fetchTipEvents = async (startLedger = null) => {
  if (!CONTRACT_ID) {
    return { events: [], latestLedger: startLedger || 1 };
  }

  try {
    let start = startLedger;
    
    // 1. If startLedger is not defined, fetch latest ledger and offset backwards
    if (!start) {
      const latestLedgerRes = await rpcServer.getLatestLedger();
      // Go back ~5000 ledgers (approx 6-7 hours of history)
      start = Math.max(1, latestLedgerRes.sequence - 5000);
    }

    // 2. Fetch events from RPC server
    const response = await rpcServer.getEvents({
      startLedger: start,
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
        },
      ],
      limit: 50,
    });

    const parsedEvents = [];
    let maxLedger = start;

    if (response && response.events) {
      for (const event of response.events) {
        if (event.ledger > maxLedger) {
          maxLedger = event.ledger;
        }

        try {
          const topics = event.topic.map((t) => scValToNative(t));
          
          // Check if the event topic starts with the 'tip_received' symbol
          if (topics[0] === "tip_received") {
            const val = scValToNative(event.value);
            
            // Extract struct properties (handles standard JS object mapping by the SDK)
            // TipEvent: { sender: Address, amount: i128, timestamp: u64 }
            const sender = val.sender || val.get?.("sender") || topics[1] || "Unknown";
            const rawAmount = val.amount || val.get?.("amount") || 0;
            const rawTimestamp = val.timestamp || val.get?.("timestamp") || Math.floor(Date.now() / 1000);

            // Convert amount from Stroops back to XLM
            const amount = typeof rawAmount === "bigint" ? Number(rawAmount) / 10000000 : Number(rawAmount) / 10000000;
            const timestamp = typeof rawTimestamp === "bigint" ? Number(rawTimestamp) : Number(rawTimestamp);

            parsedEvents.push({
              id: event.id,
              sender: String(sender),
              amount: parseFloat(amount.toFixed(4)),
              timestamp: timestamp * 1000, // convert to milliseconds
              ledger: event.ledger,
            });
          }
        } catch (parseErr) {
          console.warn("Skipping unparseable contract event entry:", event, parseErr);
        }
      }
    }

    // Sort events by timestamp descending (newest first)
    parsedEvents.sort((a, b) => b.timestamp - a.timestamp);

    return {
      events: parsedEvents,
      latestLedger: maxLedger,
    };
  } catch (error) {
    console.error("Failed to fetch tip events from RPC:", error);
    throw error;
  }
};
