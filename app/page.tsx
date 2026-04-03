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

const recentNews = [
  {
    title: "DOS AGROLINK NIGERIA Launches Smarter Produce Exchange",
    subtitle: "Farmers now list maize, rice, cassava, and vegetables directly to verified buyers for fairer pricing.",
    image: "/agropro/images/news1.jpg",
    tag: "Marketplace",
  },
  {
    title: "Price Intelligence Signals Help Farmers Time the Market",
    subtitle: "Regional demand tracking and crop price guidance are helping producers sell with stronger confidence.",
    image: "/agropro/images/news2.jpg",
    tag: "AI Intelligence",
  },
  {
    title: "Logistics and Storage Expansion Cuts Post-Harvest Losses",
    subtitle: "Pickup coordination, warehouse booking, and inventory visibility are reducing spoilage across supply chains.",
    image: "/agropro/images/news3.jpg",
    tag: "Logistics + Storage",
  },
  {
    title: "Vision in Motion: Finance + Advisory for Stronger Farmer Growth",
    subtitle: "Cooperative wallets, micro-loans, and practical farm advisory are building long-term rural resilience.",
    image: "/agropro/images/blog1.jpg",
    tag: "Finance + Advisory",
  },
];

const impactStats = [
  { metric: "30M+", label: "Farmers in Nigeria" },
  { metric: "$400B+", label: "African Agri Market Opportunity" },
  { metric: "2-5%", label: "Transaction commission model" },
];

const roadmap = ["MVP launch", "Growth phase", "Logistics expansion", "Finance + warehouse scaling"];

const heroImages = [
  "/agropro/images/banner.jpg",
  "/agropro/images/chose.jpg",
  "/agropro/images/about_img.jpg",
  "/agropro/images/service1.jpg",
  "/agropro/images/service2.jpg",
];

const footerQuickLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Farmer Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/product-listing", label: "Product Listing" },
  { href: "/order-management", label: "Order Management" },
  { href: "/loan-application", label: "Loan Application" },
  { href: "/logistics", label: "Logistics" },
  { href: "/warehouse", label: "Warehouse" },
  { href: "/equipment-listing", label: "Equipment Listing" },
  { href: "/about-us", label: "About Us" },
  { href: "/investor", label: "Investor" },
  { href: "/admin/login", label: "Admin Dashboard" },
];

export default function Home() {
  return (
    <main className="agropro-page">
      <section className="agropro-hero">
        <div className="agropro-hero-slides" aria-hidden="true">
          {heroImages.map((src) => (
            <div className="agropro-hero-slide" key={src}>
              <Image src={src} alt="Nigerian farmland" fill priority={src === heroImages[0]} className="agropro-hero-image" sizes="100vw" />
            </div>
          ))}
        </div>
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
        <p className="section-kicker">LATEST NEWS</p>
        <h2>Recent News from DOS AGROLINK NIGERIA</h2>
        <p className="section-intro">
          Follow how our 7-point platform vision is translating into real progress for farmers, buyers,
          cooperatives, and logistics partners across Nigeria.
        </p>
        <div className="latest-news-grid">
          {recentNews.map((item) => (
            <article key={item.title} className="latest-news-card">
              <div className="latest-news-image-wrap">
                <Image src={item.image} alt={item.title} fill className="latest-news-image" sizes="(max-width: 980px) 100vw, 50vw" />
              </div>
              <div className="latest-news-body">
                <span>{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
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

        <div className="footer-quick-links" aria-label="Homepage quick links">
          <p>Quick Links</p>
          <div>
            {footerQuickLinks.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
}
