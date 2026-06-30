# Stellar Transaction Viewer

A dApp built on Stellar Testnet for the Level 1 White Belt challenge. Connect your Freighter wallet to view your XLM balance, send XLM, and explore your transaction history.

## Features

- ✅ Connect / disconnect Freighter wallet
- ✅ Display XLM balance (live from Horizon testnet)
- ✅ Send XLM to any Stellar address with optional memo
- ✅ Transaction feedback: success state, tx hash, link to explorer
- ✅ Transaction history: sent/received payments with timestamps
- ✅ Links to Stellar Expert explorer for all transactions

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@stellar/stellar-sdk** — balance fetch, transaction building
- **@stellar/freighter-api** — wallet connect / sign

## Getting Started

### Prerequisites

1. Install the [Freighter wallet](https://www.freighter.app/) browser extension
2. Switch Freighter to **Stellar Testnet**
3. Fund your testnet account via [Friendbot](https://laboratory.stellar.org/#account-creator?network=test)

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  page.tsx              # Main page — wires everything together
  layout.tsx            # Root layout + metadata
  globals.css           # Tailwind base styles

components/
  WalletConnect.tsx     # Connect / disconnect button with status
  BalanceCard.tsx       # XLM balance display
  SendTransaction.tsx   # Send XLM form with feedback
  TransactionHistory.tsx # Recent transactions list

lib/
  stellar.ts            # All Stellar SDK logic (balance, history, tx)
  useWallet.ts          # Freighter wallet hook
```

## Deployment

Deploy to Vercel:

```bash
npx vercel
```

## Network

All transactions are on **Stellar Testnet** — no real funds are used.
