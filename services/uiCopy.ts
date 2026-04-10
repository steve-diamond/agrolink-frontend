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
  marketplaceHeroTag: string;
  marketplaceHeroTitle: string;
  marketplaceHeroDescription: string;
  marketplaceTrustRating: string;
  marketplaceTrustVerified: string;
  marketplaceTrustPayment: string;
  marketplaceSearchTitle: string;
  marketplaceSearchDescription: string;
  marketplaceSearchPlaceholder: string;
  marketplaceCategoryFilterLabel: string;
  marketplaceCategoryAll: string;
  marketplaceCategorySeeds: string;
  marketplaceCategoryFertilizers: string;
  marketplaceCategoryEquipment: string;
  marketplaceCategoryLivestock: string;
  marketplaceCategoryGeneral: string;
  marketplaceMinPricePlaceholder: string;
  marketplaceMaxPricePlaceholder: string;
  marketplacePromotionsTitle: string;
  marketplacePromotionsSubtitle: string;
  marketplacePromoSeedTitle: string;
  marketplacePromoSeedDetail: string;
  marketplacePromoSeedCta: string;
  marketplacePromoLogisticsTitle: string;
  marketplacePromoLogisticsDetail: string;
  marketplacePromoLogisticsCta: string;
  marketplacePromoWarehouseTitle: string;
  marketplacePromoWarehouseDetail: string;
  marketplacePromoWarehouseCta: string;
  marketplaceNoApprovedProducts: string;
  marketplaceTrendingTitle: string;
  marketplaceProductsFoundSuffix: string;
  marketplaceVerifiedSeller: string;
  marketplaceReviewsSuffix: string;
  marketplaceWhatsappLiveChat: string;
  marketplaceCheckoutTitle: string;
  marketplaceCheckoutDescription: string;
  marketplaceStepLabelOne: string;
  marketplaceStepLabelTwo: string;
  marketplaceStepLabelThree: string;
  marketplaceStepOneTitle: string;
  marketplaceStepOneDescription: string;
  marketplaceStepTwoTitle: string;
  marketplaceStepTwoDescription: string;
  marketplaceStepThreeTitle: string;
  marketplaceStepThreeDescription: string;
};

const ENGLISH: CopyPack = {
  appName: "DOS AGROLINK NIGERIA",
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
  marketplaceSubheading: "Fresh farm produce from approved farmers across DOS AGROLINK NIGERIA.",
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
  marketplaceHeroTag: "Agrolink Marketplace",
  marketplaceHeroTitle: "Trending Agricultural Products From Verified Sellers",
  marketplaceHeroDescription:
    "Design a responsive, mobile-first marketplace homepage for Agrolink that showcases top categories, trust signals, featured promotions, and fast buying.",
  marketplaceTrustRating: "4.8/5 Avg Seller Ratings",
  marketplaceTrustVerified: "Verified Badges on Trusted Stores",
  marketplaceTrustPayment: "GlobalPay Secure Payments",
  marketplaceSearchTitle: "Search and Filter Marketplace",
  marketplaceSearchDescription: "Find products by name, location, category, or price range.",
  marketplaceSearchPlaceholder: "Search products or location",
  marketplaceCategoryFilterLabel: "Filter by category",
  marketplaceCategoryAll: "All",
  marketplaceCategorySeeds: "Seeds",
  marketplaceCategoryFertilizers: "Fertilizers",
  marketplaceCategoryEquipment: "Equipment",
  marketplaceCategoryLivestock: "Livestock",
  marketplaceCategoryGeneral: "General",
  marketplaceMinPricePlaceholder: "Min price",
  marketplaceMaxPricePlaceholder: "Max price",
  marketplacePromotionsTitle: "Featured Promotions",
  marketplacePromotionsSubtitle: "Competitive with leading marketplaces",
  marketplacePromoSeedTitle: "Seed Starter Week",
  marketplacePromoSeedDetail: "Save up to 15% on certified maize, rice, and vegetable seed packs.",
  marketplacePromoSeedCta: "Shop Seeds",
  marketplacePromoLogisticsTitle: "Logistics Boost",
  marketplacePromoLogisticsDetail: "Get reduced transport fees for bulk orders from verified sellers.",
  marketplacePromoLogisticsCta: "See Logistics",
  marketplacePromoWarehouseTitle: "Warehouse Protection",
  marketplacePromoWarehouseDetail: "Secure storage offers for post-harvest produce and livestock feed.",
  marketplacePromoWarehouseCta: "Book Storage",
  marketplaceNoApprovedProducts: "No approved products available yet.",
  marketplaceTrendingTitle: "Trending Products",
  marketplaceProductsFoundSuffix: "products found",
  marketplaceVerifiedSeller: "Verified Seller",
  marketplaceReviewsSuffix: "reviews",
  marketplaceWhatsappLiveChat: "WhatsApp Live Chat",
  marketplaceCheckoutTitle: "Simplified Checkout in 3 Steps",
  marketplaceCheckoutDescription: "Built for fast mobile conversions with secure global payment support.",
  marketplaceStepLabelOne: "Step 1",
  marketplaceStepLabelTwo: "Step 2",
  marketplaceStepLabelThree: "Step 3",
  marketplaceStepOneTitle: "Select Product",
  marketplaceStepOneDescription: "Search, filter by category, and choose quantity from verified sellers.",
  marketplaceStepTwoTitle: "Confirm Order",
  marketplaceStepTwoDescription: "Review pricing, trust signals, and delivery options before checkout.",
  marketplaceStepThreeTitle: "Pay with GlobalPay",
  marketplaceStepThreeDescription: "Complete payment securely and get instant order confirmation.",
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
  marketplaceHeroTag: "Kasuwa ta Agrolink",
  marketplaceHeroTitle: "Kayayyakin Noma Masu Tashe Daga Tabbatattun Masu Sayarwa",
  marketplaceHeroDescription:
    "Shirya shafin kasuwa mai amsa girman allo, musamman ga wayar hannu, mai nuna rukunai, amincewa, rangwame, da saurin saye.",
  marketplaceTrustRating: "Matsakaicin Daraja 4.8/5",
  marketplaceTrustVerified: "Alamar Tabbaci ga Amintattun Shaguna",
  marketplaceTrustPayment: "Biyan Kudi Mai Tsaro da GlobalPay",
  marketplaceSearchTitle: "Bincike da Tace Kasuwa",
  marketplaceSearchDescription: "Nemo kaya ta suna, wuri, rukuni, ko farashi.",
  marketplaceSearchPlaceholder: "Nemo kaya ko wuri",
  marketplaceCategoryFilterLabel: "Tace ta rukuni",
  marketplaceCategoryAll: "Duka",
  marketplaceCategorySeeds: "Iri",
  marketplaceCategoryFertilizers: "Taki",
  marketplaceCategoryEquipment: "Kayan Aiki",
  marketplaceCategoryLivestock: "Dabbobi",
  marketplaceCategoryGeneral: "Na Gaba Daya",
  marketplaceMinPricePlaceholder: "Mafi karancin farashi",
  marketplaceMaxPricePlaceholder: "Mafi girman farashi",
  marketplacePromotionsTitle: "Rangwame na Musamman",
  marketplacePromotionsSubtitle: "Mai gogayya da manyan kasuwanni",
  marketplacePromoSeedTitle: "Makon Fara Iri",
  marketplacePromoSeedDetail: "Ragi har zuwa 15% kan iri masu inganci na masara, shinkafa da kayan lambu.",
  marketplacePromoSeedCta: "Sayi Iri",
  marketplacePromoLogisticsTitle: "Saukin Jigila",
  marketplacePromoLogisticsDetail: "Rage kudin jigila ga manyan oda daga tabbattun masu sayarwa.",
  marketplacePromoLogisticsCta: "Duba Jigila",
  marketplacePromoWarehouseTitle: "Kariyar Ma'ajiya",
  marketplacePromoWarehouseDetail: "Samun tayin adana amfanin gona bayan girbi da abincin dabbobi.",
  marketplacePromoWarehouseCta: "Yi Ajiyar Ma'ajiya",
  marketplaceNoApprovedProducts: "Babu kayayyakin da aka amince da su yanzu.",
  marketplaceTrendingTitle: "Kayayyakin da Suka fi Tashe",
  marketplaceProductsFoundSuffix: "an samu kaya",
  marketplaceVerifiedSeller: "Tabbataccen Mai Siyarwa",
  marketplaceReviewsSuffix: "sharhi",
  marketplaceWhatsappLiveChat: "Tattaunawa Kai Tsaye ta WhatsApp",
  marketplaceCheckoutTitle: "Saukakken Biyan Oda a Matakai 3",
  marketplaceCheckoutDescription: "An gina shi don saurin saya a wayar hannu tare da tsaron biyan kudi na duniya.",
  marketplaceStepLabelOne: "Mataki na 1",
  marketplaceStepLabelTwo: "Mataki na 2",
  marketplaceStepLabelThree: "Mataki na 3",
  marketplaceStepOneTitle: "Zabi Kaya",
  marketplaceStepOneDescription: "Nemo, tace ta rukuni, sannan ka zabi adadi daga tabbattun masu sayarwa.",
  marketplaceStepTwoTitle: "Tabbatar da Oda",
  marketplaceStepTwoDescription: "Duba farashi, alamun amincewa, da zabin isarwa kafin biya.",
  marketplaceStepThreeTitle: "Biya da GlobalPay",
  marketplaceStepThreeDescription: "Kammala biyan kudi cikin tsaro kuma ka samu tabbacin oda nan take.",
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
  marketplaceHeroTag: "Oja Agrolink",
  marketplaceHeroTitle: "Awon ọja Ogbin To N Gbe Lati Odo Awon Olutaja To Je Eri",
  marketplaceHeroDescription:
    "Se oju-ile oja to dahun daadaa lori foonu, to fi awon eya ọja, ami igbẹkẹle, ipolowo ati rira yara han.",
  marketplaceTrustRating: "Iwọn didun olutaja 4.8/5",
  marketplaceTrustVerified: "Ami Ijẹrisi lori awon ile itaja to ni igbẹkẹle",
  marketplaceTrustPayment: "Isanwo Aabo GlobalPay",
  marketplaceSearchTitle: "Wa ki o si Se Asayan",
  marketplaceSearchDescription: "Wa ọja nipa oruko, ibi, eya, tabi ibiti owo de.",
  marketplaceSearchPlaceholder: "Wa ọja tabi ibi",
  marketplaceCategoryFilterLabel: "Se asayan eya",
  marketplaceCategoryAll: "Gbogbo",
  marketplaceCategorySeeds: "Irugbin",
  marketplaceCategoryFertilizers: "Ajile",
  marketplaceCategoryEquipment: "Ohun elo",
  marketplaceCategoryLivestock: "Eranko",
  marketplaceCategoryGeneral: "Gbogbogbo",
  marketplaceMinPricePlaceholder: "Owo kere julo",
  marketplaceMaxPricePlaceholder: "Owo to po julo",
  marketplacePromotionsTitle: "Ipolowo Pataki",
  marketplacePromotionsSubtitle: "Le dije pelu awon oja nla",
  marketplacePromoSeedTitle: "Ose Ibẹrẹ Irugbin",
  marketplacePromoSeedDetail: "Fipamọ to 15% lori irugbin agbado, iresi ati ẹfọ to je eri.",
  marketplacePromoSeedCta: "Ra Irugbin",
  marketplacePromoLogisticsTitle: "Iranlowo Gbigbe",
  marketplacePromoLogisticsDetail: "Din owo gbigbe ku fun awon aṣẹ poju lati odo awon olutaja to je eri.",
  marketplacePromoLogisticsCta: "Wo Gbigbe",
  marketplacePromoWarehouseTitle: "Aabo Ile-ipamo",
  marketplacePromoWarehouseDetail: "Gba awon ipese ipamo fun ọja leyin ikore ati ounje eranko.",
  marketplacePromoWarehouseCta: "Pa Ile-ipamo",
  marketplaceNoApprovedProducts: "Ko si ọja ti a fọwọsi ni bayi.",
  marketplaceTrendingTitle: "Awon ọja To N Gbe",
  marketplaceProductsFoundSuffix: "awon ọja ni a ri",
  marketplaceVerifiedSeller: "Olutaja To Je Eri",
  marketplaceReviewsSuffix: "atunyewo",
  marketplaceWhatsappLiveChat: "Iwiregbe Live WhatsApp",
  marketplaceCheckoutTitle: "Sisanwo Rorun ni Igbesẹ Mẹta",
  marketplaceCheckoutDescription: "A ko o fun iyipada rira lori foonu pelu aabo isanwo agbaye.",
  marketplaceStepLabelOne: "Igbesẹ 1",
  marketplaceStepLabelTwo: "Igbesẹ 2",
  marketplaceStepLabelThree: "Igbesẹ 3",
  marketplaceStepOneTitle: "Yan ọja",
  marketplaceStepOneDescription: "Wa, se asayan eya, ki o yan iye lati odo awon olutaja to je eri.",
  marketplaceStepTwoTitle: "Jẹrisi Aṣẹ",
  marketplaceStepTwoDescription: "Tun owo, ami igbẹkẹle ati aṣayan ifijiṣẹ wo ki o to sanwo.",
  marketplaceStepThreeTitle: "Sanwo pelu GlobalPay",
  marketplaceStepThreeDescription: "Pari isanwo lailewu ki o gba ijẹrisi aṣẹ lẹsẹkẹsẹ.",
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
  marketplaceHeroTag: "Ahia Agrolink",
  marketplaceHeroTitle: "Ngwaahịa Ugbo Na-Eme Nke Oma Site N'aka Ndi Na-ere Ekwenyere",
  marketplaceHeroDescription:
    "Mepụta ibe ahia na-anabata ekwentị nke ọma, na-egosi ngalaba kacha mkpa, ntụkwasị obi, mbelata ego na ịzụ ngwa ngwa.",
  marketplaceTrustRating: "Nkezi akara ndi na-ere 4.8/5",
  marketplaceTrustVerified: "Akara nkwenye na ulo ahia a tụkwasịrị obi",
  marketplaceTrustPayment: "Nkwụnye ego echekwara site na GlobalPay",
  marketplaceSearchTitle: "Chọọ ma Họrọ",
  marketplaceSearchDescription: "Chọta ngwaahịa site n'aha, ebe, ngalaba, ma ọ bụ oke ego.",
  marketplaceSearchPlaceholder: "Chọọ ngwaahịa ma ọ bụ ebe",
  marketplaceCategoryFilterLabel: "Họrọ ngalaba",
  marketplaceCategoryAll: "Niile",
  marketplaceCategorySeeds: "Mkpuru",
  marketplaceCategoryFertilizers: "Fatịlaịza",
  marketplaceCategoryEquipment: "Ngwaọrụ",
  marketplaceCategoryLivestock: "Anụmanụ",
  marketplaceCategoryGeneral: "N'ozuzu",
  marketplaceMinPricePlaceholder: "Ego kacha nta",
  marketplaceMaxPricePlaceholder: "Ego kacha elu",
  marketplacePromotionsTitle: "Mbelata Ego Pụrụ Iche",
  marketplacePromotionsSubtitle: "Na-asọ mpi na ahia ukwu",
  marketplacePromoSeedTitle: "Izu Mmalite Mkpuru",
  marketplacePromoSeedDetail: "Chekwaa ruo 15% na mkpụrụ ọka, osikapa na akwukwo nri ziri ezi.",
  marketplacePromoSeedCta: "Zụta Mkpuru",
  marketplacePromoLogisticsTitle: "Nkwalite Mbupu",
  marketplacePromoLogisticsDetail: "Belata ụgwọ mbupu maka nnukwu oda site n'aka ndi na-ere ekwenyere.",
  marketplacePromoLogisticsCta: "Lee Mbupu",
  marketplacePromoWarehouseTitle: "Nchedo Ulo Nchekwa",
  marketplacePromoWarehouseDetail: "Nweta onyinye nchekwa maka ihe ubi mgbe owuwe ihe ubi na nri anụmanụ.",
  marketplacePromoWarehouseCta: "Debe Nchekwa",
  marketplaceNoApprovedProducts: "Enweghị ngwaahịa akwadoro ugbu a.",
  marketplaceTrendingTitle: "Ngwaahịa Na-aga N'ihu",
  marketplaceProductsFoundSuffix: "ngwaahịa achọtara",
  marketplaceVerifiedSeller: "Onye Na-ere Ekwenyere",
  marketplaceReviewsSuffix: "nyocha",
  marketplaceWhatsappLiveChat: "Mkparịta ụka WhatsApp",
  marketplaceCheckoutTitle: "Ịkwụ Ụgwọ Dị Mfe n'Ihe Nzọụkwụ 3",
  marketplaceCheckoutDescription: "E wuru ya maka ịzụ ngwa ngwa na ekwentị na nchekwa ịkwụ ụgwọ ụwa.",
  marketplaceStepLabelOne: "Nzọụkwụ 1",
  marketplaceStepLabelTwo: "Nzọụkwụ 2",
  marketplaceStepLabelThree: "Nzọụkwụ 3",
  marketplaceStepOneTitle: "Họrọ Ngwaahịa",
  marketplaceStepOneDescription: "Chọọ, họrọ ngalaba, ma họrọ ọnụọgụ site n'aka ndi na-ere ekwenyere.",
  marketplaceStepTwoTitle: "Kwenye Oda",
  marketplaceStepTwoDescription: "Lelee ọnụahịa, akara ntụkwasị obi na nhọrọ nnyefe tupu ịkwụ ụgwọ.",
  marketplaceStepThreeTitle: "Kwụọ na GlobalPay",
  marketplaceStepThreeDescription: "Mechaa ịkwụ ụgwọ n'ụzọ echekwara ma nweta nkwenye oda ozugbo.",
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
  marketplaceHeroTag: "Agrolink Market",
  marketplaceHeroTitle: "Hot Farm Products From Verified Sellers",
  marketplaceHeroDescription:
    "Build responsive, mobile-first market page wey show top categories, trust signs, promo offers, and quick buying.",
  marketplaceTrustRating: "4.8/5 Average Seller Rating",
  marketplaceTrustVerified: "Verified Badge for Trusted Stores",
  marketplaceTrustPayment: "GlobalPay Secure Payment",
  marketplaceSearchTitle: "Search and Filter Market",
  marketplaceSearchDescription: "Find products by name, location, category, or price range.",
  marketplaceSearchPlaceholder: "Search product or location",
  marketplaceCategoryFilterLabel: "Filter by category",
  marketplaceCategoryAll: "All",
  marketplaceCategorySeeds: "Seeds",
  marketplaceCategoryFertilizers: "Fertilizers",
  marketplaceCategoryEquipment: "Equipment",
  marketplaceCategoryLivestock: "Livestock",
  marketplaceCategoryGeneral: "General",
  marketplaceMinPricePlaceholder: "Minimum price",
  marketplaceMaxPricePlaceholder: "Maximum price",
  marketplacePromotionsTitle: "Featured Promos",
  marketplacePromotionsSubtitle: "Competitive like top marketplaces",
  marketplacePromoSeedTitle: "Seed Starter Week",
  marketplacePromoSeedDetail: "Save up to 15% for verified maize, rice and vegetable seeds.",
  marketplacePromoSeedCta: "Shop Seeds",
  marketplacePromoLogisticsTitle: "Logistics Boost",
  marketplacePromoLogisticsDetail: "Enjoy reduced transport fee for bulk orders from verified sellers.",
  marketplacePromoLogisticsCta: "See Logistics",
  marketplacePromoWarehouseTitle: "Warehouse Protection",
  marketplacePromoWarehouseDetail: "Get storage offers for post-harvest produce and livestock feed.",
  marketplacePromoWarehouseCta: "Book Storage",
  marketplaceNoApprovedProducts: "No approved products dey available yet.",
  marketplaceTrendingTitle: "Trending Products",
  marketplaceProductsFoundSuffix: "products found",
  marketplaceVerifiedSeller: "Verified Seller",
  marketplaceReviewsSuffix: "reviews",
  marketplaceWhatsappLiveChat: "WhatsApp Live Chat",
  marketplaceCheckoutTitle: "Simple Checkout in 3 Steps",
  marketplaceCheckoutDescription: "Built for fast mobile conversion with secure global payment support.",
  marketplaceStepLabelOne: "Step 1",
  marketplaceStepLabelTwo: "Step 2",
  marketplaceStepLabelThree: "Step 3",
  marketplaceStepOneTitle: "Select Product",
  marketplaceStepOneDescription: "Search, filter by category, choose quantity from verified sellers.",
  marketplaceStepTwoTitle: "Confirm Order",
  marketplaceStepTwoDescription: "Check price, trust signs and delivery options before checkout.",
  marketplaceStepThreeTitle: "Pay with GlobalPay",
  marketplaceStepThreeDescription: "Complete secure payment and get instant order confirmation.",
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
