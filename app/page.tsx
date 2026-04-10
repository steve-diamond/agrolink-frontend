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

const socialCarouselSlides = [
  {
    id: "farmer-growth",
    audience: "Farmer Growth",
    title: "Market-ready crop sales with better margins",
    summary:
      "Turn weekly harvest into structured marketplace listings, faster settlement, and transparent buyer demand signals.",
    image: "/agropro/images/about_img.jpg",
    roi: "ROI +18%",
    impact: "1,240 farmers onboarded",
    ctaPrimary: { href: "/marketplace", label: "Enter Marketplace" },
    ctaSecondary: { href: "/join-us", label: "Join Network" },
  },
  {
    id: "investor-insight",
    audience: "Investor Desk",
    title: "Portfolio visibility with social impact tracking",
    summary:
      "Monitor project performance, expected returns, and social outcomes from one clean dashboard built for investment decisions.",
    image: "/agropro/images/service3.jpg",
    roi: "ROI up to 22%",
    impact: "350 hectares cultivated",
    ctaPrimary: { href: "/investor", label: "View Investor Desk" },
    ctaSecondary: { href: "/vision", label: "See Impact Model" },
  },
  {
    id: "logistics-reliability",
    audience: "Logistics + Warehouse",
    title: "Delivery reliability backed by storage rails",
    summary:
      "Coordinate shipment milestones, warehouse capacity, and payment confidence to reduce spoilage and delay risk.",
    image: "/agropro/images/service2.jpg",
    roi: "Losses down 30%",
    impact: "95 active delivery routes",
    ctaPrimary: { href: "/logistics", label: "Track Logistics" },
    ctaSecondary: { href: "/warehouse", label: "Explore Warehousing" },
  },
] as const;

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

      <section className="slide-kit-block social-carousel-block" aria-label="DosAgrolink social media carousel">
        <div className="social-carousel-head">
          <p className="section-kicker">SOCIAL MEDIA CAROUSEL</p>
          <h2>Stories, returns, and impact in one visual flow</h2>
          <p>
            Designed for bold communication across mobile and desktop with stronger hierarchy, balanced whitespace,
            and clear conversion paths.
          </p>
        </div>

        <div className="social-carousel-track" role="list">
          {socialCarouselSlides.map((slide) => (
            <article key={slide.id} className="social-card" role="listitem">
              <div className="social-card-media">
                <Image src={slide.image} alt={slide.title} fill className="social-card-image" sizes="(max-width: 980px) 84vw, 34vw" />
                <span className="social-card-badge">{slide.audience}</span>
              </div>

              <div className="social-card-body">
                <h3>{slide.title}</h3>
                <p>{slide.summary}</p>

                <div className="social-metrics">
                  <div className="social-metric-chip">
                    <span className="metric-icon metric-icon-roi" aria-hidden="true" />
                    <div>
                      <strong>{slide.roi}</strong>
                      <small>Return signal</small>
                    </div>
                  </div>
                  <div className="social-metric-chip">
                    <span className="metric-icon metric-icon-impact" aria-hidden="true" />
                    <div>
                      <strong>{slide.impact}</strong>
                      <small>Social impact</small>
                    </div>
                  </div>
                </div>

                <div className="social-card-actions">
                  <Link href={slide.ctaPrimary.href} className="social-cta-primary">
                    {slide.ctaPrimary.label}
                  </Link>
                  <Link href={slide.ctaSecondary.href} className="social-cta-secondary">
                    {slide.ctaSecondary.label}
                  </Link>
                </div>

                <div className="social-qr-box" aria-label="QR call to action">
                  <div className="social-qr-code" aria-hidden="true" />
                  <div>
                    <strong>Scan QR for instant onboarding</strong>
                    <span>Open WhatsApp onboarding and media kit</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
