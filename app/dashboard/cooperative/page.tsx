import React from 'react';
import StatCard from 'components/dashboard/StatCard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
// import { createClient } from 'lib/supabase'; // Supabase removed, comment out or replace if needed

const SIDEBAR = [
  { label: 'Overview', key: 'overview' },
  { label: 'Members', key: 'members' },
  { label: 'Listings', key: 'listings' },
  { label: 'Finance', key: 'finance' },
  { label: 'Reports', key: 'reports' },
];

export default async function CooperativeDashboard() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  // Demo stats and members
  const stats = [
    { label: 'Total Members', value: 42, icon: '👥' },
    { label: 'Active Listings', value: 7, icon: '🛒' },
    { label: 'Pending Loans', value: 3, icon: '💸' },
    { label: 'Total Sales', value: '₦2,500,000', icon: '💰' },
  ];
  const members = [
    { name: 'Adebayo Musa', phone: '08031234567', crop: 'Maize', joined: '2024-03-01', status: 'active' },
    { name: 'Ngozi Okafor', phone: '08029876543', crop: 'Cassava', joined: '2024-01-15', status: 'pending' },
    { name: 'Yakubu Bello', phone: '08012349876', crop: 'Rice', joined: '2023-11-20', status: 'active' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 bg-[#2D6A4F] text-white flex flex-col py-8 px-4">
        <div className="text-2xl font-bold mb-8">Cooperative</div>
        <nav className="flex flex-col gap-2">
          {SIDEBAR.map((item, i) => (
            <a
              key={item.key}
              href={`#${item.key}`}
              className={`rounded-lg px-3 py-2 font-medium transition-colors ${i === 0 ? 'bg-[#D4A017] text-[#2D6A4F]' : 'hover:bg-[#52B788]/30'}`}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 bg-[#F8FAF9] p-8">
        {/* Overview Tab */}
        <section id="overview">
          <div className="flex flex-wrap gap-6 mb-8">
            {stats.map((s) => (
              <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} color={s.label === 'Total Sales' ? '#2D6A4F' : undefined} />
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
            <div className="font-bold text-lg mb-4">Member List</div>
            <table className="min-w-[600px] w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Phone</th>
                  <th className="py-2 px-2">Crop</th>
                  <th className="py-2 px-2">Date Joined</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.phone} className="border-t">
                    <td className="py-2 px-2 font-medium">{m.name}</td>
                    <td className="py-2 px-2">{m.phone}</td>
                    <td className="py-2 px-2">{m.crop}</td>
                    <td className="py-2 px-2">{new Date(m.joined).toLocaleDateString()}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${m.status === 'active' ? 'bg-[#52B788] text-white' : 'bg-yellow-200 text-yellow-800'}`}>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-8 flex-wrap">
            <button className="btn bg-[#2D6A4F] text-white">Add Member</button>
            <button className="btn bg-[#D4A017] text-[#2D6A4F]">Post Produce Listing</button>
            <button className="btn bg-[#52B788] text-white">Apply for Group Loan</button>
          </div>
        </section>
      </main>
    </div>
  );
}
