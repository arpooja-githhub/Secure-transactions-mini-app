"use client";

import { useState } from "react";

// This dynamic URL is essential for Vercel deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4001";

export default function Home() {
  const [partyId, setPartyId] = useState("demo");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [encrypted, setEncrypted] = useState<any>(null);
  const [decrypted, setDecrypted] = useState<any>(null);
  const [fetchedRecord, setFetchedRecord] = useState<any>(null);

  const encryptData = async () => {
    const res = await fetch(`${API_BASE_URL}/tx/encrypt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partyId, payload: { name, amount } }),
    });
    const data = await res.json();
    setEncrypted(data);
    setFetchedRecord(null); // Clear previous fetch
    setDecrypted(null);
  };

  const fetchRecord = async () => {
    // Mirfa Spec: Retrieve encrypted record (no decrypt)
    try {
      const res = await fetch(`${API_BASE_URL}/tx/${partyId}`);
      if (!res.ok) throw new Error("Record not found");
      const data = await res.json();
      setFetchedRecord(data);
    } catch (err) {
      alert("No record found for this Party ID");
    }
  };

  const decryptData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tx/${partyId}/decrypt`, { 
        method: "POST" 
      });
      if (!res.ok) throw new Error("Decryption failed");
      const data = await res.json();
      setDecrypted(data);
    } catch (err) {
      alert("Decryption failed! Data may be tampered or missing.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-16 px-6">
      <h1 className="text-4xl font-bold mb-12">Secure Transaction App</h1>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Party ID</label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Name</label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <input
            className="w-full border border-gray-300 p-3 rounded-lg"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <div className="flex gap-4">
            <button
              onClick={encryptData}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Encrypt & Save
            </button>
            <button
              onClick={fetchRecord}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Fetch Record
            </button>
          </div>
          <button
            onClick={decryptData}
            className="w-full bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
          >
            Decrypt Data
          </button>
        </div>
      </div>

      {/* Mirfa Spec Result Sections */}
      <div className="w-full max-w-2xl space-y-8 mt-12">
        {fetchedRecord && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <h3 className="font-bold text-lg mb-4 text-green-700">Fetched Encrypted Record (from GET /tx/:id)</h3>
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-x-auto">
              {JSON.stringify(fetchedRecord, null, 2)}
            </pre>
          </div>
        )}

        {decrypted && (
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <h3 className="font-bold text-lg mb-4 text-blue-700">Final Decrypted Result</h3>
            <pre className="text-sm font-mono bg-blue-50 p-4 rounded text-blue-900">
              {JSON.stringify(decrypted, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}