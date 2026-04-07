"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import API from "@/services/api";

type YesNo = "yes" | "no";

type AccountForm = {
  name: string;
  email: string;
  password: string;
};

type BuyerForm = {
  businessName: string;
  registrationType: string;
  rcNumber: string;
  tin: string;
  yearsInOperation: string;
  activity: string;
  businessStreet: string;
  businessCity: string;
  businessState: string;
  businessLga: string;
  businessProofName: string;
  businessProofUrl: string;
  repFullName: string;
  repTitle: string;
  repPhone: string;
  repAltPhone: string;
  repEmail: string;
  repEmailConfirm: string;
  idType: string;
  idNumber: string;
  idPhotoName: string;
  idPhotoUrl: string;
  selfieWithIdName: string;
  selfieWithIdUrl: string;
  crops: string[];
  otherCrop: string;
  qualityGrade: string;
  monthlyVolume: string;
  catchmentAreas: string[];
  deliveryMethod: string;
  storageCapacity: string;
  storageUnit: "tons" | "kg" | "";
  hasBankAccount: YesNo | "";
  bankName: string;
  accountNumber: string;
  accountName: string;
  bvn: string;
  paymentTerms: string;
  monthlyBudget: string;
  needsCreditLine: YesNo | "";
  creditAmountNeeded: string;
  tradeRef1Name: string;
  tradeRef1Phone: string;
  tradeRef2Name: string;
  tradeRef2Phone: string;
  hasFleet: YesNo | "";
  fleetCount: string;
  hasWarehouse: YesNo | "";
  warehouseLocation: string;
  warehouseCapacity: string;
  warehouseCapacityUnit: "tons" | "kg" | "";
  qualityEquipment: string[];
  rejectionPolicyAccepted: boolean;
  consentBackgroundCheck: boolean;
  consentDataSharing: boolean;
  consentCommunication: boolean;
  consentCodeOfConduct: boolean;
  signature: string;
  signatureDate: string;
  referred: YesNo | "";
  referrerCodeOrPhone: string;
};

type QueuePayload = {
  account: {
    name: string;
    email: string;
    phone: string;
  };
  application: BuyerForm;
  status: "pending" | "queued";
};

type Props = {
  accountForm: AccountForm;
  language: string;
};

const DRAFT_KEY = "agrolink_buyer_register_draft_v1";
const QUEUE_KEY = "agrolink_buyer_submission_queue_v1";

const NIGERIAN_STATES = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
] as const;

const CROP_OPTIONS = ["maize", "cassava", "rice", "yam", "tomatoes", "peppers", "sorghum", "soybeans", "other"] as const;
const QUALITY_EQUIPMENT = ["moisture meter", "weighing scale", "grading sieve", "none"] as const;
const ACTIVITY_OPTIONS = [
  "Grain milling",
  "Food processing",
  "Export",
  "Wholesale distribution",
  "Retail",
  "Restaurant chain",
  "Other",
] as const;

const stepLabels = [
  "Business Information",
  "Contact & Verification",
  "Procurement Profile",
  "Financial & Payment",
  "Logistics & Quality",
  "Consent & Compliance",
  "Referral",
] as const;

const defaultForm: BuyerForm = {
  businessName: "",
  registrationType: "",
  rcNumber: "",
  tin: "",
  yearsInOperation: "",
  activity: "",
  businessStreet: "",
  businessCity: "",
  businessState: "",
  businessLga: "",
  businessProofName: "",
  businessProofUrl: "",
  repFullName: "",
  repTitle: "",
  repPhone: "",
  repAltPhone: "",
  repEmail: "",
  repEmailConfirm: "",
  idType: "",
  idNumber: "",
  idPhotoName: "",
  idPhotoUrl: "",
  selfieWithIdName: "",
  selfieWithIdUrl: "",
  crops: [],
  otherCrop: "",
  qualityGrade: "",
  monthlyVolume: "",
  catchmentAreas: [],
  deliveryMethod: "",
  storageCapacity: "",
  storageUnit: "",
  hasBankAccount: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  bvn: "",
  paymentTerms: "",
  monthlyBudget: "",
  needsCreditLine: "",
  creditAmountNeeded: "",
  tradeRef1Name: "",
  tradeRef1Phone: "",
  tradeRef2Name: "",
  tradeRef2Phone: "",
  hasFleet: "",
  fleetCount: "",
  hasWarehouse: "",
  warehouseLocation: "",
  warehouseCapacity: "",
  warehouseCapacityUnit: "",
  qualityEquipment: [],
  rejectionPolicyAccepted: false,
  consentBackgroundCheck: false,
  consentDataSharing: false,
  consentCommunication: false,
  consentCodeOfConduct: false,
  signature: "",
  signatureDate: "",
  referred: "",
  referrerCodeOrPhone: "",
};

const uid = (): string => `AGR-BUY-${Math.floor(Math.random() * 90000 + 10000)}`;

const normalizePhone = (input: string): string => {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  if (digits.startsWith("234")) return `+${digits}`;
  return input.trim();
};

const isValidNigerianPhone = (input: string): boolean => /^\+234\d{10}$/.test(normalizePhone(input));

export default function BuyerOnboardingPanel({ accountForm, language }: Props) {
  const router = useRouter();

  const [form, setForm] = useState<BuyerForm>(defaultForm);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpRef, setOtpRef] = useState("");
  const [otpPhone, setOtpPhone] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtpState, setVerifyingOtpState] = useState(false);
  const [otpCooldownUntil, setOtpCooldownUntil] = useState(0);
  const [otpCooldownSeconds, setOtpCooldownSeconds] = useState(0);
  const [otpExpiresUntil, setOtpExpiresUntil] = useState(0);
  const [otpExpiresSeconds, setOtpExpiresSeconds] = useState(0);
  const [lastAutoOtpAttempt, setLastAutoOtpAttempt] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [verifyingBvn, setVerifyingBvn] = useState(false);
  const [networkOnline, setNetworkOnline] = useState(true);
  const [banks, setBanks] = useState<string[]>([]);
  const otpInputRef = useRef<HTMLInputElement | null>(null);

  const isPidgin = language === "pidgin";

  const t = useCallback(
    (en: string, pidgin: string) => (isPidgin ? pidgin : en),
    [isPidgin]
  );

  const setField = <K extends keyof BuyerForm,>(field: K, value: BuyerForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMulti = (field: "crops" | "catchmentAreas" | "qualityEquipment", value: string) => {
    setForm((prev) => {
      const current = prev[field] as string[];
      const exists = current.includes(value);

      if (field === "qualityEquipment" && value === "none") {
        return { ...prev, [field]: exists ? [] : ["none"] };
      }

      if (field === "qualityEquipment" && current.includes("none")) {
        const withoutNone = current.filter((item) => item !== "none");
        return { ...prev, [field]: exists ? withoutNone.filter((item) => item !== value) : [...withoutNone, value] };
      }

      return {
        ...prev,
        [field]: exists ? current.filter((item) => item !== value) : [...current, value],
      };
    });
  };

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        form,
        step,
        otpSent,
        otpVerified,
        otpRef,
      })
    );
  }, [form, step, otpSent, otpVerified, otpRef]);

  useEffect(() => {
    saveDraft();
  }, [saveDraft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNetworkOnline(navigator.onLine);

    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          form?: BuyerForm;
          step?: number;
          otpSent?: boolean;
          otpVerified?: boolean;
          otpRef?: string;
        };
        if (parsed.form) setForm((prev) => ({ ...prev, ...parsed.form }));
        if (parsed.step && parsed.step >= 1 && parsed.step <= 7) setStep(parsed.step);
        setOtpSent(Boolean(parsed.otpSent));
        setOtpVerified(Boolean(parsed.otpVerified));
        setOtpRef(typeof parsed.otpRef === "string" ? parsed.otpRef : "");
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }

    const onOnline = () => setNetworkOnline(true);
    const onOffline = () => setNetworkOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const queueSubmission = (payload: QueuePayload) => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: QueuePayload[] = raw ? (JSON.parse(raw) as QueuePayload[]) : [];
    queue.push(payload);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  };

  const flushQueue = useCallback(async () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return;

    let queue: QueuePayload[] = [];
    try {
      queue = JSON.parse(raw) as QueuePayload[];
    } catch {
      localStorage.removeItem(QUEUE_KEY);
      return;
    }

    const remaining: QueuePayload[] = [];
    for (const item of queue) {
      try {
        await API.post("/api/buyer-applications", item);
      } catch {
        remaining.push(item);
      }
    }

    if (remaining.length) {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(QUEUE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!networkOnline) return;
    void flushQueue();
  }, [networkOnline, flushQueue]);

  useEffect(() => {
    const loadBanks = async () => {
      try {
        const res = await API.get("/api/onboarding/banks");
        const list = res?.data?.banks;
        if (Array.isArray(list)) setBanks(list);
      } catch {
        setBanks([
          "Access Bank",
          "First Bank",
          "GTBank",
          "Zenith Bank",
          "UBA",
          "Fidelity Bank",
          "Union Bank",
          "Sterling Bank",
          "Wema Bank",
          "FCMB",
        ]);
      }
    };

    void loadBanks();
  }, []);

  useEffect(() => {
    if (!otpCooldownUntil) {
      setOtpCooldownSeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((otpCooldownUntil - Date.now()) / 1000));
      setOtpCooldownSeconds(remaining);
      if (remaining === 0) {
        setOtpCooldownUntil(0);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldownUntil]);

  useEffect(() => {
    if (!otpExpiresUntil) {
      setOtpExpiresSeconds(0);
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((otpExpiresUntil - Date.now()) / 1000));
      setOtpExpiresSeconds(remaining);
      if (remaining === 0) {
        setOtpExpiresUntil(0);
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [otpExpiresUntil]);

  useEffect(() => {
    if (!otpSent || otpVerified) return;
    const timer = window.setTimeout(() => otpInputRef.current?.focus(), 50);
    return () => window.clearTimeout(timer);
  }, [otpSent, otpVerified]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || "");
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Unable to read file."));
      reader.readAsDataURL(file);
    });

  const uploadMedia = async (file: File, category: string) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error(t("File too large. Maximum is 5MB.", "File too big. Max na 5MB."));
    }

    if (!networkOnline) {
      setSuccess(t("You are offline. File selected and will be submitted later.", "You dey offline. File don select, e go submit later."));
      return "";
    }

    setUploadingMedia(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const res = await API.post("/api/onboarding/media-upload", {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        dataBase64,
        category,
      });
      return String(res?.data?.fileUrl || "");
    } finally {
      setUploadingMedia(false);
    }
  };

  const resetOtpSession = useCallback(() => {
    setOtpSent(false);
    setOtpVerified(false);
    setOtpInput("");
    setOtpRef("");
    setOtpPhone("");
    setOtpCooldownUntil(0);
    setOtpExpiresUntil(0);
    setLastAutoOtpAttempt("");
  }, []);

  const handleRepPhoneChange = useCallback(
    (value: string) => {
      setField("repPhone", value);

      if (!(otpSent || otpVerified || otpRef)) return;
      const nextPhone = normalizePhone(value);
      const verifiedPhone = normalizePhone(otpPhone);
      if (!verifiedPhone || nextPhone === verifiedPhone) return;

      resetOtpSession();
      setSuccess(t("Phone number updated. Request a new OTP to verify this number.", "Phone don change. Request new OTP make we verify this number."));
      setError("");
    },
    [otpSent, otpVerified, otpRef, otpPhone, resetOtpSession, t]
  );

  const validateAccount = (): string => {
    if (!accountForm.name.trim()) return t("Full name is required.", "Full name no fit empty.");
    if (!accountForm.email.trim()) return t("Email is required.", "Email no fit empty.");
    if (!/^\S+@\S+\.\S+$/.test(accountForm.email.trim())) return t("Email format is invalid.", "Email format no correct.");
    if (accountForm.password.length < 6) return t("Password must be at least 6 characters.", "Password must pass 6 characters.");
    return "";
  };

  const validateStep = (current: number): string => {
    const accountError = validateAccount();
    if (accountError) return accountError;

    if (current === 1) {
      if (!form.businessName.trim()) return t("Business name is required.", "Business name no fit empty.");
      if (!form.registrationType) return t("Select registration type.", "Choose registration type.");
      if (!form.yearsInOperation || Number(form.yearsInOperation) < 0) return t("Years in operation must be 0 or more.", "Years in operation must be 0 or pass.");
      if (!form.activity) return t("Select business activity.", "Choose business activity.");
      if (!form.businessStreet.trim() || !form.businessCity.trim() || !form.businessState || !form.businessLga.trim()) {
        return t("Complete business address fields.", "Complete business address fields.");
      }
      if (!form.businessProofName) return t("Upload business registration proof.", "Upload business registration proof.");
    }

    if (current === 2) {
      if (!form.repFullName.trim()) return t("Authorized representative name is required.", "Representative name no fit empty.");
      if (!form.repTitle.trim()) return t("Position/Title is required.", "Position no fit empty.");
      if (!isValidNigerianPhone(form.repPhone)) return t("Phone number must be valid (+234...).", "Your phone number must be 11 digits.");
      if (!otpVerified) return t("Please verify phone with OTP.", "Verify your phone with OTP.");
      if (!form.repEmail.trim() || !/^\S+@\S+\.\S+$/.test(form.repEmail)) return t("Valid representative email is required.", "Put valid representative email.");
      if (form.repEmail.trim().toLowerCase() !== form.repEmailConfirm.trim().toLowerCase()) {
        return t("Email confirmation does not match.", "Email confirmation no match.");
      }
      if (!form.idType || !form.idNumber.trim() || !form.idPhotoName) return t("Complete ID type, number, and ID photo.", "Complete ID type, number, and ID photo.");
    }

    if (current === 3) {
      if (!form.crops.length) return t("Select at least one crop of interest.", "Choose at least one crop.");
      if (form.crops.includes("other") && !form.otherCrop.trim()) return t("Enter other crop name.", "Type other crop name.");
      if (!form.qualityGrade.trim()) return t("Preferred quality grade is required.", "Quality grade no fit empty.");
      if (!form.monthlyVolume) return t("Select typical monthly volume.", "Choose monthly volume.");
      if (!form.catchmentAreas.length) return t("Select at least one catchment area.", "Choose at least one catchment area.");
      if (!form.deliveryMethod) return t("Select preferred delivery method.", "Choose delivery method.");
    }

    if (current === 4) {
      if (!form.hasBankAccount) return t("Specify if you have a bank account.", "Choose if you get bank account.");
      if (form.hasBankAccount === "yes") {
        if (!form.bankName) return t("Bank name is required.", "Bank name no fit empty.");
        if (!/^\d{10}$/.test(form.accountNumber)) return t("Account number must be 10 digits.", "Account number must be 10 digits.");
        if (!form.accountName.trim()) return t("Account name is required.", "Account name no fit empty.");
      }
      if (form.bvn && !/^\d{11}$/.test(form.bvn)) return t("BVN must be 11 digits.", "BVN must be 11 digits.");
      if (!form.paymentTerms) return t("Select payment terms.", "Choose payment terms.");
      if (!form.monthlyBudget || Number(form.monthlyBudget) <= 0) return t("Estimated monthly budget must be greater than 0.", "Monthly budget must pass 0.");
      if (!form.needsCreditLine) return t("Select if you need a credit line.", "Choose if you need credit line.");
      if (form.needsCreditLine === "yes" && (!form.creditAmountNeeded || Number(form.creditAmountNeeded) <= 0)) {
        return t("Enter estimated credit amount needed.", "Put estimated credit amount needed.");
      }
    }

    if (current === 5) {
      if (!form.hasFleet) return t("Select logistics fleet option.", "Choose fleet option.");
      if (form.hasFleet === "yes" && (!form.fleetCount || Number(form.fleetCount) < 1)) return t("Enter number of trucks/vehicles.", "Put number of trucks/vehicles.");
      if (!form.hasWarehouse) return t("Select warehouse/cold storage option.", "Choose warehouse option.");
      if (form.hasWarehouse === "yes") {
        if (!form.warehouseLocation.trim()) return t("Warehouse location is required.", "Warehouse location no fit empty.");
        if (!form.warehouseCapacity || Number(form.warehouseCapacity) <= 0 || !form.warehouseCapacityUnit) {
          return t("Warehouse capacity and unit are required.", "Warehouse capacity and unit no fit empty.");
        }
      }
      if (!form.rejectionPolicyAccepted) return t("You must accept the return/rejection policy.", "You must agree return/rejection policy.");
    }

    if (current === 6) {
      if (!form.consentBackgroundCheck) return t("Background check consent is required.", "Background check consent required.");
      if (!form.consentDataSharing) return t("Data sharing consent is required.", "Data sharing consent required.");
      if (!form.consentCodeOfConduct) return t("Code of conduct agreement is required.", "Code of conduct agreement required.");
      if (!form.signature.trim()) return t("Signature is required.", "Signature no fit empty.");
      if (!form.signatureDate) return t("Signature date is required.", "Signature date no fit empty.");
    }

    if (current === 7) {
      if (!form.referred) return t("Select referral option.", "Choose referral option.");
      if (form.referred === "yes" && !form.referrerCodeOrPhone.trim()) {
        return t("Enter referrer phone or code.", "Put referrer phone or code.");
      }
    }

    return "";
  };

  const handleSendOtp = async () => {
    if (!isValidNigerianPhone(form.repPhone)) {
      setError(t("Your phone number must be 11 digits.", "Your phone number must be 11 digits."));
      return;
    }

    if (otpCooldownSeconds > 0) {
      setError(
        t(
          `Please wait ${otpCooldownSeconds}s before requesting another OTP.`,
          `Wait ${otpCooldownSeconds}s before you request another OTP.`
        )
      );
      return;
    }

    setError("");
    setSendingOtp(true);
    try {
      const res = await API.post("/api/onboarding/otp/send", { phone: normalizePhone(form.repPhone) });
      setOtpInput("");
      setOtpSent(true);
      setOtpVerified(false);
      setLastAutoOtpAttempt("");
      setOtpPhone(normalizePhone(form.repPhone));
      setOtpRef(String(res?.data?.otpRef || ""));
      setOtpCooldownUntil(Date.now() + 30 * 1000);
      setOtpExpiresUntil(Date.now() + 300 * 1000);
      const devOtp = res?.data?.otp;
      setSuccess(devOtp ? t(`OTP sent. Demo code: ${devOtp}`, `OTP don send. Demo code na ${devOtp}`) : t("OTP sent successfully.", "OTP don send successfully."));
    } catch (err: any) {
      setError(err?.response?.data?.message || t("Unable to send OTP now.", "We no fit send OTP now."));
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = useCallback(async () => {
    if (!otpSent) return;
    if (!/^\d{6}$/.test(otpInput.trim())) {
      setError(t("OTP must be exactly 6 digits.", "OTP must complete 6 digits."));
      return;
    }

    if (!otpRef) {
      setError(t("OTP session expired. Please request a new OTP.", "OTP don expire. Request new OTP."));
      return;
    }

    setVerifyingOtpState(true);
    try {
      await API.post("/api/onboarding/otp/verify", {
        phone: normalizePhone(form.repPhone),
        otp: otpInput.trim(),
        otpRef,
      });
      setOtpVerified(true);
      setOtpExpiresUntil(0);
      setError("");
      setSuccess(t("Phone verified successfully.", "Phone don verify successfully."));
    } catch (err: any) {
      setOtpVerified(false);
      const message = String(err?.response?.data?.message || "");
      if (/expired|invalid|not found/i.test(message)) {
        setOtpRef("");
        setOtpSent(false);
        setOtpExpiresUntil(0);
        setOtpPhone("");
      }
      setError(
        message ||
          t(
            "OTP verification failed. Please try again or request a new code.",
            "OTP verification fail. Try again or request new code."
          )
      );
      setLastAutoOtpAttempt("");
    } finally {
      setVerifyingOtpState(false);
    }
  }, [otpSent, otpInput, otpRef, form.repPhone, t]);

  useEffect(() => {
    const code = otpInput.trim();
    if (!otpSent || otpVerified || verifyingOtpState) return;
    if (code.length !== 6) return;
    if (code === lastAutoOtpAttempt) return;

    setLastAutoOtpAttempt(code);
    void handleVerifyOtp();
  }, [otpInput, otpSent, otpVerified, verifyingOtpState, lastAutoOtpAttempt, handleVerifyOtp]);

  const resolveBankAccount = async () => {
    if (form.hasBankAccount !== "yes") return;
    if (!form.bankName) {
      setError(t("Choose bank name first.", "Choose bank name first."));
      return;
    }
    if (!/^\d{10}$/.test(form.accountNumber)) {
      setError(t("Account number must be 10 digits.", "Account number must be 10 digits."));
      return;
    }

    setResolvingAccount(true);
    try {
      const res = await API.post("/api/onboarding/banks/resolve", {
        bankName: form.bankName,
        accountNumber: form.accountNumber,
      });
      if (res?.data?.accountName) setField("accountName", String(res.data.accountName));
      setSuccess(t("Account verified successfully.", "Account don verify successfully."));
      setError("");
    } catch (err: any) {
      setError(err?.response?.data?.message || t("Unable to verify account now.", "We no fit verify account now."));
    } finally {
      setResolvingAccount(false);
    }
  };

  const verifyBvn = async () => {
    if (!form.bvn) return;
    if (!/^\d{11}$/.test(form.bvn)) {
      setError(t("BVN must be 11 digits.", "BVN must be 11 digits."));
      return;
    }

    setVerifyingBvn(true);
    try {
      await API.post("/api/onboarding/bvn/verify", { bvn: form.bvn });
      setError("");
      setSuccess(t("BVN verified successfully.", "BVN don verify successfully."));
    } catch (err: any) {
      setError(err?.response?.data?.message || t("Unable to verify BVN now.", "We no fit verify BVN now."));
    } finally {
      setVerifyingBvn(false);
    }
  };

  const handleNext = () => {
    setError("");
    setSuccess("");
    const stepError = validateStep(step);
    if (stepError) {
      setError(stepError);
      return;
    }
    setStep((prev) => Math.min(7, prev + 1));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    const stepError = validateStep(7);
    if (stepError) {
      setError(stepError);
      return;
    }

    const payload: QueuePayload = {
      account: {
        name: accountForm.name.trim(),
        email: accountForm.email.trim().toLowerCase(),
        phone: normalizePhone(form.repPhone),
      },
      application: {
        ...form,
        repPhone: normalizePhone(form.repPhone),
        repAltPhone: normalizePhone(form.repAltPhone),
        tradeRef1Phone: normalizePhone(form.tradeRef1Phone),
        tradeRef2Phone: normalizePhone(form.tradeRef2Phone),
      },
      status: networkOnline ? "pending" : "queued",
    };

    setLoading(true);
    try {
      await API.post("/api/auth/register", {
        name: accountForm.name.trim(),
        email: accountForm.email.trim().toLowerCase(),
        password: accountForm.password,
        role: "buyer",
      });

      if (!networkOnline) {
        queueSubmission(payload);
        localStorage.removeItem(DRAFT_KEY);
        const appId = uid();
        router.push(`/register/buyer/success?name=${encodeURIComponent(form.businessName || accountForm.name)}&appId=${encodeURIComponent(appId)}&queued=1&verificationPending=1`);
        return;
      }

      const res = await API.post("/api/buyer-applications", payload);
      localStorage.removeItem(DRAFT_KEY);
      const appId = String(res?.data?.applicationId || uid());
      const verificationPending = res?.data?.verificationPending ? "1" : "0";
      router.push(`/register/buyer/success?name=${encodeURIComponent(form.businessName || accountForm.name)}&appId=${encodeURIComponent(appId)}&queued=0&verificationPending=${verificationPending}`);
    } catch (err: any) {
      const statusCode = err?.response?.status;
      if (!statusCode) {
        queueSubmission({ ...payload, status: "queued" });
        setSuccess(t("No network now. Draft queued and will submit when online.", "No network now. Draft don queue, e go submit when online."));
        return;
      }
      setError(err?.response?.data?.message || err?.response?.data?.error || t("Submission failed. Please try again.", "Submission fail. Try again."));
    } finally {
      setLoading(false);
    }
  };

  const stepProgress = useMemo(() => `${Math.round((step / 7) * 100)}%`, [step]);

  return (
    <>
      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
        <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
          <span>Buyer Application</span>
          <span>Step {step} / 7</span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-100">
          <div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: stepProgress }} />
        </div>
        <p className="m-0 mt-2 text-xs text-blue-900">{stepLabels[step - 1]}</p>
        <p className="m-0 mt-1 text-xs text-slate-600">
          {networkOnline ? "Sync: Online" : "Sync: Offline (draft mode)"}
        </p>
      </div>

      {error ? <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {success ? <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div> : null}

      <div className="card rounded-xl border border-blue-100 p-4">
        {step === 1 ? (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-green-950">Business/Organization name <span className="text-red-500">*</span>
              <input value={form.businessName} onChange={(e) => setField("businessName", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Business registration type <span className="text-red-500">*</span>
              <select value={form.registrationType} onChange={(e) => setField("registrationType", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                <option value="">Select type</option>
                <option>Sole Proprietorship</option>
                <option>Limited Liability Company</option>
                <option>Cooperative</option>
                <option>NGO</option>
                <option>Informal Group</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">RC number (optional)
                <input value={form.rcNumber} onChange={(e) => setField("rcNumber", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Tax ID (optional)
                <input value={form.tin} onChange={(e) => setField("tin", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Years in operation <span className="text-red-500">*</span>
                <input type="number" min="0" value={form.yearsInOperation} onChange={(e) => setField("yearsInOperation", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Primary business activity <span className="text-red-500">*</span>
                <select value={form.activity} onChange={(e) => setField("activity", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select activity</option>
                  {ACTIVITY_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Business street address <span className="text-red-500">*</span>
              <input value={form.businessStreet} onChange={(e) => setField("businessStreet", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm font-semibold text-green-950">City <span className="text-red-500">*</span>
                <input value={form.businessCity} onChange={(e) => setField("businessCity", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">State <span className="text-red-500">*</span>
                <select value={form.businessState} onChange={(e) => setField("businessState", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select state</option>
                  {NIGERIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">LGA <span className="text-red-500">*</span>
                <input value={form.businessLga} onChange={(e) => setField("businessLga", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Proof of business registration (PDF/photo) <span className="text-red-500">*</span>
              <input type="file" accept=".pdf,image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setField("businessProofName", file.name);
                try {
                  const fileUrl = await uploadMedia(file, "business-proof");
                  if (fileUrl) setField("businessProofUrl", fileUrl);
                } catch (uploadErr: any) {
                  setError(uploadErr?.message || t("Upload failed.", "Upload fail."));
                }
              }} className="min-h-12 rounded-lg border border-green-200 bg-white px-3 py-2" />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-green-950">Authorized representative full name <span className="text-red-500">*</span>
              <input value={form.repFullName} onChange={(e) => setField("repFullName", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Position/Title <span className="text-red-500">*</span>
              <input value={form.repTitle} onChange={(e) => setField("repTitle", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Phone number (+234) <span className="text-red-500">*</span>
              <input value={form.repPhone} onChange={(e) => handleRepPhoneChange(e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
            </label>
            <div className="grid gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
              {otpSent || otpVerified ? (
                <button
                  type="button"
                  onClick={() => {
                    resetOtpSession();
                    setSuccess(t("Use the phone field above and request a new OTP.", "Use phone field above, request new OTP."));
                    setError("");
                  }}
                  className="w-fit rounded-md border border-green-300 bg-white px-2 py-1 text-[11px] font-semibold text-green-800"
                >
                  Use a different phone number
                </button>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendingOtp || otpCooldownSeconds > 0}
                  className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {sendingOtp
                    ? "Sending..."
                    : otpCooldownSeconds > 0
                      ? `Resend in ${otpCooldownSeconds}s`
                      : "Send OTP"}
                </button>
                <input ref={otpInputRef} value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} placeholder="Enter OTP" maxLength={6} className="min-h-11 flex-1 rounded-lg border border-green-200 px-3" />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtpState || !otpSent}
                  className="rounded-lg border border-green-300 bg-white px-3 py-2 text-xs font-bold text-green-800 disabled:opacity-60"
                >
                  {verifyingOtpState ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
              <p className={`m-0 text-xs ${otpVerified ? "text-emerald-700" : "text-slate-600"}`}>{otpVerified ? "Phone verified." : "Please verify phone before next step."}</p>
              {otpSent && !otpVerified ? (
                <p className="m-0 text-xs text-amber-700">
                  {otpExpiresSeconds > 0
                    ? `OTP expires in ${String(Math.floor(otpExpiresSeconds / 60)).padStart(2, "0")}:${String(otpExpiresSeconds % 60).padStart(2, "0")}.`
                    : "OTP expired. Request a new code."}
                </p>
              ) : null}
            </div>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Alternative phone (optional)
              <input value={form.repAltPhone} onChange={(e) => setField("repAltPhone", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Email <span className="text-red-500">*</span>
                <input type="email" value={form.repEmail} onChange={(e) => setField("repEmail", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Confirm email <span className="text-red-500">*</span>
                <input type="email" value={form.repEmailConfirm} onChange={(e) => setField("repEmailConfirm", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Government ID type <span className="text-red-500">*</span>
                <select value={form.idType} onChange={(e) => setField("idType", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select ID type</option>
                  <option>National ID</option>
                  <option>Voter&apos;s Card</option>
                  <option>Driver&apos;s License</option>
                  <option>Passport</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">ID number <span className="text-red-500">*</span>
                <input value={form.idNumber} onChange={(e) => setField("idNumber", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Photo of ID <span className="text-red-500">*</span>
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setField("idPhotoName", file.name);
                try {
                  const fileUrl = await uploadMedia(file, "buyer-id-photo");
                  if (fileUrl) setField("idPhotoUrl", fileUrl);
                } catch (uploadErr: any) {
                  setError(uploadErr?.message || t("Upload failed.", "Upload fail."));
                }
              }} className="min-h-12 rounded-lg border border-green-200 bg-white px-3 py-2" />
            </label>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Selfie holding ID (optional)
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setField("selfieWithIdName", file.name);
                try {
                  const fileUrl = await uploadMedia(file, "buyer-selfie-id");
                  if (fileUrl) setField("selfieWithIdUrl", fileUrl);
                } catch (uploadErr: any) {
                  setError(uploadErr?.message || t("Upload failed.", "Upload fail."));
                }
              }} className="min-h-12 rounded-lg border border-green-200 bg-white px-3 py-2" />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            <div className="grid gap-2 text-sm font-semibold text-green-950">
              <span>Crops of interest <span className="text-red-500">*</span></span>
              <div className="flex flex-wrap gap-2">
                {CROP_OPTIONS.map((crop) => (
                  <button key={crop} type="button" onClick={() => toggleMulti("crops", crop)} className={`rounded-full border px-3 py-2 text-xs font-bold ${form.crops.includes(crop) ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"}`}>
                    {crop}
                  </button>
                ))}
              </div>
            </div>
            {form.crops.includes("other") ? (
              <label className="grid gap-1 text-sm font-semibold text-green-950">Other crop
                <input value={form.otherCrop} onChange={(e) => setField("otherCrop", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Preferred quality grade <span className="text-red-500">*</span>
                <select value={form.qualityGrade} onChange={(e) => setField("qualityGrade", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select grade</option>
                  <option>Grade A</option>
                  <option>Grade B</option>
                  <option>Any</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Typical monthly volume <span className="text-red-500">*</span>
                <select value={form.monthlyVolume} onChange={(e) => setField("monthlyVolume", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select volume</option>
                  <option>&lt;1 ton</option>
                  <option>1-5 tons</option>
                  <option>5-20 tons</option>
                  <option>20-50 tons</option>
                  <option>50+ tons</option>
                </select>
              </label>
            </div>
            <div className="grid gap-2 text-sm font-semibold text-green-950">
              <span>Catchment areas <span className="text-red-500">*</span></span>
              <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-lg border border-green-100 p-2">
                {NIGERIAN_STATES.map((state) => (
                  <button key={state} type="button" onClick={() => toggleMulti("catchmentAreas", state)} className={`rounded-full border px-3 py-2 text-xs font-bold ${form.catchmentAreas.includes(state) ? "border-blue-700 bg-blue-700 text-white" : "border-blue-200 bg-white text-blue-900"}`}>
                    {state}
                  </button>
                ))}
              </div>
            </div>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Preferred delivery method <span className="text-red-500">*</span>
              <div className="grid gap-2">
                {["Farmer delivers to my warehouse", "I pick up from farm", "Agrolink logistics"].map((method) => (
                  <label key={method} className="flex min-h-12 items-center gap-2 rounded-lg border border-green-200 bg-white px-3">
                    <input type="radio" checked={form.deliveryMethod === method} onChange={() => setField("deliveryMethod", method)} />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Storage capacity (optional)
                <input type="number" min="0" value={form.storageCapacity} onChange={(e) => setField("storageCapacity", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Capacity unit
                <select value={form.storageUnit} onChange={(e) => setField("storageUnit", e.target.value as BuyerForm["storageUnit"])} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select unit</option>
                  <option value="tons">tons</option>
                  <option value="kg">kg</option>
                </select>
              </label>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-green-950">Do you have a bank account? <span className="text-red-500">*</span>
              <div className="grid grid-cols-2 gap-2">
                {(["yes", "no"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setField("hasBankAccount", value)} className={`min-h-12 rounded-lg border text-sm font-bold ${form.hasBankAccount === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"}`}>
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            {form.hasBankAccount === "yes" ? (
              <>
                <label className="grid gap-1 text-sm font-semibold text-green-950">Bank name <span className="text-red-500">*</span>
                  <select value={form.bankName} onChange={(e) => setField("bankName", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                    <option value="">Select bank</option>
                    {banks.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-green-950">Account number <span className="text-red-500">*</span>
                  <div className="flex gap-2">
                    <input value={form.accountNumber} onChange={(e) => setField("accountNumber", e.target.value.replace(/\D/g, ""))} maxLength={10} className="min-h-12 flex-1 rounded-lg border border-green-200 px-3" />
                    <button type="button" onClick={resolveBankAccount} disabled={resolvingAccount} className="min-h-12 rounded-lg border border-green-300 px-3 text-xs font-bold text-green-800 disabled:opacity-60">{resolvingAccount ? "Checking..." : "Check"}</button>
                  </div>
                </label>
                <label className="grid gap-1 text-sm font-semibold text-green-950">Account name <span className="text-red-500">*</span>
                  <input value={form.accountName} onChange={(e) => setField("accountName", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
                </label>
              </>
            ) : null}
            <label className="grid gap-1 text-sm font-semibold text-green-950">BVN (optional)
              <div className="flex gap-2">
                <input value={form.bvn} onChange={(e) => setField("bvn", e.target.value.replace(/\D/g, ""))} maxLength={11} className="min-h-12 flex-1 rounded-lg border border-green-200 px-3" />
                <button type="button" onClick={verifyBvn} disabled={!form.bvn || verifyingBvn} className="min-h-12 rounded-lg border border-green-300 px-3 text-xs font-bold text-green-800 disabled:opacity-60">{verifyingBvn ? "Verifying..." : "Verify"}</button>
              </div>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Preferred payment terms <span className="text-red-500">*</span>
                <select value={form.paymentTerms} onChange={(e) => setField("paymentTerms", e.target.value)} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                  <option value="">Select terms</option>
                  <option>Immediate (upon delivery)</option>
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>Letter of Credit</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Estimated monthly purchase budget (NGN) <span className="text-red-500">*</span>
                <input type="number" min="0" value={form.monthlyBudget} onChange={(e) => setField("monthlyBudget", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
            <label className="grid gap-1 text-sm font-semibold text-green-950">Need credit line from Dos Agrolink? <span className="text-red-500">*</span>
              <div className="grid grid-cols-2 gap-2">
                {(["yes", "no"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setField("needsCreditLine", value)} className={`min-h-12 rounded-lg border text-sm font-bold ${form.needsCreditLine === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"}`}>
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            {form.needsCreditLine === "yes" ? (
              <label className="grid gap-1 text-sm font-semibold text-green-950">Estimated amount needed
                <input type="number" min="0" value={form.creditAmountNeeded} onChange={(e) => setField("creditAmountNeeded", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Trade reference 1 (optional)
                <input value={form.tradeRef1Name} onChange={(e) => setField("tradeRef1Name", e.target.value)} placeholder="Name" className="min-h-12 rounded-lg border border-green-200 px-3" />
                <input value={form.tradeRef1Phone} onChange={(e) => setField("tradeRef1Phone", e.target.value)} placeholder="Phone" className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Trade reference 2 (optional)
                <input value={form.tradeRef2Name} onChange={(e) => setField("tradeRef2Name", e.target.value)} placeholder="Name" className="min-h-12 rounded-lg border border-green-200 px-3" />
                <input value={form.tradeRef2Phone} onChange={(e) => setField("tradeRef2Phone", e.target.value)} placeholder="Phone" className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-green-950">Do you have your own logistics fleet? <span className="text-red-500">*</span>
              <div className="grid grid-cols-2 gap-2">
                {(["yes", "no"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setField("hasFleet", value)} className={`min-h-12 rounded-lg border text-sm font-bold ${form.hasFleet === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"}`}>
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            {form.hasFleet === "yes" ? (
              <label className="grid gap-1 text-sm font-semibold text-green-950">Number of trucks/vehicles
                <input type="number" min="1" value={form.fleetCount} onChange={(e) => setField("fleetCount", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            ) : null}
            <label className="grid gap-1 text-sm font-semibold text-green-950">Do you have warehouse or cold storage? <span className="text-red-500">*</span>
              <div className="grid grid-cols-2 gap-2">
                {(["yes", "no"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setField("hasWarehouse", value)} className={`min-h-12 rounded-lg border text-sm font-bold ${form.hasWarehouse === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"}`}>
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            {form.hasWarehouse === "yes" ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-1 text-sm font-semibold text-green-950">Location
                  <input value={form.warehouseLocation} onChange={(e) => setField("warehouseLocation", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-green-950">Capacity
                  <input type="number" min="0" value={form.warehouseCapacity} onChange={(e) => setField("warehouseCapacity", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
                </label>
                <label className="grid gap-1 text-sm font-semibold text-green-950">Unit
                  <select value={form.warehouseCapacityUnit} onChange={(e) => setField("warehouseCapacityUnit", e.target.value as BuyerForm["warehouseCapacityUnit"])} className="min-h-12 rounded-lg border border-green-200 bg-white px-3">
                    <option value="">Select unit</option>
                    <option value="tons">tons</option>
                    <option value="kg">kg</option>
                  </select>
                </label>
              </div>
            ) : null}
            <div className="grid gap-2 text-sm font-semibold text-green-950">
              <span>Quality testing equipment available</span>
              <div className="flex flex-wrap gap-2">
                {QUALITY_EQUIPMENT.map((item) => (
                  <button key={item} type="button" onClick={() => toggleMulti("qualityEquipment", item)} className={`rounded-full border px-3 py-2 text-xs font-bold ${form.qualityEquipment.includes(item) ? "border-blue-700 bg-blue-700 text-white" : "border-blue-200 bg-white text-blue-900"}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
              <input type="checkbox" checked={form.rejectionPolicyAccepted} onChange={(e) => setField("rejectionPolicyAccepted", e.target.checked)} />
              I agree to communicate quality rejections within 24 hours of delivery with photo evidence.
            </label>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="grid gap-3">
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
              <input type="checkbox" checked={form.consentBackgroundCheck} onChange={(e) => setField("consentBackgroundCheck", e.target.checked)} />
              Agrolink may verify my business registration and financial standing.
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
              <input type="checkbox" checked={form.consentDataSharing} onChange={(e) => setField("consentDataSharing", e.target.checked)} />
              I agree that my purchase history and ratings may be shared with farmers.
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
              <input type="checkbox" checked={form.consentCommunication} onChange={(e) => setField("consentCommunication", e.target.checked)} />
              I want to receive bulk purchase alerts, price trends, and platform updates.
            </label>
            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
              <input type="checkbox" checked={form.consentCodeOfConduct} onChange={(e) => setField("consentCodeOfConduct", e.target.checked)} />
              I will not cancel orders without valid reason or delay farmer payments.
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-green-950">Signature <span className="text-red-500">*</span>
                <input value={form.signature} onChange={(e) => setField("signature", e.target.value)} placeholder="Type full name" className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-green-950">Date <span className="text-red-500">*</span>
                <input type="date" value={form.signatureDate} onChange={(e) => setField("signatureDate", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm font-semibold text-green-950">Referred by existing Agrolink buyer? <span className="text-red-500">*</span>
              <div className="grid grid-cols-2 gap-2">
                {(["yes", "no"] as const).map((value) => (
                  <button key={value} type="button" onClick={() => setField("referred", value)} className={`min-h-12 rounded-lg border text-sm font-bold ${form.referred === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"}`}>
                    {value.toUpperCase()}
                  </button>
                ))}
              </div>
            </label>
            {form.referred === "yes" ? (
              <label className="grid gap-1 text-sm font-semibold text-green-950">Referrer phone or code <span className="text-red-500">*</span>
                <input value={form.referrerCodeOrPhone} onChange={(e) => setField("referrerCodeOrPhone", e.target.value)} className="min-h-12 rounded-lg border border-green-200 px-3" />
              </label>
            ) : null}
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
              <p className="m-0 font-semibold">Fallback support</p>
              <p className="m-0 mt-1">For poor internet, request a PDF form by email and submit attachments later.</p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStep((prev) => Math.max(1, prev - 1))}
          disabled={step === 1 || loading}
          className="min-h-12 flex-1 rounded-lg border border-green-300 bg-white px-4 text-sm font-bold text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Back
        </button>

        {step < 7 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={loading || uploadingMedia}
            className="min-h-12 flex-1 rounded-lg bg-green-700 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || uploadingMedia}
            className="min-h-12 flex-1 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Submitting..." : "Submit for Review"}
          </button>
        )}
      </div>
    </>
  );
}
