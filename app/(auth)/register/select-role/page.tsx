import Link from "next/link";
import Image from "next/image";

const ROLES = [
  {
    id: "farmer",
    href: "/register",
    emoji: "🌾",
    title: "Farmer",
    subtitle: "Smallholder & commercial farmers",
    perks: [
      "List produce & manage orders",
      "Price intelligence & market access",
      "Loans, storage & logistics booking",
    ],
    badge: "Most Popular",
    badgeColor: "bg-emerald-100 text-emerald-800",
    ring: "ring-emerald-400",
    accent: "text-emerald-700",
    btnClass: "bg-emerald-700 hover:bg-emerald-800 text-white",
  },
  {
    id: "buyer",
    href: "/register?role=buyer",
    emoji: "🛒",
    title: "Buyer / Agribusiness",
    subtitle: "Processors, traders & exporters",
    perks: [
      "Browse the verified marketplace",
      "Place orders & track fulfilment",
      "Build reliable supply partnerships",
    ],
    badge: null,
    badgeColor: "",
    ring: "ring-blue-400",
    accent: "text-blue-700",
    btnClass: "bg-blue-700 hover:bg-blue-800 text-white",
  },
  {
    id: "cooperative",
    href: "/register/cooperative",
    emoji: "🤝",
    title: "Cooperative",
    subtitle: "Registered farmer cooperatives",
    perks: [
      "Manage members & aggregate produce",
      "Access group credit scores",
      "Coordinate bulk transactions",
    ],
    badge: null,
    badgeColor: "",
    ring: "ring-amber-400",
    accent: "text-amber-700",
    btnClass: "bg-amber-600 hover:bg-amber-700 text-white",
  },
  {
    id: "logistics",
    href: "/register/logistics",
    emoji: "🚚",
    title: "Logistics Partner",
    subtitle: "Haulage & last-mile delivery",
    perks: [
      "Accept dispatch requests",
      "Update transit status in real time",
      "Earn per completed delivery",
    ],
    badge: null,
    badgeColor: "",
    ring: "ring-orange-400",
    accent: "text-orange-700",
    btnClass: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  {
    id: "warehouse",
    href: "/register/warehouse",
    emoji: "🏭",
    title: "Warehouse Manager",
    subtitle: "Storage facility operators",
    perks: [
      "Manage storage capacity & bookings",
      "Confirm farmer receipts",
      "Release inventory on demand",
    ],
    badge: null,
    badgeColor: "",
    ring: "ring-slate-400",
    accent: "text-slate-700",
    btnClass: "bg-slate-700 hover:bg-slate-800 text-white",
  },
  {
    id: "investor",
    href: "/register/investor",
    emoji: "📈",
    title: "Investor",
    subtitle: "Individuals & institutional investors",
    perks: [
      "Browse investment opportunities",
      "Monitor portfolio returns",
      "Impact-driven agri-finance",
    ],
    badge: null,
    badgeColor: "",
    ring: "ring-violet-400",
    accent: "text-violet-700",
    btnClass: "bg-violet-700 hover:bg-violet-800 text-white",
  },
  {
    id: "admin",
    href: "/register/admin",
    emoji: "🔐",
    title: "Platform Admin",
    subtitle: "DOS AgroLink staff only",
    perks: [
      "Approve users, products & loans",
      "Manage platform settings",
      "Full analytics & reporting access",
    ],
    badge: "Invite Only",
    badgeColor: "bg-rose-100 text-rose-700",
    ring: "ring-rose-400",
    accent: "text-rose-700",
    btnClass: "bg-rose-700 hover:bg-rose-800 text-white",
  },
] as const;

export default function SelectRolePage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6">
      {/* ── Header ── */}
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-green-200 bg-white px-4 py-2 shadow-sm">
          <Image src="/dos-logo.jpg" alt="DOS AgroLink" width={28} height={28} className="h-7 w-7 rounded-full object-cover" />
          <span className="text-xs font-bold uppercase tracking-widest text-green-800">
            DOS AgroLink Nigeria
          </span>
        </div>
        <h1 className="m-0 text-3xl font-extrabold text-green-900 sm:text-4xl">
          How will you use AgroLink?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
          Choose your role to get started. Each account is tailored to your specific needs and
          unlocks the right tools from day one.
        </p>
      </div>

      {/* ── Role Grid ── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ROLES.map((r) => (
          <article
            key={r.id}
            className={`relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:ring-2 ${r.ring}`}
          >
            {r.badge && (
              <span
                className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${r.badgeColor}`}
              >
                {r.badge}
              </span>
            )}

            <div className="mb-3 text-3xl" aria-hidden="true">
              {r.emoji}
            </div>

            <h2 className={`m-0 text-lg font-extrabold ${r.accent}`}>{r.title}</h2>
            <p className="m-0 mt-0.5 text-xs font-medium text-slate-500">{r.subtitle}</p>

            <ul className="my-4 grid gap-1.5 text-sm text-slate-700">
              {r.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-500" aria-hidden="true">✓</span>
                  {perk}
                </li>
              ))}
            </ul>

            <Link
              href={r.href}
              className={`mt-auto inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold no-underline transition-colors ${r.btnClass}`}
            >
              Register as {r.title}
            </Link>
          </article>
        ))}
      </div>

      {/* ── Footer ── */}
      <p className="mt-10 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-green-700 hover:underline">
          Log in here
        </Link>
      </p>
    </main>
  );
}
