"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalytics } from "@/hooks/useAnalytics";
import { submitLoanApplication } from "@/services/loanService";

// ─── Schema ───────────────────────────────────────────────────────────────────

const loanSchema = z.object({
  // Step 1
  loanPurpose: z.enum(["working_capital", "equipment", "expansion"], {
    error: "Please select a loan purpose",
  }),
  amountNeeded: z
    .number({ error: "Amount is required" })
    .min(50000, "Minimum is ₦50,000")
    .max(5000000, "Maximum is ₦5,000,000"),
  repaymentPeriod: z.enum(["3", "6", "12", "24"], {
    error: "Please select a repayment period",
  }),

  // Step 2
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  bvn: z
    .string()
    .length(11, "BVN must be 11 digits")
    .regex(/^\d+$/, "BVN must be numbers only"),
  bvnVerified: z.boolean().optional().default(false),
  nextOfKinName: z.string().min(2, "Required"),
  nextOfKinPhone: z.string().min(10, "Required"),
  nextOfKinRelationship: z.string().min(1, "Required"),
  guarantorName: z.string().optional().default(""),
  guarantorPhone: z.string().optional().default(""),
  guarantorAddress: z.string().optional().default(""),

  // Step 3
  farmAddress: z.string().min(5, "Farm address required"),
  farmState: z.string().min(2, "State required"),
  farmLga: z.string().min(2, "LGA required"),
  farmLatitude: z.number().optional(),
  farmLongitude: z.number().optional(),
  cropTypes: z.string().min(2, "Enter crop types"),
  yieldHistory: z.string().min(2, "Describe yield history"),
  inventoryValue: z
    .number({ error: "Required" })
    .min(0, "Must be positive"),
  monthlyIncome: z
    .number({ error: "Required" })
    .min(0, "Must be positive"),

  // Step 4
  hasOutstandingLoans: z.enum(["yes", "no"]).optional(),
  outstandingLoanDetails: z.string().optional().default(""),
  outstandingAmount: z.number().optional(),
  hasCollateral: z.enum(["yes", "no"]).optional(),
  collateralDetails: z.string().optional().default(""),
  collateralValue: z.number().optional(),

  // Step 5
  termsAccepted: z.boolean().refine((v) => v === true, {
    message: "You must accept the terms and conditions",
  }),
  signatureData: z.string().min(1, "Please provide your digital signature"),
});

type LoanFormData = z.infer<typeof loanSchema>;

// Captures the exact return type produced by useForm (including resolver generics)
// so step component props match without fighting the 3-way generic in UseFormReturn.
type LoanForm = ReturnType<typeof useForm<LoanFormData>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const STEP_TITLES = [
  "Eligibility Check",
  "Personal Information",
  "Business & Farm Details",
  "Financial Information",
  "Review & Submit",
];

// Fields validated on each step before advancing
const STEP_FIELDS: Array<(keyof LoanFormData)[]> = [
  ["loanPurpose", "amountNeeded", "repaymentPeriod"],
  [
    "fullName",
    "email",
    "phone",
    "bvn",
    "nextOfKinName",
    "nextOfKinPhone",
    "nextOfKinRelationship",
  ],
  [
    "farmAddress",
    "farmState",
    "farmLga",
    "cropTypes",
    "yieldHistory",
    "inventoryValue",
    "monthlyIncome",
  ],
  [],
  ["termsAccepted", "signatureData"],
];

const TOTAL_STEPS = 5;
const STORAGE_KEY = "agrolink_loan_draft";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue",
  "Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu",
  "FCT – Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina",
  "Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo",
  "Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara",
];

const PURPOSE_LABELS: Record<string, string> = {
  working_capital: "Working Capital",
  equipment: "Equipment",
  expansion: "Expansion",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(v);
}

function calcEligibilityScore(
  purpose: string,
  amount: number,
  period: string,
): number {
  let score = purpose === "working_capital" ? 40 : purpose === "equipment" ? 35 : 30;
  if (amount <= 500_000) score += 30;
  else if (amount <= 1_500_000) score += 20;
  else if (amount <= 3_000_000) score += 10;
  else score += 5;
  score += period === "24" ? 20 : period === "12" ? 15 : period === "6" ? 10 : 5;
  return Math.min(score, 95);
}

function fieldCls(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors
    focus:ring-2 focus:ring-green-500 bg-white
    ${hasError ? "border-red-400 focus:ring-red-400" : "border-slate-300"}`;
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function ProgressStepper({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-green-800">
          Step {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-xs text-slate-500">{STEP_TITLES[currentStep]}</span>
      </div>
      <div
        className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200"
      >
        <motion.div
          className="h-full rounded-full bg-linear-to-r from-green-500 to-amber-500"
          initial={false}
          animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>
      <ol className="mt-3 flex justify-between" aria-label="Application steps">
        {STEP_TITLES.map((title, i) => (
          <li
            key={i}
            className="flex w-1/5 flex-col items-center"
            aria-current={i === currentStep ? "step" : undefined}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300
                ${i < currentStep
                  ? "bg-green-600 text-white"
                  : i === currentStep
                  ? "bg-amber-500 text-white ring-2 ring-amber-300 ring-offset-1"
                  : "bg-slate-200 text-slate-500"
                }`}
                aria-label={i < currentStep ? `${title} — completed` : i === currentStep ? `${title} — current` : `${title} — upcoming`}
            >
              {i < currentStep ? <span aria-hidden="true">✓</span> : <span aria-hidden="true">{i + 1}</span>}
            </div>
            <span className="mt-1 hidden text-center text-[10px] leading-tight text-slate-500 sm:block" aria-hidden="true">
              {title}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── File Upload Zone ─────────────────────────────────────────────────────────

interface UploadedFile {
  file: File;
  progress: number;
  done: boolean;
  preview?: string;
}

function FileUploadZone({
  label,
  accept,
  maxFiles,
  files,
  onChange,
}: {
  label: string;
  accept: string;
  maxFiles: number;
  files: UploadedFile[];
  onChange: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = useCallback(
    (incoming: FileList) => {
      const slots = maxFiles - files.length;
      if (slots <= 0) return;
      const toAdd = Array.from(incoming).slice(0, slots);

      const pending: UploadedFile[] = toAdd.map((file) => ({
        file,
        progress: 0,
        done: false,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));

      onChange((prev) => {
        const startIdx = prev.length;
        const next = [...prev, ...pending];

        // Simulate per-file upload progress after state is updated
        pending.forEach((_, relIdx) => {
          const absIdx = startIdx + relIdx;
          let pct = 0;
          const timer = setInterval(() => {
            pct = Math.min(pct + Math.random() * 20 + 10, 100);
            const done = pct >= 100;
            onChange((cur) =>
              cur.map((f, i) =>
                i === absIdx ? { ...f, progress: Math.round(pct), done } : f,
              ),
            );
            if (done) clearInterval(timer);
          }, 180);
        });

        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files.length, maxFiles, onChange],
  );

  const full = files.length >= maxFiles;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{label}</p>
      {/* Use a <label> wrapping the drop zone so clicking activates the file input
          without nesting interactive controls (avoids aria lint violation) */}
      <label
        htmlFor={`file-upload-${label.replace(/\s+/g, "-")}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        className={`block rounded-xl border-2 border-dashed p-6 text-center transition-colors
          ${dragging ? "border-green-500 bg-green-50" : "border-slate-300 bg-slate-50 hover:border-green-400 hover:bg-green-50"}
          ${full ? "pointer-events-none cursor-default opacity-50" : "cursor-pointer"}`}
      >
        <div className="mb-2 text-3xl">📁</div>
        <p className="text-sm text-slate-600">
          {full
            ? "Maximum files reached"
            : `Drop files here or click to browse (${files.length}/${maxFiles})`}
        </p>
        <p className="mt-1 text-xs text-slate-400">{accept}</p>
        <input
          ref={inputRef}
          id={`file-upload-${label.replace(/\s+/g, "-")}`}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          aria-label={label}
          className="sr-only"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </label>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((uf, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-lg border bg-white p-3"
            >
              {uf.preview ? (
                // Preview URLs are blob/object URLs generated at runtime.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uf.preview}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-slate-100 text-lg">
                  📄
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-slate-700">
                  {uf.file.name}
                </p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className={`h-full rounded-full transition-all duration-200 ${uf.done ? "bg-green-500" : "bg-amber-500"}`}
                    initial={false}
                    animate={{ width: `${uf.progress}%` }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-0.5 text-[10px] text-slate-400">
                  {uf.done ? "✓ Uploaded" : `${uf.progress}%`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Remove file"
                onClick={() => onChange((prev) => prev.filter((_, fi) => fi !== i))}
                className="text-lg text-slate-400 transition-colors hover:text-red-500"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Signature Pad ────────────────────────────────────────────────────────────

function SignaturePad({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (data: string) => void;
  error?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasContent, setHasContent] = useState(!!value);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX =
      "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    drawing.current = true;
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e3a2f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    setHasContent(true);
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onChange("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Digital Signature *</p>
        {hasContent && (
          <button
            type="button"
            onClick={clear}
            className="text-xs text-red-500 hover:underline"
          >
            Clear
          </button>
        )}
      </div>
      <div
        className={`overflow-hidden rounded-xl border-2 ${error ? "border-red-400" : "border-slate-300"}`}
      >
        <p className="border-b border-slate-200 bg-slate-50 px-3 py-1 text-center text-[10px] text-slate-400">
          Draw your signature below using mouse or finger
        </p>
        <canvas
          ref={canvasRef}
          width={600}
          height={150}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="h-37.5 w-full touch-none cursor-crosshair bg-white"
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Terms Modal ──────────────────────────────────────────────────────────────

function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-white">
        <div className="flex items-center justify-between border-b p-5">
          <h3 id="terms-title" className="text-lg font-bold text-green-900">
            Terms & Conditions
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-2xl text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto p-5 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Agrolink Loan Agreement – Key Terms</p>
          <ol className="list-decimal space-y-2 pl-5">
            {[
              ["Eligibility", "You must be at least 18 years old and have an active farm or agricultural business in Nigeria."],
              ["BVN Verification", "Your Bank Verification Number will be used to verify your identity through the CBN BVN system. Providing false BVN information is a criminal offence under Nigerian law."],
              ["Credit Check", "By submitting this application, you authorize Agrolink to perform a credit check using any recognized credit bureau in Nigeria."],
              ["Repayment", "Loan repayments are due on the agreed schedule. Late payments attract a penalty of 2% per month on the outstanding balance."],
              ["Collateral", "For loans above ₦500,000, collateral may be required. Failure to repay may result in recovery of provided collateral."],
              ["Use of Funds", "Loan funds must be used solely for the stated agricultural purpose. Misuse of funds is grounds for immediate loan recall."],
              ["Data Privacy", "Your personal and financial data will be processed in accordance with the Nigeria Data Protection Act (NDPA). We will not sell your data to third parties without your consent."],
              ["Processing Time", "Applications are typically processed within 24–48 business hours. Complex applications may take longer."],
              ["Interest Rate", "Interest rates are subject to prevailing market rates and your credit assessment. The exact rate will be communicated upon approval."],
              ["Right to Decline", "Agrolink reserves the right to decline any loan application without providing a specific reason."],
            ].map(([title, body]) => (
              <li key={title}>
                <strong>{title}:</strong> {body}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-slate-400">
            Last updated: January 2025. For queries, contact support@agrolink.ng
          </p>
        </div>
        <div className="border-t p-5">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white transition-colors hover:bg-green-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 – Eligibility Check ───────────────────────────────────────────────

function Step1({ form }: { form: LoanForm }) {
  const {
    control,
    watch,
    formState: { errors },
  } = form;
  const [purpose, amount, period] = watch([
    "loanPurpose",
    "amountNeeded",
    "repaymentPeriod",
  ]);

  const score = useMemo(() => {
    if (!purpose || !amount || !period) return null;
    return calcEligibilityScore(purpose, amount, period);
  }, [purpose, amount, period]);

  const scoreColor =
    score === null
      ? ""
      : score >= 70
      ? "text-green-600"
      : score >= 50
      ? "text-amber-600"
      : "text-red-500";

  const barColor =
    score === null
      ? ""
      : score >= 70
      ? "bg-green-500"
      : score >= 50
      ? "bg-amber-500"
      : "bg-red-400";

  const scoreMessage =
    score === null
      ? ""
      : score >= 70
      ? "🎉 High likelihood of approval. Continue to complete your application."
      : score >= 50
      ? "⚡ Moderate eligibility. Completing all steps increases your chances."
      : "⚠️ Consider reducing the amount or extending the repayment period.";

  return (
    <div className="space-y-6">
      {/* Loan Purpose */}
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-slate-700">Loan Purpose <span aria-label="required">*</span></legend>
        <Controller
          name="loanPurpose"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  value: "working_capital",
                  label: "Working Capital",
                  desc: "Seeds, fertilizer, labour",
                  icon: "🌱",
                },
                {
                  value: "equipment",
                  label: "Equipment",
                  desc: "Tractors, irrigation, tools",
                  icon: "🚜",
                },
                {
                  value: "expansion",
                  label: "Expansion",
                  desc: "New land, storage, processing",
                  icon: "📈",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all
                    ${field.value === opt.value
                      ? "border-green-600 bg-green-50"
                      : "border-slate-200 hover:border-green-300"
                    }`}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                  />
                  <span className="mb-1 block text-2xl">{opt.icon}</span>
                  <p className="text-sm font-semibold text-slate-800">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{opt.desc}</p>
                </label>
              ))}
            </div>
          )}
        />
        {errors.loanPurpose && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.loanPurpose.message as string}
          </p>
        )}
      </fieldset>

      {/* Amount */}
      <div>
        <label className="text-sm font-semibold text-slate-700">
          Amount Needed (₦50,000 – ₦5,000,000) *
        </label>
        <Controller
          name="amountNeeded"
          control={control}
          render={({ field }) => (
            <div className="relative mt-1.5">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                ₦
              </span>
              <input
                type="number"
                min={50000}
                max={5000000}
                step={10000}
                placeholder="500,000"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? Number(e.target.value) : undefined,
                  )
                }
                className={`${fieldCls(!!errors.amountNeeded)} pl-8`}
              />
            </div>
          )}
        />
        {errors.amountNeeded ? (
          <p className="mt-1 text-xs text-red-500">
            {errors.amountNeeded.message as string}
          </p>
        ) : (
          amount &&
          amount >= 50000 &&
          amount <= 5000000 && (
            <p className="mt-1 text-xs font-medium text-green-700">
              {formatCurrency(amount)}
            </p>
          )
        )}
      </div>

      {/* Repayment Period */}
      <fieldset>
        <legend className="text-sm font-semibold text-slate-700">
          Repayment Period <span aria-label="required">*</span>
        </legend>
        <Controller
          name="repaymentPeriod"
          control={control}
          render={({ field }) => (
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["3", "6", "12", "24"] as const).map((m) => (
                <label
                  key={m}
                  className={`cursor-pointer rounded-lg border-2 py-3 text-center transition-all
                    ${field.value === m
                      ? "border-green-600 bg-green-50 text-green-800"
                      : "border-slate-200 text-slate-600 hover:border-green-300"
                    }`}
                >
                  <input
                    type="radio"
                    name="repaymentPeriod"
                    className="sr-only"
                    value={m}
                    checked={field.value === m}
                    onChange={() => field.onChange(m)}
                  />
                  <span className="block text-sm font-semibold">{m} mo</span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.repaymentPeriod && (
          <p role="alert" className="mt-1 text-xs text-red-500">
            {errors.repaymentPeriod.message as string}
          </p>
        )}
      </fieldset>

      {/* Eligibility Calculator */}
      <AnimatePresence>
        {score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-green-200 bg-green-50 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-green-800">
                Instant Eligibility Score
              </p>
              <span className={`text-xl font-extrabold ${scoreColor}`}>
                {score}%
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-green-200">
              <motion.div
                className={`h-full rounded-full ${barColor}`}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p
              className="mt-2 text-xs text-green-700"
              aria-live="polite"
              aria-atomic="true"
            >
              {scoreMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step 2 – Personal Information ───────────────────────────────────────────

function Step2({ form }: { form: LoanForm }) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const [bvnStatus, setBvnStatus] = useState<
    "idle" | "verifying" | "verified" | "failed"
  >("idle");
  const bvnValue = watch("bvn");

  const verifyBvn = async () => {
    if (!bvnValue || bvnValue.length !== 11) return;
    setBvnStatus("verifying");
    await new Promise((r) => setTimeout(r, 1800));
    setBvnStatus("verified");
    setValue("bvnVerified", true);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        ℹ️ Some fields may be pre-filled from your profile. You can edit them if needed.
      </div>

      {/* Identity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Full Name *
          </label>
          <input
            {...register("fullName")}
            placeholder="Adebayo Ibrahim"
            className={fieldCls(!!errors.fullName)}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.fullName.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Email *
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={fieldCls(!!errors.email)}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Phone Number *
          </label>
          <input
            {...register("phone")}
            type="tel"
            placeholder="08012345678"
            className={fieldCls(!!errors.phone)}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">
              {errors.phone.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            BVN (11 digits) *
          </label>
          <div className="flex gap-2">
            <input
              {...register("bvn")}
              maxLength={11}
              placeholder="22345678901"
              className={`flex-1 ${fieldCls(!!errors.bvn)}`}
            />
            <button
              type="button"
              onClick={verifyBvn}
              disabled={bvnStatus === "verifying" || bvnStatus === "verified"}
              className={`whitespace-nowrap rounded-lg border px-3 text-xs font-semibold transition-colors
                ${bvnStatus === "verified"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : bvnStatus === "verifying"
                  ? "border-slate-300 bg-slate-50 text-slate-400"
                  : "border-green-600 bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
                }`}
            >
              {bvnStatus === "verifying"
                ? "Verifying…"
                : bvnStatus === "verified"
                ? "✓ Verified"
                : "Verify BVN"}
            </button>
          </div>
          {errors.bvn && (
            <p className="mt-1 text-xs text-red-500">
              {errors.bvn.message as string}
            </p>
          )}
          {bvnStatus === "failed" && (
            <p className="mt-1 text-xs text-red-500">
              Verification failed. Please check your BVN and try again.
            </p>
          )}
        </div>
      </div>

      {/* Next of Kin */}
      <hr className="border-slate-200" />
      <p className="text-sm font-semibold text-slate-700">Next of Kin</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Full Name *
          </label>
          <input
            {...register("nextOfKinName")}
            placeholder="Fatima Ibrahim"
            className={fieldCls(!!errors.nextOfKinName)}
          />
          {errors.nextOfKinName && (
            <p className="mt-1 text-xs text-red-500">
              {errors.nextOfKinName.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Phone *
          </label>
          <input
            {...register("nextOfKinPhone")}
            type="tel"
            placeholder="07012345678"
            className={fieldCls(!!errors.nextOfKinPhone)}
          />
          {errors.nextOfKinPhone && (
            <p className="mt-1 text-xs text-red-500">
              {errors.nextOfKinPhone.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Relationship *
          </label>
          <select
            {...register("nextOfKinRelationship")}
            className={fieldCls(!!errors.nextOfKinRelationship)}
          >
            <option value="">Select…</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="sibling">Sibling</option>
            <option value="child">Child</option>
            <option value="other">Other</option>
          </select>
          {errors.nextOfKinRelationship && (
            <p className="mt-1 text-xs text-red-500">
              {errors.nextOfKinRelationship.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Guarantor */}
      <hr className="border-slate-200" />
      <p className="text-sm font-semibold text-slate-700">
        Guarantor{" "}
        <span className="font-normal text-slate-400">(optional)</span>
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Full Name
          </label>
          <input
            {...register("guarantorName")}
            placeholder="John Doe"
            className={fieldCls(false)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Phone
          </label>
          <input
            {...register("guarantorPhone")}
            type="tel"
            placeholder="09012345678"
            className={fieldCls(false)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Address
          </label>
          <input
            {...register("guarantorAddress")}
            placeholder="12 Main St, Lagos"
            className={fieldCls(false)}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 3 – Business / Farm Details ────────────────────────────────────────

function Step3({
  form,
  farmPhotos,
  setFarmPhotos,
}: {
  form: LoanForm;
  farmPhotos: UploadedFile[];
  setFarmPhotos: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}) {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-5">
      {/* Location */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Farm Address *
          </label>
          <input
            {...register("farmAddress")}
            placeholder="Plot 12, Kiru Road, Kano"
            className={fieldCls(!!errors.farmAddress)}
          />
          {errors.farmAddress && (
            <p className="mt-1 text-xs text-red-500">
              {errors.farmAddress.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            State *
          </label>
          <select
            {...register("farmState")}
            className={fieldCls(!!errors.farmState)}
          >
            <option value="">Select state…</option>
            {NIGERIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.farmState && (
            <p className="mt-1 text-xs text-red-500">
              {errors.farmState.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            LGA *
          </label>
          <input
            {...register("farmLga")}
            placeholder="Kiru"
            className={fieldCls(!!errors.farmLga)}
          />
          {errors.farmLga && (
            <p className="mt-1 text-xs text-red-500">
              {errors.farmLga.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Coordinates (optional helper) */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="mb-1 text-xs font-semibold text-slate-600">
          📍 GPS Coordinates{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </p>
        <p className="mb-3 text-xs text-slate-500">
          Our field officers will verify your farm location during due diligence.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="9.0579"
              {...register("farmLatitude", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] font-semibold text-slate-500">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              placeholder="7.4951"
              {...register("farmLongitude", { valueAsNumber: true })}
              className="w-full rounded-md border border-slate-200 px-2.5 py-2 text-xs outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      {/* Farm details */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Crop Types *
          </label>
          <input
            {...register("cropTypes")}
            placeholder="Maize, Soybean, Sorghum"
            className={fieldCls(!!errors.cropTypes)}
          />
          {errors.cropTypes && (
            <p className="mt-1 text-xs text-red-500">
              {errors.cropTypes.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Yield History *
          </label>
          <input
            {...register("yieldHistory")}
            placeholder="5 tons/ha (2023), 4.5 tons/ha (2024)"
            className={fieldCls(!!errors.yieldHistory)}
          />
          {errors.yieldHistory && (
            <p className="mt-1 text-xs text-red-500">
              {errors.yieldHistory.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Current Inventory Value (₦) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₦
            </span>
            <input
              type="number"
              min={0}
              {...register("inventoryValue", { valueAsNumber: true })}
              placeholder="250000"
              className={`pl-7 ${fieldCls(!!errors.inventoryValue)}`}
            />
          </div>
          {errors.inventoryValue && (
            <p className="mt-1 text-xs text-red-500">
              {errors.inventoryValue.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            Monthly Income Estimate (₦) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
              ₦
            </span>
            <input
              type="number"
              min={0}
              {...register("monthlyIncome", { valueAsNumber: true })}
              placeholder="80000"
              className={`pl-7 ${fieldCls(!!errors.monthlyIncome)}`}
            />
          </div>
          {errors.monthlyIncome && (
            <p className="mt-1 text-xs text-red-500">
              {errors.monthlyIncome.message as string}
            </p>
          )}
        </div>
      </div>

      <FileUploadZone
        label="Farm Photos (up to 5)"
        accept="image/jpeg,image/png,image/webp"
        maxFiles={5}
        files={farmPhotos}
        onChange={setFarmPhotos}
      />
    </div>
  );
}

// ─── Step 4 – Financial Information ──────────────────────────────────────────

function Step4({
  form,
  bankStatements,
  setBankStatements,
}: {
  form: LoanForm;
  bankStatements: UploadedFile[];
  setBankStatements: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}) {
  const { register, watch } = form;
  const hasOutstanding = watch("hasOutstandingLoans");
  const hasCollateral = watch("hasCollateral");

  return (
    <div className="space-y-6">
      <FileUploadZone
        label="Bank Statements – last 3 months (PDF or images)"
        accept=".pdf,image/jpeg,image/png"
        maxFiles={3}
        files={bankStatements}
        onChange={setBankStatements}
      />

      {/* Credit score display */}
      <div className="space-y-3 rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-semibold text-slate-700">
          Credit Score{" "}
          <span className="font-normal text-slate-400">(estimated)</span>
        </p>
        <div className="flex items-center gap-4">
          <div className="relative h-3 flex-1 rounded-full bg-linear-to-r from-red-400 via-amber-400 to-green-500">
            <div className="absolute left-[65%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-slate-600 bg-white shadow" />
          </div>
          <span className="text-2xl font-extrabold text-green-700">680</span>
        </div>
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>Poor (300)</span>
          <span>Fair (580)</span>
          <span>Good (670)</span>
          <span>Excellent (850)</span>
        </div>
        <p className="text-xs text-slate-500">
          Score sourced from available credit bureau data. Providing your bank statements
          may improve your assessment.
        </p>
      </div>

      {/* Outstanding loans */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Do you have any outstanding loans?
        </p>
        <div className="flex gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <label
              key={opt}
              className={`cursor-pointer flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 capitalize transition-all
                ${hasOutstanding === opt
                  ? "border-green-600 bg-green-50 text-green-800 font-semibold"
                  : "border-slate-200 text-slate-600 hover:border-green-300"
                }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={opt}
                {...register("hasOutstandingLoans")}
              />
              {opt}
            </label>
          ))}
        </div>
        <AnimatePresence>
          {hasOutstanding === "yes" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Loan Details
                </label>
                <input
                  {...register("outstandingLoanDetails")}
                  className={fieldCls(false)}
                  placeholder="Bank name, purpose, start date…"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Outstanding Amount (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={0}
                    {...register("outstandingAmount", { valueAsNumber: true })}
                    className={`pl-7 ${fieldCls(false)}`}
                    placeholder="150000"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collateral */}
      <div>
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Do you have collateral to offer?{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </p>
        <div className="flex gap-3">
          {(["yes", "no"] as const).map((opt) => (
            <label
              key={opt}
              className={`cursor-pointer flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 capitalize transition-all
                ${hasCollateral === opt
                  ? "border-green-600 bg-green-50 text-green-800 font-semibold"
                  : "border-slate-200 text-slate-600 hover:border-green-300"
                }`}
            >
              <input
                type="radio"
                className="sr-only"
                value={opt}
                {...register("hasCollateral")}
              />
              {opt}
            </label>
          ))}
        </div>
        <AnimatePresence>
          {hasCollateral === "yes" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 grid grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2"
            >
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Collateral Details
                </label>
                <input
                  {...register("collateralDetails")}
                  className={fieldCls(false)}
                  placeholder="2-bedroom property, vehicle, land…"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Estimated Value (₦)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    ₦
                  </span>
                  <input
                    type="number"
                    min={0}
                    {...register("collateralValue", { valueAsNumber: true })}
                    className={`pl-7 ${fieldCls(false)}`}
                    placeholder="2000000"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Step 5 – Review & Submit ─────────────────────────────────────────────────

function Step5({
  form,
  farmPhotos,
  bankStatements,
}: {
  form: LoanForm;
  farmPhotos: UploadedFile[];
  bankStatements: UploadedFile[];
}) {
  const {
    watch,
    control,
    formState: { errors },
  } = form;
  const values = watch();
  const [showTerms, setShowTerms] = useState(false);

  const sections = [
    {
      title: "Loan Details",
      rows: [
        { label: "Purpose", value: PURPOSE_LABELS[values.loanPurpose] ?? "—" },
        {
          label: "Amount",
          value: values.amountNeeded ? formatCurrency(values.amountNeeded) : "—",
        },
        {
          label: "Repayment Period",
          value: values.repaymentPeriod
            ? `${values.repaymentPeriod} months`
            : "—",
        },
      ],
    },
    {
      title: "Personal Information",
      rows: [
        { label: "Full Name", value: values.fullName || "—" },
        { label: "Email", value: values.email || "—" },
        { label: "Phone", value: values.phone || "—" },
        {
          label: "BVN",
          value: values.bvn
            ? `•••••••${values.bvn.slice(-4)}`
            : "—",
        },
        { label: "Next of Kin", value: values.nextOfKinName || "—" },
      ],
    },
    {
      title: "Farm Details",
      rows: [
        {
          label: "Location",
          value:
            [values.farmAddress, values.farmLga, values.farmState]
              .filter(Boolean)
              .join(", ") || "—",
        },
        { label: "Crop Types", value: values.cropTypes || "—" },
        {
          label: "Monthly Income",
          value: values.monthlyIncome
            ? formatCurrency(values.monthlyIncome)
            : "—",
        },
        { label: "Farm Photos", value: `${farmPhotos.length} file(s)` },
      ],
    },
    {
      title: "Financial Information",
      rows: [
        {
          label: "Outstanding Loans",
          value: values.hasOutstandingLoans === "yes" ? "Yes" : "No",
        },
        {
          label: "Collateral",
          value:
            values.hasCollateral === "yes"
              ? values.collateralDetails || "Yes"
              : "None",
        },
        {
          label: "Bank Statements",
          value: `${bankStatements.length} file(s)`,
        },
      ],
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="space-y-3">
        {sections.map((sec) => (
          <div
            key={sec.title}
            className="overflow-hidden rounded-xl border border-slate-200"
          >
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-600">
                {sec.title}
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {sec.rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-start justify-between gap-4 px-4 py-2.5"
                >
                  <p className="w-36 shrink-0 text-xs text-slate-500">
                    {row.label}
                  </p>
                  <p className="break-all text-right text-xs font-medium text-slate-800">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Signature */}
      <Controller
        name="signatureData"
        control={control}
        render={({ field }) => (
          <SignaturePad
            value={field.value}
            onChange={field.onChange}
            error={errors.signatureData?.message as string | undefined}
          />
        )}
      />

      {/* Terms */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
        <Controller
          name="termsAccepted"
          control={control}
          render={({ field }) => (
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={field.value === true}
              onChange={(e) => field.onChange(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-green-600"
            />
          )}
        />
        <label
          htmlFor="terms-checkbox"
          className="cursor-pointer text-sm text-slate-600"
        >
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={() => setShowTerms(true)}
            className="font-medium text-green-700 underline hover:text-green-800"
          >
            Terms and Conditions
          </button>{" "}
          of Agrolink loan services.
        </label>
      </div>
      {errors.termsAccepted && (
        <p className="-mt-2 text-xs text-red-500">
          {errors.termsAccepted.message as string}
        </p>
      )}

      {/* Processing time notice */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        ⏱️{" "}
        <strong>Estimated Processing Time:</strong> 24–48 business hours after
        submission. You will be notified via SMS and email.
      </div>

      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
    </div>
  );
}

// ─── Success Page ─────────────────────────────────────────────────────────────

function SuccessPage({
  trackingNumber,
  onReset,
}: {
  trackingNumber: string;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-8 text-center"
    >
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
        ✅
      </div>
      <h2 className="text-2xl font-extrabold text-green-900">
        Application Submitted!
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
        Your loan application has been received. Our team will review it within
        24–48 business hours.
      </p>

      <div className="mx-auto mt-6 inline-block rounded-xl border border-green-200 bg-green-50 p-5">
        <p className="mb-1 text-xs font-semibold text-green-700">
          Application Tracking Number
        </p>
        <p className="font-mono text-2xl font-extrabold tracking-widest text-green-900">
          {trackingNumber}
        </p>
        <p className="mt-1 text-xs text-green-600">
          Save this number to track your application status
        </p>
      </div>

      <div className="mx-auto mt-6 flex max-w-xs flex-col gap-3 sm:flex-row">
        <a
          href="/dashboard"
          className="flex-1 rounded-lg bg-green-700 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-green-800"
        >
          Go to Dashboard
        </a>
        <button
          onClick={onReset}
          className="flex-1 rounded-lg border border-green-700 py-2.5 text-sm font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          New Application
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export function LoanApplicationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const { trackLoanApplication, trackError, trackEvent } = useAnalytics();
  const [farmPhotos, setFarmPhotos] = useState<UploadedFile[]>([]);
  const [bankStatements, setBankStatements] = useState<UploadedFile[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [stepError, setStepError] = useState("");

  // Load persisted draft on mount
  const getDefaultValues = (): Partial<LoanFormData> => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  };

  const form = useForm<LoanFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- resolver type mismatch between @hookform/resolvers v5 and react-hook-form v7
    resolver: zodResolver(loanSchema) as any,
    mode: "onChange",
    defaultValues: {
      termsAccepted: false,
      bvnVerified: false,
      guarantorName: "",
      guarantorPhone: "",
      guarantorAddress: "",
      outstandingLoanDetails: "",
      collateralDetails: "",
      signatureData: "",
      ...getDefaultValues(),
    },
  });

  // Auto-save every 30 s
  useEffect(() => {
    const id = setInterval(() => {
      const values = form.getValues();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
        setLastSaved(new Date());
      } catch {
        // localStorage quota exceeded – ignore
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [form]);

  useEffect(() => {
    trackEvent("funnel_step_view", {
      funnel_name: "loan_application",
      step_number: currentStep + 1,
      step_name: STEP_TITLES[currentStep],
    });
  }, [currentStep, trackEvent]);

  const saveDraft = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form.getValues()));
    } catch {
      // ignore
    }
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 500);
  }, [form]);

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[currentStep];
    const valid =
      fields.length === 0 || (await form.trigger(fields as Array<keyof LoanFormData>));
    if (!valid) {
      setStepError("Please fix the errors above before continuing.");
      return;
    }
    setStepError("");
    trackEvent("funnel_step_complete", {
      funnel_name: "loan_application",
      step_number: currentStep + 1,
      step_name: STEP_TITLES[currentStep],
    });
    setDirection(1);
    setCurrentStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep, form, trackEvent]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setCurrentStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const onSubmit = form.handleSubmit(async () => {
    try {
      const values = form.getValues();
      const result = await submitLoanApplication({
        amountNeeded: Number(values.amountNeeded || 0),
        loanPurpose: String(values.loanPurpose || ""),
        repaymentPeriod: String(values.repaymentPeriod || ""),
        farmSize: Number.isFinite(Number(values.inventoryValue))
          ? Number(values.inventoryValue)
          : undefined,
      });

      trackLoanApplication({
        amount: Number(values.amountNeeded || 0),
        purpose: String(values.loanPurpose || "unknown"),
        repayment_months: String(values.repaymentPeriod || "0"),
      });
      trackEvent("funnel_conversion", {
        funnel_name: "loan_application",
        conversion_name: "application_submitted",
      });

      const tracking = String(result.loan._id || "").slice(-12).toUpperCase();
      setTrackingNumber(tracking);
      setSubmitted(true);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    } catch (error) {
      trackError(error, { module: "loan_wizard", action: "submit" });
      throw error;
    }
  });

  const handleReset = useCallback(() => {
    form.reset();
    setCurrentStep(0);
    setSubmitted(false);
    setFarmPhotos([]);
    setBankStatements([]);
    setTrackingNumber("");
    setLastSaved(null);
  }, [form]);

  // Animation variants
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
  };

  if (submitted) {
    return <SuccessPage trackingNumber={trackingNumber} onReset={handleReset} />;
  }

  return (
    <div>
      {/* Draft status bar */}
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className={isSaving ? "text-amber-500" : "text-slate-400"}>
          {isSaving
            ? "Saving draft…"
            : lastSaved
            ? `Draft saved at ${lastSaved.toLocaleTimeString()}`
            : "Changes are auto-saved every 30 s"}
        </span>
        <button
          type="button"
          onClick={saveDraft}
          className="font-semibold text-green-700 hover:underline"
        >
          Save draft
        </button>
      </div>

      <ProgressStepper currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <form onSubmit={onSubmit} noValidate>
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: "easeInOut" }}
            >
              {currentStep === 0 && <Step1 form={form} />}
              {currentStep === 1 && <Step2 form={form} />}
              {currentStep === 2 && (
                <Step3
                  form={form}
                  farmPhotos={farmPhotos}
                  setFarmPhotos={setFarmPhotos}
                />
              )}
              {currentStep === 3 && (
                <Step4
                  form={form}
                  bankStatements={bankStatements}
                  setBankStatements={setBankStatements}
                />
              )}
              {currentStep === 4 && (
                <Step5
                  form={form}
                  farmPhotos={farmPhotos}
                  bankStatements={bankStatements}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step-level validation error announcement */}
        {stepError && (
          <p
            role="alert"
            aria-live="assertive"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600"
          >
            {stepError}
          </p>
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0}
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Back
          </button>

          {currentStep < TOTAL_STEPS - 1 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800"
            >
              Continue →
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-lg bg-green-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-800"
            >
              Submit Application
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
