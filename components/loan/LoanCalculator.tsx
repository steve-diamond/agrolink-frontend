"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────

const MIN_AMOUNT = 50_000;
const MAX_AMOUNT = 5_000_000;
const STEP_AMOUNT = 10_000;

const PERIODS = [3, 6, 12, 18, 24] as const;
type Period = (typeof PERIODS)[number];

// Colours consistent with dashboard palette
const GREEN = "#16a34a";
const AMBER = "#d97706";
const RED_COL = "#dc2626";
const SLATE = "#475569";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

function fmtShort(n: number) {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toFixed(0)}`;
}

/** Standard flat-rate amortisation (equal monthly instalments). */
function buildSchedule(
  principal: number,
  annualRate: number,
  months: number,
): AmortRow[] {
  const monthlyRate = annualRate / 100 / 12;
  // Monthly payment using standard annuity formula
  const pmt =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  const rows: AmortRow[] = [];
  let balance = principal;

  for (let m = 1; m <= months; m++) {
    const interestPart = balance * monthlyRate;
    const principalPart = pmt - interestPart;
    balance = Math.max(0, balance - principalPart);
    rows.push({
      month: m,
      payment: pmt,
      principal: principalPart,
      interest: interestPart,
      balance,
    });
  }
  return rows;
}

interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/** Affordability colour + label based on monthly payment / monthly income ratio */
function affordability(payment: number, income: number) {
  if (income <= 0) return null;
  const ratio = payment / income;
  if (ratio <= 0.3)
    return { color: GREEN, label: "Affordable", bar: ratio, icon: "✅" };
  if (ratio <= 0.5)
    return { color: AMBER, label: "Moderate", bar: ratio, icon: "⚠️" };
  return {
    color: RED_COL,
    label: "High Debt-to-Income",
    bar: Math.min(ratio, 1),
    icon: "🔴",
  };
}

// ─── Custom donut label ───────────────────────────────────────────────────────

interface DonutCenterLabelProps {
  cx?: number;
  cy?: number;
  principal: number;
  total: number;
  [key: string]: unknown;
}

function DonutCenterLabel({
  cx = 0,
  cy = 0,
  principal,
  total,
}: DonutCenterLabelProps) {
  const pct = total > 0 ? Math.round((principal / total) * 100) : 0;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan
        x={cx}
        dy="-0.6em"
        fontSize="20"
        fontWeight="700"
        fill="#1e293b"
      >
        {pct}%
      </tspan>
      <tspan x={cx} dy="1.4em" fontSize="11" fill={SLATE}>
        principal
      </tspan>
    </text>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────

function Slider({
  value,
  min,
  max,
  step,
  onChange,
  formatLabel,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  formatLabel?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative">
      <div
        className="relative h-3 w-full cursor-pointer rounded-full bg-slate-200"
        style={{ touchAction: "none" }}
      >
        {/* filled track */}
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-green-600"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Loan amount"
        />
        {/* thumb */}
        {/* eslint-disable-next-line react/forbid-dom-props */}
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-green-600 shadow-md"
          style={{ left: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
        <span>{formatLabel ? formatLabel(min) : min}</span>
        <span>{formatLabel ? formatLabel(max) : max}</span>
      </div>
    </div>
  );
}

// ─── Payment timeline (calendar visual) ──────────────────────────────────────

function PaymentTimeline({
  schedule,
  months,
}: {
  schedule: AmortRow[];
  months: number;
}) {
  const maxPmt = Math.max(...schedule.map((r) => r.payment));

  return (
    <div className="overflow-x-auto pb-1">
      <div
        className="flex gap-1.5"
        style={{ minWidth: months <= 12 ? "100%" : months * 28 }}
      >
        {schedule.map((row) => {
          const heightPct = (row.payment / maxPmt) * 100;
          const principalH = (row.principal / row.payment) * heightPct;
          const isLast = row.month === months;

          return (
            <div
              key={row.month}
              className="group relative flex flex-1 flex-col items-center"
              style={{ minWidth: 22 }}
            >
              {/* bar */}
              <div className="flex h-16 w-full flex-col-reverse overflow-hidden rounded-sm bg-slate-100">
                {/* interest portion (bottom) */}
                <div
                  className="w-full bg-amber-400 transition-all duration-300"
                  style={{ height: `${heightPct - principalH}%` }}
                />
                {/* principal portion (top) */}
                <div
                  className={`w-full transition-all duration-300 ${isLast ? "bg-green-400" : "bg-green-600"}`}
                  style={{ height: `${principalH}%` }}
                />
              </div>
              <span className="mt-0.5 text-[8px] text-slate-400">
                {row.month}
              </span>

              {/* hover tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] shadow-lg opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                <p className="font-bold text-slate-800">Month {row.month}</p>
                <p className="text-green-700">
                  Principal: {fmtShort(row.principal)}
                </p>
                <p className="text-amber-600">
                  Interest: {fmtShort(row.interest)}
                </p>
                <p className="text-slate-500">
                  Balance: {fmtShort(row.balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Amortisation table ───────────────────────────────────────────────────────

function AmortTable({ schedule }: { schedule: AmortRow[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-600">
            <th className="px-3 py-2.5 font-semibold">Month</th>
            <th className="px-3 py-2.5 font-semibold">Payment</th>
            <th className="px-3 py-2.5 font-semibold text-green-700">
              Principal
            </th>
            <th className="px-3 py-2.5 font-semibold text-amber-600">
              Interest
            </th>
            <th className="px-3 py-2.5 font-semibold">Balance</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {schedule.map((row) => (
            <tr
              key={row.month}
              className="transition-colors hover:bg-green-50"
            >
              <td className="px-3 py-2 font-medium text-slate-700">
                {row.month}
              </td>
              <td className="px-3 py-2 text-slate-700">
                {fmt(row.payment, 2)}
              </td>
              <td className="px-3 py-2 text-green-700">
                {fmt(row.principal, 2)}
              </td>
              <td className="px-3 py-2 text-amber-600">
                {fmt(row.interest, 2)}
              </td>
              <td className="px-3 py-2 text-slate-500">
                {fmt(row.balance, 2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 font-semibold text-slate-700">
            <td className="px-3 py-2.5">Total</td>
            <td className="px-3 py-2.5">
              {fmt(
                schedule.reduce((s, r) => s + r.payment, 0),
                2,
              )}
            </td>
            <td className="px-3 py-2.5 text-green-700">
              {fmt(
                schedule.reduce((s, r) => s + r.principal, 0),
                2,
              )}
            </td>
            <td className="px-3 py-2.5 text-amber-600">
              {fmt(
                schedule.reduce((s, r) => s + r.interest, 0),
                2,
              )}
            </td>
            <td className="px-3 py-2.5">—</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ─── PDF download (plain CSV fallback — no extra deps) ────────────────────────

function downloadSchedule(schedule: AmortRow[], principal: number, rate: number, months: number) {
  const header = ["Month", "Payment (₦)", "Principal (₦)", "Interest (₦)", "Balance (₦)"].join(",");
  const rows = schedule.map(
    (r) =>
      [
        r.month,
        r.payment.toFixed(2),
        r.principal.toFixed(2),
        r.interest.toFixed(2),
        r.balance.toFixed(2),
      ].join(","),
  );
  const summary = [
    `Loan Amount,${principal}`,
    `Annual Interest Rate,${rate}%`,
    `Repayment Period,${months} months`,
    "",
    header,
    ...rows,
  ].join("\n");

  const blob = new Blob([summary], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `agrolink-loan-schedule-${months}mo.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Custom tooltip for donut ─────────────────────────────────────────────────

function DonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow">
      <p className="font-semibold" style={{ color: p.payload.fill }}>
        {p.name}
      </p>
      <p className="text-slate-700">{fmt(p.value, 0)}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface LoanCalculatorProps {
  /** Pre-set initial loan amount (e.g. from eligibility check) */
  initialAmount?: number;
  /** Override the fetched interest rate for testing */
  interestRateOverride?: number;
  /** Monthly income for affordability indicator */
  monthlyIncome?: number;
  /** Callback when user clicks Apply Now */
  onApply?: (amount: number, period: number) => void;
}

export function LoanCalculator({
  initialAmount = 500_000,
  interestRateOverride,
  monthlyIncome = 0,
  onApply,
}: LoanCalculatorProps) {
  // ── Inputs ──────────────────────────────────────────────────────────────────
  const [amount, setAmount] = useState(
    Math.min(Math.max(initialAmount, MIN_AMOUNT), MAX_AMOUNT),
  );
  const [period, setPeriod] = useState<Period>(12);
  const [income, setIncome] = useState(monthlyIncome);

  // ── Interest rate (simulates API fetch) ─────────────────────────────────────
  const [rate, setRate] = useState(interestRateOverride ?? 18);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateLabel, setRateLabel] = useState("Standard");

  useEffect(() => {
    if (interestRateOverride !== undefined) return;
    setRateLoading(true);
    // Simulate API call (would be replaced with real fetch)
    const t = setTimeout(() => {
      setRate(18);
      setRateLabel("Standard (CBN-approved)");
      setRateLoading(false);
    }, 900);
    return () => clearTimeout(t);
  }, [interestRateOverride]);

  // ── Calculations ─────────────────────────────────────────────────────────────
  const schedule = useMemo(
    () => buildSchedule(amount, rate, period),
    [amount, rate, period],
  );

  const totalRepayment = useMemo(
    () => schedule.reduce((s, r) => s + r.payment, 0),
    [schedule],
  );
  const totalInterest = useMemo(
    () => totalRepayment - amount,
    [totalRepayment, amount],
  );
  const monthlyPayment = schedule[0]?.payment ?? 0;

  const donutData = useMemo(
    () => [
      { name: "Principal", value: amount, fill: GREEN },
      { name: "Interest", value: totalInterest, fill: AMBER },
    ],
    [amount, totalInterest],
  );

  const afford = useMemo(
    () => affordability(monthlyPayment, income),
    [monthlyPayment, income],
  );

  // ── UI state ──────────────────────────────────────────────────────────────────
  const [showSchedule, setShowSchedule] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const toggleSchedule = useCallback(() => {
    setShowSchedule((v) => !v);
    if (!showSchedule) {
      setTimeout(
        () => tableRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        120,
      );
    }
  }, [showSchedule]);

  // Animated number formatting (instant update)
  const animKey = `${amount}-${period}-${rate}`;

  return (
    <div className="space-y-6">
      {/* ── Inputs card ─────────────────────────────────────────────────── */}
      <div className="card p-5 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-green-900">Loan Calculator</h2>
            <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold text-green-800">
              Real-time
            </span>
          </div>

          {/* Amount slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Loan Amount
              </label>
              <motion.span
                key={amount}
                initial={{ scale: 1.1, color: GREEN }}
                animate={{ scale: 1, color: "#1e293b" }}
                transition={{ duration: 0.3 }}
                className="text-base font-extrabold"
              >
                {fmt(amount)}
              </motion.span>
            </div>
            <Slider
              value={amount}
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={STEP_AMOUNT}
              onChange={setAmount}
              formatLabel={fmtShort}
            />

            {/* Quick-select buttons */}
            <div className="flex flex-wrap gap-2">
              {[100_000, 250_000, 500_000, 1_000_000, 2_500_000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors
                    ${amount === v
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-slate-300 text-slate-600 hover:border-green-500 hover:text-green-700"
                    }`}
                >
                  {fmtShort(v)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Period + Rate row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Repayment Period
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {PERIODS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPeriod(m)}
                  className={`rounded-lg border-2 py-2 text-xs font-semibold transition-all
                    ${period === m
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-green-400"
                    }`}
                >
                  {m}mo
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Interest Rate{" "}
              <span className="font-normal text-slate-400">(per annum)</span>
            </label>
            <div
              className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3"
              title="Rate sourced from your profile and current CBN guidelines"
            >
              {rateLoading ? (
                <span className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              ) : (
                <>
                  <span className="text-lg font-extrabold text-green-700">
                    {rate}%
                  </span>
                  <span className="ml-2 text-[11px] text-slate-500">
                    {rateLabel}
                  </span>
                  <span
                    className="ml-auto text-[10px] text-slate-400 cursor-help"
                    title="Interest rate is set by Agrolink based on your credit profile and CBN lending guidelines. It cannot be edited here."
                  >
                    🔒 Fixed
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Affordability income input */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Your Monthly Income{" "}
            <span className="font-normal text-slate-400">
              (for affordability check)
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₦
            </span>
            <input
              type="number"
              min={0}
              step={5000}
              value={income || ""}
              placeholder="80,000"
              onChange={(e) =>
                setIncome(e.target.value ? Number(e.target.value) : 0)
              }
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-7 pr-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-green-500 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      <motion.div
        key={animKey}
        initial={{ opacity: 0.7 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {/* Monthly repayment – hero card */}
        <div className="sm:col-span-2 lg:col-span-1 card p-5 flex flex-col items-center justify-center text-center bg-green-700 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-80">
            Monthly Repayment
          </p>
          <p className="mt-2 text-4xl font-extrabold leading-none">
            {fmt(monthlyPayment)}
          </p>
          <p className="mt-1 text-xs opacity-70">for {period} months</p>
        </div>

        {/* Total interest */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Interest
          </p>
          <p
            className="mt-2 text-2xl font-extrabold"
            style={{
              color:
                totalInterest / amount < 0.1
                  ? GREEN
                  : totalInterest / amount < 0.25
                  ? AMBER
                  : RED_COL,
            }}
          >
            {fmt(totalInterest)}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            {((totalInterest / amount) * 100).toFixed(1)}% of principal
          </p>
        </div>

        {/* Total repayment */}
        <div className="card p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Repayment
          </p>
          <p className="mt-2 text-2xl font-extrabold text-slate-800">
            {fmt(totalRepayment)}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            Principal + interest
          </p>
        </div>
      </motion.div>

      {/* ── Visuals row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Donut chart */}
        <div className="card p-5">
          <h3 className="mb-4 text-sm font-bold text-slate-700">
            Principal vs Interest Breakdown
          </h3>
          <div className="flex items-center gap-6">
            <div className="h-44 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="78%"
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationBegin={0}
                    animationDuration={600}
                    label={(props: { cx: number; cy: number }) => (
                      <DonutCenterLabel
                        {...props}
                        principal={amount}
                        total={totalRepayment}
                      />
                    )}
                    labelLine={false}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} strokeWidth={0} />
                    ))}
                  </Pie>
                  <ReTooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 text-sm shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ background: GREEN }}
                />
                <div>
                  <p className="font-semibold text-slate-700">Principal</p>
                  <p className="text-xs text-slate-500">{fmt(amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-sm"
                  style={{ background: AMBER }}
                />
                <div>
                  <p className="font-semibold text-slate-700">Interest</p>
                  <p className="text-xs text-slate-500">{fmt(totalInterest)}</p>
                </div>
              </div>
              <hr className="border-slate-100" />
              <div>
                <p className="text-xs text-slate-400">Total</p>
                <p className="font-bold text-slate-800">
                  {fmt(totalRepayment)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment timeline */}
        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">
              Payment Timeline
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-green-600" />
                Principal
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-sm bg-amber-400" />
                Interest
              </span>
            </div>
          </div>
          <PaymentTimeline schedule={schedule} months={period} />
          <p className="mt-2 text-[10px] text-slate-400 text-center">
            Hover each bar for details · Month numbers shown on x-axis
          </p>
        </div>
      </div>

      {/* ── Affordability indicator ──────────────────────────────────────── */}
      <div className="card p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Affordability Indicator
        </h3>
        {income > 0 && afford ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{afford.icon}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: afford.color }}
                >
                  {afford.label}
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-600">
                {((monthlyPayment / income) * 100).toFixed(0)}% of income
              </span>
            </div>

            {/* Meter */}
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-200">
              {/* zones */}
              <div className="absolute inset-y-0 left-0 w-[30%] rounded-l-full bg-green-200" />
              <div className="absolute inset-y-0 left-[30%] w-[20%] bg-amber-200" />
              <div className="absolute inset-y-0 left-[50%] right-0 rounded-r-full bg-red-200" />
              {/* needle */}
              <motion.div
                key={afford.bar}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(afford.bar * 100, 100)}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full border-r-2 border-white"
                style={{ background: afford.color, opacity: 0.85 }}
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400">
              <span className="text-green-600 font-medium">≤30% Affordable</span>
              <span className="text-amber-600 font-medium">31–50% Moderate</span>
              <span className="text-red-500 font-medium">&gt;50% High Risk</span>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              Monthly repayment of{" "}
              <strong>{fmt(monthlyPayment)}</strong> on a{" "}
              <strong>{fmt(income)}</strong> income leaves{" "}
              <strong
                style={{ color: (income - monthlyPayment) > 0 ? GREEN : RED_COL }}
              >
                {fmt(Math.max(income - monthlyPayment, 0))}
              </strong>{" "}
              per month after loan payment.
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-sm text-slate-400">
            Enter your monthly income above to see the affordability analysis.
          </div>
        )}
      </div>

      {/* ── Amortisation schedule ────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <button
          type="button"
          onClick={toggleSchedule}
          className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>📅 Amortisation Schedule</span>
          <span className="flex items-center gap-2 text-xs font-normal text-slate-500">
            {period} payments
            <motion.span
              animate={{ rotate: showSchedule ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-block"
            >
              ▼
            </motion.span>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {showSchedule && (
            <motion.div
              ref={tableRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing all {period} monthly payments
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      downloadSchedule(schedule, amount, rate, period)
                    }
                    className="flex items-center gap-1.5 rounded-lg border border-green-600 px-3 py-1.5 text-xs font-semibold text-green-700 transition-colors hover:bg-green-50"
                  >
                    ⬇ Download CSV
                  </button>
                </div>
                <AmortTable schedule={schedule} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 space-y-1.5">
        <p className="font-semibold text-slate-600">⚠️ Disclaimer</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>
            All calculations are for indicative purposes only and do not
            constitute a binding loan offer.
          </li>
          <li>
            The actual interest rate applied will be confirmed upon loan
            approval, subject to credit assessment and prevailing CBN
            guidelines.
          </li>
          <li>
            Repayment amounts may vary based on disbursement date and any
            applicable processing fees.
          </li>
          <li>
            Loan approval is not guaranteed and is subject to Agrolink&apos;s
            credit policies and eligibility criteria.
          </li>
        </ul>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="card p-5 flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex-1">
          <p className="text-base font-bold text-green-900">
            Ready to apply for {fmt(amount)}?
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {fmt(monthlyPayment)}/month · {period} months · {rate}% p.a.
            · Est. processing: 24–48 hrs
          </p>
        </div>
        <a
          href="/loan-application"
          onClick={(e) => {
            if (onApply) {
              e.preventDefault();
              onApply(amount, period);
            }
          }}
          className="shrink-0 rounded-xl bg-green-700 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-800 hover:shadow-md active:scale-95"
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}
