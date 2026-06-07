"use client";

import React, { useEffect, useState } from 'react';
import WhatsAppSession from 'models/whatsappSession';

type WhatsAppSessionLean = {
  phone_number: string;
  current_menu: string;
  context: Record<string, unknown>;
  last_active: Date;
  _id?: string;
};
import { dbConnect } from 'lib/mongoose';

export default function WhatsAppAdminMonitor() {
  const [sessions, setSessions] = useState<WhatsAppSessionLean[]>([]);

  useEffect(() => {
    (async () => {
      await dbConnect();
      const sessionsRaw = await WhatsAppSession.find({}).sort({ last_active: -1 }).limit(50).lean();
      // Map to WhatsAppSessionLean[] with fallback for missing fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedSessions: WhatsAppSessionLean[] = (sessionsRaw || []).map((s: any) => ({
        phone_number: s.phone_number ?? '',
        current_menu: s.current_menu ?? '',
        context: s.context ?? {},
        last_active: s.last_active ? new Date(s.last_active) : new Date(),
        _id: s._id,
      }));
      setSessions(mappedSessions);
    })();
  }, []);

  const escalate = async (phone: string) => {
    await dbConnect();
    await WhatsAppSession.updateOne({ phone_number: phone }, { current_menu: 'human_takeover' });
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
              <td className="py-2 px-4">{typeof s.context?.last_message === 'string' ? s.context.last_message : '-'}</td>
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
