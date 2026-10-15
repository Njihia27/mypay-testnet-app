"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Loading Pi SDK...");
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    const initPi = () => {
      if (window.Pi) {
        window.Pi.init({ version: "2.0", sandbox: true });
        setSdkReady(true);
        setStatus("Pi SDK Ready - Testnet Mode ✅ Open in Pi Browser for full features");
      } else {
        setStatus("Open this app in Pi Browser to use Pi Features");
      }
    };
    // Load SDK
    if (!window.Pi) {
      const script = document.createElement("script");
      script.src = "https://sdk.minepi.com/pi-sdk.js";
      script.onload = initPi;
      document.head.appendChild(script);
    } else {
      initPi();
    }
  }, []);

  const login = async () => {
    try {
      setStatus("Authenticating...");
      const scopes = ["username", "payments"];
      const auth = await window.Pi.authenticate(scopes, (payment) => {
        console.log("Incomplete payment:", payment);
      });
      setUser(auth.user);
      setStatus(`Welcome ${auth.user.username}! Authenticated!`);
    } catch (e) {
      setStatus("Auth Error: " + e.message);
    }
  };

  const pay = async () => {
    try {
      setStatus("Creating 1 Pi Test Payment...");
      await window.Pi.createPayment({
        amount: 1,
        memo: "MyPay Testnet Demo",
        metadata: { type: "test" }
      }, {
        onReadyForServerApproval: (id) => { console.log("Approve:", id); setStatus("Payment ID: " + id + " - Approve on server (demo)"); },
        onReadyForServerCompletion: (id, txid) => setStatus(`Payment Success! TXID: ${txid}`),
        onCancel: () => setStatus("Payment Cancelled by user"),
        onError: (err) => setStatus("Payment Error: " + err.message)
      });
    } catch (e) {
      setStatus("Payment Error: " + e.message);
    }
  };

  return (
    <main style={{padding:40, maxWidth:600, margin:"0 auto", textAlign:"center", fontFamily:"system-ui"}}>
      <h1 style={{fontSize:32, fontWeight:800}}>MyPay Testnet</h1>
      <p style={{background:"#f3f4f6", padding:12, borderRadius:8, fontSize:14}}>{status}</p>
      <div style={{marginTop:24, display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap"}}>
        <button onClick={login} disabled={!sdkReady} style={{padding:"14px 28px", background:sdkReady?"#7c3aed":"#9ca3af", color:"white", border:0, borderRadius:10, cursor:"pointer", fontWeight:600}}>Login with Pi</button>
        <button onClick={pay} disabled={!sdkReady || !user} style={{padding:"14px 28px", background:user?"#000":"#9ca3af", color:"white", border:0, borderRadius:10, cursor:"pointer", fontWeight:600}}>Pay 1 Pi (Test)</button>
      </div>
      {user && <p style={{marginTop:20, fontSize:18}}>👋 Hello <b>{user.username}</b>!</p>}
      <div style={{marginTop:50, fontSize:12, color:"#888"}}>
        <p>Live: mypay-testnet-app.vercel.app</p>
        <p>Sandbox: true - Testnet only</p>
      </div>
    </main>
  );
}
