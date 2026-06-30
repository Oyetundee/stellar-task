"use client";

interface Props {
  balance: string | null;
  loading: boolean;
  publicKey: string;
}

export default function BalanceCard({ balance, loading, publicKey }: Props) {
  return (
    <div className="bg-gradient-to-br from-indigo-950/80 to-slate-900/80 border border-indigo-800/40 rounded-2xl p-6">
      <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">
        XLM Balance
      </p>

      {loading ? (
        <div className="h-10 w-40 bg-slate-800 rounded-lg animate-pulse mt-1" />
      ) : (
        <p className="text-4xl font-bold text-white tracking-tight">
          {balance ?? "—"}
          <span className="text-xl text-indigo-400 ml-2 font-normal">XLM</span>
        </p>
      )}

      <p className="text-slate-500 text-xs font-mono mt-3 break-all">{publicKey}</p>

      <a
        href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors"
      >
        View on Stellar Expert ↗
      </a>
    </div>
  );
}
