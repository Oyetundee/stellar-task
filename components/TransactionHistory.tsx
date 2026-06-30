"use client";

import { Transaction, shortKey, formatDate } from "@/lib/stellar";

interface Props {
  transactions: Transaction[];
  loading: boolean;
  publicKey: string;
}

export default function TransactionHistory({ transactions, loading, publicKey }: Props) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-slate-200 font-semibold text-lg mb-4">
        Transaction History
      </h2>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <p className="text-4xl mb-3">🔭</p>
          <p className="text-sm">No transactions found for this account.</p>
          <p className="text-xs mt-1 text-slate-600">
            Send some XLM to get started.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {transactions.map((tx) => (
            <li
              key={tx.id}
              className="flex items-center justify-between gap-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-3 transition-colors group"
            >
              {/* Left: direction badge + counterparty */}
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    tx.type === "received"
                      ? "bg-emerald-950 text-emerald-400"
                      : "bg-indigo-950 text-indigo-400"
                  }`}
                >
                  {tx.type === "received" ? "↓" : "↑"}
                </span>

                <div className="min-w-0">
                  <p className="text-slate-200 text-sm">
                    {tx.type === "received" ? (
                      <>
                        From{" "}
                        <span className="font-mono text-slate-300">
                          {shortKey(tx.from)}
                        </span>
                      </>
                    ) : (
                      <>
                        To{" "}
                        <span className="font-mono text-slate-300">
                          {shortKey(tx.to)}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-slate-500 text-xs">{formatDate(tx.createdAt)}</p>
                </div>
              </div>

              {/* Right: amount + link */}
              <div className="text-right shrink-0">
                <p
                  className={`font-semibold text-sm ${
                    tx.type === "received" ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  {tx.type === "received" ? "+" : "-"}
                  {tx.amount} {tx.asset}
                </p>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${tx.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-slate-600 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  View ↗
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
