"use client";

import { useEffect, useMemo, useState } from "react";
import "../styles/custom.css";
// Removed duplicate import
import Link from "next/link";
import FarmerLogoCarousel from "../../components/FarmerLogoCarousel";
import Image from "next/image";
import { getStoredLanguage, listenToLanguageChanges, type UiLanguage } from "@services/uiLanguage";

const valueCards = [
  {
    icon: "🌱",
    title: "Agri Loans",
    desc: "Flexible working capital and seasonal credit designed for productive farms.",
    detail: "Fast review • Transparent repayment",
  },
  {
    icon: "🚚",
    title: "Logistics Support",
    desc: "Coordinated pickup and route visibility from farm gate to buyer destination.",
    detail: "Tracked delivery • Lower spoilage risk",
  },
  {
    icon: "🏠",
    title: "Warehousing",
    desc: "Quality-assured storage that protects value until market timing is right.",
    detail: "Verified inventory • Receipt-ready records",
  },
];
const trustItems = [
  {
    icon: "🤝",
    title: "Trusted Partnerships",
    desc: "We collaborate with cooperatives, institutions, and communities to scale impact.",
    metric: "50+ ecosystem partners",
  },
  {
    icon: "🔒",
    title: "Secure Payments",
    desc: "Protected transaction rails and audit trails ensure confidence across every trade.",
    metric: "End-to-end payment traceability",
  },
  {
    icon: "📊",
    title: "Proven Results",
    desc: "Data-backed execution improves farmer outcomes, buyer reliability, and market access.",
    metric: "Measured growth across value chains",
  },
];
const heroSlides = [
  {
    image: "/agropro/images/banner.jpg",
    title: {
      en: "Empowering Nigerian Farmers & Investors",
      ha: "Karfafa manoma da masu zuba jari na Najeriya",
      yo: "Mimu agbara awon agbe ati awon oludokoowo ni Naijiria",
      ig: "Inye ike ndi oru ugbo na ndi itinye ego na Naijiria",
      pcm: "Empower Nigerian farmers and investors",
    },
    subtitle: {
      en: "Grow, Trade, Invest - All in One Platform",
      ha: "Noma, ciniki, saka jari - duka a wuri guda",
      yo: "Dagba, ta, nawo - gbogbo e ninu pẹpẹ kan",
      ig: "Kowa, ree, tinye ego - n'otu ebe",
      pcm: "Grow, trade, invest - all for one platform",
    },
    ctaPrimary: { label: { en: "Enter Marketplace", ha: "Shiga kasuwa", yo: "Wo Oja", ig: "Banye ahia", pcm: "Enter market" }, href: "/marketplace" },
    ctaSecondary: { label: { en: "Join Our Network", ha: "Shiga cibiyar mu", yo: "Darapo mo wa", ig: "Soro n'otu anyi", pcm: "Join network" }, href: "/join-us" },
  },
  {
    image: "/agropro/images/BannerMaize.jpg",
    title: {
      en: "Transparent Market Access for Every Harvest",
      ha: "Bayyanannen shiga kasuwa ga kowanne girbi",
      yo: "Wiwọle oja to han gbangba fun gbogbo ikore",
      ig: "Nweta ahia doro anya maka owuwe ihe ubi niile",
      pcm: "Clear market access for every harvest",
    },
    subtitle: {
      en: "We connect producers to verified buyers with fair pricing intelligence.",
      ha: "Muna hada masu noma da masu saye tabbatattu da farashi adalci.",
      yo: "A so awọn olupese pọ mọ awọn onra to jẹrisi pelu iye to tọ.",
      ig: "Anyi na-ejikota ndi na-emepụta na ndi na-azu ihe akwadoro.",
      pcm: "We connect producers to verified buyers with fair prices.",
    },
    ctaPrimary: { label: { en: "Explore Prices", ha: "Duba farashi", yo: "Wo iye", ig: "Lelee onu ahia", pcm: "Check prices" }, href: "/marketplace" },
    ctaSecondary: { label: { en: "View Vision", ha: "Duba hangen nesa", yo: "Wo iran", ig: "Lelee ọhụụ", pcm: "View vision" }, href: "/vision" },
  },
  {
    image: "/agropro/images/cassava.jpg",
    title: {
      en: "From Farm Gate to National Value Chains",
      ha: "Daga gona zuwa manyan sarkokin daraja",
      yo: "Lati ẹnu-ọna oko de awọn pq iye kari orilẹ-ede",
      ig: "Site n'uzo ubi ruo n'usoro uru mba",
      pcm: "From farm gate to national value chains",
    },
    subtitle: {
      en: "Digitized aggregation helps smallholders scale supply with confidence.",
      ha: "Tattara kaya ta dijital na taimaka wa kananan manoma su bunkasa.",
      yo: "Ikojọpọ dijita n ran awọn agbe kekere lọwọ lati gbooro ipese.",
      ig: "Nchịkọta dijitalu na-enyere obere ndi oru ugbo ka ha too.",
      pcm: "Digital aggregation helps small farmers scale supply.",
    },
    ctaPrimary: { label: { en: "See Opportunities", ha: "Ga dama", yo: "Wo anfani", ig: "Hu ohere", pcm: "See opportunities" }, href: "/investor" },
    ctaSecondary: { label: { en: "Partner With Us", ha: "Yi hadin gwiwa", yo: "Sopọ pelu wa", ig: "Soro rụọ ọrụ", pcm: "Partner with us" }, href: "/join-us" },
  },
  {
    image: "/agropro/images/chicken.jpg",
    title: {
      en: "Reliable Food Systems, Built With Data",
      ha: "Tsarin abinci mai dogaro da bayanai",
      yo: "Eto ounje to le lori data",
      ig: "Usoro nri a pụrụ ịdabere na ya, nke data wuru",
      pcm: "Reliable food systems built with data",
    },
    subtitle: {
      en: "Our platform strengthens planning, quality, and resilient production cycles.",
      ha: "Dandalinmu na karfafa tsari, inganci da juriya a samarwa.",
      yo: "Pẹpẹ wa n mu eto, didara ati iṣelọpọ to lagbara pọ si.",
      ig: "Ikpo okwu anyi na-eme ka atumatu, ogo na mmepụta sie ike.",
      pcm: "Our platform strengthens planning and quality output cycles.",
    },
    ctaPrimary: { label: { en: "Farmer Dashboard", ha: "Allon manomi", yo: "Dasibodu agbe", ig: "Dashboard onye oru ugbo", pcm: "Farmer dashboard" }, href: "/dashboard" },
    ctaSecondary: { label: { en: "Read Stories", ha: "Karanta labarai", yo: "Ka itan", ig: "Gụọ akụkọ", pcm: "Read stories" }, href: "/vision" },
  },
  {
    image: "/agropro/images/fish.jpeg",
    title: {
      en: "Inclusive Finance That Powers Productivity",
      ha: "Tallafi na kudi mai hada kowa don kara yawan amfanin gona",
      yo: "Inawo to gba gbogbo eniyan laaye fun iṣelọpọ to ga",
      ig: "Ego gụnyere onye ọ bụla na-akwalite mmepụta",
      pcm: "Inclusive finance for stronger productivity",
    },
    subtitle: {
      en: "Credit, wallet rails, and repayment visibility unlock sustainable growth.",
      ha: "Bashi da walat na dijital suna bude hanyar ci gaba mai dorewa.",
      yo: "Kirẹditi ati apamọwọ dijita n ṣii idagbasoke alagbero.",
      ig: "Ego mgbazinye na wallet dijitalu na-emepe uto na-adịgide adịgide.",
      pcm: "Credit and wallet rails unlock sustainable growth.",
    },
    ctaPrimary: { label: { en: "Apply for Finance", ha: "Nemi kudi", yo: "Beere inawo", ig: "Tinye maka ego", pcm: "Apply for finance" }, href: "/loan-application" },
    ctaSecondary: { label: { en: "Investor Desk", ha: "Ofishin masu zuba jari", yo: "Tabili oludokoowo", ig: "Desk onye itinye ego", pcm: "Investor desk" }, href: "/investor" },
  },
  {
    image: "/agropro/images/plantain.jpg",
    title: {
      en: "Integrated Logistics and Storage Infrastructure",
      ha: "Hadin kai na jigila da ajiyar kaya",
      yo: "Eto iṣipopada ati ibi ipamọ to so pọ",
      ig: "Nhazi jikọtara njem na nchekwa",
      pcm: "Integrated logistics and storage infrastructure",
    },
    subtitle: {
      en: "Reduce post-harvest losses with traceable movement and warehouse support.",
      ha: "Rage asarar bayan girbi ta hanyar jigilar da ake iya bin sawu.",
      yo: "Din adanu lẹhin ikore ku pẹlu gbigbe to le tọpinpin.",
      ig: "Belata mfu owuwe ihe ubi site na mmegharị a na-enyocha.",
      pcm: "Cut post-harvest losses with traceable movement and storage.",
    },
    ctaPrimary: { label: { en: "Track Logistics", ha: "Bibi jigila", yo: "Tọpa gbigbe", ig: "Soro njem", pcm: "Track logistics" }, href: "/logistics" },
    ctaSecondary: { label: { en: "Book Storage", ha: "Ajiye wuri", yo: "Buki ibi ipamo", ig: "Debe nchekwa", pcm: "Book storage" }, href: "/warehouse" },
  },
  {
    image: "/agropro/images/ugu.jpg",
    title: {
      en: "A Shared Vision for Prosperous Rural Economies",
      ha: "Hangen nesa daya don bunkasar tattalin arzikin karkara",
      yo: "Iran apapọ fun eto-ọrọ igberiko to ni ilọsiwaju",
      ig: "Ohu otu maka uto akụnụba ime obodo",
      pcm: "Shared vision for prosperous rural economies",
    },
    subtitle: {
      en: "We build trust between farmers, buyers, and institutions for long-term impact.",
      ha: "Muna gina amincewa tsakanin manoma, masu saye da cibiyoyi.",
      yo: "A n kọ igbẹkẹle laarin awọn agbe, onra ati awọn ile-iṣẹ.",
      ig: "Anyị na-ewu ntụkwasị obi n'etiti ndị ọrụ ugbo na ụlọọrụ.",
      pcm: "We build trust between farmers, buyers, and institutions.",
    },
    ctaPrimary: { label: { en: "About DosAgrolink", ha: "Game da mu", yo: "Nipa wa", ig: "Banyere anyi", pcm: "About us" }, href: "/about-us" },
    ctaSecondary: { label: { en: "Become a Partner", ha: "Zama abokin hulda", yo: "Di alabaṣepọ", ig: "Bụrụ onye mmekọ", pcm: "Become partner" }, href: "/join-us" },
  },
];

export default function Home() {
  const [language, setLanguage] = useState<UiLanguage>("en");

  useEffect(() => {
    setLanguage(getStoredLanguage());
    const detach = listenToLanguageChanges((next) => setLanguage(next));
    return detach;
  }, []);

  const localizedHeroSlides = useMemo(
    () =>
      heroSlides.map((slide) => ({
        image: slide.image,
        title: slide.title[language] || slide.title.en,
        subtitle: slide.subtitle[language] || slide.subtitle.en,
        ctaPrimary: { href: slide.ctaPrimary.href, label: slide.ctaPrimary.label[language] || slide.ctaPrimary.label.en },
        ctaSecondary: { href: slide.ctaSecondary.href, label: slide.ctaSecondary.label[language] || slide.ctaSecondary.label.en },
      })),
    [language]
  );

  return (
    <main className="dos-homepage px-2 sm:px-0 py-4 sm:py-6 grid gap-4 sm:gap-6 w-full">
      <header className="flex items-center gap-3 mb-4">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={56} height={56} className="rounded-xl shadow" priority />
        <span className="text-2xl font-extrabold text-green-900 tracking-tight">DOS AGROLINK</span>
      </header>
      <section className="dos-home-card">
        <section className="dos-hero">
          <div className="dos-hero-carousel" aria-label="DosAgrolink vision highlights">
            {localizedHeroSlides.map((slide, index) => (
              <article
                key={slide.image}
                className={`dos-hero-slide custom-article custom-animation-delay-${index}`}
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
                  <div className="dos-hero-caption-shell">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <div className="dos-hero-actions">
                      <Link href={slide.ctaPrimary.href} className="dos-btn-green">{slide.ctaPrimary.label}</Link>
                      <Link href={slide.ctaSecondary.href} className="dos-btn-cream">{slide.ctaSecondary.label}</Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            <div className="dos-hero-progress" aria-hidden="true">
              {localizedHeroSlides.map((slide, index) => (
                <span key={`${slide.image}-${index}`} className={`custom-animation-delay-${index}`} />
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
                <small>{item.detail}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="dos-why" aria-label="Why choose us">
          <h2>Why Choose Us?</h2>
          <p className="dos-why-intro">A purpose-built agricultural platform combining trust, technology, and execution excellence.</p>
          <div className="dos-why-grid">
            {trustItems.map((item) => (
              <article key={item.title} className="dos-why-item">
                <span className="dos-why-icon" aria-hidden="true">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <small>{item.metric}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="dos-story">
          <Image src="/agropro/images/chose.jpg" alt="Success stories" fill className="dos-story-bg" sizes="100vw" />
          <div className="dos-story-overlay" />
          <div className="dos-story-content">
            <p className="dos-story-kicker">Field Impact</p>
            <h2>Success Stories</h2>
            <div className="dos-story-quote-card">
              <blockquote>&quot;DosAgrolink helped me double my yield and secure better buyers in one season.&quot;</blockquote>
              <p>Adebayo, Ondo State • Maize Farmer</p>
            </div>
            <div className="dos-story-metrics" aria-label="Impact metrics">
              <span>2x Yield Improvement</span>
              <span>Verified Buyer Access</span>
              <span>Better Price Confidence</span>
            </div>
            <Link href="/vision" className="dos-btn-green">View More Stories</Link>
          </div>
        </section>

        <section className="dos-partners" aria-label="Partners">
          <div className="dos-partners-copy">
            <h2>Our Farmers & Partners</h2>
            <p className="dos-partners-intro">Trusted institutions and farmer communities powering inclusive agricultural growth across finance, logistics, and market access.</p>
          </div>
          <FarmerLogoCarousel />
          <p>In Partnership With Leading Farmer Networks</p>
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

      </section>
    </main>
  );
}
