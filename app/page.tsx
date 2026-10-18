"use client";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi: any;
  }
}

export default function Home() {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [isSandboxEnv, setIsSandboxEnv] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => {
      const isSandbox = window.location.hostname.includes("sandbox.minepi.com");
      setIsSandboxEnv(isSandbox);
      window.Pi.init({ version: "2.0", sandbox: isSandbox });
      setSdkLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!sdkLoaded) {
      alert("Open this in Pi Browser - PI Mainnet!");
      return;
    }
    try {
      setStatus("Authenticating...");
      const scopes = ["username", "payments"];
      const onIncompletePayment = (payment: any) => {
        return fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: payment.identifier, txid: payment.transaction?.txid || "" }),
        });
      };
      const auth = await window.Pi.authenticate(scopes, onIncompletePayment);
      setStatus("Creating payment...");
      const paymentData = {
        amount: 1,
        memo: "MyPay - Mainnet",
        metadata: { purpose: "mainnet_checkout", app: "MyPay" },
      };
      const onReadyForServerApproval = async (paymentId: string) => {
        setStatus("Approving...");
        await fetch("/api/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        setStatus("Approved! Confirm in wallet!");
      };
      const onReadyForServerCompletion = async (paymentId: string, txid: string) => {
        setStatus("Completing...");
        await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
        setStatus("PAYMENT COMPLETED!");
      };
      const onCancel = (paymentId: string) => {
        setStatus("Cancelled: " + paymentId);
      };
      const onError = (error: any) => {
        setStatus("Error: " + (error?.message || JSON.stringify(error)));
      };
      await window.Pi.createPayment(paymentData, {
        onReadyForServerApproval,
        onReadyForServerCompletion,
        onCancel,
        onError,
      });
    } catch (err: any) {
      setStatus("Error: " + err.message);
    }
  };

  return (
    <main style={{ padding: 20, textAlign: "center", fontFamily: "sans-serif" }}>
      <h1>{isSandboxEnv ? "MyPay Testnet App" : "MyPay Mainnet App"}</h1>
      <p>SDK: {sdkLoaded ? (isSandboxEnv ? "Loaded (Testnet) - Sandbox OK" : "Loaded (Mainnet)") : "Loading..."}</p>
      <p>Status: {status}</p>
      <button onClick={handlePay} style={{ padding: "15px 30px", fontSize: 18, fontWeight: "bold", background: "#000", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", marginTop: 20 }}>
        {isSandboxEnv ? "Pay 1 Test Pi (Testnet)" : "Pay 1 Real Pi (Mainnet)"}
      </button>
      {!isSandboxEnv && <p style={{ marginTop: 10, fontSize: 12, color: "red" }}>MAINNET - Real Pi will be deducted!</p>}
      {isSandboxEnv && <p style={{ marginTop: 10, fontSize: 12, color: "green" }}>SANDBOX - Test Pi only, safe!</p>}
    </main>
  );
}
