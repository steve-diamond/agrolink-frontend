"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import API from "@/services/api";

type Opportunity = {
  _id: string;
  title: string;
  roiPct: number;
  durationMonths: number;
};

type InvestorOverviewResponse = {
  status: string;
  data?: {
    highlights?: {
      totalInvested?: number;
      estimatedReturn?: number;
      activeProjects?: number;
    };
    opportunities?: Opportunity[];
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

export default function InvestorPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [highlights, setHighlights] = useState({
    totalInvested: 0,
    estimatedReturn: 0,
    activeProjects: 0,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get<InvestorOverviewResponse>("/api/investor/overview");
        if (!mounted) return;

        const nextHighlights = {
          totalInvested: Number(res.data?.highlights?.totalInvested ?? 0),
          estimatedReturn: Number(res.data?.highlights?.estimatedReturn ?? 0),
          activeProjects: Number(res.data?.highlights?.activeProjects ?? 0),
        };

        setHighlights(nextHighlights);
        setOpportunities(Array.isArray(res.data?.opportunities) ? res.data!.opportunities! : []);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load investor data.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const metricCards = useMemo(
    () => [
      { label: "Total Investment", value: formatCurrency(highlights.totalInvested) },
      { label: "Estimated Return", value: formatCurrency(highlights.estimatedReturn) },
      { label: "Active Projects", value: String(highlights.activeProjects) },
    ],
    [highlights]
  );

  return (
    <main className="dash-page investor-page">
      <section className="dash-hero investor-hero">
        <Image src="/agropro/images/banner.jpg" alt="Investor dashboard" fill className="dash-hero-bg" sizes="100vw" />
        <div className="dash-hero-overlay" />
        <div className="dash-hero-content">
          <p className="dash-kicker">DosAgrolink Investor Desk</p>
          <h1>Investor Portfolio Overview</h1>
          <p>Track verified opportunities and monitor your active agricultural investments.</p>
        </div>
      </section>

      <section className="dash-kpi-grid" aria-label="Investor metrics">
        {metricCards.map((item) => (
          <article key={item.label} className="dash-kpi">
            <h2>{item.label}</h2>
            <strong>{item.value}</strong>
          </article>
        ))}
      </section>

      {error ? (
        <section className="dash-card">
          <h3>Unable to Load Investor Data</h3>
          <p className="dash-muted">{error}</p>
        </section>
      ) : null}

      <section className="dash-card">
        <div className="dash-card-head">
          <h3>Open Opportunities</h3>
          <Link href="/invest/sponsor">View all</Link>
        </div>

        {loading ? (
          <p className="dash-muted">Loading opportunities...</p>
        ) : opportunities.length === 0 ? (
          <p className="dash-muted">No active campaigns are available right now.</p>
        ) : (
          <div className="dash-opportunity-grid">
            {opportunities.map((item) => (
              <article key={item._id} className="dash-opportunity-card">
                <h4>{item.title}</h4>
                <p>ROI: {Number(item.roiPct).toFixed(1)}%</p>
                <p>Duration: {item.durationMonths} Months</p>
                <Link href={`/invest/${item._id}`} className="dash-btn-primary">Invest Now</Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dash-links" aria-label="Quick links">
        <Link href="/dashboard">Farmer Dashboard</Link>
        <Link href="/logistics">Logistics</Link>
        <Link href="/warehouse">Warehouse</Link>
        <Link href="/admin/login">Admin</Link>
      </section>
    </main>
  );
}
