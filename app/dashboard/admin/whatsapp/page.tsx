"use client";
import React, { useEffect, useState } from 'react';
import WhatsAppSession from 'models/whatsappSession';
import { dbConnect } from 'lib/mongoose';

export default function WhatsAppAdminMonitor() {
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      await dbConnect();
      const sessions = await WhatsAppSession.find({}).sort({ last_active: -1 }).limit(50).lean();
      setSessions(sessions || []);
    })();
  }, []);

  const escalate = async (phone: string) => {
    await dbConnect();
    await WhatsAppSession.updateOne({ phone_number: phone }, { current_menu: 'human_takeover' });
    // TODO: Notify support via email
    alert('Escalated to human support.');
  };

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">WhatsApp Bot Monitor</h1>
      <table className="min-w-full bg-white rounded shadow mb-8">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-4 text-left">Phone</th>
            <th className="py-2 px-4 text-left">Last Message</th>
            <th className="py-2 px-4 text-left">Menu State</th>
            <th className="py-2 px-4 text-left">Last Active</th>
            <th className="py-2 px-4 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(s => (
            <tr key={s.phone_number}>
              <td className="py-2 px-4">+{s.phone_number.slice(0, 3)}****{s.phone_number.slice(-3)}</td>
              <td className="py-2 px-4">{s.context?.last_message || '-'}</td>
              <td className="py-2 px-4">{s.current_menu}</td>
              <td className="py-2 px-4">{s.last_active ? new Date(s.last_active).toLocaleString() : '-'}</td>
              <td className="py-2 px-4">
                <button className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded" onClick={() => escalate(s.phone_number)}>Escalate to Human</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
