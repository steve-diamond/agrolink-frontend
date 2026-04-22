// FX utility for USD/NGN with 24hr cache
const FX_CACHE_KEY = "fx_usd_ngn_rate";
const FX_CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

import type { NextApiRequest, NextApiResponse } from 'next';

let cachedRate: number | null = null;
let lastFetched = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getUSDRate(): Promise<number> {
  const now = Date.now();
  if (cachedRate && now - lastFetched < CACHE_DURATION) {
    return cachedRate;
  }
  const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=NGN');
  const data = await res.json();
  const rate = data.rates.NGN;
  cachedRate = rate;
  lastFetched = now;
  return rate;
}

export function convertToNGN(usdAmount: number, rate?: number): number {
  if (!rate && cachedRate) rate = cachedRate;
  if (!rate) throw new Error('FX rate not loaded');
  return Math.round(usdAmount * rate * 100) / 100;
}

