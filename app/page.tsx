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
        // For Testnet: sandbox:true | For Mainnet: sandbox:false
        window.Pi.init({ version: "2.0", sandbox: true });
        setSdkLoaded(true);
      }
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!window.Pi || !sdkLoaded) {
      alert("Open in Pi Browser!");
      return;
    }
    try {
      setStatus("Authenticating...");
      const scopes = ["username", "payments"];

      const onIncompletePaymentFound = (payment: any) => {
        console.log("Incomplete found:", payment.identifier);
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
      setStatus(`Authenticated as ${auth.user.username}`);
      console.log("Auth:", auth);

      setStatus("Creating payment...");
      const paymentData = {
        amount: 1,
        memo: "MyPay Testnet - 1 Pi",
        metadata: { purpose: "testnet_checkout", app: "MyPay" },
      };

      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          setStatus(`Approving ${paymentId}...`);
          const res = await fetch("/api/approve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId }),
          });
          const data = await res.json();
          console.log("Approve:", data);
          setStatus("Approved! Check wallet to confirm");
        },
        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          setStatus(`Completing ${txid}...`);
          const res = await fetch("/api/complete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId, txid }),
          });
          const data = await res.json();
          console.log("Complete:", data);
          setStatus(`COMPLETED! TxID: ${txid}`);
          alert(`Payment COMPLETED! TxID: ${txid}`);
        },
        onCancel: (paymentId: string) => {
          setStatus(`Cancelled: ${paymentId}`);
        },
        onError: (error: any) => {
          console.error(error);
          setStatus(`Error: ${JSON.stringify(error)}`);
          alert(`Payment error: ${error}`);
        },
      });
    } catch (err: any) {
      console.error(err);
      setStatus(`Error: ${err.message}`);
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <main style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>MyPay Testnet App</h1>
      <p style={{ marginTop: 10 }}>
        SDK: {sdkLoaded ? "✅ Loaded" : "⏳ Loading..."} {username && `| User: ${username}`}
      </p>
      <p style={{ marginTop: 10, color: "#7c3aed", fontWeight: "bold", minHeight: 20 }}>{status}</p>

      <button
        onClick={handlePay}
        disabled={!sdkLoaded}
        style={{
          marginTop: 20,
          padding: "16px 32px",
          fontSize: 18,
          fontWeight: "bold",
          background: sdkLoaded ? "#7c3aed" : "#9ca3af",
          color: "white",
          border: "none",
          borderRadius: 12,
          cursor: sdkLoaded ? "pointer" : "not-allowed",
        }}
      >
        Pay 1 Pi (Testnet)
      </button>

      <div style={{ marginTop: 30, fontSize: 12, color: "#6b7280" }}>
        <p>Last TxID: 771fb46e857bb6119ae8f8d-c7d7473ae01e2d7459c7a0d54ed358ad8bf419b2f ✅</p>
        <p>Wallet: GAKUW45LN4C...W7A7GN</p>
      </div>
    </main>
  );
}
