import API from "./api";

export type FarmingTip = {
  _id: string;
  text: string;
};

export async function getFarmingTips(): Promise<FarmingTip[]> {
  const res = await API.get("/api/farming-tips");
  if (Array.isArray(res.data?.tips)) return res.data.tips as FarmingTip[];
  return [];
}
