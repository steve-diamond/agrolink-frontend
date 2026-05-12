import API from "../src/services/api";

export type FarmingTip = {
  _id: string;
  text: string;
};

export async function getFarmingTips(): Promise<FarmingTip[]> {
  const res = await API.get("/api/farming-tips") as { data?: { tips?: unknown[] } };
  if (Array.isArray(res.data?.tips)) return res.data!.tips as FarmingTip[];
  return [];
}
