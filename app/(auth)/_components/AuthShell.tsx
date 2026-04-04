import Image from "next/image";
import type { ReactNode } from "react";
import dosLogo from "../../../dos logo.jpg";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bullets: string[];
  imageA: {
    src: string;
    alt: string;
  };
  imageB: {
    src: string;
    alt: string;
  };
  children: ReactNode;
};

export default function AuthShell({ eyebrow, title, subtitle, bullets, imageA, imageB, children }: AuthShellProps) {
  return (
    <main className="auth-shell-root mx-auto min-h-[calc(100vh-6rem)] w-full max-w-5xl py-6 sm:py-10">
      <div className="auth-shell-backdrop" aria-hidden="true" />
      <section className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr]">
        <aside className="auth-shell-panel relative overflow-hidden rounded-2xl border border-emerald-900/40 bg-[linear-gradient(145deg,#0b2f1a_0%,#12562f_53%,#1f7a44_100%)] p-6 text-emerald-50 shadow-[0_18px_46px_rgba(14,59,35,0.35)] sm:p-7">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-amber-300/20 blur-2xl" />
          <div className="absolute -bottom-24 -left-8 h-64 w-64 rounded-full bg-emerald-300/20 blur-2xl" />

          <div className="relative z-10 grid h-full gap-5">
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/20 bg-white/8 px-3 py-2">
              <Image src={dosLogo} alt="DOS AGROLINK NIGERIA" className="h-8 w-8 rounded-full border border-white/35 object-cover" />
              <p className="m-0 text-[11px] font-semibold tracking-[0.14em] text-emerald-100">DOS AGROLINK NIGERIA</p>
            </div>

            <div>
              <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-100/90">{eyebrow}</p>
              <h1 className="m-0 mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h1>
              <p className="mb-0 mt-2 max-w-md text-sm text-emerald-100/95">{subtitle}</p>
            </div>

            <div className="grid gap-3 rounded-xl border border-white/20 bg-black/10 p-4 text-sm text-emerald-100">
              {bullets.map((bullet) => (
                <p key={bullet} className="m-0">
                  {bullet}
                </p>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="relative h-32 overflow-hidden rounded-xl border border-white/25 bg-white/10">
                <Image src={imageA.src} alt={imageA.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 260px" />
              </div>
              <div className="relative h-32 overflow-hidden rounded-xl border border-white/25 bg-white/10">
                <Image src={imageB.src} alt={imageB.alt} fill className="object-cover" sizes="(max-width: 640px) 100vw, 260px" />
              </div>
            </div>
          </div>
        </aside>

        <div className="auth-shell-card">{children}</div>
      </section>
    </main>
  );
}
