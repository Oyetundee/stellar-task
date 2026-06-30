"use client";

import { useState, useCallback, useEffect } from "react";
import {
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction as freighterSign,
} from "@stellar/freighter-api";

export type WalletState =
  | { status: "disconnected" }
  | { status: "connecting" }
  | { status: "connected"; publicKey: string }
  | { status: "error"; message: string };

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({ status: "disconnected" });

  // Check if already authorized on mount
  useEffect(() => {
    async function check() {
      try {
        const { address } = await getAddress();
        if (address) setWallet({ status: "connected", publicKey: address });
      } catch {
        // Not connected yet
      }
    }
    check();
  }, []);

  const connect = useCallback(async () => {
    setWallet({ status: "connecting" });

    try {
      // requestAccess() prompts the user to authorize the dapp
      const { address, error: accessError } = await requestAccess();

      if (accessError) {
        setWallet({ status: "error", message: accessError.message });
        return;
      }

      if (!address) {
        setWallet({ status: "error", message: "No address returned. Did you approve access in Freighter?" });
        return;
      }

      // Check network
      const details = await getNetworkDetails();
      if (details.error) {
        setWallet({ status: "error", message: details.error.message });
        return;
      }

      if (!details.networkPassphrase.includes("Test")) {
        setWallet({
          status: "error",
          message: "Please switch Freighter to Stellar Testnet and try again.",
        });
        return;
      }

      setWallet({ status: "connected", publicKey: address });
    } catch (err) {
      setWallet({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to connect wallet.",
      });
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({ status: "disconnected" });
  }, []);

  const signTransaction = useCallback(
    async (xdr: string, networkPassphrase: string): Promise<string> => {
      const result = await freighterSign(xdr, { networkPassphrase });
      if (result.error) throw new Error(result.error.message);
      return result.signedTxXdr;
    },
    []
  );

  return { wallet, connect, disconnect, signTransaction };
}