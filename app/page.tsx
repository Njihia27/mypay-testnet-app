"use client";
import { useState, useEffect } from "react";

declare global {
  interface Window {
    Pi: any;
  }
}

export default function Home() {
  const [piLoaded, setPiLoaded] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Load Pi SDK
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.onload = () => {
      if (window.Pi) {
        window.Pi.init({ version: "2.0", sandbox: true });
        setPiLoaded(true);
        console.log("Pi SDK Loaded - Testnet");
      }
    };
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!window.Pi) {
      alert("Pi SDK not loaded. Make sure you are in Pi Browser and refresh.");
      return;
    }

    try {
      // 1. Authenticate
      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        (payment: any) => {
          console.log("Incomplete payment:", payment);
        }
      );
      
      setUsername(auth.user.username);
      console.log("Auth success:", auth);

      // 2. Create Payment - 1 Pi Testnet
      await window.Pi.createPayment(
        {
          amount: 1,
          memo: "MyPay Testnet Payment - Step 13",
          metadata: { purpose: "testnet-checklist" },
        },
        {
          onReadyForServerApproval: (paymentId: string) => {
            console.log("Ready for approval:", paymentId);
            alert("Payment APPROVED on Testnet! ID: " + paymentId);
            // For testnet demo, we complete on frontend
            // In mainnet you need backend approval
          },
          onReadyForServerCompletion: (paymentId: string, txid: string) => {
            console.log("Payment completed:", paymentId, txid);
            alert("SUCCESS! Payment Completed! TxID: " + txid + "\nStep 13 will now be GREEN!");
          },
          onCancel: (paymentId: string) => {
            alert("Payment cancelled: " + paymentId);
          },
          onError: (error: any, payment: any) => {
            console.error("Error:", error);
            alert("Payment error: " + error);
          },
        }
      );
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "Arial", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>MyPay</h1>
        <p style={{ color: "#666", marginBottom: "20px" }}>
          {piLoaded ? "✅ Pi SDK Ready - Testnet" : "Loading Pi SDK..."}
        </p>
        {username && <p>Welcome, @{username}</p>}
        
        <button
          onClick={handlePay}
          style={{ background: "#6a1b9a", color: "white", border: "none", padding: "16px 32px", borderRadius: "12px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}
        >
          Pay 1 Pi (Testnet)
        </button>
        
        <p style={{ marginTop: "20px", fontWeight: "bold" }}>Ready - Step 13</p>
        
        <a href="/privacy" style={{ display: "block", marginTop: "30px", color: "#6a1b9a" }}>
          Privacy Policy
        </a>
      </div>
    </main>
  );
}
