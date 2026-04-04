"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { normalizeProductsResponse } from "@/services/productService";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";

type AuthUser = {
  _id: string;
  name: string;
  email: string;
  role: "farmer" | "buyer" | "admin";
};

type Product = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  location?: string;
  approved?: boolean;
  farmer?: string;
};

type OrderLineItem = {
  productId?: { _id?: string; name?: string; price?: number };
  quantity: number;
};

type Order = {
  _id: string;
  products?: OrderLineItem[];
  productId?: { _id?: string; name?: string; price?: number };
  quantity?: number;
  totalAmount?: number;
  totalPrice?: number;
  status: string;
  paymentStatus?: string;
  createdAt?: string;
};

type CommunityPost = {
  id: string;
  message: string;
  createdAt: string;
  comments: Array<{
    id: string;
    message: string;
    createdAt: string;
  }>;
};

type DailyChallenge = {
  id: string;
  title: string;
  completed: boolean;
};

type WeeklyBadge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
};

type SeasonMission = {
  id: string;
  title: string;
  target: number;
  progress: number;
};

type ThemeChoice = "classic" | "sunrise" | "forest";

type RewardItem = {
  id: string;
  title: string;
  description: string;
  xpRequired: number;
  unlocksTheme?: ThemeChoice;
};

type ActivityEntry = {
  id: string;
  label: string;
  createdAt: string;
};

type WeeklySummary = {
  checkIns: number;
  posts: number;
  challenges: number;
  spins: number;
  negotiations: number;
  buyerEvents: number;
};

function FarmerDashboard({ user }: { user: AuthUser }) {
  const { copy } = useLocalizedCopy();
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [communityDraft, setCommunityDraft] = useState("");
  const [commentDraftByPostId, setCommentDraftByPostId] = useState<Record<string, string>>({});
  const [streakDays, setStreakDays] = useState(0);
  const [lastCheckInDate, setLastCheckInDate] = useState("");
  const [xpPoints, setXpPoints] = useState(0);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [marketMoodVote, setMarketMoodVote] = useState("");
  const [marketMoodCounts, setMarketMoodCounts] = useState({
    rising: 12,
    stable: 8,
    needBuyers: 10,
  });
  const [dailyInsight, setDailyInsight] = useState("");
  const [insightRevealed, setInsightRevealed] = useState(false);
  const [weeklyBadges, setWeeklyBadges] = useState<WeeklyBadge[]>([]);
  const [seasonMissions, setSeasonMissions] = useState<SeasonMission[]>([]);
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemeChoice>("classic");
  const [spinPlayedDate, setSpinPlayedDate] = useState("");
  const [weatherGuessDate, setWeatherGuessDate] = useState("");
  const [negotiationQuestDate, setNegotiationQuestDate] = useState("");
  const [negotiationWins, setNegotiationWins] = useState(0);
  const [buyerEventDate, setBuyerEventDate] = useState("");
  const [bossMonthKey, setBossMonthKey] = useState("");
  const [bossProgress, setBossProgress] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [coopProgress, setCoopProgress] = useState(0);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary>({
    checkIns: 0,
    posts: 0,
    challenges: 0,
    spins: 0,
    negotiations: 0,
    buyerEvents: 0,
  });
  const [lastWeekSummary, setLastWeekSummary] = useState<WeeklySummary | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [countdownClock, setCountdownClock] = useState("00:00:00");
  const [engagementMessage, setEngagementMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const communityStorageKey = `agrolink-community-posts-${user._id}`;
  const engagementStorageKey = `agrolink-engagement-${user._id}`;
  const todayKey = new Date().toISOString().slice(0, 10);
  const currentWeek = new Date();
  const currentMonthKey = `${currentWeek.getFullYear()}-${String(currentWeek.getMonth() + 1).padStart(2, "0")}`;
  const yearStart = new Date(currentWeek.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((currentWeek.getTime() - yearStart.getTime()) / 86400000) + 1;
  const currentWeekKey = `${currentWeek.getFullYear()}-W${Math.ceil(dayOfYear / 7)}`;
  const coopTarget = 120;

  const insightBank = [
    "Tomato demand often spikes 48 hours before major market days.",
    "Grouped transport with nearby farmers can cut logistics cost by up to 20%.",
    "Buyers respond faster to listings with clear harvest dates and quantity ranges.",
    "Early morning listing refresh can improve product visibility for same-day buyers.",
    "Short product descriptions with origin + freshness details convert better.",
  ];

  const seasonEndDate = new Date("2026-06-30T23:59:59");

  const rewardCatalog: RewardItem[] = [
    {
      id: "reward-theme-sunrise",
      title: "Sunrise Dashboard Theme",
      description: "Warm golden layout for early-morning planning.",
      xpRequired: 80,
      unlocksTheme: "sunrise",
    },
    {
      id: "reward-theme-forest",
      title: "Forest Pro Dashboard Theme",
      description: "Deep green premium look for seasoned farmers.",
      xpRequired: 140,
      unlocksTheme: "forest",
    },
    {
      id: "reward-nameplate",
      title: "Founder Nameplate",
      description: "Adds founder prestige to your profile progression journey.",
      xpRequired: 200,
    },
  ];

  useEffect(() => {
    API.get("/api/products", { params: { farmer: user._id } })
      .then((res) => {
        const all = normalizeProductsResponse(res.data as unknown);
        setAllProducts(all);
        setProducts(all.filter((p: Product) => p.farmer === user._id));
      })
      .catch(() => {
        setAllProducts([]);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [user._id]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(communityStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as CommunityPost[];
      if (Array.isArray(parsed)) {
        setCommunityPosts(parsed);
      }
    } catch {
      setCommunityPosts([]);
    }
  }, [communityStorageKey]);

  useEffect(() => {
    const baseChallenges: DailyChallenge[] = [
      { id: "challenge-update", title: "Share one community update", completed: false },
      { id: "challenge-listing", title: "Review your active product listing", completed: false },
      { id: "challenge-network", title: "Connect with one nearby farmer", completed: false },
    ];

    const daySeed = Number(todayKey.replace(/-/g, ""));
    const insight = insightBank[daySeed % insightBank.length];
    setDailyInsight(insight);

    try {
      const raw = localStorage.getItem(engagementStorageKey);
      if (!raw) {
        setDailyChallenges(baseChallenges);
        return;
      }

      const parsed = JSON.parse(raw) as {
        streakDays?: number;
        lastCheckInDate?: string;
        xpPoints?: number;
        challengeDate?: string;
        completedChallengeIds?: string[];
        marketMoodVoteDate?: string;
        marketMoodVote?: string;
        marketMoodCounts?: { rising: number; stable: number; needBuyers: number };
        insightDate?: string;
        claimedRewardIds?: string[];
        selectedTheme?: ThemeChoice;
        spinPlayedDate?: string;
        weatherGuessDate?: string;
        negotiationQuestDate?: string;
        negotiationWins?: number;
        buyerEventDate?: string;
        bossMonthKey?: string;
        bossProgress?: number;
        weekSummaryKey?: string;
        weeklySummary?: WeeklySummary;
        lastWeekSummary?: WeeklySummary;
        activityLog?: ActivityEntry[];
        coopProgress?: number;
        coopWeekKey?: string;
      };

      if (typeof parsed.streakDays === "number") setStreakDays(parsed.streakDays);
      if (typeof parsed.lastCheckInDate === "string") setLastCheckInDate(parsed.lastCheckInDate);
      if (typeof parsed.xpPoints === "number") setXpPoints(parsed.xpPoints);

      if (parsed.challengeDate === todayKey && Array.isArray(parsed.completedChallengeIds)) {
        const completed = new Set(parsed.completedChallengeIds);
        setDailyChallenges(baseChallenges.map((challenge) => ({ ...challenge, completed: completed.has(challenge.id) })));
      } else {
        setDailyChallenges(baseChallenges);
      }

      if (parsed.marketMoodVoteDate === todayKey && typeof parsed.marketMoodVote === "string") {
        setMarketMoodVote(parsed.marketMoodVote);
      }

      if (parsed.marketMoodCounts) {
        setMarketMoodCounts(parsed.marketMoodCounts);
      }

      if (parsed.insightDate === todayKey) {
        setInsightRevealed(true);
      }

      if (Array.isArray(parsed.claimedRewardIds)) {
        setClaimedRewardIds(parsed.claimedRewardIds);
      }

      if (parsed.selectedTheme === "classic" || parsed.selectedTheme === "sunrise" || parsed.selectedTheme === "forest") {
        setSelectedTheme(parsed.selectedTheme);
      }

      if (typeof parsed.spinPlayedDate === "string") {
        setSpinPlayedDate(parsed.spinPlayedDate);
      }

      if (typeof parsed.weatherGuessDate === "string") {
        setWeatherGuessDate(parsed.weatherGuessDate);
      }

      if (typeof parsed.negotiationQuestDate === "string") {
        setNegotiationQuestDate(parsed.negotiationQuestDate);
      }

      if (parsed.negotiationQuestDate === todayKey && typeof parsed.negotiationWins === "number") {
        setNegotiationWins(parsed.negotiationWins);
      } else {
        setNegotiationWins(0);
      }

      if (typeof parsed.buyerEventDate === "string") {
        setBuyerEventDate(parsed.buyerEventDate);
      }

      if (parsed.bossMonthKey === currentMonthKey && typeof parsed.bossProgress === "number") {
        setBossMonthKey(parsed.bossMonthKey);
        setBossProgress(parsed.bossProgress);
      } else {
        setBossMonthKey(currentMonthKey);
        setBossProgress(0);
      }

      if (parsed.weekSummaryKey === currentWeekKey && parsed.weeklySummary) {
        setWeeklySummary(parsed.weeklySummary);
      } else {
        if (parsed.weeklySummary) {
          setLastWeekSummary(parsed.weeklySummary);
          persistEngagement({
            weekSummaryKey: currentWeekKey,
            weeklySummary: {
              checkIns: 0,
              posts: 0,
              challenges: 0,
              spins: 0,
              negotiations: 0,
              buyerEvents: 0,
            },
            lastWeekSummary: parsed.weeklySummary,
          });
        }
        setWeeklySummary({
          checkIns: 0,
          posts: 0,
          challenges: 0,
          spins: 0,
          negotiations: 0,
          buyerEvents: 0,
        });
      }

      if (parsed.lastWeekSummary) {
        setLastWeekSummary(parsed.lastWeekSummary);
      }

      if (Array.isArray(parsed.activityLog)) {
        setActivityLog(parsed.activityLog.slice(0, 12));
      }

      if (parsed.coopWeekKey === currentWeekKey && typeof parsed.coopProgress === "number") {
        setCoopProgress(parsed.coopProgress);
      } else {
        setCoopProgress(0);
      }
    } catch {
      setDailyChallenges(baseChallenges);
    }
  }, [currentMonthKey, currentWeekKey, engagementStorageKey, todayKey]);

  useEffect(() => {
    const updateClock = () => {
      const diff = seasonEndDate.getTime() - Date.now();
      if (diff <= 0) {
        setCountdownClock("00:00:00");
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      setCountdownClock(`${hours}:${minutes}:${seconds}`);
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const persistEngagement = (partial: Partial<{
    streakDays: number;
    lastCheckInDate: string;
    xpPoints: number;
    challengeDate: string;
    completedChallengeIds: string[];
    marketMoodVoteDate: string;
    marketMoodVote: string;
    marketMoodCounts: { rising: number; stable: number; needBuyers: number };
    insightDate: string;
    claimedRewardIds: string[];
    selectedTheme: ThemeChoice;
    spinPlayedDate: string;
    weatherGuessDate: string;
    negotiationQuestDate: string;
    negotiationWins: number;
    buyerEventDate: string;
    bossMonthKey: string;
    bossProgress: number;
    weekSummaryKey: string;
    weeklySummary: WeeklySummary;
    lastWeekSummary: WeeklySummary;
    activityLog: ActivityEntry[];
    coopProgress: number;
    coopWeekKey: string;
  }>) => {
    try {
      const raw = localStorage.getItem(engagementStorageKey);
      const previous = raw ? JSON.parse(raw) : {};
      const next = { ...previous, ...partial };
      localStorage.setItem(engagementStorageKey, JSON.stringify(next));
    } catch {
      // Ignore storage errors to avoid blocking dashboard interactions.
    }
  };

  const appendActivity = (label: string) => {
    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        label,
        createdAt: new Date().toISOString(),
      },
      ...activityLog,
    ].slice(0, 12);

    setActivityLog(next);
    persistEngagement({ activityLog: next });
  };

  const bumpWeeklySummary = (partial: Partial<WeeklySummary>) => {
    const next: WeeklySummary = {
      checkIns: weeklySummary.checkIns + (partial.checkIns || 0),
      posts: weeklySummary.posts + (partial.posts || 0),
      challenges: weeklySummary.challenges + (partial.challenges || 0),
      spins: weeklySummary.spins + (partial.spins || 0),
      negotiations: weeklySummary.negotiations + (partial.negotiations || 0),
      buyerEvents: weeklySummary.buyerEvents + (partial.buyerEvents || 0),
    };
    setWeeklySummary(next);
    persistEngagement({ weekSummaryKey: currentWeekKey, weeklySummary: next });
  };

  const triggerCelebration = () => {
    setCelebrationVisible(true);
    window.setTimeout(() => setCelebrationVisible(false), 1800);
  };

  const handleShareCommunityPost = () => {
    const message = communityDraft.trim();
    if (!message) {
      return;
    }

    const next: CommunityPost[] = [
      {
        id: `${Date.now()}`,
        message,
        createdAt: new Date().toISOString(),
        comments: [],
      },
      ...communityPosts,
    ].slice(0, 8);

    const nextXp = xpPoints + 6;

    setCommunityPosts(next);
    setCommunityDraft("");
    setXpPoints(nextXp);
    localStorage.setItem(communityStorageKey, JSON.stringify(next));
    persistEngagement({ xpPoints: nextXp });
    appendActivity("Shared a community update (+6 XP)");
    bumpWeeklySummary({ posts: 1 });
    setEngagementMessage("Community post shared. +6 XP earned.");
  };

  const handleAddComment = (postId: string) => {
    const draft = (commentDraftByPostId[postId] || "").trim();
    if (!draft) {
      return;
    }

    const nextPosts = communityPosts.map((post) => {
      if (post.id !== postId) {
        return post;
      }

      const nextComments = [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
          message: draft,
          createdAt: new Date().toISOString(),
        },
        ...(post.comments || []),
      ].slice(0, 6);

      return {
        ...post,
        comments: nextComments,
      };
    });

    setCommunityPosts(nextPosts);
    setCommentDraftByPostId((prev) => ({ ...prev, [postId]: "" }));
    const nextXp = xpPoints + 3;
    setXpPoints(nextXp);
    localStorage.setItem(communityStorageKey, JSON.stringify(nextPosts));
    persistEngagement({ xpPoints: nextXp });
    appendActivity("Replied to a farmer update (+3 XP)");
  };

  const handleDailyCheckIn = () => {
    if (lastCheckInDate === todayKey) {
      setEngagementMessage("You already checked in today. Keep your streak alive tomorrow.");
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);

    const nextStreak = lastCheckInDate === yesterdayKey ? streakDays + 1 : 1;
    const nextXp = xpPoints + 15;

    setStreakDays(nextStreak);
    setLastCheckInDate(todayKey);
    setXpPoints(nextXp);
    setEngagementMessage(`Check-in complete. +15 XP earned. Current streak: ${nextStreak} day(s).`);

    persistEngagement({
      streakDays: nextStreak,
      lastCheckInDate: todayKey,
      xpPoints: nextXp,
    });
    appendActivity(`Checked in for day ${nextStreak} streak (+15 XP)`);
    bumpWeeklySummary({ checkIns: 1 });
  };

  const handleToggleChallenge = (challengeId: string) => {
    const target = dailyChallenges.find((challenge) => challenge.id === challengeId);
    if (!target) {
      return;
    }

    if (target.completed) {
      setEngagementMessage("Challenge already completed for today.");
      return;
    }

    const nextChallenges = dailyChallenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, completed: true } : challenge
    );

    const nextXp = xpPoints + 10;
    setDailyChallenges(nextChallenges);
    setXpPoints(nextXp);
    setEngagementMessage("Challenge completed. +10 XP earned.");

    persistEngagement({
      xpPoints: nextXp,
      challengeDate: todayKey,
      completedChallengeIds: nextChallenges.filter((challenge) => challenge.completed).map((challenge) => challenge.id),
    });
    appendActivity("Completed a daily challenge (+10 XP)");
    bumpWeeklySummary({ challenges: 1 });
  };

  const handleVoteMarketMood = (vote: "rising" | "stable" | "needBuyers") => {
    if (marketMoodVote) {
      setEngagementMessage("You have already voted in today's market mood pulse.");
      return;
    }

    const nextCounts = {
      ...marketMoodCounts,
      [vote]: marketMoodCounts[vote] + 1,
    };
    const nextXp = xpPoints + 5;

    setMarketMoodCounts(nextCounts);
    setMarketMoodVote(vote);
    setXpPoints(nextXp);
    setEngagementMessage("Vote submitted. +5 XP earned for community participation.");

    persistEngagement({
      xpPoints: nextXp,
      marketMoodVoteDate: todayKey,
      marketMoodVote: vote,
      marketMoodCounts: nextCounts,
    });
    appendActivity("Voted in market mood pulse (+5 XP)");
  };

  const handleRevealInsight = () => {
    if (insightRevealed) {
      return;
    }

    const nextXp = xpPoints + 5;

    setInsightRevealed(true);
    setXpPoints(nextXp);
    setEngagementMessage("Daily insight unlocked. +5 XP earned.");

    persistEngagement({
      xpPoints: nextXp,
      insightDate: todayKey,
    });
    appendActivity("Unlocked daily market insight (+5 XP)");
  };

  const handleClaimReward = (reward: RewardItem) => {
    if (claimedRewardIds.includes(reward.id)) {
      setEngagementMessage("Reward already claimed.");
      return;
    }

    if (xpPoints < reward.xpRequired) {
      setEngagementMessage(`You need ${reward.xpRequired - xpPoints} more XP to claim this reward.`);
      return;
    }

    const nextClaimed = [...claimedRewardIds, reward.id];
    setClaimedRewardIds(nextClaimed);

    let nextTheme = selectedTheme;
    if (reward.unlocksTheme) {
      nextTheme = reward.unlocksTheme;
      setSelectedTheme(nextTheme);
    }

    setEngagementMessage(`Reward claimed: ${reward.title}.`);
    persistEngagement({
      claimedRewardIds: nextClaimed,
      selectedTheme: nextTheme,
    });
    appendActivity(`Claimed reward: ${reward.title}`);
  };

  const handleSelectTheme = (theme: ThemeChoice) => {
    if (theme === "classic") {
      setSelectedTheme(theme);
      persistEngagement({ selectedTheme: theme });
      return;
    }

    const requiredRewardId = theme === "sunrise" ? "reward-theme-sunrise" : "reward-theme-forest";
    if (!claimedRewardIds.includes(requiredRewardId)) {
      setEngagementMessage("Claim the theme reward first from the Reward Shop.");
      return;
    }

    setSelectedTheme(theme);
    persistEngagement({ selectedTheme: theme });
    setEngagementMessage(`${theme[0].toUpperCase()}${theme.slice(1)} theme activated.`);
    appendActivity(`Switched dashboard theme to ${theme}`);
  };

  const handleLuckySpin = () => {
    if (spinPlayedDate === todayKey) {
      setEngagementMessage("Lucky Harvest Spin already used today. Come back tomorrow for another spin.");
      return;
    }

    const outcomes = [
      { label: "Fertilizer Boost", xp: 8 },
      { label: "Market Momentum", xp: 12 },
      { label: "Harvest Jackpot", xp: 20 },
      { label: "Buyer Wave", xp: 15 },
      { label: "Community Cheer", xp: 10 },
    ];

    const result = outcomes[Math.floor(Math.random() * outcomes.length)];
    const nextXp = xpPoints + result.xp;
    setXpPoints(nextXp);
    setSpinPlayedDate(todayKey);
    setEngagementMessage(`Lucky Harvest Spin: ${result.label}. +${result.xp} XP earned.`);

    persistEngagement({
      xpPoints: nextXp,
      spinPlayedDate: todayKey,
    });
    appendActivity(`Played Lucky Harvest Spin: ${result.label} (+${result.xp} XP)`);
    bumpWeeklySummary({ spins: 1 });
    if (result.xp >= 15) {
      triggerCelebration();
    }
  };

  const handleCoopContribute = () => {
    if (coopProgress >= coopTarget) {
      setEngagementMessage("Weekly co-op mission already completed. Great work, team.");
      return;
    }

    const contribution = 14;
    const nextCoop = Math.min(coopProgress + contribution, coopTarget);
    const nextXp = xpPoints + contribution;

    setCoopProgress(nextCoop);
    setXpPoints(nextXp);
    setEngagementMessage(`Co-op mission contribution added. +${contribution} XP earned.`);

    persistEngagement({
      coopProgress: nextCoop,
      coopWeekKey: currentWeekKey,
      xpPoints: nextXp,
    });

    appendActivity(`Contributed to co-op mission (+${contribution} XP)`);
  };

  const handleWeatherPrediction = (guess: "rain-rise" | "sunny-stable" | "storm-drop") => {
    if (weatherGuessDate === todayKey) {
      setEngagementMessage("Weather prediction challenge already completed today.");
      return;
    }

    const actualByDay: Array<"rain-rise" | "sunny-stable" | "storm-drop"> = [
      "sunny-stable",
      "rain-rise",
      "storm-drop",
      "sunny-stable",
      "rain-rise",
      "storm-drop",
      "sunny-stable",
    ];
    const actual = actualByDay[new Date().getDay()];
    const isCorrect = guess === actual;
    const gainedXp = isCorrect ? 18 : 4;
    const nextXp = xpPoints + gainedXp;

    setXpPoints(nextXp);
    setWeatherGuessDate(todayKey);
    setEngagementMessage(
      isCorrect
        ? `Great prediction. +${gainedXp} XP for reading the weather-market signal.`
        : `Forecast locked. +${gainedXp} XP participation reward.`
    );

    persistEngagement({
      xpPoints: nextXp,
      weatherGuessDate: todayKey,
    });
    appendActivity(`Played weather prediction (${isCorrect ? "correct" : "attempt"}) (+${gainedXp} XP)`);
  };

  const handleNegotiationWin = () => {
    const baseWins = negotiationQuestDate === todayKey ? negotiationWins : 0;
    if (baseWins >= 3) {
      setEngagementMessage("Negotiation streak completed for today. Come back tomorrow.");
      return;
    }

    const nextWins = baseWins + 1;
    const gainedXp = nextWins === 3 ? 16 : 7;
    const nextXp = xpPoints + gainedXp;

    setNegotiationQuestDate(todayKey);
    setNegotiationWins(nextWins);
    setXpPoints(nextXp);
    setEngagementMessage(
      nextWins === 3
        ? `Negotiation streak complete. Final boost +${gainedXp} XP.`
        : `Negotiation win logged. +${gainedXp} XP.`
    );

    persistEngagement({
      xpPoints: nextXp,
      negotiationQuestDate: todayKey,
      negotiationWins: nextWins,
    });
    appendActivity(`Logged negotiation win ${nextWins}/3 (+${gainedXp} XP)`);
    bumpWeeklySummary({ negotiations: 1 });
    if (nextWins === 3) {
      triggerCelebration();
    }
  };

  const handleSurpriseBuyerEvent = () => {
    if (buyerEventDate === todayKey) {
      setEngagementMessage("Surprise buyer event already completed today.");
      return;
    }

    const events = [
      { label: "Bulk restaurant buyer request", xp: 14, bossBoost: 12 },
      { label: "Export scout asks for quality samples", xp: 18, bossBoost: 15 },
      { label: "Local market surge request", xp: 12, bossBoost: 10 },
      { label: "Co-op buyer flash order", xp: 16, bossBoost: 14 },
    ];

    const selected = events[Math.floor(Math.random() * events.length)];
    const nextXp = xpPoints + selected.xp;
    const nextBoss = Math.min(bossProgress + selected.bossBoost, 100);

    setXpPoints(nextXp);
    setBuyerEventDate(todayKey);
    setBossMonthKey(currentMonthKey);
    setBossProgress(nextBoss);
    setEngagementMessage(`Event complete: ${selected.label}. +${selected.xp} XP.`);

    persistEngagement({
      xpPoints: nextXp,
      buyerEventDate: todayKey,
      bossMonthKey: currentMonthKey,
      bossProgress: nextBoss,
    });
    appendActivity(`Completed surprise buyer event: ${selected.label} (+${selected.xp} XP)`);
    bumpWeeklySummary({ buyerEvents: 1 });
    triggerCelebration();
  };

  const handleBossChallengePush = () => {
    if (bossProgress >= 100) {
      setEngagementMessage("Monthly boss challenge already completed. Legendary run.");
      return;
    }

    const nextBoss = Math.min(bossProgress + 11, 100);
    const gainedXp = nextBoss >= 100 ? 24 : 9;
    const nextXp = xpPoints + gainedXp;

    setBossMonthKey(currentMonthKey);
    setBossProgress(nextBoss);
    setXpPoints(nextXp);
    setEngagementMessage(nextBoss >= 100 ? `Boss challenge cleared. +${gainedXp} XP.` : `Boss challenge advanced. +${gainedXp} XP.`);

    persistEngagement({
      bossMonthKey: currentMonthKey,
      bossProgress: nextBoss,
      xpPoints: nextXp,
    });
    appendActivity(`Pushed monthly boss challenge to ${nextBoss}% (+${gainedXp} XP)`);
    if (nextBoss >= 100) {
      triggerCelebration();
    }
  };

  const primaryLocation =
    products.find((product) => (product.location || "").trim())?.location?.trim().toLowerCase() || "";

  const nearbyProducts = primaryLocation
    ? allProducts
        .filter((product) => (product.farmer || "") !== user._id)
        .filter((product) => (product.location || "").trim().toLowerCase().includes(primaryLocation))
        .slice(0, 5)
    : [];

  const farmerScore = xpPoints + products.length * 20 + streakDays * 5;
  const leaderboardEntries = [
    {
      id: "self",
      name: user.name,
      score: farmerScore,
      tag: "You",
    },
    ...nearbyProducts.slice(0, 4).map((item, index) => ({
      id: item._id,
      name: `${item.location || "Nearby"} Farmer ${index + 1}`,
      score: Math.round(Number(item.price || 0) / 40 + Number(item.quantity || 0) * 6 + 30 + index * 4),
      tag: item.location || "Nearby",
    })),
  ]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  const userLeaderboardRank = Math.max(
    leaderboardEntries.findIndex((entry) => entry.id === "self") + 1,
    1
  );

  const leagueTier =
    farmerScore >= 420
      ? "Platinum"
      : farmerScore >= 280
      ? "Gold"
      : farmerScore >= 160
      ? "Silver"
      : "Bronze";
  const nextTierTarget = leagueTier === "Bronze" ? 160 : leagueTier === "Silver" ? 280 : leagueTier === "Gold" ? 420 : 420;
  const nextTierGap = Math.max(nextTierTarget - farmerScore, 0);
  const weekdayIndex = new Date().getDay();
  const weeklyTournamentFocus = [
    "Leafy Greens Demand Wave",
    "Tomato Fast-Move Challenge",
    "Yam Bulk Supply Race",
    "Pepper Price Mastery",
    "Maize Growth Ladder",
    "Weekend Buyer Rush",
    "Community Relay Sprint",
  ][weekdayIndex];
  const weeklyTournamentPrizeXp = 30 + weekdayIndex * 5;
  const tournamentGap = Math.max((leaderboardEntries[0]?.score || 0) - farmerScore + 20, 0);
  const coopProgressRatio = coopTarget > 0 ? coopProgress / coopTarget : 0;
  const coopProgressClass =
    coopProgressRatio >= 1
      ? "w-full"
      : coopProgressRatio >= 0.75
      ? "w-3/4"
      : coopProgressRatio >= 0.5
      ? "w-1/2"
      : coopProgressRatio >= 0.25
      ? "w-1/4"
      : "w-[8%]";
  const negotiationRatio = Math.min(negotiationWins / 3, 1);
  const negotiationProgressClass =
    negotiationRatio >= 1
      ? "w-full"
      : negotiationRatio >= 0.67
      ? "w-2/3"
      : negotiationRatio >= 0.34
      ? "w-1/3"
      : "w-[8%]";
  const bossRatio = Math.min(bossProgress / 100, 1);
  const bossProgressClass =
    bossRatio >= 1
      ? "w-full"
      : bossRatio >= 0.75
      ? "w-3/4"
      : bossRatio >= 0.5
      ? "w-1/2"
      : bossRatio >= 0.25
      ? "w-1/4"
      : "w-[8%]";
  const farmerAvatar =
    leagueTier === "Platinum"
      ? "Master Agripreneur"
      : leagueTier === "Gold"
      ? "Market Captain"
      : leagueTier === "Silver"
      ? "Growth Ranger"
      : "Seed Starter";
  const dailyObjectives = [
    { label: "Daily check-in", completed: lastCheckInDate === todayKey },
    { label: "Lucky spin", completed: spinPlayedDate === todayKey },
    { label: "Weather prediction", completed: weatherGuessDate === todayKey },
    { label: "Negotiation streak", completed: negotiationQuestDate === todayKey && negotiationWins >= 3 },
  ];
  const completedObjectiveCount = dailyObjectives.filter((item) => item.completed).length;
  const comboMultiplier =
    completedObjectiveCount >= 4
      ? 1.6
      : completedObjectiveCount === 3
      ? 1.4
      : completedObjectiveCount === 2
      ? 1.2
      : completedObjectiveCount === 1
      ? 1.1
      : 1;
  const focusCoachTips = [
    !dailyObjectives[0].completed ? "Start with daily check-in for streak momentum." : null,
    !dailyObjectives[1].completed ? "Use Lucky Harvest Spin now for quick bonus XP." : null,
    !dailyObjectives[2].completed ? "Play weather prediction before midday market moves." : null,
    !dailyObjectives[3].completed ? "Complete 3 negotiation wins to finish your quest." : null,
  ].filter((tip): tip is string => Boolean(tip));

  const heroThemeClass =
    selectedTheme === "sunrise"
      ? "from-amber-700 via-orange-700 to-yellow-600"
      : selectedTheme === "forest"
      ? "from-green-950 via-emerald-900 to-lime-700"
      : "from-green-950 via-green-900 to-green-700";
  const themeBadgeClass =
    selectedTheme === "sunrise"
      ? "bg-amber-100 text-amber-900"
      : selectedTheme === "forest"
      ? "bg-emerald-100 text-emerald-900"
      : "bg-green-100 text-green-900";

  const farmerLevel = Math.floor(xpPoints / 120) + 1;
  const levelProgress = Math.round(((xpPoints % 120) / 120) * 100);
  const completedChallenges = dailyChallenges.filter((challenge) => challenge.completed).length;
  const totalPosts = communityPosts.length;

  useEffect(() => {
    const nextBadges: WeeklyBadge[] = [
      {
        id: "badge-streak",
        title: "Streak Guardian",
        description: "Check in for 3 days in a row.",
        unlocked: streakDays >= 3,
      },
      {
        id: "badge-community",
        title: "Village Voice",
        description: "Share at least 3 community updates.",
        unlocked: totalPosts >= 3,
      },
      {
        id: "badge-growth",
        title: "Growth Champion",
        description: "Reach 200 XP in the Farm XP Arena.",
        unlocked: xpPoints >= 200,
      },
    ];
    setWeeklyBadges(nextBadges);

    const missions: SeasonMission[] = [
      {
        id: "season-mission-listings",
        title: "Active Listing Sprint",
        target: 5,
        progress: Math.min(products.length, 5),
      },
      {
        id: "season-mission-engagement",
        title: "Community Builder",
        target: 10,
        progress: Math.min(totalPosts + completedChallenges, 10),
      },
      {
        id: "season-mission-level",
        title: "Level Up Journey",
        target: 4,
        progress: Math.min(farmerLevel, 4),
      },
    ];
    setSeasonMissions(missions);
  }, [completedChallenges, farmerLevel, products.length, streakDays, totalPosts, xpPoints]);

  const levelProgressWidthClass =
    levelProgress >= 100
      ? "w-full"
      : levelProgress >= 90
      ? "w-[90%]"
      : levelProgress >= 80
      ? "w-[80%]"
      : levelProgress >= 70
      ? "w-[70%]"
      : levelProgress >= 60
      ? "w-[60%]"
      : levelProgress >= 50
      ? "w-1/2"
      : levelProgress >= 40
      ? "w-[40%]"
      : levelProgress >= 30
      ? "w-[30%]"
      : levelProgress >= 20
      ? "w-[20%]"
      : levelProgress >= 10
      ? "w-[10%]"
      : "w-[4%]";

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      {celebrationVisible ? (
        <div className="pointer-events-none fixed inset-x-0 top-16 z-50 mx-auto flex max-w-5xl justify-center">
          <div className="rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-emerald-700 shadow">Milestone unlocked</div>
        </div>
      ) : null}

      <section className={`rounded-2xl border border-green-900/25 bg-linear-to-br p-5 text-green-50 shadow-xl shadow-green-900/25 ${heroThemeClass}`}>
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">{copy.myFarm}</p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h1 className="m-0 text-3xl font-bold">{copy.welcome}, {user.name}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${themeBadgeClass}`}>
            Theme: {selectedTheme}
          </span>
        </div>
        <p className="mb-0 mt-2 text-sm text-green-100">Track crop listings, compete with nearby farmers, and unlock new rewards daily.</p>
      </section>

      <section className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-base font-bold text-green-950">Today&apos;s Objectives</h2>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
            {completedObjectiveCount}/{dailyObjectives.length} complete
          </span>
        </div>
        <div className="mt-2 grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {dailyObjectives.map((objective) => (
            <div
              key={objective.label}
              className={`rounded-lg border px-3 py-2 text-sm ${objective.completed ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-700"}`}
            >
              {objective.completed ? "Completed" : "Pending"}: {objective.label}
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          <article className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Daily Combo Multiplier</p>
            <p className="m-0 mt-1 text-lg font-bold text-emerald-900">x{comboMultiplier.toFixed(1)}</p>
            <p className="m-0 text-xs text-emerald-800">Finish more objectives to boost your daily momentum bonus feel.</p>
          </article>

          <article className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Focus Coach</p>
            {focusCoachTips.length > 0 ? (
              <div className="mt-1 grid gap-1">
                {focusCoachTips.slice(0, 2).map((tip) => (
                  <p key={tip} className="m-0 text-xs text-sky-900">- {tip}</p>
                ))}
              </div>
            ) : (
              <p className="m-0 mt-1 text-xs text-sky-900">All objectives complete. Push boss missions and leaderboard battles next.</p>
            )}
          </article>
        </div>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-bold text-green-950">{copy.myProducts}</h2>
        <Link href="/farmer/upload" className="btn-primary touch-target inline-flex items-center justify-center px-4 no-underline">
          + {copy.uploadNewProduct}
        </Link>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-xl font-bold text-green-950">Farm XP Arena</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Level {farmerLevel}</span>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Daily Streak</p>
            <p className="m-0 mt-1 text-2xl font-bold text-emerald-900">{streakDays} day{streakDays === 1 ? "" : "s"}</p>
            <button type="button" onClick={handleDailyCheckIn} className="mt-2 rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800">
              Check in today
            </button>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-3 md:col-span-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">XP Progress</p>
            <p className="m-0 mt-1 text-sm text-slate-700">{xpPoints} XP total • {120 - (xpPoints % 120)} XP to next level</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full bg-emerald-600 transition-all ${levelProgressWidthClass}`} />
            </div>
            <button
              type="button"
              onClick={handleRevealInsight}
              className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100"
            >
              {insightRevealed ? "Daily insight unlocked" : "Unlock daily market insight"}
            </button>
            {insightRevealed ? <p className="m-0 mt-2 text-sm text-slate-700">{dailyInsight}</p> : null}
          </article>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Today&apos;s Challenges</p>
            <div className="mt-2 grid gap-2">
              {dailyChallenges.map((challenge) => (
                <label key={challenge.id} className="flex items-center gap-2 rounded-md bg-white px-2 py-1.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={challenge.completed}
                    disabled={challenge.completed}
                    onChange={() => handleToggleChallenge(challenge.id)}
                    className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-200"
                  />
                  {challenge.title}
                </label>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-sky-200 bg-sky-50 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-sky-700">Market Mood Pulse</p>
            <div className="mt-2 grid gap-2">
              <button type="button" onClick={() => handleVoteMarketMood("rising")} className="rounded-md bg-white px-3 py-1.5 text-left text-sm font-semibold text-slate-700 hover:bg-sky-100">
                Prices rising • {marketMoodCounts.rising}
              </button>
              <button type="button" onClick={() => handleVoteMarketMood("stable")} className="rounded-md bg-white px-3 py-1.5 text-left text-sm font-semibold text-slate-700 hover:bg-sky-100">
                Prices stable • {marketMoodCounts.stable}
              </button>
              <button type="button" onClick={() => handleVoteMarketMood("needBuyers")} className="rounded-md bg-white px-3 py-1.5 text-left text-sm font-semibold text-slate-700 hover:bg-sky-100">
                Need buyers urgently • {marketMoodCounts.needBuyers}
              </button>
            </div>
          </article>
        </div>

        {engagementMessage ? (
          <p className="m-0 mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{engagementMessage}</p>
        ) : null}

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-purple-200 bg-purple-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-purple-700">Weekly Badge Cabinet</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-purple-700">
                {weeklyBadges.filter((badge) => badge.unlocked).length}/{weeklyBadges.length} unlocked
              </span>
            </div>
            <div className="mt-2 grid gap-2">
              {weeklyBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-md border px-2 py-1.5 ${badge.unlocked ? "border-purple-300 bg-white" : "border-slate-200 bg-slate-100"}`}
                >
                  <p className={`m-0 text-sm font-semibold ${badge.unlocked ? "text-purple-900" : "text-slate-500"}`}>{badge.title}</p>
                  <p className={`m-0 text-xs ${badge.unlocked ? "text-purple-700" : "text-slate-500"}`}>{badge.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-orange-200 bg-orange-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-orange-700">Season Mission Board</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-orange-700">Ends in {countdownClock}</span>
            </div>

            <div className="mt-2 grid gap-2">
              {seasonMissions.map((mission) => {
                const ratio = mission.target > 0 ? mission.progress / mission.target : 0;
                const missionWidthClass =
                  ratio >= 1
                    ? "w-full"
                    : ratio >= 0.75
                    ? "w-3/4"
                    : ratio >= 0.5
                    ? "w-1/2"
                    : ratio >= 0.25
                    ? "w-1/4"
                    : "w-[8%]";

                return (
                  <div key={mission.id} className="rounded-md border border-orange-200 bg-white px-2 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="m-0 text-sm font-semibold text-orange-900">{mission.title}</p>
                      <p className="m-0 text-xs font-bold text-orange-700">{mission.progress}/{mission.target}</p>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-orange-100">
                      <div className={`h-full bg-orange-500 ${missionWidthClass}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-indigo-700">Nearby Leaderboard</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-indigo-700">{leagueTier} League</span>
            </div>
            <p className="m-0 mt-1 text-xs text-indigo-800">
              {nextTierGap > 0 ? `${nextTierGap} score points to reach next league tier.` : "Top tier reached. Keep the momentum."}
            </p>

            <div className="mt-2 grid gap-1">
              {leaderboardEntries.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between rounded-md border border-indigo-200 bg-white px-2 py-1.5">
                  <p className="m-0 text-sm font-semibold text-indigo-900">#{index + 1} {entry.name}</p>
                  <p className="m-0 text-xs font-bold text-indigo-700">{entry.score} pts · {entry.tag}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-xl border border-teal-200 bg-teal-50 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">Reward Shop</p>
            <p className="m-0 mt-1 text-xs text-teal-900">Claim milestone rewards when your XP meets each threshold.</p>

            <div className="mt-2 grid gap-2">
              {rewardCatalog.map((reward) => {
                const claimed = claimedRewardIds.includes(reward.id);
                const eligible = xpPoints >= reward.xpRequired;

                return (
                  <div key={reward.id} className="rounded-md border border-teal-200 bg-white px-2 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="m-0 text-sm font-semibold text-teal-900">{reward.title}</p>
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">{reward.xpRequired} XP</span>
                    </div>
                    <p className="m-0 mt-1 text-xs text-slate-600">{reward.description}</p>
                    <button
                      type="button"
                      onClick={() => handleClaimReward(reward)}
                      disabled={claimed || !eligible}
                      className="mt-2 rounded-md border border-teal-300 bg-teal-100 px-3 py-1 text-xs font-bold text-teal-900 hover:bg-teal-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {claimed ? "Claimed" : eligible ? "Claim Reward" : "Locked"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 grid gap-2 rounded-md border border-teal-200 bg-white p-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-teal-700">Theme Switcher</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => handleSelectTheme("classic")} className="rounded-md border border-slate-300 bg-slate-100 px-2 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200">Classic</button>
                <button type="button" onClick={() => handleSelectTheme("sunrise")} className="rounded-md border border-amber-300 bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-200">Sunrise</button>
                <button type="button" onClick={() => handleSelectTheme("forest")} className="rounded-md border border-emerald-300 bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-200">Forest</button>
              </div>
            </div>
          </article>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-rose-200 bg-rose-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-rose-700">Lucky Harvest Spin</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-rose-700">Daily Bonus</span>
            </div>
            <p className="m-0 mt-1 text-xs text-rose-900">Spin once each day for surprise XP and momentum boosts.</p>
            <button
              type="button"
              onClick={handleLuckySpin}
              disabled={spinPlayedDate === todayKey}
              className="mt-2 rounded-md border border-rose-300 bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-900 hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {spinPlayedDate === todayKey ? "Spin used today" : "Spin the wheel"}
            </button>
          </article>

          <article className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-cyan-700">Weekly Tournament Spotlight</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-cyan-700">Prize {weeklyTournamentPrizeXp} XP</span>
            </div>
            <p className="m-0 mt-1 text-sm font-semibold text-cyan-900">{weeklyTournamentFocus}</p>
            <p className="m-0 mt-1 text-xs text-cyan-800">Current rank: #{userLeaderboardRank} in nearby league.</p>
            <p className="m-0 mt-1 text-xs text-cyan-800">
              {tournamentGap > 0
                ? `Push ${tournamentGap} more score points to challenge the tournament leader.`
                : "You are leading this week. Defend your position."}
            </p>
          </article>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-lime-200 bg-lime-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-lime-700">Co-op Team Quest</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-lime-700">Week {currentWeekKey}</span>
            </div>
            <p className="m-0 mt-1 text-xs text-lime-900">Nearby farmers work together to hit the weekly logistics readiness goal.</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-lime-100">
              <div className={`h-full bg-lime-500 ${coopProgressClass}`} />
            </div>
            <p className="m-0 mt-1 text-xs font-semibold text-lime-800">{coopProgress}/{coopTarget} team points</p>
            <button
              type="button"
              onClick={handleCoopContribute}
              disabled={coopProgress >= coopTarget}
              className="mt-2 rounded-md border border-lime-300 bg-lime-100 px-3 py-1.5 text-xs font-bold text-lime-900 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {coopProgress >= coopTarget ? "Mission complete" : "Contribute +14"}
            </button>
          </article>

          <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Journey Timeline</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-slate-700">Last {activityLog.length} actions</span>
            </div>
            <div className="mt-2 grid gap-1">
              {activityLog.length === 0 ? (
                <p className="m-0 rounded-md border border-dashed border-slate-300 bg-white px-2 py-2 text-xs text-slate-600">
                  Your activity timeline will fill up as you engage with missions, spin, and community actions.
                </p>
              ) : (
                activityLog.map((item) => (
                  <div key={item.id} className="rounded-md border border-slate-200 bg-white px-2 py-1.5">
                    <p className="m-0 text-xs font-semibold text-slate-800">{item.label}</p>
                    <p className="m-0 text-[11px] text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">Weather Price Prediction</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-blue-700">Daily Brain Game</span>
            </div>
            <p className="m-0 mt-1 text-xs text-blue-900">Predict how weather may shift market prices before traders react.</p>
            <div className="mt-2 grid gap-2">
              <button
                type="button"
                onClick={() => handleWeatherPrediction("rain-rise")}
                disabled={weatherGuessDate === todayKey}
                className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-left text-xs font-bold text-blue-900 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"Rain week -> vegetable prices rise"}
              </button>
              <button
                type="button"
                onClick={() => handleWeatherPrediction("sunny-stable")}
                disabled={weatherGuessDate === todayKey}
                className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-left text-xs font-bold text-blue-900 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"Sunny days -> prices stay stable"}
              </button>
              <button
                type="button"
                onClick={() => handleWeatherPrediction("storm-drop")}
                disabled={weatherGuessDate === todayKey}
                className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-left text-xs font-bold text-blue-900 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"Storm alerts -> prices dip short-term"}
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-fuchsia-700">Negotiation Streak Quest</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-fuchsia-700">Daily 3-step quest</span>
            </div>
            <p className="m-0 mt-1 text-xs text-fuchsia-900">Log successful buyer negotiations to build your closing streak.</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-fuchsia-100">
              <div className={`h-full bg-fuchsia-500 ${negotiationProgressClass}`} />
            </div>
            <p className="m-0 mt-1 text-xs font-semibold text-fuchsia-800">{negotiationWins}/3 wins today</p>
            <button
              type="button"
              onClick={handleNegotiationWin}
              disabled={negotiationWins >= 3 && negotiationQuestDate === todayKey}
              className="mt-2 rounded-md border border-fuchsia-300 bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-900 hover:bg-fuchsia-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {negotiationWins >= 3 && negotiationQuestDate === todayKey ? "Quest done today" : "Log negotiation win"}
            </button>
          </article>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <article className="rounded-xl border border-violet-200 bg-violet-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-violet-700">Surprise Buyer Event</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-violet-700">Daily random event</span>
            </div>
            <p className="m-0 mt-1 text-xs text-violet-900">Unexpected buyer scenarios appear once daily with instant XP and boss progress boosts.</p>
            <button
              type="button"
              onClick={handleSurpriseBuyerEvent}
              disabled={buyerEventDate === todayKey}
              className="mt-2 rounded-md border border-violet-300 bg-violet-100 px-3 py-1.5 text-xs font-bold text-violet-900 hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {buyerEventDate === todayKey ? "Event completed today" : "Trigger buyer event"}
            </button>
          </article>

          <article className="rounded-xl border border-amber-300 bg-amber-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Farmer Avatar Evolution</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-amber-700">{leagueTier} tier</span>
            </div>
            <p className="m-0 mt-1 text-sm font-bold text-amber-900">Avatar: {farmerAvatar}</p>
            <p className="m-0 mt-1 text-xs text-amber-800">Level up league tiers to evolve your dashboard identity and status.</p>
          </article>
        </div>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-red-700">Monthly Boss Challenge</p>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-red-700">{bossMonthKey}</span>
          </div>
          <p className="m-0 mt-1 text-xs text-red-900">Complete high-pressure supply missions all month to earn a rare prestige finish.</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-red-100">
            <div className={`h-full bg-red-500 ${bossProgressClass}`} />
          </div>
          <p className="m-0 mt-1 text-xs font-semibold text-red-800">{bossProgress}/100 progress</p>
          <button
            type="button"
            onClick={handleBossChallengePush}
            disabled={bossProgress >= 100}
            className="mt-2 rounded-md border border-red-300 bg-red-100 px-3 py-1.5 text-xs font-bold text-red-900 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {bossProgress >= 100 ? "Boss challenge completed" : "Push boss mission +11"}
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-300 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-slate-700">Weekly Reset Summary</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">Current week: {currentWeekKey}</span>
          </div>

          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="m-0 text-xs font-bold text-slate-700">This week</p>
              <p className="m-0 mt-1 text-xs text-slate-600">Check-ins: {weeklySummary.checkIns}</p>
              <p className="m-0 text-xs text-slate-600">Posts: {weeklySummary.posts}</p>
              <p className="m-0 text-xs text-slate-600">Challenges: {weeklySummary.challenges}</p>
              <p className="m-0 text-xs text-slate-600">Spins: {weeklySummary.spins}</p>
              <p className="m-0 text-xs text-slate-600">Negotiations: {weeklySummary.negotiations}</p>
              <p className="m-0 text-xs text-slate-600">Buyer events: {weeklySummary.buyerEvents}</p>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <p className="m-0 text-xs font-bold text-slate-700">Last week</p>
              {lastWeekSummary ? (
                <>
                  <p className="m-0 mt-1 text-xs text-slate-600">Check-ins: {lastWeekSummary.checkIns}</p>
                  <p className="m-0 text-xs text-slate-600">Posts: {lastWeekSummary.posts}</p>
                  <p className="m-0 text-xs text-slate-600">Challenges: {lastWeekSummary.challenges}</p>
                  <p className="m-0 text-xs text-slate-600">Spins: {lastWeekSummary.spins}</p>
                  <p className="m-0 text-xs text-slate-600">Negotiations: {lastWeekSummary.negotiations}</p>
                  <p className="m-0 text-xs text-slate-600">Buyer events: {lastWeekSummary.buyerEvents}</p>
                </>
              ) : (
                <p className="m-0 mt-1 text-xs text-slate-600">No previous week data yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">{copy.loadingProducts}</p> : null}

      {!loading && products.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">{copy.noProductsYet}</p>
          <Link href="/farmer/upload" className="mt-3 inline-block font-bold text-green-700 no-underline">{copy.uploadFirstProduct}</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {products.map((product) => (
          <article key={product._id} className={`card p-4 ${product.approved ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="m-0 text-lg font-bold text-green-950">{product.name}</h3>
                <p className="m-0 mt-1 text-sm text-slate-600">NGN {Number(product.price).toLocaleString()} · Qty {product.quantity}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${product.approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {product.approved ? copy.approved : copy.pending}
              </span>
            </div>
          </article>
        ))}
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="m-0 text-xl font-bold text-green-950">Farmer Community Hub</h2>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-green-700">Share • Learn • Collaborate</p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-2">
            <label htmlFor="communityPost" className="text-sm font-semibold text-green-950">Post an update to your community wall</label>
            <textarea
              id="communityPost"
              value={communityDraft}
              onChange={(e) => setCommunityDraft(e.target.value)}
              rows={3}
              placeholder="Share market updates, crop tips, or transport needs with fellow farmers."
              className="rounded-lg border border-green-200 px-3 py-2 outline-none ring-green-200 focus:ring"
            />
            <button
              type="button"
              onClick={handleShareCommunityPost}
              className="btn-primary touch-target w-fit px-4"
            >
              Share Update
            </button>

            <div className="mt-2 grid gap-2">
              {communityPosts.length === 0 ? (
                <p className="m-0 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600">
                  No posts yet. Start your first community update.
                </p>
              ) : (
                communityPosts.map((post) => (
                  <article key={post.id} className="rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2">
                    <p className="m-0 text-sm text-slate-800">{post.message}</p>
                    <p className="m-0 mt-1 text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>

                    <div className="mt-2 grid gap-2 rounded-md bg-white/70 p-2">
                      <label className="text-xs font-semibold text-emerald-900">Reply to this update</label>
                      <div className="flex gap-2">
                        <input
                          value={commentDraftByPostId[post.id] || ""}
                          onChange={(e) =>
                            setCommentDraftByPostId((prev) => ({
                              ...prev,
                              [post.id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                          className="min-h-10 flex-1 rounded-md border border-emerald-200 px-2 py-1 text-sm outline-none ring-emerald-200 focus:ring"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(post.id)}
                          className="rounded-md border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 hover:bg-emerald-200"
                        >
                          Reply
                        </button>
                      </div>

                      {(post.comments || []).length > 0 ? (
                        <div className="grid gap-1">
                          {(post.comments || []).map((comment) => (
                            <div key={comment.id} className="rounded-md border border-emerald-100 bg-white px-2 py-1">
                              <p className="m-0 text-xs text-slate-700">{comment.message}</p>
                              <p className="m-0 mt-0.5 text-[11px] text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="grid gap-2">
            <h3 className="m-0 text-sm font-bold uppercase tracking-[0.08em] text-green-800">Community Channels</h3>
            <Link href="/marketplace" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Market Price Watch
            </Link>
            <Link href="/logistics" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Logistics & Transport Coordination
            </Link>
            <Link href="/loan-application" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Cooperative Finance Support
            </Link>
            <Link href="/vision" className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-900 no-underline hover:bg-green-100">
              Advisory & Knowledge Hub
            </Link>

            <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <h4 className="m-0 text-xs font-bold uppercase tracking-[0.08em] text-slate-700">Nearby Farmers</h4>
              <p className="m-0 mt-1 text-xs text-slate-600">
                {primaryLocation
                  ? `Based on your current listing area: ${primaryLocation}`
                  : "Add a product location to discover nearby farmers."}
              </p>

              <div className="mt-2 grid gap-1">
                {nearbyProducts.length === 0 ? (
                  <p className="m-0 text-xs text-slate-500">No nearby farmer listings found yet.</p>
                ) : (
                  nearbyProducts.map((item) => (
                    <div key={item._id} className="rounded-md border border-slate-200 bg-white px-2 py-1">
                      <p className="m-0 text-xs font-semibold text-slate-800">{item.name}</p>
                      <p className="m-0 text-[11px] text-slate-500">{item.location || "Unknown location"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function BuyerDashboard({ user }: { user: AuthUser }) {
  const { copy } = useLocalizedCopy();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get<Order[]>("/api/orders")
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(err?.response?.data?.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const getItems = (order: Order): OrderLineItem[] => {
    if (Array.isArray(order.products) && order.products.length) return order.products;
    if (order.productId) return [{ productId: order.productId, quantity: order.quantity ?? 0 }];
    return [];
  };

  return (
    <main className="mx-auto grid max-w-5xl gap-4">
      <section className="rounded-2xl border border-green-900/25 bg-linear-to-br from-green-950 via-green-900 to-green-700 p-5 text-green-50 shadow-xl shadow-green-900/25">
        <p className="m-0 text-xs uppercase tracking-[0.16em] text-green-100">{copy.marketHub}</p>
        <h1 className="m-0 mt-1 text-3xl font-bold">{copy.welcome}, {user.name}</h1>
        <p className="mb-0 mt-2 text-sm text-green-100">Check order status and negotiate with trusted farmers.</p>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-xl font-bold text-green-950">{copy.myOrders}</h2>
        <Link href="/marketplace" className="btn-primary touch-target inline-flex items-center justify-center px-4 no-underline">
          {copy.marketHub}
        </Link>
      </section>

      {loading ? <p className="m-0 text-sm text-slate-600">{copy.loadingOrders}</p> : null}
      {error ? <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

      {!loading && !error && orders.length === 0 ? (
        <section className="card border-dashed p-5 text-center">
          <p className="m-0 text-slate-600">{copy.noOrdersYet}</p>
          <Link href="/marketplace" className="mt-3 inline-block font-bold text-green-700 no-underline">{copy.browseMarketplace}</Link>
        </section>
      ) : null}

      <section className="grid gap-3">
        {orders.map((order) => {
          const items = getItems(order);
          const total = Number(order.totalAmount ?? order.totalPrice ?? 0);
          return (
            <article key={order._id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="m-0 text-base font-bold text-green-950">
                  {items.length > 1 ? `${items.length} items` : items[0]?.productId?.name || "Order"}
                </h3>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{order.status}</span>
              </div>
              <p className="m-0 mt-2 text-sm text-slate-700">Total: NGN {total.toLocaleString()}</p>
              {order.createdAt ? <p className="m-0 mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</p> : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const raw = localStorage.getItem("user");

    if (!token || !raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed.role === "admin") {
        router.replace("/admin");
        return;
      }
      setUser(parsed);
    } catch {
      router.replace("/login");
    }
  }, [router]);

  if (!user) {
    return <main className="p-8 text-center text-slate-600">Loading...</main>;
  }

  if (user.role === "farmer") return <FarmerDashboard user={user} />;
  if (user.role === "buyer") return <BuyerDashboard user={user} />;

  return null;
}