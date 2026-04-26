"use client";
import React, { useEffect, useState } from "react";
import Image from 'next/image';


export default function AgentGradingPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/grading/pending");
        const json = await res.json();
        if (res.ok) setSubmissions(json.submissions || []);
        else setError(json.error || "Failed to fetch submissions");
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
      setLoading(false);
    }
    fetchSubmissions();
  }, []);


  async function handleApprove(id: string) {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/grading/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approve: true, notes }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed to approve");
      else {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setSelected(null);
        setNotes("");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
    setActionLoading(false);
  }

  async function handleReject(id: string) {
    setActionLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/grading/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approve: false, notes }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed to reject");
      else {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setSelected(null);
        setNotes("");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    }
    setActionLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Grading Submissions (Agent Verification)</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {!loading && submissions.length === 0 && <div>No pending submissions.</div>}
      <table className="w-full border mt-4 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Commodity</th>
            <th className="p-2">Grade</th>
            <th className="p-2">Photos</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b">
              <td className="p-2">{s.commodity}</td>
              <td className="p-2">{s.grade}</td>
              <td className="p-2">
                <div className="flex gap-1">
                  {s.photos?.map((url: string, i: number) => (
                    <Image key={i} src={url} alt="photo" width={40} height={40} className="h-10 w-10 object-cover rounded" />
                  ))}
                </div>
              </td>
              <td className="p-2">
                <button className="text-blue-600 underline" onClick={() => setSelected(s)}>View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">{selected.commodity} - Grade {selected.grade}</h2>
            <div className="mb-2 flex gap-2">
              {selected.photos?.map((url: string, i: number) => (
                <Image key={i} src={url} alt="photo" width={64} height={64} className="h-16 w-16 object-cover rounded" />
              ))}
            </div>
            <div className="mb-2">
              <strong>Criteria Met:</strong>
              <pre className="bg-gray-100 rounded p-2 text-xs mt-1">{JSON.stringify(selected.criteria_met, null, 2)}</pre>
            </div>
            <textarea
              className="w-full border rounded p-2 mt-2"
              placeholder="Agent notes (optional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div className="mt-4 flex gap-2">
              <button className="bg-green-600 text-white px-4 py-2 rounded" disabled={actionLoading} onClick={() => handleApprove(selected.id)}>
                Approve
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" disabled={actionLoading} onClick={() => handleReject(selected.id)}>
                Reject
              </button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
