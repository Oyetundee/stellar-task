"use client";

import { useState } from "react";
import {
  buildSendXLMTransaction,
  submitSignedTransaction,
  NETWORK_PASSPHRASE,
  SendTxResult,
} from "@/lib/stellar";

interface Props {
  publicKey: string;
  signTransaction: (xdr: string, networkPassphrase: string) => Promise<string>;
  onSuccess: () => void; // refresh balance + history after send
}

export default function SendTransaction({ publicKey, signTransaction, onSuccess }: Props) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendTxResult | null>(null);

  async function handleSend() {
    setLoading(true);
    setResult(null);

    try {
      const xdr = await buildSendXLMTransaction(publicKey, to.trim(), amount, memo || undefined);
      const signedXdr = await signTransaction(xdr, NETWORK_PASSPHRASE);
      const res = await submitSignedTransaction(signedXdr);
      setResult(res);

      if (res.success) {
        setTo("");
        setAmount("");
        setMemo("");
        onSuccess();
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  }

  const isValid = to.trim().length === 56 && parseFloat(amount) > 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
      <h2 className="text-slate-200 font-semibold text-lg">Send XLM</h2>

      {/* Destination */}
      <div className="space-y-1">
        <label className="text-slate-400 text-xs uppercase tracking-wider">
          Destination address
        </label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="G…"
          className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 font-mono text-sm rounded-lg px-3 py-2.5 outline-none transition-colors placeholder:text-slate-600"
        />
      </div>

      {/* Amount */}
      <div className="space-y-1">
        <label className="text-slate-400 text-xs uppercase tracking-wider">
          Amount (XLM)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 text-sm rounded-lg px-3 py-2.5 outline-none transition-colors placeholder:text-slate-600"
        />
      </div>

      {/* Memo (optional) */}
      <div className="space-y-1">
        <label className="text-slate-400 text-xs uppercase tracking-wider">
          Memo <span className="text-slate-600 normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="Note for this transaction"
          maxLength={28}
          className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 text-slate-100 text-sm rounded-lg px-3 py-2.5 outline-none transition-colors placeholder:text-slate-600"
        />
      </div>

      {/* Send button */}
      <button
        onClick={handleSend}
        disabled={!isValid || loading}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-medium rounded-lg py-3 text-sm transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Signing & submitting…
          </>
        ) : (
          "Send XLM"
        )}
      </button>

      {/* Feedback */}
      {result && (
        <div
          className={`rounded-lg p-3 text-sm ${
            result.success
              ? "bg-emerald-950/60 border border-emerald-800/50 text-emerald-300"
              : "bg-red-950/60 border border-red-800/50 text-red-300"
          }`}
        >
          {result.success ? (
            <div className="space-y-1">
              <p className="font-medium">✓ Transaction sent</p>
              <p className="text-xs font-mono break-all text-emerald-400/80">
                {result.hash}
              </p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline underline-offset-2 hover:text-emerald-200 transition-colors"
              >
                View on Stellar Expert ↗
              </a>
            </div>
          ) : (
            <p>✗ {result.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
