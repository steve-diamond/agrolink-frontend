"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type AgriNewsItem = {
  title: string;
  summary: string;
  link: string;
  source: string;
  topic: string;
  publishedAt: string;
  imageUrl?: string;
  videoUrl?: string;
};

type AgriNewsResponse = {
  updatedAt: string;
  items: AgriNewsItem[];
};

type LiveAgriNewsProps = {
  limit?: number;
  showSeeMoreLink?: boolean;
  showWelcomeCard?: boolean;
};

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

const toReadableDate = (iso: string) => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? "Just now"
    : new Intl.DateTimeFormat("en-NG", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
};

export default function LiveAgriNews({
  limit = 3,
  showSeeMoreLink = true,
  showWelcomeCard = true,
}: LiveAgriNewsProps) {
  const [payload, setPayload] = useState<AgriNewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const response = await fetch("/api/agri-news", { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as AgriNewsResponse;
      setPayload(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchNews();
    const timer = window.setInterval(() => {
      void fetchNews();
    }, REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  const items = useMemo(() => (payload?.items ?? []).slice(0, limit), [payload, limit]);

  return (
    <>
      {showWelcomeCard ? (
        <article className="ceo-welcome-card">
          <div className="ceo-welcome-layout">
            <div className="ceo-welcome-photo">
              <Image
                src="/agropro/images/ceo.jpg"
                alt="CEO of DOS AGROLINK NIGERIA"
                fill
                sizes="(max-width: 980px) 100vw, 260px"
                className="ceo-welcome-photo-img"
              />
            </div>

            <div className="ceo-welcome-content">
              <p className="ceo-welcome-kicker">Welcome Message from CEO</p>
              <h3>Welcome to Dos Agrolink Nigeria.</h3>
              <p>
                At Dos Agrolink, we believe the future of agriculture in Nigeria lies in empowering our farmers with the
                right tools, the right information, and the right connections.
              </p>
              <p>
                We understand daily challenges from unpredictable weather to fluctuating market prices and limited access
                to quality inputs. Our platform is built to be simple, reliable, and accessible, even in low-connectivity
                environments.
              </p>
              <ul>
                <li>Access real-time market prices to sell smarter.</li>
                <li>Get timely farm reminders and advisory support.</li>
                <li>Purchase subsidized farm inputs with ease.</li>
                <li>Connect directly with trusted agents and support services.</li>
              </ul>
              <p>
                Our mission is to bridge the gap between farmers and opportunity, using technology for growth,
                sustainability, and prosperity.
              </p>
              <p className="ceo-signature">Warm regards, CEO, Dos Agrolink Nigeria</p>
            </div>
          </div>
        </article>
      ) : null}

      <div className="live-news-header">
        <p className="section-kicker">LATEST FARM BUSINESS NEWS</p>
        <h2>Reliable updates on planting, pests, and market value chains</h2>
        <p className="section-intro">
          Curated from trusted agricultural and market sources, refreshed automatically for DOS AGROLINK members.
        </p>
        <div className="live-news-meta">
          <span>Auto refresh: every 10 minutes</span>
          <span>Last update: {payload ? toReadableDate(payload.updatedAt) : "Fetching..."}</span>
        </div>
      </div>

      <div className="latest-news-grid">
        {loading && items.length === 0 ? (
          <article className="latest-news-card latest-news-loading">Fetching latest market trends...</article>
        ) : null}

        {items.map((item) => (
          <article key={`${item.link}-${item.title}`} className="latest-news-card latest-news-live-card">
            {item.videoUrl ? (
              <div className="latest-news-video-wrap">
                <iframe
                  src={item.videoUrl}
                  title={item.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div
                className="latest-news-image-wrap latest-news-live-image"
                style={{ backgroundImage: `url('${item.imageUrl ?? "/agropro/images/news1.jpg"}')` }}
                role="img"
                aria-label={item.title}
              />
            )}

            <div className="latest-news-body">
              <span>{item.topic}</span>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="latest-news-actions">
                <small>{item.source} • {toReadableDate(item.publishedAt)}</small>
                <Link href={item.link} target="_blank" rel="noreferrer">
                  Further Read
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {showSeeMoreLink ? (
        <div className="live-news-cta-row">
          <Link href="/news">See More Recent News</Link>
          <Link href="/join-us">Join Us</Link>
        </div>
      ) : null}
    </>
  );
}
