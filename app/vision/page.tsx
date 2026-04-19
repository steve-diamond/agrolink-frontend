import Link from "next/link";
import Image from "next/image";
import { visionPoints } from "@lib/visionPoints";

export default function VisionPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-4 sm:gap-6 py-4 sm:py-6 px-2 sm:px-0">
      <section className="card p-4 sm:p-6 w-full flex items-center gap-3 mb-4">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={44} height={44} className="rounded-lg shadow" priority />
        <span className="text-xl font-extrabold text-green-900 tracking-tight">DOS AGROLINK VISION</span>
        <p className="text-xs font-bold tracking-[0.2em] text-amber-700">DOS AGROLINK VISION</p>
        <h1 className="mt-2 text-3xl font-extrabold text-green-900 sm:text-4xl">Our 7-Point Vision in Action</h1>
        <p className="mt-3 max-w-4xl text-sm text-slate-700 sm:text-base">
          Explore how each strategic pillar creates measurable value for farmers, buyers, cooperatives, and agribusiness partners.
          Every vision point includes who benefits, how we deliver, and how to engage.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/join-us" className="btn-primary inline-flex items-center px-4 py-2 no-underline">Join Us</Link>
          <Link href="/marketplace" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">
            Explore Marketplace
          </Link>
        </div>
      </section>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full">
        {visionPoints.map((item, index) => (
          <article key={item.slug} className="card overflow-hidden">
            <div className="relative min-h-42.5">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="(max-width: 980px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-linear-to-t from-green-950/70 to-transparent" />
              <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-1 text-xs font-extrabold text-green-900">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <div className="p-4">
              <h2 className="text-2xl font-extrabold text-green-900">{item.title}</h2>
              <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/vision/${item.slug}`} className="btn-primary inline-flex items-center px-4 py-2 no-underline">Read More</Link>
                <Link href="/join-us" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">
                  Join Us
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
