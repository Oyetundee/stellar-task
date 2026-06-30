import {
  Horizon,
  Networks,
  TransactionBuilder,
  Asset,
  Operation,
  Memo,
} from "@stellar/stellar-sdk";

export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

export const server = new Horizon.Server(HORIZON_URL);

// ── Types ──────────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  createdAt: string;
  type: "sent" | "received" | "other";
  amount: string;
  asset: string;
  from: string;
  to: string;
  memo?: string;
  successful: boolean;
}

export interface SendTxResult {
  success: boolean;
  hash?: string;
  error?: string;
}

// ── Balance ────────────────────────────────────────────────────────────────

export async function getXLMBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const xlmBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );
    return xlmBalance ? parseFloat(xlmBalance.balance).toFixed(4) : "0.0000";
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "response" in err &&
      (err as { response?: { status?: number } }).response?.status === 404
    ) {
      return "0.0000"; // Unfunded account
    }
    throw err;
  }
}

// ── Transaction History ────────────────────────────────────────────────────

export async function getTransactionHistory(
  publicKey: string,
  limit = 20
): Promise<Transaction[]> {
  try {
    const operations = await server
      .operations()
      .forAccount(publicKey)
      .order("desc")
      .limit(limit)
      .call();

    const txns: Transaction[] = [];

    for (const op of operations.records) {
      // Only handle payment operations for clean display
      if (op.type !== "payment" && op.type !== "create_account") continue;

      const isPayment = op.type === "payment";
      const isCreateAccount = op.type === "create_account";

      const from = isPayment
        ? (op as Horizon.ServerApi.PaymentOperationRecord).from
        : (op as Horizon.ServerApi.CreateAccountOperationRecord).funder;

      const to = isPayment
        ? (op as Horizon.ServerApi.PaymentOperationRecord).to
        : (op as Horizon.ServerApi.CreateAccountOperationRecord).account;

      const amount = isPayment
        ? (op as Horizon.ServerApi.PaymentOperationRecord).amount
        : (op as Horizon.ServerApi.CreateAccountOperationRecord).starting_balance;

      const assetType = isPayment
        ? (op as Horizon.ServerApi.PaymentOperationRecord).asset_type
        : "native";

      const assetCode =
        assetType === "native"
          ? "XLM"
          : (op as Horizon.ServerApi.PaymentOperationRecord).asset_code ?? "UNKNOWN";

      txns.push({
        id: op.id,
        createdAt: op.created_at,
        type: from === publicKey ? "sent" : "received",
        amount: parseFloat(amount).toFixed(4),
        asset: assetCode,
        from,
        to,
        successful: op.transaction_successful ?? true,
      });
    }

    return txns;
  } catch {
    return [];
  }
}

// ── Send XLM ───────────────────────────────────────────────────────────────

export async function buildSendXLMTransaction(
  fromPublicKey: string,
  toPublicKey: string,
  amount: string,
  memo?: string
): Promise<string> {
  const account = await server.loadAccount(fromPublicKey);

  const txBuilder = new TransactionBuilder(account, {
    fee: "100000", // 0.01 XLM base fee
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      Operation.payment({
        destination: toPublicKey,
        asset: Asset.native(),
        amount,
      })
    )
    .setTimeout(180);

  if (memo) {
    txBuilder.addMemo(Memo.text(memo));
  }

  const tx = txBuilder.build();
  return tx.toXDR();
}

export async function submitSignedTransaction(
  signedXDR: string
): Promise<SendTxResult> {
  try {
    const { TransactionBuilder } = await import("@stellar/stellar-sdk");
    const tx = TransactionBuilder.fromXDR(signedXDR, NETWORK_PASSPHRASE);
    const result = await server.submitTransaction(tx);
    return { success: true, hash: result.hash };
  } catch (err: unknown) {
    const stellarErr = err as {
      response?: { data?: { extras?: { result_codes?: unknown } } };
    };
    const codes = stellarErr?.response?.data?.extras?.result_codes;
    return {
      success: false,
      error: codes
        ? JSON.stringify(codes)
        : err instanceof Error
        ? err.message
        : "Transaction failed",
    };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

export function shortKey(key: string): string {
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
