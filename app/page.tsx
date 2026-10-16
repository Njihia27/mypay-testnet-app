"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi: any;
  }
}

export default function Home() {
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: "2.0", sandbox: true });
        setSdkLoaded(true);
      }
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!window.Pi || !sdkLoaded) {
      alert("Pi SDK not loaded. Open in Pi Browser sandbox.");
      return;
    }
    try {
      const paymentData = {
        amount: 1,
        memo: "MyPay Testnet",
        metadata: { purpose: "testnet_checkout" },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Ready for approval:", paymentId);
          const res = await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
          const data = await res.json();
          console.log("Approve:", data);
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log("Ready for completion:", paymentId, txid);
          const res = await fetch("/api/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });
          const data = await res.json();
          console.log("Complete:", data);
          alert("Payment COMPLETED! TxID: " + txid);
        },
        onCancel: (paymentId: string) => {
          alert("Payment cancelled: " + paymentId);
        },
        onError: (error: any) => {
          alert("Payment error: " + JSON.stringify(error));
        },
      });
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      <h1>MyPay Testnet App</h1>
      <p>SDK Loaded: {sdkLoaded ? "Yes" : "No"}</p>
      <button
        onClick={handlePay}
        style={{
          padding: "15px 30px",
          fontSize: 18,
          background: "#7c3aed",
          color: "white",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
        }}
      >
        Pay 1 Pi (Testnet)
      </button>
    </main>
  );
}
