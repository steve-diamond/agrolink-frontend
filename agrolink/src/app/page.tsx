"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAppShell } from "@/components/AppShell";
import { UI_COPY } from "@/lib/i18n";

type Copy = {
  heroTitle: string;
  heroSubtitle: string;
  weather: string;
  maize: string;
  call: string;
  marketHub: string;
  inputShop: string;
  myFarm: string;
  finance: string;
  principleTitle: string;
  principleItems: string[];
};

const CONTENT: Record<keyof typeof UI_COPY, Copy> = {
  en: {
    heroTitle: "Dos AgroLink Nigeria",
    heroSubtitle: "Helping smallholder farmers earn better with trusted market access, farm support, and digital finance.",
    weather: "Weather Alert",
    maize: "Maize Price",
    call: "Call Field Agent",
    marketHub: "Market Hub",
    inputShop: "Input Shop",
    myFarm: "My Farm",
    finance: "Financial Services",
    principleTitle: "Our Product Intention",
    principleItems: [
      "Offline-first for low-connectivity communities",
      "Voice-assisted for low-literacy accessibility",
      "Transparent pricing to build farmer trust",
      "Fast support with one-tap agent calls",
      "Local language support for inclusive adoption",
    ],
  },
  ha: {
    heroTitle: "Dos AgroLink Najeriya",
    heroSubtitle: "Muna taimaka wa kananan manoma su samu karin riba ta kasuwa mai aminci da tallafin gona.",
    weather: "Sanarwar Yanayi",
    maize: "Farashin Masara",
    call: "Kira Wakilin Gona",
    marketHub: "Cibiyar Kasuwa",
    inputShop: "Shagon Kayan Gona",
    myFarm: "Gonata",
    finance: "Ayyukan Kudi",
    principleTitle: "Manufar Samfurinmu",
    principleItems: [
      "Offline-first don yankunan da intanet ke rauni",
      "Taimakon murya don masu karancin ilimi",
      "Farashi mai gaskiya domin amincewar manoma",
      "Taimako cikin sauri ta kira daya",
      "Harsuna na gida domin kowa ya iya amfani",
    ],
  },
  yo: {
    heroTitle: "Dos AgroLink Naijiria",
    heroSubtitle: "A n ran awon agbe kekere lowo lati ta dara ati lati ri iranlowo oko ati eto inawo.",
    weather: "Ikilo Oju Ojo",
    maize: "Iye Oka",
    call: "Pe Asoju Oko",
    marketHub: "Ibi Oja",
    inputShop: "Ile Itaja Input",
    myFarm: "Oko Mi",
    finance: "Ise Isuna",
    principleTitle: "Ero Pataki Wa",
    principleItems: [
      "Offline-first fun ibi ti netiwoki ko lagbara",
      "Iranlowo ohun fun awon ti kika ko rorun",
      "Iye to han gedegbe fun igbekele",
      "Atilẹyin kiakia pelu ipe kan",
      "Atilẹyin ede abinibi fun gbogbo eniyan",
    ],
  },
  ig: {
    heroTitle: "Dos AgroLink Naijiria",
    heroSubtitle: "Anyi na-enyere obere ndi oru ugbo aka inweta uru site na ahia a pụrụ ịtụkwasị obi na nkwado ugbo.",
    weather: "Nkwuputa Ihuigwe",
    maize: "Ahia Oka",
    call: "Kpoo Onye Nnọchi",
    marketHub: "Ebe Ahia",
    inputShop: "Ulo Ahia Input",
    myFarm: "Ubi M",
    finance: "Orumaka Ego",
    principleTitle: "Ebumnuche Ngwa Ahia Anyi",
    principleItems: [
      "Offline-first maka ebe netwọk adịghị ike",
      "Nkwado olu maka nghota dị mfe",
      "Ahia doro anya maka ntụkwasị obi",
      "Nkwado ngwa ngwa site na otu oku",
      "Nkwado asusu obodo maka onye obula",
    ],
  },
  pcm: {
    heroTitle: "Dos AgroLink Naija",
    heroSubtitle: "We dey help small farmers make better money with correct market, farm support and finance.",
    weather: "Weather Alert",
    maize: "Maize Price",
    call: "Call Field Agent",
    marketHub: "Market Hub",
    inputShop: "Input Shop",
    myFarm: "My Farm",
    finance: "Money Services",
    principleTitle: "Our Main Intention",
    principleItems: [
      "Offline-first for places wey network no strong",
      "Voice help for people wey reading hard",
      "Clear price to build trust",
      "Quick support with one tap call",
      "Local language support for everybody",
    ],
  },
};

export default function Home() {
  const { language, user } = useAppShell();
  const copy = useMemo(() => CONTENT[language], [language]);

  return (
    <main className="page">
      <header className="subHeader">
        <div>
          <p className="brandOverline">Vision Statement</p>
          <h1>{copy.heroTitle}</h1>
        </div>
      </header>

      <section className="hero card">
        <p>{copy.heroSubtitle}</p>
        <div className="stats">
          <article>
            <span>{copy.weather}</span>
            <strong>Heavy rain by 4PM</strong>
          </article>
          <article>
            <span>{copy.maize}</span>
            <strong>NGN 54,500 / 100kg</strong>
          </article>
          <article>
            <span>Support</span>
            <a href="tel:+2348030001020">{copy.call}</a>
          </article>
        </div>
      </section>

      <section className="quickLinks">
        <Link className="card action" href="/market-hub">{copy.marketHub}</Link>
        <Link className="card action" href="/input-shop">{copy.inputShop}</Link>
        <Link className="card action" href="/my-farm">{copy.myFarm}</Link>
        <Link className="card action" href="/financial-services">{copy.finance}</Link>
      </section>

      <section className="card intention">
        <h2>Take Action</h2>
        <div className="ctaRow">
          <a href="tel:+2348030001020" className="btn btnPrimary">{copy.call}</a>
          <Link href="/market-hub" className="btn btnSecondary">Open Price Board</Link>
          <Link href={user ? "/my-farm" : "/login"} className="btn btnSecondary">{user ? "Open Dashboard" : "Login to Continue"}</Link>
        </div>
      </section>

      <section className="card intention">
        <h2>{copy.principleTitle}</h2>
        <ul>
          {copy.principleItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
