import { useState, useEffect } from "react";
import { ethers } from "ethers";
import TreasuryABI from "./abis/Treasury.json";
import { useAccount, useConnect, useSigner } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";

const CONTRACT_ADDRESS = "0xcd4d24A1eE6744b0bf3a6df4b1A1963D05dF8df4";

interface Apple {
  id: number;
  x: number;
  y: number;
}

function App() {
  const [apples, setApples] = useState<Apple[]>([]);
  const { connect } = useConnect({ connector: new InjectedConnector() });
  const { data: signer } = useSigner();

  useEffect(() => {
    const newApples: Apple[] = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 80,
      y: Math.random() * 80,
    }));
    setApples(newApples);
  }, []);

  const collectApple = async (id: number) => {
    if (!signer) {
      alert("Connect your wallet first!");
      return;
    }

    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, TreasuryABI, signer);
      const tx = await contract.collect({ value: ethers.utils.parseEther("0.00006") });
      await tx.wait();
      setApples((prev) => prev.filter((a) => a.id !== id));
      console.log("Collected!");
    } catch (err) {
      console.error(err);
      alert("Transaction failed!");
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", background: "#a2d149" }}>
      <button
        onClick={() => connect()}
        style={{ position: "absolute", top: 10, left: 10, padding: "10px 20px", zIndex: 10 }}
      >
        Connect Wallet
      </button>

      {apples.map((apple) => (
        <div
          key={apple.id}
          onClick={() => collectApple(apple.id)}
          style={{
            position: "absolute",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "red",
            top: ${apple.y}%,
            left: ${apple.x}%,
            cursor: "pointer",
          }}
        ></div>
      ))}

      {/* Basit ağaç çizimi */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          width: "100px",
          height: "200px",
          marginLeft: "-50px",
          backgroundColor: "#8b5a2b",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          bottom: "150px",
          left: "50%",
          width: "200px",
          height: "100px",
          marginLeft: "-100px",
          borderRadius: "50%",
          backgroundColor: "green",
        }}
      ></div>
    </div>
  );
}

export default App;
