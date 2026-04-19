import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { findVisionPointBySlug, visionPoints } from "@/lib/visionPoints";

type VisionDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return visionPoints.map((item) => ({ slug: item.slug }));
}

export default async function VisionDetailPage({ params }: VisionDetailPageProps) {
  const { slug } = await params;
  const point = findVisionPointBySlug(slug);

  if (!point) {
    notFound();
  }

  return (
    <main className="mx-auto grid max-w-6xl gap-4 sm:gap-6 py-4 sm:py-6 px-2 sm:px-0">
      <section className="card overflow-hidden w-full flex items-center gap-3 mb-4">
        <Image src="/dos-agrolink-logo.png" alt="DOS Agrolink Logo" width={44} height={44} className="rounded-lg shadow" priority />
        <span className="text-xl font-extrabold text-green-900 tracking-tight">DOS AGROLINK</span>
        <div className="relative min-h-62.5 sm:min-h-80">
          <Image src={point.image} alt={point.title} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-linear-to-r from-green-950/80 via-green-900/60 to-transparent" />
          <div className="relative z-10 max-w-3xl p-6 text-green-50 sm:p-8">
            <p className="text-xs font-bold tracking-[0.2em] text-amber-200">VISION POINT</p>
            <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">{point.title}</h1>
            <p className="mt-3 text-sm text-green-100 sm:text-base">{point.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/join-us" className="btn-primary inline-flex items-center px-4 py-2 no-underline">Join Us</Link>
              <Link href={point.furtherReadLink} className="inline-flex items-center rounded-full border border-white/55 px-4 py-2 text-sm font-bold text-white no-underline">
                Explore Related Module
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full">
        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">Who Benefits</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            {point.whoBenefits.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>

        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">How We Deliver</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            {point.howWeDeliver.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>

        <article className="card p-5">
          <h2 className="text-xl font-bold text-green-900">How To Engage</h2>
          <ul className="mt-3 grid gap-2 text-sm text-slate-700">
            {point.howToEngage.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card p-4 sm:p-5 w-full">
        <h2 className="text-2xl font-bold text-green-900">Take Action</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-700">
          Ready to benefit from {point.title}? Join the DOS AGROLINK ecosystem and connect your farm, cooperative,
          or agribusiness operation to transparent trade, logistics, finance, and intelligence workflows.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/join-us" className="btn-primary inline-flex items-center px-4 py-2 no-underline">Join Us</Link>
          <Link href="/vision" className="inline-flex items-center rounded-full border border-green-300 px-4 py-2 text-sm font-bold text-green-800 no-underline">
            Back to All Vision Points
          </Link>
        </div>
      </section>
    </main>
  );
}
