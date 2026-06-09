import StatCard from 'components/dashboard/StatCard';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import mongoose from 'mongoose';
import { dbConnect } from 'lib/mongoose';
import Product from 'models/Product';
import Order from 'models/Order';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Cooperative = require('models/Cooperative');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CooperativeMember = require('models/CooperativeMember');

export const dynamic = 'force-dynamic';

const SIDEBAR = [
  { label: 'Overview', key: 'overview' },
  { label: 'Members', key: 'members' },
  { label: 'Listings', key: 'listings' },
  { label: 'Finance', key: 'finance' },
  { label: 'Reports', key: 'reports' },
];

type MemberRow = {
  key: string;
  name: string;
  phone: string;
  role: string;
  joined: string;
  status: string;
};

export default async function CooperativeDashboard() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  const sessionEmail = String((session as { user?: { email?: string } })?.user?.email || '').toLowerCase();

  if (!sessionEmail) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-[#2D6A4F]">Cooperative dashboard unavailable</h1>
          <p className="mt-3 text-gray-600">Your account is missing an email identity in this session. Sign in again to continue.</p>
        </div>
      </main>
    );
  }

  await dbConnect();

  const cooperative = await Cooperative.findOne({
    $or: [
      { chairman_email: sessionEmail },
      { secretary_email: sessionEmail },
    ],
  }).lean();

  if (!cooperative) {
    return (
      <main className="min-h-screen bg-[#F8FAF9] p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-2xl font-bold text-[#2D6A4F]">No cooperative profile found</h1>
          <p className="mt-3 text-gray-600">
            No cooperative registration is linked to {sessionEmail}. Register a cooperative to unlock this dashboard.
          </p>
          <div className="mt-6">
            <Link href="/cooperatives/register" className="inline-flex rounded-lg bg-[#2D6A4F] px-4 py-2 text-white font-medium">
              Register Cooperative
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const cooperativeId = new mongoose.Types.ObjectId(String(cooperative._id));

  const membersRaw = await CooperativeMember.find({ cooperative_id: cooperativeId })
    .populate('farmer_id', 'name phone')
    .sort({ joined_at: -1 })
    .limit(100)
    .lean();

  const memberIds = membersRaw
    .map((member: { farmer_id?: { _id?: mongoose.Types.ObjectId } }) => member.farmer_id?._id)
    .filter(Boolean) as mongoose.Types.ObjectId[];

  const activeListings = memberIds.length > 0
    ? await Product.countDocuments({ farmer: { $in: memberIds }, isActive: true })
    : 0;

  const memberProducts = memberIds.length > 0
    ? await Product.find({ farmer: { $in: memberIds } }).select('_id').lean()
    : [];

  const memberProductIds = memberProducts.map((product: { _id: mongoose.Types.ObjectId }) => product._id);

  const deliveredOrders = memberProductIds.length > 0
    ? await Order.find({
        status: { $in: ['paid', 'confirmed', 'shipped', 'delivered'] },
        products: { $elemMatch: { productId: { $in: memberProductIds } } },
      })
        .select('totalAmount')
        .lean()
    : [];

  const totalSales = deliveredOrders.reduce(
    (sum: number, order: { totalAmount?: number }) => sum + Number(order.totalAmount ?? 0),
    0
  );

  const members: MemberRow[] = membersRaw.map(
    (member: {
      farmer_id?: { name?: string; phone?: string };
      joined_at?: Date | string;
      role?: string;
      _id?: mongoose.Types.ObjectId;
    }) => ({
      key: String(member._id ?? `${member.farmer_id?.name || 'member'}-${member.joined_at || ''}`),
      name: String(member.farmer_id?.name || 'Unnamed member'),
      phone: String(member.farmer_id?.phone || '-'),
      role: String(member.role || 'member'),
      joined: member.joined_at ? new Date(member.joined_at).toLocaleDateString() : '-',
      status: String(cooperative.status || 'pending'),
    })
  );

  const stats = [
    { label: 'Total Members', value: Number(cooperative.member_count || members.length), icon: '👥' },
    { label: 'Active Listings', value: activeListings, icon: '🛒' },
    { label: 'Verification Status', value: String(cooperative.status || 'pending').toUpperCase(), icon: '✅' },
    { label: 'Total Sales', value: `₦${Math.round(totalSales).toLocaleString()}`, icon: '💰' },
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
            <table className="min-w-150 w-full text-left">
              <thead>
                <tr className="text-gray-500 text-sm">
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Phone</th>
                  <th className="py-2 px-2">Role</th>
                  <th className="py-2 px-2">Date Joined</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 ? (
                  <tr className="border-t">
                    <td className="py-4 px-2 text-gray-500" colSpan={5}>No members yet.</td>
                  </tr>
                ) : members.map((m: MemberRow) => (
                  <tr key={m.key} className="border-t">
                    <td className="py-2 px-2 font-medium">{m.name}</td>
                    <td className="py-2 px-2">{m.phone}</td>
                    <td className="py-2 px-2 capitalize">{m.role}</td>
                    <td className="py-2 px-2">{m.joined}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${m.status === 'verified' ? 'bg-[#52B788] text-white' : m.status === 'rejected' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link href="/cooperatives/register" className="btn bg-[#2D6A4F] text-white">Update Cooperative Profile</Link>
            <Link href="/dashboard/seller/upload" className="btn bg-[#D4A017] text-[#2D6A4F]">Post Produce Listing</Link>
            <Link href="/loan-application" className="btn bg-[#52B788] text-white">Apply for Group Loan</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
