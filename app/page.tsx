"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi: any;
  }
}

export default function Home() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => {
      if (window.Pi) {
        // MAINNET MODE - Real Pi
        window.Pi.init({ version: "2.0", sandbox: false });
        setSdkLoaded(true);
      }
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!window.Pi || !sdkLoaded) {
      alert("Open this in Pi Browser - Pi Mainnet!");
      return;
    }
    try {
      setStatus("Authenticating...");
      const scopes = ["username", "payments"];

      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete payment:", payment);
        return fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId: payment.identifier,
            txid: payment.transaction?.txid || "",
          }),
        });
      };

      const auth = await window.Pi.authenticate(scopes, onIncompletePaymentFound);
      setUsername(auth.user.username);
      setStatus(`Authenticated: ${auth.user.username}`);

      setStatus("Creating REAL payment...");
      
      // REAL MAINNET AMOUNT - change this to your product price
      const paymentData = {
        amount: 1, // 1 Real Pi
        memo: "MyPay Mainnet - 1 Pi",
        metadata: { purpose: "mainnet_checkout", app: "MyPay" },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          setStatus(`Approving MAINNET ${paymentId}...`);
          const res = await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
          const data = await res.json();
          console.log("Mainnet Approve:", data);
          setStatus("Approved on Mainnet! Confirm in wallet");
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setStatus(`Completing MAINNET ${txid}...`);
          const res = await fetch("/api/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });
          const data = await res.json();
          console.log("Mainnet Complete:", data);
          setStatus(`MAINNET COMPLETED! TxID: ${txid}`);
          alert(`REAL Pi Payment COMPLETED!\nTxID: ${txid}\nCheck blockchain!`);
        },
        onCancel: (paymentId: string) => {
          setStatus(`Mainnet Cancelled: ${paymentId}`);
        },
        onError: (error: any) => {
          console.error(error);
          setStatus(`Mainnet Error: ${JSON.stringify(error)}`);
        },
      });
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <main style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>MyPay Mainnet App</h1>
      <p>SDK: {sdkLoaded ? "✅ Loaded (Mainnet)" : "⏳ Loading..."} {username && `| ${username}`}</p>
      <p style={{ marginTop: 10, color: "#dc2626", fontWeight: "bold" }}>{status}</p>

      <button
        onClick={handlePay}
        disabled={!sdkLoaded}
        style={{
          marginTop: 20,
          padding: "16px 32px",
          fontSize: 18,
          fontWeight: "bold",
          background: sdkLoaded ? "#000000" : "#9ca3af",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        Pay 1 Real Pi (Mainnet)
      </button>

      <p style={{ marginTop: 30, fontSize: 12, color: "red" }}>
        ⚠️ MAINNET - Real Pi will be deducted!
      </p>
    </main>
  );
}
