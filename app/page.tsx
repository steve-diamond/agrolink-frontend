"use client";

import Link from "next/link";
import Image from "next/image";
import dosLogo from "../dos logo.jpg";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

export default function Home() {
  const { copy } = useLocalizedCopy();

  return (
    <main className="grid gap-4">
      <section className="card bg-gradient-to-br from-green-950 via-green-900 to-green-700 p-4 text-green-50">
        <div className="flex items-center gap-3">
          <Image src={dosLogo} alt="Dos AgroLink logo" width={54} height={54} className="rounded-lg border border-white/40" />
          <div>
            <h1 className="m-0 text-2xl font-bold">{copy.appName}</h1>
            <p className="mb-0 mt-1 text-sm text-green-100">{copy.tagline}</p>
          </div>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          <p className="m-0 rounded-lg bg-white/10 px-3 py-2 text-sm">{copy.weatherAlert}: Heavy rain by 4PM</p>
          <p className="m-0 rounded-lg bg-white/10 px-3 py-2 text-sm">{copy.maizePrice}: NGN 54,500 / 100kg</p>
          <a href="tel:+2348030001020" className="m-0 rounded-lg bg-white/10 px-3 py-2 text-sm no-underline">{copy.callAgent}</a>
        </div>
        <p className="mb-0 mt-2 text-xs text-green-100">{copy.networkLowData}</p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/marketplace" className="card p-4 font-semibold text-green-950 no-underline">{copy.marketHub}</Link>
        <Link href="/farmer/upload" className="card p-4 font-semibold text-green-950 no-underline">{copy.inputShop}</Link>
        <Link href="/dashboard" className="card p-4 font-semibold text-green-950 no-underline">{copy.myFarm}</Link>
        <Link href="/orders" className="card p-4 font-semibold text-green-950 no-underline">{copy.finance}</Link>
      </section>

      <section className="card grid gap-2 p-4 sm:grid-cols-3">
        <button className="btn-primary touch-target">{copy.callAgent}</button>
        <button className="btn-secondary touch-target">{copy.listenNow}</button>
        <button className="btn-secondary touch-target">{copy.syncOffline}</button>
      </section>
    </main>
  );
}
