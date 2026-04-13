import Link from "next/link";
import Image from "next/image";

const opportunities = [
  { title: "Maize Farming Cooperative", roi: "15%", duration: "6 Months", href: "/marketplace" },
  { title: "Poultry Expansion Project", roi: "18%", duration: "9 Months", href: "/loan-application" },
  { title: "Cassava Processing Plant", roi: "20%", duration: "8 Months", href: "/vision" },
];

const highlights = [
  { label: "Total Investment", value: "N32,000,000" },
  { label: "Estimated Return", value: "N3,200,000" },
  { label: "Active Projects", value: "4" },
];

export default function InvestorPage() {
  return (
    <main className="dash-page investor-page">
      <section className="dash-hero investor-hero">
        <Image src="/agropro/images/banner.jpg" alt="Investor dashboard" fill className="dash-hero-bg" sizes="100vw" />
        <div className="dash-hero-overlay" />
        <div className="dash-hero-content">
          <p className="dash-kicker">DosAgrolink Investor Desk</p>
          <h1>Welcome Back, Ada!</h1>
          <p>Track and manage your farm investments with ease.</p>
        </div>
      </section>

      <section className="dash-kpi-grid" aria-label="Investor metrics">
        {highlights.map((item) => (
          <article key={item.label} className="dash-kpi">
            <h2>{item.label}</h2>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      <section className="dash-grid-two">
        <article className="dash-card">
          <h3>Investment Overview</h3>
          <div className="dash-mini-grid">
            <div className="dash-mini-chip">Farmers Growth</div>
            <div className="dash-mini-chip">Recent Growth</div>
            <div className="dash-mini-chip">Impact Metrics</div>
          </div>
          <p className="dash-muted">Performance data updates weekly for portfolio and social impact tracking.</p>
          <Link href="/vision" className="dash-btn-secondary">Open Reports</Link>
        </article>

        <article className="dash-card">
          <h3>Impact Metrics</h3>
          <p className="dash-amount">53 Farmers Supported</p>
          <p className="dash-amount">30% Yield Increase</p>
          <p className="dash-muted">Linked to verified farmer production outcomes.</p>
          <Link href="/about-us" className="dash-btn-secondary">View Impact Story</Link>
        </article>
      </section>

      <section className="dash-card">
        <div className="dash-card-head">
          <h3>Open Opportunities</h3>
          <Link href="/marketplace">View all</Link>
        </div>
        <div className="dash-opportunity-grid">
          {opportunities.map((item) => (
            <article key={item.title} className="dash-opportunity-card">
              <h4>{item.title}</h4>
              <p>ROI: {item.roi}</p>
              <p>Duration: {item.duration}</p>
              <Link href={item.href} className="dash-btn-primary">Invest Now</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="dash-card">
        <h3>Partnered With</h3>
        <div className="dash-partner-row">
          <span>IFAD</span>
          <span>NIRSAL</span>
          <span>ACCESS</span>
          <span>Lagos State</span>
        </div>
      </section>

      <section className="dash-links" aria-label="Quick links">
        <Link href="/dashboard">Farmer Dashboard</Link>
        <Link href="/logistics">Logistics</Link>
        <Link href="/warehouse">Warehouse</Link>
        <Link href="/admin/login">Admin</Link>
      </section>
    </main>
  );
}
