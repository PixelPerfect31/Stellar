# StellarTip 🚀💸

A decentralized multi-wallet Tip Jar dApp built on the **Stellar Blockchain** using **Soroban Smart Contracts**. StellarTip allows users to connect their Stellar wallets, view balances, send tips securely on the Stellar Testnet, and track transaction status in real time.

---

## 🌐 Live Demo

**Live Application:**
https://YOUR-VERCEL-LINK.vercel.app

---

## 🎥 Demo Video

Watch the full demo here:

**Demo Video Link:**
PASTE_YOUR_YOUTUBE_OR_GOOGLE_DRIVE_LINK_HERE

---

## 📜 Contract Information

| Item              | Value                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| Network           | Stellar Testnet                                                                                     |
| Contract ID       | `CBLZAL7HCFIGW3M2HPQ6IHURYHL7EYVMMHEABDINE5VY52BPDXVHO4ST`                                          |
| Deploy TX Hash    | `8eb5cfea4f808f74be193a63f11de68995034ad751181295a98503e932c42a20`                                  |
| Contract Explorer | https://lab.stellar.org/r/testnet/contract/CBLZAL7HCFIGW3M2HPQ6IHURYHL7EYVMMHEABDINE5VY52BPDXVHO4ST |

---

## ✨ Features

* 🔗 Freighter wallet integration
* 🔗 Albedo wallet integration
* 💰 Display Stellar Testnet XLM balances
* 💸 Send XLM tips through Soroban Smart Contracts
* ⚡ Real-time transaction status updates
* 📜 Recent activity/event tracking
* 🔍 Explorer links for transactions
* 📱 Fully mobile-responsive interface
* 🛡️ Error handling for common wallet and network failures
* ☁️ Automatic deployment through Vercel

---

## ⚙️ Setup Instructions

### Prerequisites

Make sure you have the following installed:

* Node.js (v18 or later)
* npm
* Freighter Wallet Extension OR Albedo Wallet
* Git

---

## 🚀 Run Locally

Clone the repository:

```bash
git clone https://github.com/PixelPerfect31/Stellar.git
```

Move into the project directory:

```bash
cd Stellar
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application:

```text
http://localhost:5173
```

---

## 🏗️ Smart Contract Development

Navigate to the Soroban contract:

```bash
cd contracts/tipjar
```

Build the contract:

```bash
stellar contract build
```

Deploy to Stellar Testnet:

```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/soroban_tipjar_contract.wasm \
  --source deployer \
  --network testnet
```

---

## 🏛️ Architecture

Frontend (React + Vite)
↓
Freighter / Albedo Wallets
↓
Soroban Smart Contract
↓
Stellar Testnet

---

## 📸 Screenshots

### Desktop View

Add screenshots inside:

```text
screenshots/desktop.png
```

---

### Mobile Responsive View

Add screenshots inside:

```text
screenshots/mobile.png
```

---

### Wallet Connected

Add screenshots inside:

```text
screenshots/wallet-connected.png
```

---

### Transaction Success

Add screenshots inside:

```text
screenshots/transaction-success.png
```

---

## 🧪 Testing

This project includes automated tests.

Run tests:

```bash
npm test
```

Example output:

```text
✓ Wallet connection renders correctly
✓ Deposit validation works
✓ Transaction status updates correctly

Test Files  1 passed
Tests       3 passed
```

---

## 🔄 CI/CD

This project uses **GitHub Actions** for Continuous Integration and **Vercel** for Continuous Deployment.

### GitHub Actions

Every push to the `main` branch automatically:

* Installs dependencies
* Builds the application
* Runs automated checks

### Vercel

Every successful push automatically deploys the latest version.

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Blockchain

* Stellar Testnet
* Soroban Smart Contracts
* Stellar SDK

### Wallets

* Freighter
* Albedo

### Smart Contract

* Rust
* Soroban SDK

### Deployment

* Vercel
* GitHub Actions

---

## 👨‍💻 Project Structure

```text
Stellar/
├── src/
├── contracts/
│   └── tipjar/
├── public/
├── screenshots/
├── .github/
│   └── workflows/
├── README.md
└── package.json
```

---

## 📌 Submission Details

### GitHub Repository

https://github.com/PixelPerfect31/Stellar

### Live Demo

PASTE_YOUR_VERCEL_LINK_HERE

### Contract Address

CBLZAL7HCFIGW3M2HPQ6IHURYHL7EYVMMHEABDINE5VY52BPDXVHO4ST

### Contract Deployment Transaction

8eb5cfea4f808f74be193a63f11de68995034ad751181295a98503e932c42a20

### Contract Interaction Transaction

PASTE_A_REAL_TRANSACTION_HASH_FROM_THE_APP_HERE

### Demo Video

PASTE_YOUR_VIDEO_LINK_HERE

---

## 🙌 Acknowledgements

Built as part of the Stellar Developer Challenge to explore Soroban smart contracts, multi-wallet integrations, and decentralized application development on Stellar.


