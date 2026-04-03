import Link from "next/link";
import Image from "next/image";
import dosLogo from "../dos logo.jpg";

const strategicCapabilities = [
  {
    title: "Smart Produce Marketplace",
    body: "Farmers list maize, rice, cassava, and vegetables directly to verified buyers by location, volume, and fair pricing.",
  },
  {
    title: "AI Crop Price Intelligence",
    body: "Real-time demand and regional pricing signals guide farmers on when to sell, where to sell, and expected market direction.",
  },
  {
    title: "Cooperative Digital Wallet",
    body: "Instant payouts, savings tracking, and input payments keep cooperative cash cycles transparent and healthy.",
  },
  {
    title: "Farmer Micro-Loan System",
    body: "Loan access is tied to sales history, farm profile, and cooperative performance so growth capital reaches active farmers.",
  },
  {
    title: "Logistics & Transport Network",
    body: "Farm-to-city movement is coordinated through pickup requests, driver assignment, transit tracking, and delivery confirmation.",
  },
  {
    title: "Warehouse & Storage System",
    body: "Capacity-aware booking, inventory records, and warehouse receipts reduce spoilage and forced low-price sales.",
  },
  {
    title: "Advisory & Knowledge Hub",
    body: "Weather-aware crop guidance, pest alerts, and fertilizer recommendations support stronger decisions and better yields.",
  },
];

const slideHeaders = [
  {
    title: "Title Slide",
    subtitle: "DOS AGROLINK NIGERIA: Digital infrastructure for agricultural trade",
    tone: "primary",
    image: "/agropro/images/banner.jpg",
  },
  {
    title: "Insight Slide",
    subtitle: "Farmers do not lack production. They lack access to profitable markets.",
    tone: "insight",
    image: "/agropro/images/chose.jpg",
  },
  {
    title: "Problem Slide",
    subtitle: "Low profits, middlemen, and post-harvest losses reduce farmer confidence.",
    tone: "workflow",
    image: "/agropro/images/service2.jpg",
  },
  {
    title: "Solution Slide",
    subtitle: "Direct-to-buyer access, secure payments, and streamlined transactions.",
    tone: "opportunity",
    image: "/agropro/images/service3.jpg",
  },
];

const impactStats = [
  { metric: "30M+", label: "Farmers in Nigeria" },
  { metric: "$400B+", label: "African Agri Market Opportunity" },
  { metric: "2-5%", label: "Transaction commission model" },
];

const roadmap = ["MVP launch", "Growth phase", "Logistics expansion", "Finance + warehouse scaling"];

export default function Home() {
  return (
    <main className="agropro-page">
      <section className="agropro-hero">
        <Image src="/agropro/images/banner.jpg" alt="Nigerian farmland" fill priority className="agropro-hero-image" sizes="100vw" />
        <div className="agropro-hero-overlay" />
        <div className="agropro-hero-content">
          <div className="agropro-brand-row">
            <Image src={dosLogo} alt="DOS AGROLINK NIGERIA" width={56} height={56} className="agropro-logo" />
            <div>
              <p className="agropro-kicker">DOS AGROLINK NIGERIA</p>
              <h1>The Digital Operating System for Agricultural Trade in Nigeria</h1>
            </div>
          </div>
          <p>
            We connect farmers, buyers, logistics, storage, and finance into one trusted platform built to increase
            farmer income and reduce avoidable losses.
          </p>
          <Link href="/marketplace" className="agropro-cta">Enter Marketplace</Link>
        </div>
      </section>

      <section className="slide-kit-block">
        <p className="section-kicker">PITCH BANNERS</p>
        <h2>Slide Header Banners for DOS AGROLINK NIGERIA</h2>
        <div className="slide-header-grid">
          {slideHeaders.map((item) => (
            <article key={item.title} className={`slide-header-card ${item.tone}`}>
              <Image src={item.image} alt={item.title} fill className="slide-header-bg" sizes="(max-width: 980px) 100vw, 50vw" />
              <div className="slide-header-tint" />
              <Image src={dosLogo} alt="DOS AGROLINK NIGERIA mark" width={40} height={40} className="slide-mark" />
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <div className="slide-gold-wave" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="capabilities-block">
        <p className="section-kicker">OUR 7-POINT VISION</p>
        <h2>Built to Solve Real Farmer Problems Across Nigeria</h2>
        <div className="capabilities-grid">
          {strategicCapabilities.map((item) => (
            <article key={item.title} className="capability-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="agropro-opportunity">
        <div className="opportunity-copy">
          <p className="section-kicker">BUSINESS MODEL & TRACTION</p>
          <h2>From Farm Data to Market Confidence</h2>
          <p>
            DOS AGROLINK NIGERIA combines direct produce transactions with secure payments and value-added logistics,
            storage, and financing rails for long-term agricultural growth.
          </p>
        </div>
        <div className="opportunity-stats">
          {impactStats.map((item) => (
            <article key={item.metric} className="impact-chip">
              <strong>{item.metric}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="agropro-roadmap">
        <div>
          <p className="section-kicker">ROADMAP</p>
          <h2>Execution Path</h2>
          <ul>
            {roadmap.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
        <div className="roadmap-gallery">
          <Image src="/agropro/images/service1.jpg" alt="Fresh produce" width={240} height={170} />
          <Image src="/agropro/images/about_img.jpg" alt="Tomato harvest" width={240} height={170} />
          <Image src="/agropro/images/service2.jpg" alt="Agricultural production" width={240} height={170} />
        </div>
      </section>

      <footer className="agropro-footer-vision">
        <div className="slide-footer-grid">
          <div className="vision-footer-strip">
            <span>DOS AGROLINK NIGERIA</span>
            <p>Direct to buyers. Better prices for farmers.</p>
          </div>
          <div className="vision-footer-strip">
            <span>DOS AGROLINK NIGERIA</span>
            <p>Secure payments, transparent records, and trusted transactions.</p>
          </div>
          <div className="vision-footer-strip">
            <span>DOS AGROLINK NIGERIA</span>
            <p>Logistics + storage + advisory intelligence to reduce losses and grow value.</p>
          </div>
          <div className="vision-footer-strip">
            <span>DOS AGROLINK NIGERIA</span>
            <p>Empowering Africa&apos;s agricultural future with data-driven trade infrastructure.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
