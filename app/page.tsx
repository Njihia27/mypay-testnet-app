"use client"

import PayButton from "@/components/PayButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-purple-700">MyPay</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        Send & Receive Pi easily<br />
        Pay for goods & services or get paid by others
      </p>

      <div className="bg-white p-8 rounded-2xl shadow-lg border">
        <PayButton />
      </div>
    </main>
  );
}