// Single source of truth for the codex's categories and the (now flat) top
// navigation. Category keys here MUST match the keys emitted by
// scripts/sync-vault.mjs and the `category` field in content/index.json.

export type CategoryKey =
  | "settlements"
  | "villages"
  | "factions"
  | "organizations"
  | "races"
  | "gods"
  | "lore"
  | "history"
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
  /** Lore entries carry an `age` + `order`; the editor exposes those fields. */
  chronological?: boolean;
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
  factions: {
    key: "factions",
    label: "Factions",
    singular: "Faction",
    blurb: "The realms, kingdoms, clans, and powers that vie for dominion.",
    sigil: "banner",
  },
  organizations: {
    key: "organizations",
    label: "Organizations",
    singular: "Organization",
    blurb: "Orders, guilds, and secret societies working the shadows.",
    sigil: "eye",
  },
  races: {
    key: "races",
    label: "Races",
    singular: "Race",
    blurb: "The kindreds and bloodlines that walk the world.",
    sigil: "folk",
  },
  gods: {
    key: "gods",
    label: "Gods",
    singular: "Deity",
    blurb: "The pantheon and the divine powers behind creation.",
    sigil: "sun",
  },
  lore: {
    key: "lore",
    label: "History",
    singular: "Chronicle",
    blurb: "The ages of the world, from creation to the present peace.",
    sigil: "scroll",
    chronological: true,
  },
  history: {
    key: "history",
    label: "Annals",
    singular: "Record",
    blurb: "Timelines and assorted records of ages past.",
    sigil: "book",
  },
  chronicles: {
    key: "chronicles",
    label: "Chronicles",
    singular: "Chapter",
    blurb: "Recorded adventures and tales from across Ardeo.",
    sigil: "book",
  },
};

/**
 * The flat top navigation. Each item is a single link — no submenus.
 * `coversCategories` lists every content category surfaced under that item
 * (used to decide whether the item has content and, for Settlements, to merge
 * villages in). `href` is where the item points.
 */
export interface NavItem {
  key: string;
  label: string;
  href: string;
  sigil: SigilKey;
  blurb: string;
  coversCategories: CategoryKey[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    key: "settlements",
    label: "Settlements",
    href: "/codex/settlements/",
    sigil: "keep",
    blurb: "Cities, towns, and the villages beyond their walls.",
    coversCategories: ["settlements", "villages"],
  },
  {
    key: "factions",
    label: "Factions",
    href: "/codex/factions/",
    sigil: "banner",
    blurb: "Kingdoms, clans, and the powers that vie for dominion.",
    coversCategories: ["factions"],
  },
  {
    key: "organizations",
    label: "Organizations",
    href: "/codex/organizations/",
    sigil: "eye",
    blurb: "Orders, guilds, and secret societies.",
    coversCategories: ["organizations"],
  },
  {
    key: "races",
    label: "Races",
    href: "/codex/races/",
    sigil: "folk",
    blurb: "The kindreds that walk beneath the sun and moons.",
    coversCategories: ["races"],
  },
  {
    key: "gods",
    label: "Gods",
    href: "/codex/gods/",
    sigil: "sun",
    blurb: "The pantheon and its dominions.",
    coversCategories: ["gods"],
  },
  {
    key: "history",
    label: "History",
    href: "/history/",
    sigil: "scroll",
    blurb: "The ages of the world, set down in order.",
    coversCategories: ["lore"],
  },
  {
    key: "annals",
    label: "Annals",
    href: "/codex/history/",
    sigil: "book",
    blurb: "Timelines and assorted records.",
    coversCategories: ["history"],
  },
  {
    key: "chronicles",
    label: "Chronicles",
    href: "/codex/chronicles/",
    sigil: "book",
    blurb: "Recorded adventures from across the realm.",
    coversCategories: ["chronicles"],
  },
];

/** Categories a user can create/edit from the backoffice (in menu order). */
export const EDITABLE_CATEGORIES: CategoryKey[] = [
  "settlements",
  "villages",
  "factions",
  "organizations",
  "races",
  "gods",
  "lore",
  "history",
  "chronicles",
];

export function categoryDef(key: string): CategoryDef | undefined {
  return CATEGORIES[key as CategoryKey];
}
