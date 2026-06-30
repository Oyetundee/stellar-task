"use client";

import { WalletState } from "@/lib/useWallet";
import { shortKey } from "@/lib/stellar";

interface Props {
  wallet: WalletState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function WalletConnect({ wallet, onConnect, onDisconnect }: Props) {
  if (wallet.status === "connected") {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/50 rounded-lg px-3 py-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300 text-sm font-mono">
            {shortKey(wallet.publicKey)}
          </span>
        </div>
        <button
          onClick={onDisconnect}
          className="text-sm text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-500 rounded-lg px-3 py-2 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  if (wallet.status === "connecting") {
    return (
      <button
        disabled
        className="flex items-center gap-2 bg-indigo-700/50 text-indigo-300 rounded-lg px-4 py-2 text-sm cursor-not-allowed"
      >
        <span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        Connecting…
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={onConnect}
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
      >
        Connect Freighter
      </button>
      {wallet.status === "error" && (
        <p className="text-red-400 text-xs max-w-xs text-right">{wallet.message}</p>
      )}
    </div>
  );
}
