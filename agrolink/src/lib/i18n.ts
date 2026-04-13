export type Language = "en" | "ha" | "yo" | "ig" | "pcm";

export const SUPPORTED_LANGUAGES: Language[] = ["en", "ha", "yo", "ig", "pcm"];

export const UI_COPY: Record<Language, {
  appName: string;
  tagline: string;
  marketHub: string;
  inputShop: string;
  myFarm: string;
  finance: string;
  home: string;
}> = {
  en: {
    appName: "Dos AgroLink Nigeria",
    tagline: "Farmer Digital Platform",
    marketHub: "Market Hub",
    inputShop: "Input Shop",
    myFarm: "My Farm",
    finance: "Financial Services",
    home: "Home",
  },
  ha: {
    appName: "Dos AgroLink Najeriya",
    tagline: "Dandamalin Manoma na Dijital",
    marketHub: "Cibiyar Kasuwa",
    inputShop: "Shagon Kayan Gona",
    myFarm: "Gonata",
    finance: "Ayyukan Kudi",
    home: "Gida",
  },
  yo: {
    appName: "Dos AgroLink Naijiria",
    tagline: "Pẹpẹ Agbe Oni-nọmba",
    marketHub: "Ibi Oja",
    inputShop: "Ile Itaja Input",
    myFarm: "Oko Mi",
    finance: "Ise Isuna",
    home: "Ile",
  },
  ig: {
    appName: "Dos AgroLink Naijiria",
    tagline: "Nkwado Ugbo Dijital",
    marketHub: "Ebe Ahia",
    inputShop: "Ulo Ahia Input",
    myFarm: "Ubi M",
    finance: "Orumaka Ego",
    home: "Ulo",
  },
  pcm: {
    appName: "Dos AgroLink Naija",
    tagline: "Farmer Digital Platform",
    marketHub: "Market Hub",
    inputShop: "Input Shop",
    myFarm: "My Farm",
    finance: "Money Services",
    home: "Home",
  },
};
