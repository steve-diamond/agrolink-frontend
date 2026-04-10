import Image from "next/image";
import Link from "next/link";
import dosLogo from "../dos logo.jpg";
import HomeLanguageSwitcher from "@/components/HomeLanguageSwitcher";

const navItems = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Finance", href: "/loan-application" },
  { label: "Logistics", href: "/logistics" },
  { label: "Warehouse", href: "/warehouse" },
  { label: "Investor Desk", href: "/investor" },
  { label: "About Us", href: "/about-us" },
];
const valueCards = [
  { icon: "🌱", title: "Agri Loans", desc: "Easy finance for your farm" },
  { icon: "🚚", title: "Logistics Support", desc: "Reliable transport solutions" },
  { icon: "🏠", title: "Warehousing", desc: "Secure storage for your harvest" },
];
const trustItems = [
  { icon: "🤝", title: "Trusted Partnerships" },
  { icon: "🔒", title: "Secure Payments" },
  { icon: "📊", title: "Proven Results" },
];
const partners = ["Lagos State", "IFAD", "ACCESS", "NIRSAL", "NDA"];

const heroSlides = [
  {
    image: "/agropro/images/banner.jpg",
    title: "Empowering Nigerian Farmers & Investors",
    subtitle: "Grow, Trade, Invest - All in One Platform",
    ctaPrimary: { label: "Enter Marketplace", href: "/marketplace" },
    ctaSecondary: { label: "Join Our Network", href: "/join-us" },
  },
  {
    image: "/agropro/images/BannerMaize.jpg",
    title: "Transparent Market Access for Every Harvest",
    subtitle: "We connect producers to verified buyers with fair pricing intelligence.",
    ctaPrimary: { label: "Explore Prices", href: "/marketplace" },
    ctaSecondary: { label: "View Vision", href: "/vision" },
  },
  {
    image: "/agropro/images/cassava.jpg",
    title: "From Farm Gate to National Value Chains",
    subtitle: "Digitized aggregation helps smallholders scale supply with confidence.",
    ctaPrimary: { label: "See Opportunities", href: "/investor" },
    ctaSecondary: { label: "Partner With Us", href: "/join-us" },
  },
  {
    image: "/agropro/images/chicken.jpg",
    title: "Reliable Food Systems, Built With Data",
    subtitle: "Our platform strengthens planning, quality, and resilient production cycles.",
    ctaPrimary: { label: "Farmer Dashboard", href: "/dashboard" },
    ctaSecondary: { label: "Read Stories", href: "/vision" },
  },
  {
    image: "/agropro/images/fish.jpeg",
    title: "Inclusive Finance That Powers Productivity",
    subtitle: "Credit, wallet rails, and repayment visibility unlock sustainable growth.",
    ctaPrimary: { label: "Apply for Finance", href: "/loan-application" },
    ctaSecondary: { label: "Investor Desk", href: "/investor" },
  },
  {
    image: "/agropro/images/plantain.jpg",
    title: "Integrated Logistics and Storage Infrastructure",
    subtitle: "Reduce post-harvest losses with traceable movement and warehouse support.",
    ctaPrimary: { label: "Track Logistics", href: "/logistics" },
    ctaSecondary: { label: "Book Storage", href: "/warehouse" },
  },
  {
    image: "/agropro/images/ugu.jpg",
    title: "A Shared Vision for Prosperous Rural Economies",
    subtitle: "We build trust between farmers, buyers, and institutions for long-term impact.",
    ctaPrimary: { label: "About DosAgrolink", href: "/about-us" },
    ctaSecondary: { label: "Become a Partner", href: "/join-us" },
  },
];

export default function Home() {
  return (
    <main className="dos-homepage">
      <section className="dos-home-card">
        <header className="dos-topbar">
          <div className="dos-brand">
            <Image src={dosLogo} alt="DosAgrolink" width={32} height={32} className="dos-brand-logo" />
            <strong>DosAgrolink</strong>
          </div>
          <nav className="dos-menu" aria-label="Primary">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>{item.label}</Link>
            ))}
          </nav>
        </header>

        <div className="dos-subbar">
          <div className="dos-subbar-contact" aria-label="Contact channels">
            <span>Call Us</span>
            <span>|</span>
            <span>WhatsApp</span>
          </div>
          <div className="dos-subbar-divider" aria-hidden="true">|</div>
          <HomeLanguageSwitcher />
          <Link href="/register" className="dos-get-started">Get Started</Link>
        </div>

        <section className="dos-hero">
          <div className="dos-hero-carousel" aria-label="DosAgrolink vision highlights">
            {heroSlides.map((slide, index) => (
              <article
                key={slide.image}
                className="dos-hero-slide"
                style={{ animationDelay: `${index * 5}s` }}
                aria-label={`Slide ${index + 1}`}
              >
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="dos-hero-bg"
                  sizes="100vw"
                />
                <div className="dos-hero-overlay" />
                <div className="dos-hero-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.subtitle}</p>
                  <div className="dos-hero-actions">
                    <Link href={slide.ctaPrimary.href} className="dos-btn-green">{slide.ctaPrimary.label}</Link>
                    <Link href={slide.ctaSecondary.href} className="dos-btn-cream">{slide.ctaSecondary.label}</Link>
                  </div>
                </div>
              </article>
            ))}

            <div className="dos-hero-progress" aria-hidden="true">
              {heroSlides.map((slide, index) => (
                <span key={`${slide.image}-${index}`} style={{ animationDelay: `${index * 5}s` }} />
              ))}
            </div>
          </div>
        </section>

        <section className="dos-value-grid" aria-label="Value propositions">
          {valueCards.map((item) => (
            <article key={item.title} className="dos-value-card">
              <span className="dos-value-icon" aria-hidden="true">{item.icon}</span>
              <div>
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="dos-why" aria-label="Why choose us">
          <h2>Why Choose Us?</h2>
          <div className="dos-why-grid">
            {trustItems.map((item) => (
              <article key={item.title} className="dos-why-item">
                <span aria-hidden="true">{item.icon}</span>
                <h3>{item.title}</h3>
              </article>
            ))}
          </div>
        </section>

        <section className="dos-story">
          <Image src="/agropro/images/chose.jpg" alt="Success stories" fill className="dos-story-bg" sizes="100vw" />
          <div className="dos-story-overlay" />
          <div className="dos-story-content">
            <h2>Success Stories</h2>
            <blockquote>&quot;DosAgrolink helped me double my yield!&quot;</blockquote>
            <p>- Adebayo, Ondo State</p>
            <Link href="/vision" className="dos-btn-green">View More Stories</Link>
          </div>
        </section>

        <section className="dos-partners" aria-label="Partners">
          <h2>Our Partners</h2>
          <div className="dos-partners-grid">
            {partners.map((item) => (
              <div key={item} className="dos-partner-chip">{item}</div>
            ))}
          </div>
          <p>In Partnership With</p>
        </section>

        <section className="dos-cta-strip">
          <h2>Ready to Get Started?</h2>
          <div className="dos-cta-actions">
            <Link href="/join-us" className="dos-btn-cream">Contact Us</Link>
            <Link href="/investor" className="dos-btn-green">Invest Now</Link>
          </div>
          <div className="dos-contact-row">
            <span>☎ Call: 0800-XXX-XXXX</span>
            <span>✉ Email: info@dosagrolink.com.ng</span>
            <span>◉ SSL Secure</span>
            <span>◎ Certified</span>
          </div>
        </section>

        <footer className="dos-mini-footer">
          <p>Privacy Policy | Terms of Service | FAQs</p>
        </footer>
      </section>
    </main>
  );
}
