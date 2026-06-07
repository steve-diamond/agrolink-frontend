"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
} from "react";
import Image from "next/image";
import {
  FiUser,
  FiBriefcase,
  FiCreditCard,
  FiBell,
  FiShield,
  FiCamera,
  FiMapPin,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiUpload,
  FiFileText,
  FiTrash2,
  FiRefreshCw,
  FiSmartphone,
  FiMonitor,
  FiLogOut,
  FiChevronDown,
} from "react-icons/fi";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId =
  | "personal"
  | "business"
  | "bank"
  | "notifications"
  | "security";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface ToggleItem {
  key: string;
  label: string;
  description: string;
}

interface Session {
  id: string;
  device: string;
  type: "mobile" | "desktop";
  location: string;
  lastActive: string;
  current: boolean;
}

interface CropOption {
  label: string;
  value: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: "personal",      label: "Personal Info",    icon: <FiUser size={16} /> },
  { id: "business",      label: "Business Details", icon: <FiBriefcase size={16} /> },
  { id: "bank",          label: "Bank Information", icon: <FiCreditCard size={16} /> },
  { id: "notifications", label: "Notifications",    icon: <FiBell size={16} /> },
  { id: "security",      label: "Security",         icon: <FiShield size={16} /> },
];

const NIGERIAN_BANKS = [
  "Access Bank", "Fidelity Bank", "First Bank of Nigeria",
  "First City Monument Bank (FCMB)", "Guaranty Trust Bank (GTB)",
  "Keystone Bank", "Polaris Bank", "Stanbic IBTC Bank",
  "Sterling Bank", "Union Bank of Nigeria", "United Bank for Africa (UBA)",
  "Unity Bank", "Wema Bank", "Zenith Bank",
];

const CROP_OPTIONS: CropOption[] = [
  { label: "Maize", value: "maize" },
  { label: "Rice", value: "rice" },
  { label: "Cassava", value: "cassava" },
  { label: "Yam", value: "yam" },
  { label: "Sorghum", value: "sorghum" },
  { label: "Millet", value: "millet" },
  { label: "Groundnut", value: "groundnut" },
  { label: "Soybean", value: "soybean" },
  { label: "Cowpea", value: "cowpea" },
  { label: "Tomato", value: "tomato" },
  { label: "Pepper", value: "pepper" },
  { label: "Onion", value: "onion" },
  { label: "Plantain", value: "plantain" },
  { label: "Cocoa", value: "cocoa" },
  { label: "Palm Oil", value: "palm_oil" },
];

const CERTIFICATIONS = [
  "Organic Farming Certification",
  "Good Agricultural Practices (GAP)",
  "GlobalG.A.P.",
  "NAFDAC Certified",
  "SON Quality Mark",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "yo", label: "Yoruba" },
  { value: "ig", label: "Igbo" },
  { value: "ha", label: "Hausa" },
];

const EMAIL_TOGGLES: ToggleItem[] = [
  { key: "emailOrders",     label: "Order updates",    description: "New orders, status changes, cancellations" },
  { key: "emailPayments",   label: "Payment alerts",   description: "Successful payments, refunds, disputes" },
  { key: "emailPromo",      label: "Promotions",       description: "Deals, discounts and AgroLink offers" },
  { key: "emailNews",       label: "Platform news",    description: "Feature releases and announcements" },
];

const SMS_TOGGLES: ToggleItem[] = [
  { key: "smsOrders",   label: "Order OTPs",      description: "Delivery confirmation codes" },
  { key: "smsPayments", label: "Payment alerts",  description: "Transaction notifications via SMS" },
  { key: "smsPromo",    label: "Promotions",      description: "Exclusive SMS-only deals" },
];

const PUSH_TOGGLES: ToggleItem[] = [
  { key: "pushOrders",    label: "New orders",       description: "Instant push when a buyer places an order" },
  { key: "pushMessages",  label: "Messages",         description: "Chat messages from buyers" },
  { key: "pushStock",     label: "Stock alerts",     description: "Low inventory warnings" },
  { key: "pushPayments",  label: "Payment received", description: "Instant payout notifications" },
];

const MOCK_SESSIONS: Session[] = [
  { id: "s1", device: "Chrome · Windows 11", type: "desktop", location: "Lagos, Nigeria",  lastActive: "Active now",      current: true  },
  { id: "s2", device: "Safari · iPhone 15",  type: "mobile",  location: "Abuja, Nigeria",  lastActive: "2 hours ago",     current: false },
  { id: "s3", device: "Firefox · Ubuntu",    type: "desktop", location: "Port Harcourt",   lastActive: "Yesterday 9:42 AM", current: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskBVN(bvn: string): string {
  if (bvn.length < 5) return "•".repeat(bvn.length);
  return bvn.slice(0, 2) + "•".repeat(bvn.length - 4) + bvn.slice(-2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${
        status === "saving"
          ? "bg-amber-50 text-amber-600 border border-amber-200"
          : status === "saved"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-600 border border-red-200"
      }`}
    >
      {status === "saving" && <FiRefreshCw size={11} className="animate-spin" />}
      {status === "saved"  && <FiCheck size={11} />}
      {status === "error"  && <FiAlertTriangle size={11} />}
      {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Error saving"}
    </span>
  );
}

function ToggleSwitch({
  enabled,
  onChange,
  label,
}: {
  enabled: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="sr-only"
      />
      <span
        className={`absolute inset-0 rounded-full border-2 border-transparent transition-colors duration-200 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 ${
          enabled ? "bg-green-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none absolute top-0 left-0 inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </label>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-start justify-between px-6 py-4 border-b border-gray-50">
        <div>
          <h3 className="text-sm font-bold text-gray-800">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

function InputField({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  badge,
  required,
  maxLength,
  disabled,
  hint,
}: {
  label: string;
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  badge?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-gray-600 flex items-center gap-2">
        {label}
        {required && <span className="text-red-500 text-[10px]">required</span>}
        {badge}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border bg-white text-gray-800 placeholder-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 ${
          disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100" : "border-gray-200 hover:border-gray-300"
        }`}
      />
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function VerifiedBadge({ verified }: { verified: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        verified
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-400"
      }`}
    >
      {verified ? <FiCheck size={9} /> : <FiX size={9} />}
      {verified ? "Verified" : "Unverified"}
    </span>
  );
}

// ─── Avatar Uploader ──────────────────────────────────────────────────────────

function AvatarUploader({
  src,
  name,
  onChange,
}: {
  src: string;
  name: string;
  onChange: (dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onChange(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-6">
      <div className="relative shrink-0">
        <div
          className={`w-24 h-24 rounded-full overflow-hidden border-4 transition-colors ${
            dragging ? "border-green-400" : "border-green-100"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {src ? (
            <Image src={src} alt={name} width={96} height={96} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700 text-2xl font-bold">
              {initials}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload avatar"
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-md transition-colors"
        >
          <FiCamera size={14} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          aria-label="Upload profile photo"
          className="hidden"
          onChange={handleChange}
        />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">Profile Photo</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
          JPG, PNG or WebP · max 5 MB<br />
          Drag & drop or click the camera icon
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 text-xs font-semibold text-green-700 hover:text-green-800 underline underline-offset-2"
        >
          Upload new photo
        </button>
      </div>
    </div>
  );
}

// ─── Crop Multi-select ────────────────────────────────────────────────────────

function CropMultiSelect({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (crops: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  const selectedLabels = CROP_OPTIONS
    .filter((c) => selected.includes(c.value))
    .map((c) => c.label);

  return (
    <div className="flex flex-col gap-1" ref={ref}>
      <label className="text-xs font-semibold text-gray-600">Primary Crops</label>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-left focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors"
      >
        <span className={selected.length === 0 ? "text-gray-300" : "text-gray-800"}>
          {selected.length === 0
            ? "Select crops…"
            : selectedLabels.length <= 3
            ? selectedLabels.join(", ")
            : `${selectedLabels.slice(0, 3).join(", ")} +${selectedLabels.length - 3} more`}
        </span>
        <FiChevronDown size={15} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="relative z-20">
          <div className="absolute top-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {CROP_OPTIONS.map((crop) => (
              <button
                key={crop.value}
                type="button"
                onClick={() => toggle(crop.value)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-green-50 transition-colors text-left"
              >
                <span
                  className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border transition-colors ${
                    selected.includes(crop.value)
                      ? "bg-green-600 border-green-600"
                      : "border-gray-300"
                  }`}
                >
                  {selected.includes(crop.value) && <FiCheck size={10} className="text-white" />}
                </span>
                <span className={selected.includes(crop.value) ? "text-green-700 font-semibold" : "text-gray-700"}>
                  {crop.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {selectedLabels.map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200"
            >
              {label}
              <button
                type="button"
                onClick={() => toggle(selected[i])}
                aria-label={`Remove ${label}`}
                className="hover:text-green-900"
              >
                <FiX size={10} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface ProfileSettingsProps {
  initialRole?: "farmer" | "buyer" | "investor";
}

export default function ProfileSettings({ initialRole = "farmer" }: ProfileSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("personal");

  // ── Save status per tab ────────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<Record<TabId, SaveStatus>>({
    personal:      "idle",
    business:      "idle",
    bank:          "idle",
    notifications: "idle",
    security:      "idle",
  });
  const debounceRef = useRef<Record<TabId, ReturnType<typeof setTimeout>>>({} as Record<TabId, ReturnType<typeof setTimeout>>);

  function triggerAutoSave(tab: TabId) {
    if (debounceRef.current[tab]) clearTimeout(debounceRef.current[tab]);
    setSaveStatus((s) => ({ ...s, [tab]: "saving" }));
    debounceRef.current[tab] = setTimeout(() => {
      // Simulate API save
      setSaveStatus((s) => ({ ...s, [tab]: "saved" }));
      setTimeout(() => setSaveStatus((s) => ({ ...s, [tab]: "idle" })), 2500);
    }, 1200);
  }

  // ── Personal Info ──────────────────────────────────────────────────────────
  const [avatar, setAvatar]       = useState("");
  const [fullName, setFullName]   = useState("Emeka Okafor");
  const [phone, setPhone]         = useState("+234 801 234 5678");
  const [email, setEmail]         = useState("emeka@agrolink.ng");
  const [address, setAddress]     = useState("14 Ikeja Road, Lagos State");
  const [bio, setBio]             = useState("Passionate rice and maize farmer with over 10 years experience in the Lagos corridor.");
  const [language, setLanguage]   = useState("en");
  const [phoneVerified]           = useState(true);
  const [emailVerified]           = useState(true);
  const BIO_MAX = 280;

  function handlePersonalChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      triggerAutoSave("personal");
    };
  }

  // ── Business Details ───────────────────────────────────────────────────────
  const [farmName, setFarmName]           = useState("Okafor Farms Ltd.");
  const [farmSize, setFarmSize]           = useState("12");
  const [crops, setCrops]                 = useState<string[]>(["rice", "maize"]);
  const [yearsExp, setYearsExp]           = useState("10");
  const [certs, setCerts]                 = useState<string[]>(["Organic Farming Certification"]);
  const [certFiles, setCertFiles]         = useState<string[]>([]);
  const [stateOp, setStateOp]             = useState("Lagos");
  const certInputRef                      = useRef<HTMLInputElement>(null);

  function handleBusinessChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      triggerAutoSave("business");
    };
  }

  function handleCertFile(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    setCertFiles((prev) => [...prev, ...names]);
    triggerAutoSave("business");
  }

  function removeCertFile(name: string) {
    setCertFiles((prev) => prev.filter((f) => f !== name));
    triggerAutoSave("business");
  }

  // ── Bank Information ───────────────────────────────────────────────────────
  const [bankName, setBankName]         = useState("Guaranty Trust Bank (GTB)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName]   = useState("");
  const [bvn, setBvn]                   = useState("22345678901");
  const [showBvn, setShowBvn]           = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleVerifyAccount() {
    if (accountNumber.length < 10) return;
    setVerifyStatus("loading");
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1800));
    if (accountNumber.startsWith("0")) {
      setAccountName("EMEKA CHUKWUEMEKA OKAFOR");
      setVerifyStatus("success");
      triggerAutoSave("bank");
    } else {
      setVerifyStatus("error");
    }
  }

  function handleBankChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      triggerAutoSave("bank");
    };
  }

  // ── Notifications ──────────────────────────────────────────────────────────
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    emailOrders: true,  emailPayments: true,  emailPromo: false, emailNews: true,
    smsOrders:   true,  smsPayments:   true,  smsPromo:  false,
    pushOrders:  true,  pushMessages:  true,  pushStock: true,   pushPayments: true,
  });

  function handleToggle(key: string) {
    setNotifToggles((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      triggerAutoSave("notifications");
      return next;
    });
  }

  // ── Security ───────────────────────────────────────────────────────────────
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]     = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [sessions, setSessions]       = useState<Session[]>(MOCK_SESSIONS);
  const [pwChangeStatus, setPwChangeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwError, setPwError]         = useState("");

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError("");
    if (!currentPw || !newPw || !confirmPw) { setPwError("All fields are required."); return; }
    if (newPw.length < 8) { setPwError("New password must be at least 8 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwChangeStatus("loading");
    await new Promise((r) => setTimeout(r, 1600));
    setPwChangeStatus("success");
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwChangeStatus("idle"), 3000);
  }

  function signOutSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id === "s1" || s.id !== id));
  }

  function signOutAll() {
    setSessions((prev) => prev.filter((s) => s.current));
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const currentSaveStatus = saveStatus[activeTab];

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences and information</p>
          </div>
          <SaveIndicator status={currentSaveStatus} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Sidebar tabs ──────────────────────────────────────────────── */}
          <aside className="lg:w-56 shrink-0">
            {/* Mobile: horizontal scroll tabs */}
            <div className="flex lg:hidden gap-1 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === tab.id
                      ? "bg-green-600 text-white shadow-sm"
                      : "bg-white text-gray-500 border border-gray-100 hover:border-green-200 hover:text-green-700"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Desktop: vertical list */}
            <nav className="hidden lg:flex flex-col gap-1" aria-label="Profile settings sections">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors text-left ${
                    activeTab === tab.id
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-gray-500 hover:bg-white hover:text-green-700 hover:border hover:border-green-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === "notifications" && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                  )}
                </button>
              ))}
            </nav>

            {/* Profile summary card */}
            <div className="hidden lg:block mt-4 bg-white border border-gray-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="w-14 h-14 rounded-full overflow-hidden mx-auto mb-2 border-2 border-green-100">
                {avatar ? (
                  <Image src={avatar} alt={fullName} width={56} height={56} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-50 text-green-700 font-bold text-lg">
                    {fullName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-gray-800 truncate">{fullName}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{initialRole}</p>
              <span className="inline-flex items-center gap-1 mt-2 bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full">
                <FiCheck size={9} /> Verified account
              </span>
            </div>
          </aside>

          {/* ── Tab panels ────────────────────────────────────────────────── */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* ── 1. Personal Information ──────────────────────────────────── */}
            {activeTab === "personal" && (
              <>
                <SectionCard title="Profile Photo" subtitle="Used across the platform">
                  <AvatarUploader
                    src={avatar}
                    name={fullName}
                    onChange={(url) => { setAvatar(url); triggerAutoSave("personal"); }}
                  />
                </SectionCard>

                <SectionCard title="Basic Information" subtitle="Your public profile details">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name" id="fullName" value={fullName}
                      onChange={handlePersonalChange(setFullName)}
                      placeholder="Enter your full name" required
                    />
                    <InputField
                      label="Phone Number" id="phone" type="tel" value={phone}
                      onChange={handlePersonalChange(setPhone)}
                      placeholder="+234 000 000 0000"
                      badge={<VerifiedBadge verified={phoneVerified} />}
                    />
                    <InputField
                      label="Email Address" id="email" type="email" value={email}
                      onChange={handlePersonalChange(setEmail)}
                      placeholder="you@example.com"
                      badge={<VerifiedBadge verified={emailVerified} />}
                    />
                    <div className="flex flex-col gap-1">
                      <label htmlFor="language" className="text-xs font-semibold text-gray-600">
                        Preferred Language
                      </label>
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => { setLanguage(e.target.value); triggerAutoSave("personal"); }}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors"
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Location" subtitle="Used for logistics and buyer matching">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="address" className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <FiMapPin size={12} className="text-green-600" />
                      Address
                    </label>
                    <div className="relative">
                      <input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => { setAddress(e.target.value); triggerAutoSave("personal"); }}
                        placeholder="Enter your address"
                        className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700"
                        aria-label="Use current location"
                        title="Use current location"
                      >
                        <FiMapPin size={15} />
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400">State, LGA and nearest market will be auto-detected</p>
                  </div>
                </SectionCard>

                <SectionCard title="Bio / Description" subtitle="Tell buyers about yourself">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="bio" className="text-xs font-semibold text-gray-600">
                      Bio
                      <span className="ml-auto float-right text-[11px] font-normal text-gray-300">
                        {bio.length} / {BIO_MAX}
                      </span>
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => { setBio(e.target.value.slice(0, BIO_MAX)); triggerAutoSave("personal"); }}
                      rows={4}
                      placeholder="Tell buyers about your farming story, specialties and values…"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors resize-none"
                    />
                    <div className="flex gap-0.5 mt-1" aria-hidden="true">
                      {Array.from({ length: 10 }).map((_, seg) => (
                        <div
                          key={seg}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            seg < Math.round((bio.length / BIO_MAX) * 10)
                              ? bio.length > BIO_MAX * 0.9
                                ? "bg-red-400"
                                : bio.length > BIO_MAX * 0.7
                                ? "bg-amber-400"
                                : "bg-green-500"
                              : "bg-gray-100"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── 2. Business Details ──────────────────────────────────────── */}
            {activeTab === "business" && (
              <>
                {initialRole !== "farmer" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                    <FiAlertTriangle size={15} />
                    Business details are primarily for farmers and sellers.
                  </div>
                )}

                <SectionCard title="Farm Information" subtitle="Details visible to buyers and investors">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField
                      label="Farm / Business Name" id="farmName" value={farmName}
                      onChange={handleBusinessChange(setFarmName)}
                      placeholder="e.g. Sunshine Farms Ltd."
                    />
                    <InputField
                      label="Farm Size (hectares)" id="farmSize" type="number" value={farmSize}
                      onChange={handleBusinessChange(setFarmSize)}
                      placeholder="e.g. 12"
                      hint="Total cultivated land area"
                    />
                    <InputField
                      label="Years of Experience" id="yearsExp" type="number" value={yearsExp}
                      onChange={handleBusinessChange(setYearsExp)}
                      placeholder="e.g. 10"
                    />
                    <div className="flex flex-col gap-1">
                      <label htmlFor="stateOp" className="text-xs font-semibold text-gray-600">State of Operation</label>
                      <select
                        id="stateOp"
                        value={stateOp}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors"
                        onChange={(e) => { setStateOp(e.target.value); triggerAutoSave("business"); }}
                      >
                        {["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River",
                          "Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano",
                          "Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun",
                          "Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard title="Primary Crops">
                  <CropMultiSelect
                    selected={crops}
                    onChange={(c) => { setCrops(c); triggerAutoSave("business"); }}
                  />
                </SectionCard>

                <SectionCard title="Certifications" subtitle="Upload supporting documents (PDF, JPG, PNG)">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {CERTIFICATIONS.map((cert) => (
                        <label key={cert} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={certs.includes(cert)}
                            onChange={(e) => {
                              setCerts(e.target.checked
                                ? [...certs, cert]
                                : certs.filter((c) => c !== cert)
                              );
                              triggerAutoSave("business");
                            }}
                          />
                          <span className="text-xs text-gray-700">{cert}</span>
                        </label>
                      ))}
                    </div>

                    {/* Document upload */}
                    <label
                      htmlFor="certFileUpload"
                      className="flex flex-col items-center border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-green-300 transition-colors cursor-pointer"
                    >
                      <FiUpload size={22} className="text-gray-300 mb-2" />
                      <p className="text-sm text-gray-400">Drag & drop or <span className="text-green-600 font-semibold">browse</span></p>
                      <p className="text-xs text-gray-300 mt-0.5">PDF, JPG, PNG · max 10 MB each</p>
                    </label>
                    <input
                      id="certFileUpload"
                      ref={certInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      aria-label="Upload certification documents"
                      className="hidden"
                      onChange={handleCertFile}
                    />

                    {certFiles.length > 0 && (
                      <div className="space-y-1.5">
                        {certFiles.map((name) => (
                          <div key={name} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <FiFileText size={14} className="text-green-600 shrink-0" />
                              <span className="text-xs text-gray-700 truncate">{name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCertFile(name)}
                              aria-label={`Remove ${name}`}
                              className="text-gray-300 hover:text-red-400 ml-2 shrink-0"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── 3. Bank Information ──────────────────────────────────────── */}
            {activeTab === "bank" && (
              <>
                <SectionCard
                  title="Bank Account"
                  subtitle="Used for payouts and withdrawals"
                  action={
                    verifyStatus === "success" ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                        <FiCheck size={11} /> Verified
                      </span>
                    ) : undefined
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Bank selector */}
                    <div className="flex flex-col gap-1 sm:col-span-2">
                      <label htmlFor="bankName" className="text-xs font-semibold text-gray-600">Bank Name</label>
                      <select
                        id="bankName"
                        value={bankName}
                        onChange={(e) => { setBankName(e.target.value); triggerAutoSave("bank"); }}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors"
                      >
                        {NIGERIAN_BANKS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Account number + verify */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="accountNumber" className="text-xs font-semibold text-gray-600">Account Number</label>
                      <div className="flex gap-2">
                        <input
                          id="accountNumber"
                          type="text"
                          inputMode="numeric"
                          maxLength={10}
                          value={accountNumber}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                            setAccountNumber(v);
                            setVerifyStatus("idle");
                            triggerAutoSave("bank");
                          }}
                          placeholder="10-digit NUBAN"
                          className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyAccount}
                          disabled={accountNumber.length < 10 || verifyStatus === "loading"}
                          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-1.5 shrink-0 ${
                            accountNumber.length < 10
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : verifyStatus === "success"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          {verifyStatus === "loading" && <FiRefreshCw size={13} className="animate-spin" />}
                          {verifyStatus === "success" && <FiCheck size={13} />}
                          {verifyStatus === "error" && <FiX size={13} />}
                          {verifyStatus === "loading" ? "Verifying…" : verifyStatus === "success" ? "Verified" : "Verify"}
                        </button>
                      </div>
                      {verifyStatus === "error" && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <FiAlertTriangle size={11} /> Account not found. Check number and bank.
                        </p>
                      )}
                    </div>

                    {/* Account name (auto-filled) */}
                    <InputField
                      label="Account Name"
                      id="accountName"
                      value={accountName}
                      onChange={handleBankChange(setAccountName)}
                      placeholder="Auto-filled after verification"
                      disabled={verifyStatus !== "success"}
                      hint={verifyStatus === "success" ? "Fetched via bank API" : "Verify account number first"}
                    />
                  </div>
                </SectionCard>

                <SectionCard title="BVN" subtitle="Bank Verification Number — stored encrypted">
                  <div className="flex flex-col gap-1">
                    <label htmlFor="bvn" className="text-xs font-semibold text-gray-600">BVN</label>
                    <div className="flex gap-2">
                      <input
                        id="bvn"
                        type="text"
                        value={showBvn ? bvn : maskBVN(bvn)}
                        onChange={(e) => {
                          if (showBvn) { setBvn(e.target.value.replace(/\D/g, "").slice(0, 11)); triggerAutoSave("bank"); }
                        }}
                        maxLength={showBvn ? 11 : undefined}
                        readOnly={!showBvn}
                        placeholder="11-digit BVN"
                        className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors font-mono tracking-widest"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBvn((v) => !v)}
                        aria-label={showBvn ? "Hide BVN" : "Reveal BVN"}
                        className="px-3.5 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300 transition-colors"
                      >
                        {showBvn ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                      <FiShield size={10} className="text-green-500" />
                      Encrypted at rest · never shared with third parties
                    </p>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ── 4. Notifications ─────────────────────────────────────────── */}
            {activeTab === "notifications" && (
              <>
                {(
                  [
                    { title: "Email Notifications", subtitle: "Sent to " + email, items: EMAIL_TOGGLES },
                    { title: "SMS Notifications",   subtitle: "Sent to " + phone,  items: SMS_TOGGLES  },
                    { title: "Push Notifications",  subtitle: "Browser & PWA alerts", items: PUSH_TOGGLES },
                  ] as { title: string; subtitle: string; items: ToggleItem[] }[]
                ).map((group) => (
                  <SectionCard key={group.title} title={group.title} subtitle={group.subtitle}>
                    <div className="divide-y divide-gray-50">
                      {group.items.map((item) => (
                        <div key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                          <div className="min-w-0 pr-4">
                            <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                          </div>
                          <ToggleSwitch
                            enabled={notifToggles[item.key] ?? false}
                            onChange={() => handleToggle(item.key)}
                            label={item.label}
                          />
                        </div>
                      ))}
                    </div>
                  </SectionCard>
                ))}
              </>
            )}

            {/* ── 5. Security ──────────────────────────────────────────────── */}
            {activeTab === "security" && (
              <>
                {/* Change password */}
                <SectionCard title="Change Password" subtitle="Use a strong unique password">
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Current password */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="currentPw" className="text-xs font-semibold text-gray-600">Current Password</label>
                      <div className="relative">
                        <input id="currentPw" type={showCurrentPw ? "text" : "password"} value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)} autoComplete="current-password"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors" />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                          aria-label={showCurrentPw ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showCurrentPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                    </div>
                    {/* New password */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="newPw" className="text-xs font-semibold text-gray-600">New Password</label>
                      <div className="relative">
                        <input id="newPw" type={showNewPw ? "text" : "password"} value={newPw}
                          onChange={(e) => setNewPw(e.target.value)} autoComplete="new-password"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors" />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                          aria-label={showNewPw ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNewPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm password */}
                    <div className="flex flex-col gap-1">
                      <label htmlFor="confirmPw" className="text-xs font-semibold text-gray-600">Confirm Password</label>
                      <div className="relative">
                        <input id="confirmPw" type={showConfirmPw ? "text" : "password"} value={confirmPw}
                          onChange={(e) => setConfirmPw(e.target.value)} autoComplete="new-password"
                          className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-gray-200 hover:border-gray-300 bg-white text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-colors" />
                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                          aria-label={showConfirmPw ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPw ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                        </button>
                      </div>
                    </div>

                    {/* Password strength (on new password) */}
                    {newPw.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[8, 12, 16, 20].map((len, i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors ${
                                newPw.length >= len
                                  ? i === 0 ? "bg-red-400" : i === 1 ? "bg-amber-400" : i === 2 ? "bg-green-400" : "bg-green-600"
                                  : "bg-gray-100"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {newPw.length < 8 ? "Too short" : newPw.length < 12 ? "Weak" : newPw.length < 16 ? "Moderate" : "Strong"}
                        </p>
                      </div>
                    )}

                    {pwError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <FiAlertTriangle size={11} /> {pwError}
                      </p>
                    )}

                    {pwChangeStatus === "success" && (
                      <p className="text-xs text-green-600 flex items-center gap-1 font-semibold">
                        <FiCheck size={11} /> Password updated successfully
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={pwChangeStatus === "loading"}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-bold rounded-xl transition-colors"
                    >
                      {pwChangeStatus === "loading" && <FiRefreshCw size={13} className="animate-spin" />}
                      {pwChangeStatus === "loading" ? "Updating…" : "Update Password"}
                    </button>
                  </form>
                </SectionCard>

                {/* 2FA */}
                <SectionCard
                  title="Two-Factor Authentication"
                  subtitle="Add an extra layer of security to your account"
                  action={
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${twoFAEnabled ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-gray-400 border border-gray-200"}`}>
                      {twoFAEnabled ? "Enabled" : "Disabled"}
                    </span>
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        When enabled, you will be asked for a one-time SMS code each time you log in from a new device.
                      </p>
                      {twoFAEnabled && (
                        <p className="text-xs text-green-600 font-semibold mt-2 flex items-center gap-1">
                          <FiCheck size={11} /> Codes are sent to {phone}
                        </p>
                      )}
                    </div>
                    <ToggleSwitch
                      enabled={twoFAEnabled}
                      onChange={setTwoFAEnabled}
                      label="Two-factor authentication"
                    />
                  </div>
                </SectionCard>

                {/* Active sessions */}
                <SectionCard
                  title="Active Sessions"
                  subtitle="Devices currently signed in to your account"
                  action={
                    sessions.length > 1 ? (
                      <button
                        type="button"
                        onClick={signOutAll}
                        className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                      >
                        <FiLogOut size={12} /> Sign out all
                      </button>
                    ) : undefined
                  }
                >
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors ${
                          session.current
                            ? "border-green-200 bg-green-50/60"
                            : "border-gray-100 bg-gray-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${session.current ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                            {session.type === "mobile"
                              ? <FiSmartphone size={17} />
                              : <FiMonitor size={17} />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{session.device}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {session.location} · {session.lastActive}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          {session.current ? (
                            <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              This device
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => signOutSession(session.id)}
                              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                              aria-label={`Sign out ${session.device}`}
                            >
                              <FiLogOut size={12} /> Sign out
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Danger zone */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-red-700 mb-1">Danger Zone</h3>
                  <p className="text-xs text-red-500 mb-4">
                    Deleting your account is permanent. All your data, listings and transaction history will be removed.
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-bold text-red-600 border-2 border-red-200 hover:bg-red-100 rounded-xl transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}


