import { useEffect, useState } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dead";

export default function App() {
  const [provider, setProvider] = useState<any>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [status, setStatus] = useState("Loading...");
  const [collected, setCollected] = useState(0);

  useEffect(() => {
    const init = async () => {
      try { await sdk.actions.ready(); } catch {}
      const p = await sdk.wallet.getEthereumProvider?.();
      if (p) setProvider(p);
      setStatus("Ready! Connect your wallet to start.");
    };
    init();
  }, []);

  async function connectWallet() {
    if (!provider) {
      setStatus("No wallet found in browser.");
      return;
    }
    try {
      await provider.request({ method: "eth_requestAccounts" });
      setWalletConnected(true);
      setStatus("Wallet connected ✅");
    } catch {
      setStatus("Wallet connection failed ❌");
    }
  }

  async function collectApple() {
    if (!walletConnected) {
      setStatus("Please connect your wallet first.");
      return;
    }

    setStatus("Requesting wallet approval...");
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const from = accounts[0];
      const tx = { from, to: TREASURY_ADDRESS, value: "0x0" };
      await provider.request({ method: "eth_sendTransaction", params: [tx] });

      setCollected(c => c + 1);
      setStatus("🍎 Apple collected!");
    } catch {
      setStatus("❌ Transaction rejected or failed.");
    }
  }

  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <h1>🍏 Base Fruit</h1>
      <p>Click anywhere on the tree to collect apples!</p>

      {!walletConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Wallet connected ✅</p>
      )}

      <div
        style={{
          position: "relative",
          width: 300,
          height: 400,
          margin: "20px auto",
          cursor: "pointer",
        }}
        onClick={collectApple}
      >
        <img
          src="/images/tree.png"
          alt="tree"
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      <p>Collected: {collected}</p>
      <p>{status}</p>
    </div>
  );
}