// Single source of truth for the codex's categories and how they group into
// the navigation. Keys here MUST match the category keys emitted by
// scripts/sync-vault.mjs.

export type CategoryKey =
  | "settlements"
  | "villages"
  | "nature"
  | "regions"
  | "factions"
  | "organizations"
  | "races"
  | "characters"
  | "gods"
  | "lore"
  | "history"
  | "culture"
  | "resources"
  | "chronicles";

export type SigilKey =
  | "keep"
  | "hamlet"
  | "peak"
  | "map"
  | "banner"
  | "eye"
  | "folk"
  | "portrait"
  | "sun"
  | "scroll"
  | "goblet"
  | "gem"
  | "book";

export interface CategoryDef {
  key: CategoryKey;
  label: string; // plural, for listings & nav
  singular: string; // for an individual entry's badge
  blurb: string; // shown on category index cards
  sigil: SigilKey;
}

export interface SectionDef {
  key: string;
  label: string;
  blurb: string;
  categories: CategoryKey[];
}

export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  settlements: {
    key: "settlements",
    label: "Settlements",
    singular: "Settlement",
    blurb: "Cities, ports, and fortified towns of the known world.",
    sigil: "keep",
  },
  villages: {
    key: "villages",
    label: "Villages",
    singular: "Village",
    blurb: "Hamlets and outlying communities beyond the city walls.",
    sigil: "hamlet",
  },
  nature: {
    key: "nature",
    label: "Geography",
    singular: "Landmark",
    blurb: "Forests, peaks, rivers, and seas that shape the land.",
    sigil: "peak",
  },
  regions: {
    key: "regions",
    label: "Regions",
    singular: "Region",
    blurb: "The great provinces and territories of the continent.",
    sigil: "map",
  },
  factions: {
    key: "factions",
    label: "Factions & Kingdoms",
    singular: "Faction",
    blurb: "The realms, clans, and powers that vie for dominion.",
    sigil: "banner",
  },
  organizations: {
    key: "organizations",
    label: "Orders & Organizations",
    singular: "Organization",
    blurb: "Guilds, orders, and secret societies working the shadows.",
    sigil: "eye",
  },
  races: {
    key: "races",
    label: "Peoples & Races",
    singular: "People",
    blurb: "The kindreds and bloodlines that walk the world.",
    sigil: "folk",
  },
  characters: {
    key: "characters",
    label: "Characters",
    singular: "Character",
    blurb: "Notable figures whose deeds echo through the age.",
    sigil: "portrait",
  },
  gods: {
    key: "gods",
    label: "Gods & Religion",
    singular: "Deity",
    blurb: "The pantheon and the divine powers behind creation.",
    sigil: "sun",
  },
  lore: {
    key: "lore",
    label: "History & Lore",
    singular: "Chronicle",
    blurb: "The ages of the world, from creation to present peace.",
    sigil: "scroll",
  },
  history: {
    key: "history",
    label: "Annals",
    singular: "Record",
    blurb: "Timelines and assorted records of ages past.",
    sigil: "scroll",
  },
  culture: {
    key: "culture",
    label: "Culture",
    singular: "Custom",
    blurb: "Drink, weather, and the everyday texture of the world.",
    sigil: "goblet",
  },
  resources: {
    key: "resources",
    label: "Resources",
    singular: "Resource",
    blurb: "Metals, materials, and the wealth of the earth.",
    sigil: "gem",
  },
  chronicles: {
    key: "chronicles",
    label: "Chronicles",
    singular: "Chapter",
    blurb: "Recorded adventures and tales from across Ardeo.",
    sigil: "book",
  },
};

export const SECTIONS: SectionDef[] = [
  {
    key: "world",
    label: "The World",
    blurb: "Lands, geography, and the texture of the realm.",
    categories: ["regions", "nature", "culture", "resources"],
  },
  {
    key: "places",
    label: "Places",
    blurb: "Where the peoples of Ardeo make their homes.",
    categories: ["settlements", "villages"],
  },
  {
    key: "powers",
    label: "Powers",
    blurb: "The factions and orders that move the world.",
    categories: ["factions", "organizations"],
  },
  {
    key: "peoples",
    label: "Peoples",
    blurb: "The kindreds that walk beneath the sun and moons.",
    categories: ["races"],
  },
  {
    key: "figures",
    label: "Characters",
    blurb: "The hands that shape history.",
    categories: ["characters"],
  },
  {
    key: "divine",
    label: "Gods",
    blurb: "The pantheon and its dominions.",
    categories: ["gods"],
  },
  {
    key: "history",
    label: "History",
    blurb: "The ages of the world, set down in order.",
    categories: ["lore", "history"],
  },
  {
    key: "tales",
    label: "Chronicles",
    blurb: "Recorded adventures from across the realm.",
    categories: ["chronicles"],
  },
];

export function categoryDef(key: string): CategoryDef | undefined {
  return CATEGORIES[key as CategoryKey];
}

export function sectionForCategory(key: string): SectionDef | undefined {
  return SECTIONS.find((s) => s.categories.includes(key as CategoryKey));
}
