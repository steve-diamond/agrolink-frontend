export type VisionPoint = {
  slug: string;
  title: string;
  summary: string;
  image: string;
  whoBenefits: string[];
  howWeDeliver: string[];
  howToEngage: string[];
  furtherReadLink: string;
};

export const visionPoints: VisionPoint[] = [
  {
    slug: "smart-produce-marketplace",
    title: "Smart Produce Marketplace",
    summary:
      "Farmers list maize, rice, cassava, and vegetables directly to verified buyers by location, volume, and fair pricing.",
    image: "/agropro/images/blog2.jpg",
    whoBenefits: [
      "Smallholder farmers seeking direct buyer access",
      "Bulk buyers needing verified supply and transparent pricing",
      "Cooperatives aggregating produce for stronger negotiation",
    ],
    howWeDeliver: [
      "Verified farmer and buyer onboarding",
      "Listing standards for quality, quantity, and location",
      "Order and payment workflow with traceable status updates",
    ],
    howToEngage: [
      "Create your DOS AGROLINK account",
      "Complete profile and verification details",
      "List products or publish buying demand to begin trading",
    ],
    furtherReadLink: "/marketplace",
  },
  {
    slug: "ai-crop-price-intelligence",
    title: "AI Crop Price Intelligence",
    summary:
      "Real-time demand and regional pricing signals guide farmers on when to sell, where to sell, and expected market direction.",
    image: "/agropro/images/news2.jpg",
    whoBenefits: [
      "Farmers making harvest timing and market decisions",
      "Buyers planning stock and procurement budgets",
      "Cooperatives optimizing group sales outcomes",
    ],
    howWeDeliver: [
      "Market monitoring and trend aggregation",
      "Regional pricing snapshots and movement signals",
      "Actionable intelligence integrated into user workflows",
    ],
    howToEngage: [
      "Follow the live DOS AGROLINK market updates",
      "Compare regional price signals before sales",
      "Use advisory insights to schedule harvest and transport",
    ],
    furtherReadLink: "/vision",
  },
  {
    slug: "cooperative-digital-wallet",
    title: "Cooperative Digital Wallet",
    summary:
      "Instant payouts, savings tracking, and input payments keep cooperative cash cycles transparent and healthy.",
    image: "/agropro/images/image1.jpg",
    whoBenefits: [
      "Farmers requiring secure and prompt settlement",
      "Cooperatives managing pooled savings and expenses",
      "Input providers receiving cleaner payment records",
    ],
    howWeDeliver: [
      "Wallet rails linked to transaction records",
      "Clear movement logs for payout and savings history",
      "Admin visibility and account accountability controls",
    ],
    howToEngage: [
      "Register on DOS AGROLINK",
      "Link your cooperative identity and transaction profile",
      "Use wallet features for payouts, savings, and input purchases",
    ],
    furtherReadLink: "/dashboard",
  },
  {
    slug: "farmer-micro-loan-system",
    title: "Farmer Micro-Loan System",
    summary:
      "Loan access is tied to sales history, farm profile, and cooperative performance so growth capital reaches active farmers.",
    image: "/agropro/images/news1.jpg",
    whoBenefits: [
      "Farmers needing working capital for inputs and equipment",
      "Cooperatives coordinating inclusive financing pools",
      "Financial partners seeking performance-based lending context",
    ],
    howWeDeliver: [
      "Loan profiling from transaction and cooperative records",
      "Structured application and review process",
      "Usage tracking for repayment and productivity outcomes",
    ],
    howToEngage: [
      "Maintain active trade records on DOS AGROLINK",
      "Apply through the loan application pathway",
      "Use funds for productive farm growth priorities",
    ],
    furtherReadLink: "/loan-application",
  },
  {
    slug: "logistics-transport-network",
    title: "Logistics & Transport Network",
    summary:
      "Farm-to-city movement is coordinated through pickup requests, driver assignment, transit tracking, and delivery confirmation.",
    image: "/agropro/images/blog3.jpg",
    whoBenefits: [
      "Farmers reducing delivery uncertainty and losses",
      "Buyers receiving produce with better reliability",
      "Transport operators accessing structured demand",
    ],
    howWeDeliver: [
      "Pickup and assignment workflows",
      "Transit status visibility for all parties",
      "Delivery confirmation to close trade cycles",
    ],
    howToEngage: [
      "Submit logistics requests from your account workflow",
      "Track movement in real time",
      "Confirm delivery to strengthen trust and reputation",
    ],
    furtherReadLink: "/logistics",
  },
  {
    slug: "warehouse-storage-system",
    title: "Warehouse & Storage System",
    summary:
      "Capacity-aware booking, inventory records, and warehouse receipts reduce spoilage and forced low-price sales.",
    image: "/agropro/images/service3.jpg",
    whoBenefits: [
      "Farmers preserving value after harvest",
      "Cooperatives managing inventory and timing better sales",
      "Buyers sourcing from more stable inventory pools",
    ],
    howWeDeliver: [
      "Storage booking informed by available capacity",
      "Inventory and ownership records per commodity",
      "Receipt-backed storage confidence for financing conversations",
    ],
    howToEngage: [
      "Request warehouse allocation via DOS AGROLINK",
      "Track quantity and quality while in storage",
      "Sell strategically when market conditions are favorable",
    ],
    furtherReadLink: "/warehouse",
  },
  {
    slug: "advisory-knowledge-hub",
    title: "Advisory & Knowledge Hub",
    summary:
      "Weather-aware crop guidance, pest alerts, and fertilizer recommendations support stronger decisions and better yields.",
    image: "/agropro/images/about_img1.jpg",
    whoBenefits: [
      "Farmers managing climate and pest risk",
      "Cooperatives coordinating extension support",
      "Agribusiness stakeholders improving productivity outcomes",
    ],
    howWeDeliver: [
      "Practical advisory updates tied to farm realities",
      "Pest and planting season information from trusted sources",
      "Knowledge links integrated with market and finance workflows",
    ],
    howToEngage: [
      "Follow live DOS AGROLINK advisory and news updates",
      "Apply planting and pest recommendations on schedule",
      "Share field outcomes to improve cooperative learning",
    ],
    furtherReadLink: "/vision",
  },
];

export const findVisionPointBySlug = (slug: string) =>
  visionPoints.find((item) => item.slug === slug);
