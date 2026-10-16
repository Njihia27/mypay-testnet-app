const handlePay = async () => {
  if (!window.Pi) {
    alert("Pi SDK not loaded. Open in Pi Browser");
    return;
  }
  try {
    const paymentData = {
      amount: 1,
      memo: "MyPay Testnet",
      metadata: { purpose: "testnet checkout" },
    };

    await window.Pi.createPayment(paymentData, {
      onReadyForServerApproval: async (paymentId: string) => {
        console.log("Ready for approval:", paymentId);
        // CALL YOUR BACKEND - THIS APPROVES ON PI SERVER
        const res = await fetch("/api/approve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = await res.json();
        console.log("Approve response:", data);
        if (!res.ok) {
          alert("Approve failed: " + JSON.stringify(data));
        }
      },
      onReadyForServerCompletion: async (paymentId: string, txid: string) => {
        console.log("Ready for completion:", paymentId, txid);
        const res = await fetch("/api/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, txid }),
        });
        const data = await res.json();
        console.log("Complete response:", data);
        alert("Payment COMPLETED! TxID: " + txid);
      },
      onCancel: (paymentId: string) => {
        alert("Payment cancelled: " + paymentId);
      },
      onError: (error: any, payment: any) => {
        alert("Payment error: " + error);
      },
    });
  } catch (err: any) {
    alert("Error: " + err.message);
  }
};
