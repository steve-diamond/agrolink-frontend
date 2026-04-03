import Link from "next/link";
import Image from "next/image";
import dosLogo from "../dos logo.jpg";

const audienceCards = [
  {
    title: "For Agribusinesses",
    body: "Build, grow, and scale with connected supply intelligence and traceable workflows.",
    imageClass: "audience-image-one",
  },
  {
    title: "For Farmers & Cooperatives",
    body: "Unlock capital, improve yields, and access premium markets with real-time data.",
    imageClass: "audience-image-two",
  },
  {
    title: "For Investors & Partners",
    body: "Drive impact and returns through transparent operations and performance reporting.",
    imageClass: "audience-image-three",
  },
];

const painPoints = [
  {
    title: "We've seen the harvest spoiled by a broken thread to the market.",
    body: "We know the heartbreak of a farmer who has poured everything into their crop, only to see it sold at discount due to a lack of timely buyers or post-harvest access.",
    tone: "deep",
  },
  {
    title: "We've tried to build trust with nothing but a handshake.",
    body: "We have watched partnerships collapse over vague terms, product quality disputes, and delayed payment cycles. It is no wonder that confidence drops when records disappear.",
    tone: "bright",
  },
  {
    title: "We've worked in the dark, wishing for a thread of clear insight.",
    body: "From farm records to logistics checkpoints and market movement, teams are often forced to move on instinct because the right data never reaches the right people.",
    tone: "bright",
  },
  {
    title: "We've felt the frustration of a brilliant vision held back by a missing financial thread.",
    body: "A great strategy is not enough when access to affordable credit, verified history, and market confidence remains fragmented.",
    tone: "deep",
  },
];

const faqs = [
  "What does DOS AGROLINK NIGERIA do in simple terms?",
  "Do you only operate in Nigeria?",
  "What makes DOS AGROLINK NIGERIA different from other agtech companies?",
  "How can my organization partner with DOS AGROLINK NIGERIA?",
  "Are you a non-profit organization?",
];

const strategicCapabilities = [
  {
    title: "Smart Produce Marketplace",
    body: "Farmers list maize, rice, cassava, and vegetables while buyers source by location, volume, and price.",
  },
  {
    title: "AI Crop Price Intelligence",
    body: "Price and demand signals guide farmers on when to sell, where to sell, and what to expect next.",
  },
  {
    title: "Cooperative Digital Wallet",
    body: "Instant payout flows, savings visibility, and input payments keep cooperative cash cycles healthy.",
  },
  {
    title: "Farmer Micro-Loan System",
    body: "Loan access tied to sales behavior, farm profile, and cooperative performance expands growth capital.",
  },
  {
    title: "Logistics & Transport Network",
    body: "Farm-to-city movement is coordinated through request, assignment, transit tracking, and delivery proof.",
  },
  {
    title: "Warehouse & Storage System",
    body: "Booking, inventory records, cold-storage support, and warehouse receipts reduce forced low-price sales.",
  },
  {
    title: "Advisory & Knowledge Hub",
    body: "Weather-aware crop guidance, pest alerts, and fertilizer recommendations support better farm decisions.",
  },
];

const strategicFeatures = [
  "Smart Produce Marketplace",
  "AI Crop Price Intelligence",
  "Cooperative Digital Wallet",
  "Farmer Micro-Loan System",
  "Logistics & Produce Transport Network",
  "Warehouse & Storage System",
  "Agricultural Knowledge & Advisory Hub",
];

const slideHeaders = [
  {
    title: "DOS AGROLINK NIGERIA",
    subtitle: "Digital infrastructure for agricultural trade",
    tone: "primary",
  },
  {
    title: "Farmers do not lack production",
    subtitle: "They lack access to markets",
    tone: "insight",
  },
  {
    title: "How It Works",
    subtitle: "List produce -> buyer purchases -> payment secured",
    tone: "workflow",
  },
  {
    title: "Market Opportunity",
    subtitle: "30M+ farmers and a $400B+ African agriculture market",
    tone: "opportunity",
  },
];

const slideFooters = [
  "Direct to buyers. Transparent value for farmers.",
  "Secure payments with cooperative wallet rails.",
  "Reduced post-harvest loss through logistics + storage.",
  "Empowering Africa's agricultural future.",
];

export default function Home() {
  return (
    <main className="landing-page">
      <section className="hero-block">
        <p className="section-kicker">DO IT SMART</p>
        <h1>The Operating System for African Agriculture</h1>
        <div className="soil-line" aria-hidden="true" />

        <article className="hero-highlight">
          <p className="section-kicker">OUR VISION</p>
          <h2>A connected, Sustainable African Agribusiness</h2>
          <p>
            DOS AGROLINK NIGERIA delivers a vibrant African agribusiness ecosystem where every farmer, processor,
            and stakeholder thrives. We connect through the right information, shorten uncertainty in production,
            and foster transparent market access to amplify food security, economic empowerment, and environmental
            balance across the continent.
          </p>
        </article>
      </section>

      <section className="audience-block">
        <p className="section-kicker">VALUE</p>
        <h2>From Data to Decisions, From Farm to Fork</h2>
        <p className="section-intro">
          DOS AGROLINK NIGERIA transforms fragmented agriculture into connected outcomes for teams, processors, and investors.
          One trusted flow from source to service.
        </p>

        <div className="audience-grid">
          {audienceCards.map((card) => (
            <article className="audience-card" key={card.title}>
              <div className={`audience-image ${card.imageClass}`} aria-hidden="true">
                <div className="portrait-mark" />
              </div>
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="story-block">
        <p className="section-kicker">REAL</p>
        <h2>We built DOS AGROLINK NIGERIA because we&apos;ve been in your shoes!</h2>
        <p className="section-intro">
          Our journey did not start with a business plan. It began with shared reality. We have stood in the fields,
          walked the markets, and built in uncertainty. This is why our platform is designed around trust, visibility,
          and financial access.
        </p>

        <div className="story-grid">
          {painPoints.map((point) => (
            <article className={`story-card ${point.tone}`} key={point.title}>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="strategy-block">
        <p className="section-kicker">CAPABILITIES</p>
        <h2>Built to Solve Real Farmer Problems Across Nigeria</h2>
        <p className="section-intro">
          Our platform is designed as a full agricultural ecosystem where farmers sell produce, get fair prices,
          access financing, move goods efficiently, reduce post-harvest losses, and make better decisions with trusted data.
        </p>

        <div className="strategy-grid">
          {strategicFeatures.map((feature, index) => (
            <article className="strategy-card" key={feature}>
              <span>{index + 1}</span>
              <h3>{feature}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="product-banner">
        <div>
          <h2>Access premium market with our product.</h2>
          <p>
            The process to set things up can feel complex and confusing. We simplify your path with tools that connect
            finance, operations, and market visibility in one ecosystem.
          </p>
          <Link href="/marketplace" className="cta-link">
            Explore Agtrail
          </Link>
        </div>
        <p className="banner-mark">Agtrail...</p>
      </section>

      <section className="faq-block">
        <p className="section-kicker">FAQs</p>
        <h2>Frequently Asked Questions</h2>
        <p className="section-intro">
          DOS AGROLINK NIGERIA welcomes inquiries from farmers, processors, agribusinesses, and institutions.
        </p>

        <div className="faq-grid">
          {faqs.map((question, index) => (
            <details className={`faq-item ${index === faqs.length - 1 ? "faq-item-wide" : ""}`} key={question}>
              <summary>{question}</summary>
              <p>
                Our team will guide you through onboarding, product fit, and partnership models based on your goals.
              </p>
            </details>
          ))}
        </div>
      </section>

      <section className="capabilities-block">
        <p className="section-kicker">STRATEGIC CAPABILITIES</p>
        <h2>Built to Solve Real Farmer Problems Across Nigeria</h2>
        <p className="section-intro">
          DOS AGROLINK NIGERIA is built as a complete ecosystem connecting production, finance, logistics,
          storage, and advisory intelligence in one trusted platform.
        </p>

        <div className="capabilities-grid">
          {strategicCapabilities.map((item) => (
            <article key={item.title} className="capability-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="slide-kit-block">
        <p className="section-kicker">SLIDE KIT</p>
        <h2>Presentation Header Banners & Vision Footers</h2>
        <p className="section-intro">
          Ready-to-use banner and footer styles for your pitch deck, aligned to the DOS AGROLINK NIGERIA
          visual identity and platform vision.
        </p>

        <div className="slide-header-grid">
          {slideHeaders.map((item) => (
            <article key={item.title} className={`slide-header-card ${item.tone}`}>
              <Image src={dosLogo} alt="DOS AGROLINK NIGERIA mark" width={44} height={44} className="slide-mark" />
              <h3>{item.title}</h3>
              <p>{item.subtitle}</p>
              <div className="slide-gold-wave" aria-hidden="true" />
            </article>
          ))}
        </div>

        <div className="slide-footer-grid">
          {slideFooters.map((line) => (
            <div key={line} className="vision-footer-strip">
              <span>DOS AGROLINK NIGERIA</span>
              <p>{line}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <Image src={dosLogo} alt="DOS AGROLINK NIGERIA logo" width={50} height={50} className="footer-logo" />
          <h3>Bring Verifiable Truth to Your Chain?</h3>
          <Link href="/contact" className="cta-link">
            Talk to us
          </Link>
        </div>

        <div className="footer-links">
          <h4>Visit Us</h4>
          <p>Home</p>
          <p>About Us</p>
          <p>Blog</p>
          <p>Agtrail</p>
          <p>Contact Us</p>
        </div>

        <div className="footer-contact">
          <h4>Reach Out</h4>
          <p>+234 806 1139 719</p>
          <p>info@dosagrolinknigeria.com</p>
          <form className="newsletter-form" action="#">
            <input type="email" placeholder="Enter your email address" aria-label="Email address" />
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="footer-bottom">
          <p>DOS AGROLINK NIGERIA</p>
          <div>
            <a href="#">Privacy Policy</a>
            <a href="#">Refund Policy</a>
            <a href="#">Terms and Conditions</a>
          </div>
          <div>
            <a href="#">LinkedIn</a>
            <a href="#">Instagram</a>
            <a href="#">X</a>
            <a href="#">Facebook</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
