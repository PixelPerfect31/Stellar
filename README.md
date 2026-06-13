# StellarPay (Level 2 Upgrade)

StellarPay is a premium, decentralized application (dApp) built on the **Stellar Testnet** using **React**, **Vite**, and **Tailwind CSS**. It provides users with multi-wallet payment tools (Freighter + Albedo) and interactive interactions with a custom **Soroban Tip Jar smart contract**.

The interface features a responsive, mobile-first design with smooth animation triggers, micro-interactions, glassmorphic styling, and loading skeleton states.

---

## Level 2 Features

*   **Multi-Wallet Support:**
    *   **Freighter Wallet:** Seamless browser extension connection with network verification (checks if Freighter is set to Testnet).
    *   **Albedo Wallet:** Interactive web-based signer popup (no extension installation required).
    *   **Wallet Persistence:** Automatically stores user preferences in `localStorage` to support auto-reconnecting on page refreshes or returning visits.
*   **Soroban Smart Contract (Tip Jar):**
    *   Written in **Rust** using the latest `soroban-sdk` (v22.0.0).
    *   `deposit(sender, amount)`: Accepts a virtual tip, increases the aggregate tip jar total, and logs ledger events.
    *   `get_total()`: Returns the cumulative amount tipped in the contract.
    *   **Setup Fallback:** Prompts developers with clear inline setup alerts if the contract ID has not yet been configured in the front-end.
*   **Real-Time Event Integration:**
    *   Subscribes to Soroban contract events using a polling RPC subscriber.
    *   Detects and parses `"tip_received"` events containing the sender's address, tip amount, and timestamp.
    *   Updates a **"Recent Activity"** log panel in real-time without requiring page refreshes.
*   **Transaction Status Tracking:**
    *   A reusable, user-friendly state tracker showcasing: **Preparing**, **Awaiting Signature**, **Submitting**, **Pending Confirmation**, **Confirmed**, and **Failed**.
    *   Displays transaction hashes, clipboard copying, and direct explorer anchors on [Stellar Expert Explorer](https://stellar.expert).
*   **Robust Error Handling:**
    *   `WalletNotInstalledError`: Explains how to acquire Freighter or switch to Albedo.
    *   `UserRejectedTransactionError`: Gracefully captures when users close signers or cancel prompts.
    *   `NetworkError`: Intercepts cases where Horizon or Soroban RPC nodes are unresponsive.
    *   `InsufficientBalanceError`: Alerts users when balances are inadequate to cover transactions or gas fees.
    *   `ContractExecutionError`: Flags issues related to contract simulation failures.
*   **SDF Friendbot Integration:** Initialize and fund empty testnet public keys with 10,000 free XLM instantly from the UI.

---

## Tech Stack

*   **Framework:** React v19 + Vite + ES Modules
*   **Styling:** Vanilla CSS + Tailwind CSS v4 (@theme configurations)
*   **Stellar Connection:** `@stellar/stellar-sdk` (v15.1.0)
*   **Wallet APIs:** `@stellar/freighter-api` (Freighter) & `@albedo-link/intent` (Albedo)
*   **Globals Resolver:** `vite-plugin-node-polyfills`
*   **Notifications:** `react-toastify`
*   **Icons:** `lucide-react`

---

## Clean Folder Structure

The project maintains a structured codebase, separating wallet adapters, contract helpers, subscription routines, error mappers, UI components, and settings:

```text
contracts/
└── tipjar/                     # Soroban Rust Smart Contract
    ├── Cargo.toml              # Cargo dependency configuration
    └── src/
        └── lib.rs              # Tip Jar contract implementation
src/
├── config/
│   └── contract.js             # Deployed Soroban Contract ID configuration
├── wallets/
│   └── wallet-manager.js       # Unified Freighter & Albedo connector interface
├── contracts/
│   └── tipjar.js               # deposit() and get_total() contract invocation wrappers
├── events/
│   └── subscription.js         # Polling event subscription querying Soroban RPC
├── components/
│   ├── Navbar.jsx              # sticky top brand layout, status pills, disconnect button
│   ├── WalletCard.jsx          # unified wallet states, addresses, copy tools, modal triggers
│   ├── BalanceCard.jsx         # XLM balance tracker, Friendbot onboarding button
│   ├── TipJarCard.jsx          # tip jar input, stat cards, setup warnings, deposit actions
│   ├── RecentActivity.jsx      # live tip ledger events polled without page refreshes
│   ├── SendPayment.jsx         # Horizon native XLM payment form with validators
│   ├── TransactionStatus.jsx   # step-by-step transaction progress logs and explorer links
│   ├── WalletSelectorModal.jsx # Freighter and Albedo connector selector modal
│   └── Loader.jsx              # reusable CSS loaders and anim skeleton templates
├── services/
│   └── stellar.js              # Horizon network balance fetches and payment operations
├── utils/
│   ├── errors.js               # custom error classes and raw error mapper utilities
│   └── validators.js           # address formats and transfer amount input validators
├── App.jsx                     # central React state coordinator
├── main.jsx                    # entry mounting loader
└── index.css                   # Tailwind CSS declarations, HSL colors, background mesh
```

---

## Installation & Local Development

### 1. Prerequisites (Setup Wallets)

*   **Freighter Extension:** Install from [freighter.app](https://www.freighter.app/). Open settings -> preferences -> network and select **Testnet**.
*   **Albedo Account:** No setup required! Albedo operates in a secure web tab.

### 2. Run Locally

Navigate to the workspace and launch Vite:

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev
```

The application will start at `http://localhost:5173`.

---

## Soroban Contract Setup & Deployment

The Soroban Tip Jar contract is written in Rust. Perform the following steps to manually build and deploy the contract onto the Stellar Testnet:

### 1. Build the WASM contract
Make sure you have Rust and the `wasm32-unknown-unknown` target installed. In the `contracts/tipjar` directory, run:

```bash
cargo build --target wasm32-unknown-unknown --release
```

This generates `target/wasm32-unknown-unknown/release/soroban_tipjar_contract.wasm`.

### 2. Configure Soroban CLI Identity
If you haven't already, configure a developer identity and request testnet funding:

```bash
# Generate a developer keypair
soroban keys generate dev_user

# Fund your developer keypair using Friendbot
soroban keys fund dev_user --network testnet
```

### 3. Deploy the Contract
Deploy the compiled WASM binary to the Stellar Testnet:

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/soroban_tipjar_contract.wasm \
  --source dev_user \
  --network testnet
```

Copy the returned **Contract ID** (e.g. `CC...`).

### 4. Paste the Contract ID
Open [src/config/contract.js](file:///c:/Users/Rahul/Desktop/stellar/src/config/contract.js) and paste the Contract ID inside the quotes:

```javascript
export const CONTRACT_ID = "YOUR_DEPLOYED_CONTRACT_ID";
```

Once saved, the Tip Jar card and Recent Activity panel on your frontend will automatically activate.

### 5. (Optional) Invoke manually via CLI
You can test the contract methods using the CLI:

```bash
# Query the total tipped amount (returns 0 initially)
soroban contract invoke \
  --id YOUR_DEPLOYED_CONTRACT_ID \
  --source dev_user \
  --network testnet \
  -- get_total

# Deposit a tip (amount is in Stroops, e.g. 10000000 = 1 XLM)
soroban contract invoke \
  --id YOUR_DEPLOYED_CONTRACT_ID \
  --source dev_user \
  --network testnet \
  -- deposit \
  --sender <YOUR_STELLAR_ADDRESS> \
  --amount 50000000
```

---

## Real-Time Event Subscription

StellarPay queries the Soroban RPC endpoint (`https://soroban-testnet.stellar.org`) using `rpcServer.getEvents()`. 
Every 6 seconds, the `RecentActivity` component polls for recent ledger entries. It filters for topics matching `"tip_received"`, decodes the payload parameters (sender, amount in Stroops, and timestamp), and merges new items into the scrollable UI list without causing a page refresh.

---

## Deployment to Vercel

Build and host the production bundle:

1.  **Build Check:**
    ```bash
    npm run build
    ```
2.  **Deploy via Dashboard:**
    *   Push your project to GitHub.
    *   Connect your GitHub account to [Vercel](https://vercel.com).
    *   Select **Import** for the `stellar` repository.
    *   Leave the default Vite configurations.
    *   Set the root directory to your workspace, then click **Deploy**.

---

## GitHub Submission Instructions

For Level 2 submissions, prepare your Git history as if the project was built incrementally. Provide these meaningful commits:

*   **Commit 1:**
    `feat: add multi-wallet support with Freighter and Albedo integration`
*   **Commit 2:**
    `feat: implement Soroban tip jar contract and frontend contract interactions`
*   **Commit 3:**
    `feat: add real-time event subscriptions and transaction status tracking`
*   **Commit 4:**
    `refactor: improve error handling, UI polish, and production readiness`

---

## Screenshot Placeholders

*Insert screenshots or animations here to present your submission:*
*   `![Dashboard - Wallet Selection Modal](https://placehold.co/800x450/0f172a/ffffff?text=Wallet+Selector+Modal+Dashboard)`
*   `![Dashboard - Tip Jar & Recent Activity](https://placehold.co/800x450/0f172a/ffffff?text=Soroban+Tip+Jar+and+Recent+Activity+Feed)`
*   `![Dashboard - Transaction Live Tracking](https://placehold.co/800x450/0f172a/ffffff?text=Real-time+TransactionStatus+Tracker)`
