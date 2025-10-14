import { useState } from "react";
import { ethers } from "ethers";

// Sabit elma ücreti
const APPLE_PRICE_IN_ETH = "0.00006";
const TREASURY_ADDRESS = "0x000000000000000000000000000000000000dead"; // değiştir

// Örnek ağaç/elma koordinatları
const applePositions = [
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 50, y: 40 },
  { id: 3, x: 70, y: 20 },
];

export default function App({ provider }: { provider: any }) {
  const [collected, setCollected] = useState(0);
  const [status, setStatus] = useState("");
  const [collectedApples, setCollectedApples] = useState<number[]>([]);

  const collectApple = async (appleId: number) => {
    if (collectedApples.includes(appleId)) {
      setStatus("Already collected this apple!");
      return;
    }

    if (!provider) {
      setStatus("Wallet not available. Open inside Farcaster or connect wallet.");
      return;
    }

    setStatus(`This will cost ${APPLE_PRICE_IN_ETH} ETH + gas fees. Confirm in your wallet.`);

    try {
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();

      const value = ethers.utils.parseEther(APPLE_PRICE_IN_ETH);

      // Gas estimate
      let gasLimit;
      try {
        gasLimit = await signer.estimateGas({
          to: TREASURY_ADDRESS,
          value
        });
        gasLimit = gasLimit.mul(110).div(100); // +10% tampon
      } catch {
        gasLimit = ethers.BigNumber.from(21000);
      }

      const feeData = await ethersProvider.getFeeData();

      const tx = {
        to: TREASURY_ADDRESS,
        value,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas ?? undefined,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ?? undefined,
        gasPrice: feeData.gasPrice ?? undefined,
      };

      setStatus("Requesting wallet approval...");
      const sent = await signer.sendTransaction(tx);

      await sent.wait(1); // 1 confirmation

      setCollected(c => c + 1);
      setCollectedApples(prev => [...prev, appleId]);
      setStatus(`🍎 Apple collected! Tx: ${sent.hash}`);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 4001) {
        setStatus("Transaction rejected by user.");
      } else if (err?.message) {
        setStatus("Transaction failed: " + err.message);
      } else {
        setStatus("Transaction failed.");
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "800px", height: "600px", background: "url('/tree.png') no-repeat center/contain" }}>
      <h1>Base Fruit 🍎</h1>
      <p>Apples collected: {collected}</p>
      <p>Status: {status}</p>

      {applePositions.map(apple => (
        !collectedApples.includes(apple.id) && (
          <img
            key={apple.id}
            src="/apple.png" // elma görseli public klasörde olmalı
            alt="apple"
            style={{
              position: "absolute",
              width: 40,
              height: 40,
              cursor: "pointer",
              top: ${apple.y}%,
              left: ${apple.x}%
            }}
            onClick={() => collectApple(apple.id)}
          />
        )
      ))}
    </div>
  );
}
