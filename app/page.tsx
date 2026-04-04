import Link from "next/link";
import Image from "next/image";
import dosLogo from "../dos logo.jpg";
import LiveAgriNews from "@/components/LiveAgriNews";
import { visionPoints } from "@/lib/visionPoints";

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
        <LiveAgriNews />
      </section>

      <section className="capabilities-block">
        <p className="section-kicker">OUR 7-POINT VISION</p>
        <h2>Built to Solve Real Farmer Problems Across Nigeria</h2>
        <div className="capability-section-actions">
          <Link href="/vision" className="btn-primary inline-flex items-center px-4 py-2 no-underline">Read Full Vision</Link>
          <Link href="/join-us" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">
            Join Us
          </Link>
        </div>
        <div className="capabilities-grid">
          {visionPoints.map((item, index) => (
            <article key={item.slug} className="capability-card">
              <div className="capability-card-media">
                <Image src={item.image} alt={item.title} fill className="capability-card-image" sizes="(max-width: 980px) 100vw, 33vw" />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="capability-card-body">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <div className="capability-card-actions">
                  <Link href={`/vision/${item.slug}`}>Read More</Link>
                  <Link href="/join-us">Join Us</Link>
                </div>
              </div>
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
          <div className="opportunity-visual">
            <Image src="/agropro/images/service3.jpg" alt="Professional produce operation" fill className="opportunity-visual-image" sizes="(max-width: 980px) 100vw, 60vw" />
            <div className="opportunity-visual-overlay">
              <strong>Trusted Trade Rail</strong>
              <span>Data, logistics, storage, finance</span>
            </div>
          </div>
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

    </main>
  );
}
