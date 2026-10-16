"use client";
import { useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("Ready - Step 13");

  const handlePay = async () => {
    try {
      const Pi = (window as any).Pi;
      if (!Pi) {
        alert("Please open in Pi Browser");
        return;
      }
      await Pi.init({ version: "2.0", sandbox: true });
      const auth = await Pi.authenticate(["username", "payments"], () => {});
      setStatus("Hello " + auth.user.username);

      Pi.createPayment(
        {
          amount: 1,
          memo: "MyPay Step 13 Test",
          metadata: { type: "test" },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatus("Approving...");
            await fetch("/api/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            setStatus("Completing...");
            await fetch("/api/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });
            setStatus("✅ Completed - Step 13 Done");
          },
          onCancel: () => setStatus("Cancelled"),
          onError: (e: any) => setStatus("Error: " + e.message),
        }
      );
    } catch (e: any) {
      setStatus("Error: " + e.message);
    }
  };

  return (
    <main style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <h1 style={{ fontSize: 40, fontWeight: "bold", color: "#7c3aed" }}>MyPay</h1>
      <p style={{ marginBottom: 20 }}>Send & Receive Pi easily</p>
      <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <button onClick={handlePay} style={{ background: "#7c3aed", color: "white", padding: "16px 32px", borderRadius: 12, fontWeight: "bold", border: "none", cursor: "pointer", width: "100%" }}>
          Pay 1 Pi (Testnet)
        </button>
        <p style={{ marginTop: 12, textAlign: "center" }}>{status}</p>
      </div>
      <a href="/privacy" style={{ marginTop: 20, color: "blue", textDecoration: "underline" }}>Privacy Policy</a>
    </main>
  );
}