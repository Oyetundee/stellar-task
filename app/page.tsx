"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@/lib/useWallet";
import { getXLMBalance, getTransactionHistory, Transaction } from "@/lib/stellar";
import WalletConnect from "@/components/WalletConnect";
import BalanceCard from "@/components/BalanceCard";
import SendTransaction from "@/components/SendTransaction";
import TransactionHistory from "@/components/TransactionHistory";

export default function Home() {
  const { wallet, connect, disconnect, signTransaction } = useWallet();
  const publicKey =
    wallet.status === "connected" ? wallet.publicKey : null;

  const [balance, setBalance] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!publicKey) return;

    setBalanceLoading(true);
    setTxLoading(true);

    const [bal, txns] = await Promise.all([
      getXLMBalance(publicKey),
      getTransactionHistory(publicKey),
    ]);

    setBalance(bal);
    setTransactions(txns);
    setBalanceLoading(false);
    setTxLoading(false);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey) {
      refresh();
    } else {
      setBalance(null);
      setTransactions([]);
    }
  }, [publicKey, refresh]);

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/60 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✦</span>
            <span className="font-semibold text-lg tracking-tight">
              Stellar Viewer
            </span>
            <span className="text-xs bg-indigo-900/60 text-indigo-400 border border-indigo-800/50 rounded-full px-2 py-0.5 ml-1">
              Testnet
            </span>
          </div>
          <WalletConnect
            wallet={wallet}
            onConnect={connect}
            onDisconnect={disconnect}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {publicKey ? (
          <div className="space-y-6">
            {/* Balance */}
            <BalanceCard
              balance={balance}
              loading={balanceLoading}
              publicKey={publicKey}
            />

            {/* Two-column on wider screens */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Send — narrower col */}
              <div className="lg:col-span-2">
                <SendTransaction
                  publicKey={publicKey}
                  signTransaction={signTransaction}
                  onSuccess={refresh}
                />
              </div>

              {/* History — wider col */}
              <div className="lg:col-span-3">
                <TransactionHistory
                  transactions={transactions}
                  loading={txLoading}
                  publicKey={publicKey}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Landing state */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-900/40 border border-indigo-800/50 flex items-center justify-center text-3xl mb-6">
              ✦
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              Stellar Transaction Viewer
            </h1>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
              Connect your Freighter wallet to view your XLM balance, send
              transactions, and explore your history on Stellar Testnet.
            </p>
            <button
              onClick={connect}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-6 py-3 text-base transition-colors"
            >
              Connect Freighter Wallet
            </button>
            {wallet.status === "error" && (
              <p className="text-red-400 text-sm mt-4 max-w-xs">
                {wallet.message}
              </p>
            )}
            <p className="text-slate-600 text-xs mt-6">
              Don&apos;t have Freighter?{" "}
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-400 underline underline-offset-2"
              >
                Install it here ↗
              </a>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
