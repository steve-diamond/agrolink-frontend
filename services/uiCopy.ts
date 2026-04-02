import type { UiLanguage } from "./uiLanguage";

type CopyPack = {
  appName: string;
  tagline: string;
  welcome: string;
  login: string;
  register: string;
  email: string;
  password: string;
  fullName: string;
  buyer: string;
  farmer: string;
  createAccount: string;
  weatherAlert: string;
  maizePrice: string;
  callAgent: string;
  listenNow: string;
  syncOffline: string;
  marketHub: string;
  inputShop: string;
  myFarm: string;
  finance: string;
  marketplaceHeading: string;
  marketplaceSubheading: string;
  loading: string;
  loadingProducts: string;
  loadingOrders: string;
  myProducts: string;
  myOrders: string;
  uploadNewProduct: string;
  buyNow: string;
  creatingOrder: string;
  browseMarketplace: string;
  noOrdersYet: string;
  noProductsYet: string;
  uploadFirstProduct: string;
  approved: string;
  pending: string;
  available: string;
  quantity: string;
  noImage: string;
  networkLowData: string;
  pendingOfflineUploads: string;
  syncedOfflineUploads: string;
  offlineSaved: string;
  syncStatus: string;
  offline: string;
  online: string;
  queued: string;
};

const ENGLISH: CopyPack = {
  appName: "Dos AgroLink Nigeria",
  tagline: "Digital platform for Nigerian smallholder farmers",
  welcome: "Welcome",
  login: "Login",
  register: "Register",
  email: "Email",
  password: "Password",
  fullName: "Full Name",
  buyer: "Buyer",
  farmer: "Farmer",
  createAccount: "Create Account",
  weatherAlert: "Weather Alert",
  maizePrice: "Maize Price",
  callAgent: "Call Agent",
  listenNow: "Listen",
  syncOffline: "Sync Offline",
  marketHub: "Market Hub",
  inputShop: "Input Shop",
  myFarm: "My Farm",
  finance: "Financial Services",
  marketplaceHeading: "Marketplace",
  marketplaceSubheading: "Fresh farm produce from approved farmers across AgroLink.",
  loading: "Loading...",
  loadingProducts: "Loading approved products...",
  loadingOrders: "Loading your orders...",
  myProducts: "My Products",
  myOrders: "My Orders",
  uploadNewProduct: "Upload New Product",
  buyNow: "Buy Now",
  creatingOrder: "Creating Order...",
  browseMarketplace: "Browse marketplace",
  noOrdersYet: "No orders yet.",
  noProductsYet: "You have not listed any products yet.",
  uploadFirstProduct: "Upload first product",
  approved: "Approved",
  pending: "Pending",
  available: "Available",
  quantity: "Quantity",
  noImage: "No image available",
  networkLowData: "Network: Low Data Mode On",
  pendingOfflineUploads: "Pending offline uploads",
  syncedOfflineUploads: "Synced offline uploads",
  offlineSaved: "No network: upload saved offline and will sync automatically.",
  syncStatus: "Sync",
  offline: "Offline",
  online: "Online",
  queued: "Queued",
};

const HAUSA: CopyPack = {
  ...ENGLISH,
  login: "Shiga",
  register: "Yi Rajista",
  email: "Imel",
  password: "Kalmar Sirri",
  fullName: "Cikakken Suna",
  createAccount: "Kirkiro Asusu",
  weatherAlert: "Sanarwar Yanayi",
  callAgent: "Kira Wakili",
  listenNow: "Saurara",
  syncOffline: "Daidaita Offline",
  welcome: "Barka da zuwa",
  loading: "Ana lodawa...",
  loadingProducts: "Ana lodin kayayyaki...",
  loadingOrders: "Ana lodin ododi...",
  myProducts: "Kayayyaki na",
  myOrders: "Ododi na",
  uploadNewProduct: "Saka Sabon Kaya",
  buyNow: "Sayi Yanzu",
  creatingOrder: "Ana kirkirar Oda...",
  browseMarketplace: "Duba Kasuwa",
  noOrdersYet: "Babu oda tukuna.",
  noProductsYet: "Ba ka saka kaya ba tukuna.",
  uploadFirstProduct: "Saka kaya na farko",
  approved: "An Amince",
  pending: "Ana Jira",
  available: "Akwai",
  quantity: "Yawa",
  noImage: "Babu hoto",
  networkLowData: "Hadin yanar gizo: Yanayin karamin data",
  pendingOfflineUploads: "Ayyukan offline masu jira",
  syncedOfflineUploads: "An daidaita ayyukan offline",
  offlineSaved: "Babu yanar gizo: an ajiye uplod dinsa offline.",
  syncStatus: "Daidaitawa",
  offline: "Offline",
  online: "Online",
  queued: "A Jira",
};

const YORUBA: CopyPack = {
  ...ENGLISH,
  login: "Wole",
  register: "Forukosile",
  email: "Imeeli",
  password: "Oroigbaniwọle",
  fullName: "Oruko Kikun",
  createAccount: "Da Akanti",
  weatherAlert: "Ikilo Oju Ojo",
  callAgent: "Pe Asoju",
  listenNow: "Gbo",
  syncOffline: "Muṣiṣẹ Offline",
  welcome: "Kaabo",
  loading: "N gbe...",
  loadingProducts: "N gbe awon ọja...",
  loadingOrders: "N gbe awon aṣẹ...",
  myProducts: "Awon ọja mi",
  myOrders: "Awon aṣẹ mi",
  uploadNewProduct: "Fi Ọja Titun Sile",
  buyNow: "Ra Bayi",
  creatingOrder: "N da aṣẹ sile...",
  browseMarketplace: "Wo Oja",
  noOrdersYet: "Ko si aṣẹ sibẹsibẹ.",
  noProductsYet: "O ko ti fi ọja kan sile.",
  uploadFirstProduct: "Fi ọja akọkọ sile",
  approved: "Ti Fọwọsi",
  pending: "N duro",
  available: "Wa",
  quantity: "Iye",
  noImage: "Ko si aworan",
  networkLowData: "Nẹtiwọki: Ipo data kekere",
  pendingOfflineUploads: "Awọn upload offline to nduro",
  syncedOfflineUploads: "A ti mu upload offline ṣiṣẹ",
  offlineSaved: "Ko si nẹtiwọki: a ti fipamọ upload naa offline.",
  syncStatus: "Amuṣiṣẹ",
  offline: "Offline",
  online: "Online",
  queued: "Nduro",
};

const IGBO: CopyPack = {
  ...ENGLISH,
  login: "Banye",
  register: "Debanye",
  email: "Email",
  password: "Okwuntughe",
  fullName: "Aha Ozu",
  createAccount: "Mepụta Akaụntụ",
  weatherAlert: "Ịdọ Aka Na Ntị Ihuigwe",
  callAgent: "Kpọọ Onye Nnọchi",
  listenNow: "Gee Ntị",
  syncOffline: "Mekọrịta Offline",
  welcome: "Nnọọ",
  loading: "Na-ebudata...",
  loadingProducts: "Na-ebudata ngwaahịa...",
  loadingOrders: "Na-ebudata oda...",
  myProducts: "Ngwaahịa m",
  myOrders: "Oda m",
  uploadNewProduct: "Tinye Ngwaahịa Ohuru",
  buyNow: "Zuta Ugbu a",
  creatingOrder: "Na-eme Oda...",
  browseMarketplace: "Lelee Ahia",
  noOrdersYet: "Enwebeghi oda.",
  noProductsYet: "I tinyebeghi ngwaahịa.",
  uploadFirstProduct: "Tinye ngwaahịa mbu",
  approved: "Akwadoro",
  pending: "Na-eche",
  available: "Di",
  quantity: "Ọnụọgụ",
  noImage: "Enweghi onyonyo",
  networkLowData: "Netwọk: Obere Data",
  pendingOfflineUploads: "Upload offline na-eche",
  syncedOfflineUploads: "E mekọrịtala upload offline",
  offlineSaved: "Enweghi netwọk: echekwara upload offline.",
  syncStatus: "Mmekọrịta",
  offline: "Offline",
  online: "Online",
  queued: "Na-eche",
};

const PIDGIN: CopyPack = {
  ...ENGLISH,
  login: "Log in",
  register: "Register",
  email: "Email",
  password: "Password",
  fullName: "Full Name",
  createAccount: "Create Account",
  weatherAlert: "Weather Alert",
  callAgent: "Call Agent",
  listenNow: "Listen",
  syncOffline: "Sync Offline",
  welcome: "Welcome",
  loading: "Loading...",
  loadingProducts: "Loading products...",
  loadingOrders: "Loading orders...",
  myProducts: "My Products",
  myOrders: "My Orders",
  uploadNewProduct: "Upload New Product",
  buyNow: "Buy Now",
  creatingOrder: "Creating Order...",
  browseMarketplace: "Browse marketplace",
  noOrdersYet: "No orders yet.",
  noProductsYet: "You never list product yet.",
  uploadFirstProduct: "Upload first product",
  approved: "Approved",
  pending: "Pending",
  available: "Available",
  quantity: "Quantity",
  noImage: "No image",
  networkLowData: "Network: Low Data Mode On",
  pendingOfflineUploads: "Pending offline uploads",
  syncedOfflineUploads: "Synced offline uploads",
  offlineSaved: "No network: upload don save offline, e go sync later.",
  syncStatus: "Sync",
  offline: "Offline",
  online: "Online",
  queued: "Queued",
};

const COPY: Record<UiLanguage, CopyPack> = {
  en: ENGLISH,
  ha: HAUSA,
  yo: YORUBA,
  ig: IGBO,
  pcm: PIDGIN,
};

export function getCopy(language: UiLanguage): CopyPack {
  return COPY[language] || ENGLISH;
}
