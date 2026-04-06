"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import API from "@/services/api";
import { useLocalizedCopy } from "@/services/useLocalizedCopy";
import AuthShell from "../_components/AuthShell";
import PasswordEyeIcon from "../_components/PasswordEyeIcon";
import BuyerOnboardingPanel from "./_components/BuyerOnboardingPanel";

type UserRole = "buyer" | "farmer";
type YesNo = "yes" | "no";
type Language = "en" | "pidgin" | "hausa" | "yoruba" | "igbo";

type QueuePayload = {
  account: {
    name: string;
    email: string;
    phone: string;
  };
  application: FarmerForm;
  status: "submitted" | "queued";
};

type FarmerForm = {
  phone: string;
  altPhone: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  idPhotoName: string;
  idPhotoUrl: string;
  selfieWithIdName: string;
  selfieWithIdUrl: string;
  state: string;
  lga: string;
  townVillage: string;
  landmark: string;
  gpsLat: string;
  gpsLng: string;
  farmSizeValue: string;
  farmSizeUnit: "hectares" | "acres" | "plots" | "";
  landOwnership: "owned" | "family" | "rented" | "sharecropper" | "";
  crops: string[];
  otherCrop: string;
  yearsExperience: string;
  waterSource: "rain-fed" | "borehole" | "river" | "well" | "drip" | "";
  useFertilizer: YesNo | "";
  fertilizerType: "organic" | "inorganic" | "both" | "";
  usePesticides: YesNo | "";
  assets: string[];
  mobileAccess: "smartphone" | "feature-phone" | "none" | "";
  internetAccess: "daily" | "weekly" | "rarely" | "no" | "";
  hasBankAccount: YesNo | "";
  bankName: string;
  accountNumber: string;
  accountName: string;
  bvn: string;
  paymentMethod: "bank-transfer" | "wallet" | "mobile-money" | "";
  membershipTier: "basic" | "premium" | "";
  emergencyContactName: string;
  emergencyContactPhone: string;
  consentDataSharing: boolean;
  consentCreditCheck: boolean;
  consentSmsVoice: boolean;
  signature: string;
  wasReferred: YesNo | "";
  referrer: string;
};

const DRAFT_KEY = "agrolink_farmer_register_draft_v1";
const QUEUE_KEY = "agrolink_farmer_submission_queue_v1";

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

const BASE_LGAS = ["North", "Central", "South"];

const LGA_BY_STATE: Record<string, string[]> = Object.fromEntries(
  NIGERIAN_STATES.map((state) => [state, BASE_LGAS.map((region) => `${state} ${region}`)])
);

LGA_BY_STATE["Lagos"] = ["Ikeja", "Epe", "Ikorodu", "Badagry", "Eti-Osa"];
LGA_BY_STATE["Federal Capital Territory"] = ["Abuja Municipal", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Abaji"];
LGA_BY_STATE["Kano"] = ["Nasarawa", "Dala", "Fagge", "Gwale", "Tarauni"];
LGA_BY_STATE["Kaduna"] = ["Zaria", "Kaduna North", "Kaduna South", "Kachia", "Soba"];
LGA_BY_STATE["Rivers"] = ["Port Harcourt", "Obio/Akpor", "Ikwerre", "Ahoada East", "Etche"];

const CROPS = [
  "maize",
  "cassava",
  "rice",
  "yam",
  "tomatoes",
  "peppers",
  "sorghum",
  "groundnut",
  "beans",
  "millet",
  "soybean",
  "other",
] as const;

const ASSETS = ["tractor", "sprayer", "harvester", "storage facility", "none"] as const;

const BANKS = [
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
  "Polaris Bank",
  "Keystone Bank",
  "Stanbic IBTC",
  "Providus Bank",
  "Jaiz Bank",
] as const;

const defaultFarmerForm: FarmerForm = {
  phone: "",
  altPhone: "",
  dateOfBirth: "",
  idType: "",
  idNumber: "",
  idPhotoName: "",
  idPhotoUrl: "",
  selfieWithIdName: "",
  selfieWithIdUrl: "",
  state: "",
  lga: "",
  townVillage: "",
  landmark: "",
  gpsLat: "",
  gpsLng: "",
  farmSizeValue: "",
  farmSizeUnit: "",
  landOwnership: "",
  crops: [],
  otherCrop: "",
  yearsExperience: "",
  waterSource: "",
  useFertilizer: "",
  fertilizerType: "",
  usePesticides: "",
  assets: [],
  mobileAccess: "",
  internetAccess: "",
  hasBankAccount: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
  bvn: "",
  paymentMethod: "",
  membershipTier: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  consentDataSharing: false,
  consentCreditCheck: false,
  consentSmsVoice: false,
  signature: "",
  wasReferred: "",
  referrer: "",
};

const stepLabels = [
  "Personal Information",
  "Farm & Location",
  "Farming Practices & Assets",
  "Financial & Bank Details",
  "Membership & Consent",
  "Referral",
] as const;

const ageFromDob = (dob: string): number => {
  if (!dob) return 0;
  const dobDate = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - dobDate.getFullYear();
  const monthDiff = now.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dobDate.getDate())) {
    age -= 1;
  }
  return age;
};

const normalizePhone = (input: string): string => {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("234") && digits.length === 13) return `+${digits}`;
  if (digits.startsWith("0") && digits.length === 11) return `+234${digits.slice(1)}`;
  if (digits.length === 10) return `+234${digits}`;
  if (digits.startsWith("234")) return `+${digits}`;
  return input.trim();
};

const isValidNigerianPhone = (input: string): boolean => {
  const normalized = normalizePhone(input);
  return /^\+234\d{10}$/.test(normalized);
};

const uid = (): string => `AGR-${Math.floor(Math.random() * 900000 + 100000)}`;

export default function RegisterPage() {
  const router = useRouter();
  const { copy } = useLocalizedCopy();

  const [accountForm, setAccountForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer" as UserRole,
  });
  const [farmerForm, setFarmerForm] = useState<FarmerForm>(defaultFarmerForm);
  const [language, setLanguage] = useState<Language>("en");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentFarmerStep, setCurrentFarmerStep] = useState(1);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [banks, setBanks] = useState<string[]>([...BANKS]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const [verifyingBvn, setVerifyingBvn] = useState(false);
  const [networkOnline, setNetworkOnline] = useState<boolean>(true);
  const [voiceError, setVoiceError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setNetworkOnline(window.navigator.onLine);

    const toOnline = () => setNetworkOnline(true);
    const toOffline = () => setNetworkOnline(false);

    window.addEventListener("online", toOnline);
    window.addEventListener("offline", toOffline);

    return () => {
      window.removeEventListener("online", toOnline);
      window.removeEventListener("offline", toOffline);
    };
  }, []);

  const getText = useCallback(
    (english: string, pidgin: string): string => (language === "pidgin" ? pidgin : english),
    [language]
  );

  const getPasswordStrength = (password: string) => {
    if (!password) {
      return { label: "", toneClass: "text-slate-500", score: 0 };
    }

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: "Weak password", toneClass: "text-red-600", score };
    if (score <= 2) return { label: "Fair password", toneClass: "text-amber-700", score };
    if (score === 3) return { label: "Good password", toneClass: "text-emerald-700", score };
    return { label: "Strong password", toneClass: "text-emerald-800", score };
  };

  const passwordStrength = getPasswordStrength(accountForm.password);

  const lgaOptions = useMemo(() => {
    if (!farmerForm.state) return [];
    return LGA_BY_STATE[farmerForm.state] || [];
  }, [farmerForm.state]);

  const setFarmerField = <K extends keyof FarmerForm>(field: K, value: FarmerForm[K]) => {
    setFarmerForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    const payload = {
      accountForm,
      farmerForm,
      currentFarmerStep,
      otpSent,
      otpVerified,
      language,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
  }, [accountForm, farmerForm, currentFarmerStep, otpSent, otpVerified, language]);

  useEffect(() => {
    if (accountForm.role === "farmer") {
      saveDraft();
    }
  }, [accountForm.role, saveDraft]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as {
        accountForm?: typeof accountForm;
        farmerForm?: FarmerForm;
        currentFarmerStep?: number;
        otpSent?: boolean;
        otpVerified?: boolean;
        language?: Language;
      };

      if (parsed.accountForm) {
        setAccountForm((prev) => ({ ...prev, ...parsed.accountForm, role: "farmer" }));
      }
      if (parsed.farmerForm) {
        setFarmerForm((prev) => ({ ...prev, ...parsed.farmerForm }));
      }
      if (parsed.currentFarmerStep && parsed.currentFarmerStep >= 1 && parsed.currentFarmerStep <= 6) {
        setCurrentFarmerStep(parsed.currentFarmerStep);
      }
      setOtpSent(Boolean(parsed.otpSent));
      setOtpVerified(Boolean(parsed.otpVerified));
      if (parsed.language) {
        setLanguage(parsed.language);
      }
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (!farmerForm.state) return;
    if (farmerForm.lga && !lgaOptions.includes(farmerForm.lga)) {
      setFarmerField("lga", "");
    }
  }, [farmerForm.state, farmerForm.lga, lgaOptions]);

  const queueSubmission = (payload: QueuePayload) => {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem(QUEUE_KEY);
    const queue: QueuePayload[] = existing ? (JSON.parse(existing) as QueuePayload[]) : [];
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

    if (!queue.length) return;

    const remaining: QueuePayload[] = [];
    for (const item of queue) {
      try {
        await API.post("/api/farmer-applications", item);
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
        const apiBanks = res?.data?.banks;
        if (Array.isArray(apiBanks) && apiBanks.length) {
          setBanks(apiBanks);
        }
      } catch {
        // keep static bank fallback
      }
    };

    void loadBanks();
  }, []);

  const validateAccountStep = (): string => {
    if (!accountForm.name.trim()) return getText("Full name is required.", "Abeg put your full name.");
    if (!accountForm.email.trim()) return getText("Email is required.", "Abeg put your email.");
    if (!/^\S+@\S+\.\S+$/.test(accountForm.email.trim())) {
      return getText("Please enter a valid email.", "Email no correct. Check am.");
    }
    if (accountForm.password.length < 6) {
      return getText("Password must be at least 6 characters.", "Password must reach 6 characters.");
    }
    return "";
  };

  const validateFarmerStep = (step: number): string => {
    if (step === 1) {
      if (!isValidNigerianPhone(farmerForm.phone)) {
        return getText("Phone number must be valid (+234...).", "Your phone number must be 11 digits. Try again.");
      }
      if (!otpVerified) {
        return getText("Please complete OTP verification.", "Verify your phone with OTP before you continue.");
      }
      if (!farmerForm.dateOfBirth) return getText("Date of birth is required.", "Pick your date of birth.");
      if (ageFromDob(farmerForm.dateOfBirth) < 18) return getText("Applicant must be at least 18 years old.", "You never reach 18 years.");
      if (!farmerForm.idType) return getText("Select an ID type.", "Choose your ID type.");
      if (!farmerForm.idNumber.trim()) return getText("ID number is required.", "ID number no fit empty.");
      if (!farmerForm.idPhotoName) return getText("Please upload your ID photo.", "Upload your ID photo with good light.");
    }

    if (step === 2) {
      if (!farmerForm.state) return getText("State is required.", "Choose your state.");
      if (!farmerForm.lga) return getText("LGA is required.", "Choose your LGA.");
      if (!farmerForm.townVillage.trim()) return getText("Town or village is required.", "Put your town or village.");
      if (!farmerForm.landmark.trim()) return getText("Farm landmark is required.", "Put farm address or landmark.");
      const size = Number(farmerForm.farmSizeValue);
      if (!farmerForm.farmSizeValue || Number.isNaN(size) || size <= 0) {
        return getText("Farm size must be greater than 0.", "Farm size must pass 0.");
      }
      if (!farmerForm.farmSizeUnit) return getText("Select farm size unit.", "Choose farm size unit.");
      if (!farmerForm.landOwnership) return getText("Select land ownership.", "Select who get the land.");
      if (!farmerForm.crops.length) return getText("Select at least one crop.", "Choose at least one crop.");
      if (farmerForm.crops.includes("other") && !farmerForm.otherCrop.trim()) {
        return getText("Enter other crop name.", "You choose other crop, type am.");
      }
    }

    if (step === 3) {
      const years = Number(farmerForm.yearsExperience);
      if (Number.isNaN(years) || years < 0 || years > 50) {
        return getText("Years of farming must be between 0 and 50.", "Years of farming must dey between 0 and 50.");
      }
      if (!farmerForm.waterSource) return getText("Select main water source.", "Select main water source.");
      if (!farmerForm.useFertilizer) return getText("Choose fertilizer usage.", "Tell us if you use fertilizer.");
      if (farmerForm.useFertilizer === "yes" && !farmerForm.fertilizerType) {
        return getText("Select fertilizer type.", "Choose fertilizer type.");
      }
      if (!farmerForm.usePesticides) return getText("Choose pesticide/herbicide usage.", "Tell us if you use pesticide.");
      if (!farmerForm.mobileAccess) return getText("Select phone access.", "Select your phone access.");
      if (!farmerForm.internetAccess) return getText("Select internet access.", "Select your internet access.");
    }

    if (step === 4) {
      if (!farmerForm.hasBankAccount) return getText("Please choose if you have a bank account.", "Choose if you get bank account.");
      if (farmerForm.hasBankAccount === "yes") {
        if (!farmerForm.bankName) return getText("Bank name is required.", "Choose your bank name.");
        if (!/^\d{10}$/.test(farmerForm.accountNumber)) {
          return getText("Account number must be 10 digits.", "Account number must be 10 digits.");
        }
        if (!farmerForm.accountName.trim()) return getText("Account name is required.", "Put account name.");
        if (farmerForm.bvn && !/^\d{11}$/.test(farmerForm.bvn)) {
          return getText("BVN must be 11 digits.", "BVN must be 11 digits.");
        }
      }
      if (!farmerForm.paymentMethod) return getText("Select preferred payment method.", "Choose preferred payment method.");
    }

    if (step === 5) {
      if (!farmerForm.membershipTier) return getText("Select membership tier.", "Choose membership tier.");
      if (!farmerForm.emergencyContactName.trim()) return getText("Emergency contact name is required.", "Emergency contact name no fit empty.");
      if (!isValidNigerianPhone(farmerForm.emergencyContactPhone)) {
        return getText("Emergency contact phone is invalid.", "Emergency contact phone no correct.");
      }
      if (!farmerForm.consentDataSharing) {
        return getText("Data sharing consent is required.", "Tick data sharing consent to continue.");
      }
      if (!farmerForm.consentCreditCheck) {
        return getText("Credit check consent is required.", "Tick credit check consent to continue.");
      }
      if (!farmerForm.signature.trim()) return getText("Signature is required.", "Sign before you continue.");
    }

    if (step === 6) {
      if (!farmerForm.wasReferred) return getText("Please choose referral option.", "Choose if person refer you.");
      if (farmerForm.wasReferred === "yes" && !farmerForm.referrer.trim()) {
        return getText("Enter referrer code or phone.", "Put referrer phone or code.");
      }
    }

    return "";
  };

  const handleAccountChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setAccountForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleVoiceInput = (field: keyof FarmerForm) => {
    if (typeof window === "undefined") return;

    const speechApi =
      (window as Window & { SpeechRecognition?: any }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!speechApi) {
      setVoiceError(getText("Voice input is not available on this phone.", "Voice input no dey this phone."));
      return;
    }

    setVoiceError("");
    const recognition = new speechApi();
    recognition.lang = language === "en" ? "en-NG" : "en-NG";
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      setFarmerField(field, transcript as FarmerForm[keyof FarmerForm]);
    };

    recognition.onerror = () => {
      setVoiceError(getText("Voice input failed. Please type instead.", "Voice input fail. Abeg type am."));
    };
  };

  const handleAccountNameVoiceInput = () => {
    if (typeof window === "undefined") return;

    const speechApi =
      (window as Window & { SpeechRecognition?: any }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!speechApi) {
      setVoiceError(getText("Voice input is not available on this phone.", "Voice input no dey this phone."));
      return;
    }

    setVoiceError("");
    const recognition = new speechApi();
    recognition.lang = language === "en" ? "en-NG" : "en-NG";
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim() ?? "";
      if (!transcript) return;
      setAccountForm((prev) => ({ ...prev, name: transcript }));
    };

    recognition.onerror = () => {
      setVoiceError(getText("Voice input failed. Please type instead.", "Voice input fail. Abeg type am."));
    };
  };

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

  const uploadMedia = async (file: File, category: "id-photo" | "selfie-with-id") => {
    if (!networkOnline) {
      setSuccess(getText("You are offline. File selected and will be submitted later.", "You dey offline. We select file, e go submit later."));
      return "";
    }

    setUploadingMedia(true);
    try {
      const dataBase64 = await fileToBase64(file);
      const res = await API.post("/api/onboarding/media-upload", {
        fileName: file.name,
        mimeType: file.type || "image/jpeg",
        dataBase64,
        category,
      });
      return String(res?.data?.fileUrl || "");
    } finally {
      setUploadingMedia(false);
    }
  };

  const sendOtp = async () => {
    if (!isValidNigerianPhone(farmerForm.phone)) {
      setError(getText("Enter a valid Nigerian phone number before OTP.", "Put correct phone number before OTP."));
      return;
    }

    setError("");
    setSuccess("");
    try {
      const res = await API.post("/api/onboarding/otp/send", {
        phone: normalizePhone(farmerForm.phone),
      });
      setOtpInput("");
      setOtpSent(true);
      setOtpVerified(false);
      const debugOtp = res?.data?.otp;
      if (debugOtp) {
        setSuccess(getText(`OTP sent. Demo code: ${debugOtp}`, `OTP don send. Demo code na ${debugOtp}`));
      } else {
        setSuccess(getText("OTP sent successfully.", "OTP don send successfully."));
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || getText("Unable to send OTP now.", "We no fit send OTP now."));
    }
  };

  const verifyOtp = async () => {
    if (!otpSent) return;
    try {
      await API.post("/api/onboarding/otp/verify", {
        phone: normalizePhone(farmerForm.phone),
        otp: otpInput.trim(),
      });
      setOtpVerified(true);
      setError("");
      setSuccess(getText("Phone verified successfully.", "Phone don verify successfully."));
    } catch (err: any) {
      setOtpVerified(false);
      setError(err?.response?.data?.message || getText("Incorrect OTP. Please try again.", "OTP no correct. Try again."));
    }
  };

  const resolveBankAccount = async () => {
    if (farmerForm.hasBankAccount !== "yes") return;
    if (!farmerForm.bankName) {
      setError(getText("Choose bank name first.", "Choose bank name first."));
      return;
    }
    if (!/^\d{10}$/.test(farmerForm.accountNumber)) {
      setError(getText("Account number must be 10 digits.", "Account number must be 10 digits."));
      return;
    }

    setResolvingAccount(true);
    setError("");
    try {
      const res = await API.post("/api/onboarding/banks/resolve", {
        bankName: farmerForm.bankName,
        accountNumber: farmerForm.accountNumber,
      });
      if (res?.data?.accountName) {
        setFarmerField("accountName", String(res.data.accountName));
      }
      setSuccess(getText("Account verified successfully.", "Account don verify successfully."));
    } catch (err: any) {
      setError(err?.response?.data?.message || getText("Unable to verify account now.", "We no fit verify account now."));
    } finally {
      setResolvingAccount(false);
    }
  };

  const verifyBvn = async () => {
    if (!farmerForm.bvn) return;
    if (!/^\d{11}$/.test(farmerForm.bvn)) {
      setError(getText("BVN must be 11 digits.", "BVN must be 11 digits."));
      return;
    }

    setVerifyingBvn(true);
    setError("");
    try {
      await API.post("/api/onboarding/bvn/verify", { bvn: farmerForm.bvn });
      setSuccess(getText("BVN verified successfully.", "BVN don verify successfully."));
    } catch (err: any) {
      setError(err?.response?.data?.message || getText("Unable to verify BVN now.", "We no fit verify BVN now."));
    } finally {
      setVerifyingBvn(false);
    }
  };

  const handleCropToggle = (crop: string) => {
    setFarmerForm((prev) => {
      const exists = prev.crops.includes(crop);
      return {
        ...prev,
        crops: exists ? prev.crops.filter((item) => item !== crop) : [...prev.crops, crop],
      };
    });
  };

  const handleAssetToggle = (asset: string) => {
    setFarmerForm((prev) => {
      if (asset === "none") {
        return { ...prev, assets: prev.assets.includes("none") ? [] : ["none"] };
      }

      const withoutNone = prev.assets.filter((item) => item !== "none");
      const exists = withoutNone.includes(asset);
      return {
        ...prev,
        assets: exists ? withoutNone.filter((item) => item !== asset) : [...withoutNone, asset],
      };
    });
  };

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError(getText("Geolocation is not available on this device.", "Location service no dey this phone."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFarmerField("gpsLat", position.coords.latitude.toFixed(6));
        setFarmerField("gpsLng", position.coords.longitude.toFixed(6));
        setError("");
      },
      () => {
        setError(getText("Unable to get current location. Please try again.", "We no fit get your location now. Try again."));
      }
    );
  };

  const clearDraft = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DRAFT_KEY);
    }
  };

  const submitFarmerRegistration = async () => {
    const accountError = validateAccountStep();
    if (accountError) {
      setError(accountError);
      return;
    }

    const stepError = validateFarmerStep(6);
    if (stepError) {
      setError(stepError);
      return;
    }

    const normalizedPhone = normalizePhone(farmerForm.phone);

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/api/auth/register", {
        name: accountForm.name.trim(),
        email: accountForm.email.trim().toLowerCase(),
        password: accountForm.password,
        role: "farmer",
      });

      const payload: QueuePayload = {
        account: {
          name: accountForm.name.trim(),
          email: accountForm.email.trim().toLowerCase(),
          phone: normalizedPhone,
        },
        application: {
          ...farmerForm,
          phone: normalizedPhone,
          altPhone: normalizePhone(farmerForm.altPhone),
          emergencyContactPhone: normalizePhone(farmerForm.emergencyContactPhone),
        },
        status: networkOnline ? "submitted" : "queued",
      };

      if (!networkOnline) {
        queueSubmission(payload);
        setSuccess(getText("Account created. Farmer form saved offline and queued for sync.", "Account don create. Farmer form don save offline and queue for send."));
        clearDraft();
        const offlineId = uid();
        router.push(`/register/success?name=${encodeURIComponent(accountForm.name.trim())}&appId=${encodeURIComponent(offlineId)}&queued=1&kycPending=1`);
        return;
      }

      const res = await API.post("/api/farmer-applications", payload);
      const appId = res?.data?.applicationId || uid();
      const kycPending = res?.data?.kycPending ? "1" : "0";
      clearDraft();
      router.push(`/register/success?name=${encodeURIComponent(accountForm.name.trim())}&appId=${encodeURIComponent(appId)}&queued=0&kycPending=${kycPending}`);
    } catch (err: any) {
      const statusCode = err?.response?.status;
      if (!statusCode) {
        const payload: QueuePayload = {
          account: {
            name: accountForm.name.trim(),
            email: accountForm.email.trim().toLowerCase(),
            phone: normalizePhone(farmerForm.phone),
          },
          application: farmerForm,
          status: "queued",
        };

        queueSubmission(payload);
        setSuccess(getText("No network now. We saved your application and will send when internet returns.", "No network now. We save your form. We go send am when network return."));
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          getText("Registration failed. Please try again.", "Registration fail. Try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFarmerNext = () => {
    setError("");
    setSuccess("");

    const accountError = validateAccountStep();
    if (accountError) {
      setError(accountError);
      return;
    }

    const stepError = validateFarmerStep(currentFarmerStep);
    if (stepError) {
      setError(stepError);
      return;
    }

    setCurrentFarmerStep((prev) => Math.min(6, prev + 1));
  };

  const renderLanguageToggle = (
    <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-green-100 bg-green-50 p-2 text-xs font-semibold text-green-900">
      <span>{getText("Language", "Language")}</span>
      {(["en", "pidgin", "hausa", "yoruba", "igbo"] as Language[]).map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => setLanguage(lang)}
          className={`rounded-full px-3 py-1 ${
            language === lang ? "bg-green-700 text-white" : "bg-white text-green-800"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const renderFarmerProgress = (
    <div className="mb-4 rounded-lg border border-green-100 bg-green-50 p-3">
      <div className="flex items-center justify-between text-xs font-semibold text-green-800">
        <span>{getText("Farmer Application", "Farmer Application")}</span>
        <span>
          {getText("Step", "Step")} {currentFarmerStep} / 6
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-green-100">
        <div
          className={`h-full rounded-full bg-green-700 transition-all ${
            currentFarmerStep === 1
              ? "w-1/6"
              : currentFarmerStep === 2
                ? "w-2/6"
                : currentFarmerStep === 3
                  ? "w-3/6"
                  : currentFarmerStep === 4
                    ? "w-4/6"
                    : currentFarmerStep === 5
                      ? "w-5/6"
                      : "w-full"
          }`}
        />
      </div>
      <p className="m-0 mt-2 text-xs text-green-900">{stepLabels[currentFarmerStep - 1]}</p>
      <p className="m-0 mt-1 text-xs text-slate-600">
        {networkOnline
          ? getText("Online: your draft is auto-saved.", "Online: we dey save your draft automatically.")
          : getText("Offline: draft saved locally and queued for later sync.", "Offline: draft dey save locally, we go sync later.")}
      </p>
    </div>
  );

  const renderPersonalStep = (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Phone number <span className="text-red-500">*</span>
        <input
          type="tel"
          value={farmerForm.phone}
          onChange={(e) => setFarmerField("phone", e.target.value)}
          placeholder="+234 801 234 5678"
          className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
        />
      </label>

      <div className="grid gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={sendOtp} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white">
            Send OTP
          </button>
          <input
            type="text"
            inputMode="numeric"
            value={otpInput}
            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter OTP"
            className="min-h-11 flex-1 rounded-lg border border-green-200 px-3 outline-none"
          />
          <button type="button" onClick={verifyOtp} className="rounded-lg border border-green-300 bg-white px-3 py-2 text-xs font-bold text-green-800">
            Verify OTP
          </button>
        </div>
        <p className={`m-0 text-xs ${otpVerified ? "text-emerald-700" : "text-slate-600"}`}>
          {otpVerified
            ? getText("Phone verified.", "Phone don verify.")
            : getText("Please verify your phone before moving to next step.", "Abeg verify your phone before next step.")}
        </p>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Alternative phone (optional)
        <input
          type="tel"
          value={farmerForm.altPhone}
          onChange={(e) => setFarmerField("altPhone", e.target.value)}
          placeholder="+234 701 234 5678"
          className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Date of birth <span className="text-red-500">*</span>
        <input
          type="date"
          value={farmerForm.dateOfBirth}
          onChange={(e) => setFarmerField("dateOfBirth", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Government ID type <span className="text-red-500">*</span>
        <select
          value={farmerForm.idType}
          onChange={(e) => setFarmerField("idType", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
        >
          <option value="">Select ID type</option>
          <option value="National ID">National ID</option>
          <option value="Voter&apos;s Card">Voter&apos;s Card</option>
          <option value="Driver&apos;s License">Driver&apos;s License</option>
          <option value="Passport">Passport</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        ID number <span className="text-red-500">*</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={farmerForm.idNumber}
            onChange={(e) => setFarmerField("idNumber", e.target.value)}
            className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
          <button type="button" onClick={() => handleVoiceInput("idNumber")} className="min-h-12 rounded-lg border border-green-300 px-3 text-sm font-semibold text-green-700">
            Mic
          </button>
        </div>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Photo of ID <span className="text-red-500">*</span>
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setFarmerField("idPhotoName", file.name);
            try {
              const fileUrl = await uploadMedia(file, "id-photo");
              if (fileUrl) setFarmerField("idPhotoUrl", fileUrl);
            } catch (err: any) {
              setError(err?.response?.data?.message || getText("ID upload failed. Try again.", "ID upload fail. Try again."));
            }
          }}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 py-2"
        />
        <span className="text-xs font-normal text-slate-600">Hold steady, use good light.</span>
        {farmerForm.idPhotoUrl ? <span className="text-xs font-normal text-emerald-700">Uploaded</span> : null}
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Selfie with ID (optional)
        <input
          type="file"
          accept="image/*"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setFarmerField("selfieWithIdName", file.name);
            try {
              const fileUrl = await uploadMedia(file, "selfie-with-id");
              if (fileUrl) setFarmerField("selfieWithIdUrl", fileUrl);
            } catch (err: any) {
              setError(err?.response?.data?.message || getText("Selfie upload failed. Try again.", "Selfie upload fail. Try again."));
            }
          }}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 py-2"
        />
        {farmerForm.selfieWithIdUrl ? <span className="text-xs font-normal text-emerald-700">Uploaded</span> : null}
      </label>
    </div>
  );

  const renderLocationStep = (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-semibold text-green-950">
        State <span className="text-red-500">*</span>
        <select
          value={farmerForm.state}
          onChange={(e) => setFarmerField("state", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
        >
          <option value="">Select state</option>
          {NIGERIAN_STATES.map((state) => (
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        LGA <span className="text-red-500">*</span>
        <select
          value={farmerForm.lga}
          onChange={(e) => setFarmerField("lga", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
          disabled={!farmerForm.state}
        >
          <option value="">Select LGA</option>
          {lgaOptions.map((lga) => (
            <option key={lga} value={lga}>
              {lga}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Town / Village <span className="text-red-500">*</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={farmerForm.townVillage}
            onChange={(e) => setFarmerField("townVillage", e.target.value)}
            className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
          <button type="button" onClick={() => handleVoiceInput("townVillage")} className="min-h-12 rounded-lg border border-green-300 px-3 text-sm font-semibold text-green-700">
            Mic
          </button>
        </div>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Farm address / landmark <span className="text-red-500">*</span>
        <div className="flex gap-2">
          <input
            type="text"
            value={farmerForm.landmark}
            onChange={(e) => setFarmerField("landmark", e.target.value)}
            placeholder="Behind old market, near river"
            className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
          <button type="button" onClick={() => handleVoiceInput("landmark")} className="min-h-12 rounded-lg border border-green-300 px-3 text-sm font-semibold text-green-700">
            Mic
          </button>
        </div>
      </label>

      <div className="grid gap-2 rounded-lg border border-green-100 bg-green-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={handleUseCurrentLocation} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-bold text-white">
            Use my current location
          </button>
          <span className="text-xs text-slate-600">Optional but useful for verification.</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={farmerForm.gpsLat} readOnly placeholder="Latitude" className="min-h-11 rounded-lg border border-green-200 bg-white px-3" />
          <input value={farmerForm.gpsLng} readOnly placeholder="Longitude" className="min-h-11 rounded-lg border border-green-200 bg-white px-3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="grid gap-1 text-sm font-semibold text-green-950">
          Farm size <span className="text-red-500">*</span>
          <input
            type="number"
            min="0"
            step="0.1"
            value={farmerForm.farmSizeValue}
            onChange={(e) => setFarmerField("farmSizeValue", e.target.value)}
            className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-green-950">
          Unit <span className="text-red-500">*</span>
          <select
            value={farmerForm.farmSizeUnit}
            onChange={(e) => setFarmerField("farmSizeUnit", e.target.value as FarmerForm["farmSizeUnit"])}
            className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
          >
            <option value="">Select unit</option>
            <option value="hectares">Hectares</option>
            <option value="acres">Acres</option>
            <option value="plots">Plots</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Land ownership <span className="text-red-500">*</span>
        <div className="grid gap-2">
          {[
            { value: "owned", label: "Owned" },
            { value: "family", label: "Family" },
            { value: "rented", label: "Rented" },
            { value: "sharecropper", label: "Sharecropper" },
          ].map((option) => (
            <label key={option.value} className="flex min-h-12 items-center gap-2 rounded-lg border border-green-200 bg-white px-3">
              <input
                type="radio"
                name="landOwnership"
                checked={farmerForm.landOwnership === option.value}
                onChange={() => setFarmerField("landOwnership", option.value as FarmerForm["landOwnership"])}
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </label>

      <div className="grid gap-2 text-sm font-semibold text-green-950">
        <span>
          Primary crops grown <span className="text-red-500">*</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CROPS.map((crop) => (
            <button
              key={crop}
              type="button"
              onClick={() => handleCropToggle(crop)}
              className={`rounded-full border px-3 py-2 text-xs font-bold ${
                farmerForm.crops.includes(crop)
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-green-200 bg-white text-green-900"
              }`}
            >
              {crop}
            </button>
          ))}
        </div>
      </div>

      {farmerForm.crops.includes("other") ? (
        <label className="grid gap-1 text-sm font-semibold text-green-950">
          Other crop <span className="text-red-500">*</span>
          <input
            type="text"
            value={farmerForm.otherCrop}
            onChange={(e) => setFarmerField("otherCrop", e.target.value)}
            className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
        </label>
      ) : null}
    </div>
  );

  const renderOperationsStep = (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Years of farming experience <span className="text-red-500">*</span>
        <input
          type="number"
          min="0"
          max="50"
          value={farmerForm.yearsExperience}
          onChange={(e) => setFarmerField("yearsExperience", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Main water source <span className="text-red-500">*</span>
        <select
          value={farmerForm.waterSource}
          onChange={(e) => setFarmerField("waterSource", e.target.value as FarmerForm["waterSource"])}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
        >
          <option value="">Select water source</option>
          <option value="rain-fed">Rain-fed</option>
          <option value="borehole">Borehole</option>
          <option value="river">River</option>
          <option value="well">Well</option>
          <option value="drip">Drip irrigation</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Do you use fertilizer? <span className="text-red-500">*</span>
        <div className="grid grid-cols-2 gap-2">
          {(["yes", "no"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFarmerField("useFertilizer", value)}
              className={`min-h-12 rounded-lg border text-sm font-bold ${
                farmerForm.useFertilizer === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </label>

      {farmerForm.useFertilizer === "yes" ? (
        <label className="grid gap-1 text-sm font-semibold text-green-950">
          Fertilizer type <span className="text-red-500">*</span>
          <select
            value={farmerForm.fertilizerType}
            onChange={(e) => setFarmerField("fertilizerType", e.target.value as FarmerForm["fertilizerType"])}
            className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
          >
            <option value="">Select type</option>
            <option value="organic">Organic</option>
            <option value="inorganic">Inorganic</option>
            <option value="both">Both</option>
          </select>
        </label>
      ) : null}

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Do you use pesticides/herbicides? <span className="text-red-500">*</span>
        <div className="grid grid-cols-2 gap-2">
          {(["yes", "no"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFarmerField("usePesticides", value)}
              className={`min-h-12 rounded-lg border text-sm font-bold ${
                farmerForm.usePesticides === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </label>

      <div className="grid gap-2 text-sm font-semibold text-green-950">
        <span>Assets owned</span>
        <div className="flex flex-wrap gap-2">
          {ASSETS.map((asset) => (
            <button
              key={asset}
              type="button"
              onClick={() => handleAssetToggle(asset)}
              className={`rounded-full border px-3 py-2 text-xs font-bold ${
                farmerForm.assets.includes(asset)
                  ? "border-green-700 bg-green-700 text-white"
                  : "border-green-200 bg-white text-green-900"
              }`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Access to mobile phone? <span className="text-red-500">*</span>
        <select
          value={farmerForm.mobileAccess}
          onChange={(e) => setFarmerField("mobileAccess", e.target.value as FarmerForm["mobileAccess"])}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
        >
          <option value="">Select one</option>
          <option value="smartphone">Smartphone</option>
          <option value="feature-phone">Feature phone</option>
          <option value="none">None</option>
        </select>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Access to internet? <span className="text-red-500">*</span>
        <select
          value={farmerForm.internetAccess}
          onChange={(e) => setFarmerField("internetAccess", e.target.value as FarmerForm["internetAccess"])}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
        >
          <option value="">Select one</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="rarely">Rarely</option>
          <option value="no">No</option>
        </select>
      </label>
    </div>
  );

  const renderFinancialStep = (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Do you have a bank account? <span className="text-red-500">*</span>
        <div className="grid grid-cols-2 gap-2">
          {(["yes", "no"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFarmerField("hasBankAccount", value)}
              className={`min-h-12 rounded-lg border text-sm font-bold ${
                farmerForm.hasBankAccount === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </label>

      {farmerForm.hasBankAccount === "yes" ? (
        <>
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Bank name <span className="text-red-500">*</span>
            <select
              value={farmerForm.bankName}
              onChange={(e) => setFarmerField("bankName", e.target.value)}
              className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
            >
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Account number <span className="text-red-500">*</span>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={farmerForm.accountNumber}
                onChange={(e) => setFarmerField("accountNumber", e.target.value.replace(/\D/g, ""))}
                className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
              />
              <button type="button" onClick={resolveBankAccount} disabled={resolvingAccount} className="min-h-12 rounded-lg border border-green-300 px-3 text-xs font-bold text-green-800 disabled:opacity-60">
                {resolvingAccount ? "Checking..." : "Check"}
              </button>
            </div>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            Account name <span className="text-red-500">*</span>
            <input
              type="text"
              value={farmerForm.accountName}
              onChange={(e) => setFarmerField("accountName", e.target.value)}
              placeholder="Auto-fetch or type manually"
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            BVN (optional)
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={11}
                value={farmerForm.bvn}
                onChange={(e) => setFarmerField("bvn", e.target.value.replace(/\D/g, ""))}
                className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
              />
              <button type="button" onClick={verifyBvn} disabled={!farmerForm.bvn || verifyingBvn} className="min-h-12 rounded-lg border border-green-300 px-3 text-xs font-bold text-green-800 disabled:opacity-60">
                {verifyingBvn ? "Verifying..." : "Verify"}
              </button>
            </div>
          </label>
        </>
      ) : null}

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Preferred payment method <span className="text-red-500">*</span>
        <select
          value={farmerForm.paymentMethod}
          onChange={(e) => setFarmerField("paymentMethod", e.target.value as FarmerForm["paymentMethod"])}
          className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
        >
          <option value="">Select method</option>
          <option value="bank-transfer">Bank transfer</option>
          <option value="wallet">Wallet</option>
          <option value="mobile-money">Mobile money</option>
        </select>
      </label>
    </div>
  );

  const renderConsentStep = (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Membership tier <span className="text-red-500">*</span>
        <div className="grid gap-2">
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-green-200 bg-white px-3">
            <input
              type="radio"
              checked={farmerForm.membershipTier === "basic"}
              onChange={() => setFarmerField("membershipTier", "basic")}
            />
            <span>Basic (free)</span>
          </label>
          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-green-200 bg-white px-3">
            <input
              type="radio"
              checked={farmerForm.membershipTier === "premium"}
              onChange={() => setFarmerField("membershipTier", "premium")}
            />
            <span>Premium (small fee for credit access)</span>
          </label>
        </div>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Emergency contact name <span className="text-red-500">*</span>
        <input
          type="text"
          value={farmerForm.emergencyContactName}
          onChange={(e) => setFarmerField("emergencyContactName", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Emergency contact phone <span className="text-red-500">*</span>
        <input
          type="tel"
          value={farmerForm.emergencyContactPhone}
          onChange={(e) => setFarmerField("emergencyContactPhone", e.target.value)}
          className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
        />
      </label>

      <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
        <input
          type="checkbox"
          checked={farmerForm.consentDataSharing}
          onChange={(e) => setFarmerField("consentDataSharing", e.target.checked)}
        />
        I agree that Dos Agrolink can verify my information and share it with buyers for transactions.
      </label>

      <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
        <input
          type="checkbox"
          checked={farmerForm.consentCreditCheck}
          onChange={(e) => setFarmerField("consentCreditCheck", e.target.checked)}
        />
        I agree to a soft credit check using my farm and ID data.
      </label>

      <label className="flex min-h-12 items-center gap-3 rounded-lg border border-green-200 bg-white px-3 text-sm text-green-950">
        <input
          type="checkbox"
          checked={farmerForm.consentSmsVoice}
          onChange={(e) => setFarmerField("consentSmsVoice", e.target.checked)}
        />
        I want to receive farming tips, weather alerts, and offers via SMS or voice call.
      </label>

      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Signature <span className="text-red-500">*</span>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            value={farmerForm.signature}
            onChange={(e) => setFarmerField("signature", e.target.value)}
            placeholder="Type your full name as signature"
            className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
          <button
            type="button"
            onClick={() => setFarmerField("signature", accountForm.name.trim())}
            className="min-h-12 rounded-lg border border-green-300 px-3 text-xs font-bold text-green-800"
          >
            Tap to sign
          </button>
        </div>
      </label>
    </div>
  );

  const renderReferralStep = (
    <div className="grid gap-3">
      <label className="grid gap-1 text-sm font-semibold text-green-950">
        Were you referred by an existing Dos Agrolink farmer? <span className="text-red-500">*</span>
        <div className="grid grid-cols-2 gap-2">
          {(["yes", "no"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFarmerField("wasReferred", value)}
              className={`min-h-12 rounded-lg border text-sm font-bold ${
                farmerForm.wasReferred === value ? "border-green-700 bg-green-700 text-white" : "border-green-200 bg-white text-green-900"
              }`}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </label>

      {farmerForm.wasReferred === "yes" ? (
        <label className="grid gap-1 text-sm font-semibold text-green-950">
          Referrer phone number or code <span className="text-red-500">*</span>
          <input
            type="text"
            value={farmerForm.referrer}
            onChange={(e) => setFarmerField("referrer", e.target.value)}
            className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
          />
        </label>
      ) : null}

      <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-xs text-green-900">
        <p className="m-0 font-semibold">USSD fallback</p>
        <p className="m-0 mt-1">Dial *347*1# to complete basic registration on feature phones.</p>
      </div>
    </div>
  );

  const renderCurrentFarmerStep = () => {
    if (currentFarmerStep === 1) return renderPersonalStep;
    if (currentFarmerStep === 2) return renderLocationStep;
    if (currentFarmerStep === 3) return renderOperationsStep;
    if (currentFarmerStep === 4) return renderFinancialStep;
    if (currentFarmerStep === 5) return renderConsentStep;
    return renderReferralStep;
  };

  return (
    <AuthShell
      eyebrow="Create Account"
      title={copy.createAccount}
      subtitle="Join DOS AGROLINK NIGERIA to buy or sell verified agricultural produce across trusted local supply chains."
      vision="To build Nigeria's most trusted farm-to-market network where every harvest finds a verified buyer at fair value."
      mission="We connect farmers, buyers, and logistics through secure digital onboarding, transparent pricing, and reliable fulfillment from village to city."
      impactPoints={[
        "Empower smallholder farmers with direct market access and digital identity.",
        "Help buyers source traceable produce with consistent quality and delivery.",
        "Strengthen local food systems through trusted payments and logistics coordination.",
      ]}
      bullets={[
        "Buyer and farmer account types",
        "Guided onboarding with verification steps",
        "Auto-save with offline queue for weak networks",
      ]}
      imageA={{ src: "/agropro/images/about_img.jpg", alt: "Farmer inspecting fresh crops" }}
      imageB={{ src: "/agropro/images/chose.jpg", alt: "Harvested produce in curated baskets" }}
    >
      <section className="card rounded-2xl p-5 sm:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Create Account</p>
          <h2 className="m-0 mt-2 text-2xl font-bold text-green-950">Get started on Agrolink</h2>
          <p className="mb-0 mt-1 text-sm text-slate-600">Large buttons, fewer typing steps, and draft save for unstable networks.</p>
        </div>

        {renderLanguageToggle}

        {error ? (
          <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        ) : null}

        {success ? (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
        ) : null}

        {voiceError ? (
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{voiceError}</div>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          className="grid gap-3"
        >
          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.fullName} <span className="text-red-500">*</span>
            <div className="flex gap-2">
              <input
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={accountForm.name}
                onChange={handleAccountChange}
                required
                className="min-h-12 flex-1 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
              />
              <button type="button" onClick={handleAccountNameVoiceInput} className="min-h-12 rounded-lg border border-green-300 px-3 text-sm font-semibold text-green-700">
                Mic
              </button>
            </div>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.email} <span className="text-red-500">*</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={accountForm.email}
              onChange={handleAccountChange}
              required
              className="min-h-12 rounded-lg border border-green-200 px-3 outline-none ring-green-200 focus:ring"
            />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.password} <span className="text-red-500">*</span>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={accountForm.password}
                onChange={handleAccountChange}
                required
                minLength={6}
                className="min-h-12 w-full rounded-lg border border-green-200 px-3 pr-20 outline-none ring-green-200 focus:ring"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-green-800 hover:bg-green-100"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <PasswordEyeIcon visible={showPassword} />
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            {passwordStrength.label ? (
              <div className="grid gap-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-green-100">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score <= 1
                        ? "bg-red-500"
                        : passwordStrength.score <= 2
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                    } ${
                      passwordStrength.score <= 0
                        ? "w-0"
                        : passwordStrength.score === 1
                          ? "w-1/4"
                          : passwordStrength.score === 2
                            ? "w-2/4"
                            : passwordStrength.score === 3
                              ? "w-3/4"
                              : "w-full"
                    }`}
                  />
                </div>
                <p className={`m-0 text-xs font-semibold ${passwordStrength.toneClass}`}>{passwordStrength.label}</p>
              </div>
            ) : null}
          </label>

          <label className="grid gap-1 text-sm font-semibold text-green-950">
            {copy.buyer} / {copy.farmer} <span className="text-red-500">*</span>
            <select
              name="role"
              value={accountForm.role}
              onChange={handleAccountChange}
              className="min-h-12 rounded-lg border border-green-200 bg-white px-3 outline-none ring-green-200 focus:ring"
            >
              <option value="buyer">{copy.buyer} - browse and purchase produce</option>
              <option value="farmer">{copy.farmer} - complete onboarding and sell produce</option>
            </select>
          </label>

          {accountForm.role === "buyer" ? (
            <BuyerOnboardingPanel
              accountForm={{
                name: accountForm.name,
                email: accountForm.email,
                password: accountForm.password,
              }}
              language={language}
            />
          ) : (
            <>
              {renderFarmerProgress}
              <div className="card rounded-xl border border-green-100 p-4">{renderCurrentFarmerStep()}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentFarmerStep((prev) => Math.max(1, prev - 1))}
                  disabled={currentFarmerStep === 1 || loading}
                  className="min-h-12 flex-1 rounded-lg border border-green-300 bg-white px-4 text-sm font-bold text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Back
                </button>

                {currentFarmerStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleFarmerNext}
                    disabled={loading || uploadingMedia}
                    className="min-h-12 flex-1 rounded-lg bg-green-700 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={submitFarmerRegistration}
                    disabled={loading || uploadingMedia}
                    className="min-h-12 flex-1 rounded-lg bg-green-700 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Submitting..." : "Join Dos Agrolink"}
                  </button>
                )}
              </div>
            </>
          )}
        </form>

        <p className="mb-0 mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-green-700 no-underline hover:text-green-800">
            {copy.login}
          </Link>
        </p>
      </section>
    </AuthShell>
  );
}
