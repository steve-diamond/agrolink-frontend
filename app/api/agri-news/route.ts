import { NextResponse } from "next/server";

type FeedSource = {
  label: string;
  url: string;
  topic: string;
};

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

const FEED_SOURCES: FeedSource[] = [
  {
    label: "FAO",
    url: "https://www.fao.org/news/rss/en/",
    topic: "Planting & policy",
  },
  {
    label: "IITA",
    url: "https://www.iita.org/feed/",
    topic: "Pests & resilience",
  },
  {
    label: "CIMMYT",
    url: "https://www.cimmyt.org/feed/",
    topic: "Seeds & crop systems",
  },
  {
    label: "Market Watch",
    url: "https://news.google.com/rss/search?q=Nigeria+agriculture+market+prices+crop+pests&hl=en-NG&gl=NG&ceid=NG:en",
    topic: "Market value chain",
  },
];

const FALLBACK_ITEMS: AgriNewsItem[] = [
  {
    title: "Planting Season Outlook: Timing Rainfall and Input Planning",
    summary:
      "DOS AGROLINK advisory team recommends staggered planting windows and cooperative input pooling to reduce weather shocks.",
    link: "https://www.fao.org/home/en",
    source: "FAO",
    topic: "Planting guidance",
    publishedAt: new Date().toISOString(),
    imageUrl: "/agropro/images/news1.jpg",
  },
  {
    title: "Current Pest Alerts: Fall Armyworm Monitoring Across Maize Belts",
    summary:
      "Farmers are advised to scout early, report outbreaks quickly, and use approved integrated pest management methods.",
    link: "https://www.iita.org/",
    source: "IITA",
    topic: "Pest alerts",
    publishedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    imageUrl: "/agropro/images/news2.jpg",
  },
  {
    title: "Value Chain Brief: Grain Movement, Storage, and Price Behavior",
    summary:
      "Warehouse access and coordinated logistics continue to influence farm-gate and urban market spreads in key crop corridors.",
    link: "https://www.cimmyt.org/",
    source: "CIMMYT",
    topic: "Market value chain",
    publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    imageUrl: "/agropro/images/news3.jpg",
  },
  {
    title: "Video Briefing: Building Reliable Agribusiness Intelligence Systems",
    summary:
      "A practical video update on market intelligence, resilient planting decisions, and sustainable farm profitability.",
    link: "https://www.youtube.com/watch?v=H9L8JYb4Bq8",
    source: "YouTube",
    topic: "Video insight",
    publishedAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    imageUrl: "/agropro/images/blog1.jpg",
    videoUrl: "https://www.youtube.com/embed/H9L8JYb4Bq8",
  },
];

const decodeHtml = (raw: string) =>
  raw
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]*>/g, "")
    .trim();

const getTagValue = (text: string, tag: string) => {
  const match = text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1]) : "";
};

const getAttrValue = (text: string, tag: string, attr: string) => {
  const match = text.match(new RegExp(`<${tag}[^>]*${attr}="([^"]+)"[^>]*>`, "i"));
  return match ? match[1] : "";
};

const extractItems = (xml: string) => {
  const matches = xml.match(/<item[\s\S]*?<\/item>/gi);
  return matches ?? [];
};

const normalizeYouTube = (url: string) => {
  if (!url) {
    return "";
  }
  const shortMatch = url.match(/youtu\.be\/([A-Za-z0-9_-]+)/i);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  const longMatch = url.match(/[?&]v=([A-Za-z0-9_-]+)/i);
  if (longMatch?.[1]) {
    return `https://www.youtube.com/embed/${longMatch[1]}`;
  }
  return "";
};

const parseFeed = (xml: string, source: FeedSource): AgriNewsItem[] => {
  return extractItems(xml)
    .map((chunk) => {
      const title = getTagValue(chunk, "title");
      const link = getTagValue(chunk, "link");
      const summary = getTagValue(chunk, "description") || getTagValue(chunk, "content:encoded");
      const publishedAt = getTagValue(chunk, "pubDate") || new Date().toISOString();
      const sourceLabel = getTagValue(chunk, "source") || source.label;

      const mediaContent = getAttrValue(chunk, "media:content", "url");
      const mediaThumb = getAttrValue(chunk, "media:thumbnail", "url");
      const enclosureUrl = getAttrValue(chunk, "enclosure", "url");
      const enclosureType = getAttrValue(chunk, "enclosure", "type");

      const imgInDescription = chunk.match(/<img[^>]+src="([^"]+)"/i)?.[1] ?? "";
      const imageUrl = mediaContent || mediaThumb || (enclosureType.includes("image") ? enclosureUrl : "") || imgInDescription;

      const embeddedFromLink = normalizeYouTube(link);
      const embeddedFromMedia = normalizeYouTube(mediaContent || enclosureUrl);
      const videoUrl = embeddedFromMedia || embeddedFromLink;

      return {
        title,
        link,
        summary,
        source: sourceLabel,
        topic: source.topic,
        publishedAt: new Date(publishedAt).toISOString(),
        imageUrl,
        videoUrl,
      } as AgriNewsItem;
    })
    .filter((item) => item.title && item.link);
};

const fetchOneFeed = async (source: FeedSource) => {
  const response = await fetch(source.url, {
    next: { revalidate: 900 },
    headers: {
      "User-Agent": "DOS-AGROLINK-News-Bot/1.0",
    },
  });

  if (!response.ok) {
    return [] as AgriNewsItem[];
  }

  const xml = await response.text();
  return parseFeed(xml, source);
};

export async function GET() {
  try {
    const data = await Promise.all(FEED_SOURCES.map((source) => fetchOneFeed(source)));
    const merged = data
      .flat()
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const deduped: AgriNewsItem[] = [];
    const seen = new Set<string>();

    for (const item of merged) {
      const key = `${item.link}|${item.title}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      deduped.push(item);
    }

    const limited = deduped.slice(0, 8);

    if (limited.length === 0) {
      return NextResponse.json({
        updatedAt: new Date().toISOString(),
        items: FALLBACK_ITEMS,
      });
    }

    const withFallbackVisuals = limited.map((item, index) => ({
      ...item,
      imageUrl: item.imageUrl || FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].imageUrl,
    }));

    const hasVideo = withFallbackVisuals.some((item) => item.videoUrl);
    const items = hasVideo
      ? withFallbackVisuals
      : [FALLBACK_ITEMS.find((item) => item.videoUrl)!, ...withFallbackVisuals.slice(0, 7)];

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      items,
    });
  } catch {
    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      items: FALLBACK_ITEMS,
    });
  }
}
