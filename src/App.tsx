import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import TreasuryABI from "./abis/Treasury.json";

const CONTRACT_ADDRESS = "0xcd4d24A1eE6744b0bf3a6df4b1A1963D05dF8df4";
const APPLE_PRICE = "0.00006";

function App() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [collected, setCollected] = useState<number>(0);
  const [collectedIds, setCollectedIds] = useState<number[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if ((window as any).ethereum) {
      setProvider(new ethers.providers.Web3Provider((window as any).ethereum));
    }
  }, []);

  async function collectApple(appleId: number) {
    if (collectedIds.includes(appleId)) return;
    if (!provider) return;

    try {
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TreasuryABI, signer);
      const tx = await contract.collect({ value: ethers.utils.parseEther(APPLE_PRICE) });
      await tx.wait(1);

      setCollected(c => c + 1);
      setCollectedIds(prev => [...prev, appleId]);
      setStatus("Collected");
    } catch (err) {
      console.error(err);
    }
  }

  const apples = [
    { id: 1, x: 20, y: 30 },
    { id: 2, x: 50, y: 50 },
    { id: 3, x: 70, y: 20 },
  ];

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#d0f0c0" }}>
      {apples.map(apple => (
        <div
          key={apple.id}
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            backgroundColor: "red",
            borderRadius: "50%",
            top: apple.y + "%",
            left: apple.x + "%",
            cursor: "pointer",
          }}
          onClick={() => collectApple(apple.id)}
        />
      ))}
      {status && <div style={{ position: "absolute", top: 20, left: 20, fontSize: 24 }}>{status}</div>}
      <div style={{ position: "absolute", top: 60, left: 20 }}>Collected: {collected}</div>
    </div>
  );
}

export default App;
