export const LESSON_CATEGORIES = [
  {
    name: "Foundations",
    slug: "foundations",
    description: "San Ti Shi, basic stepping, and structural principles",
  },
  {
    name: "Five Elements",
    slug: "five-elements",
    description: "Pi, Zuan, Beng, Pao, Heng — the five fists",
  },
  {
    name: "Forms",
    slug: "forms",
    description: "Linked sequences and solo practice sets",
  },
  {
    name: "Applications",
    slug: "applications",
    description: "Partner work, fighting applications, and strategy",
  },
  {
    name: "Conditioning",
    slug: "conditioning",
    description: "Strength, power development, and body conditioning",
  },
  {
    name: "Mobility & Recovery",
    slug: "mobility-recovery",
    description: "Stretching, joint health, and recovery practices",
  },
  {
    name: "Theory",
    slug: "theory",
    description: "History, principles, and conceptual framework",
  },
  {
    name: "Weapons",
    slug: "weapons",
    description: "Sword, spear, staff, and other traditional weapons",
  },
] as const;

export type CategorySlug = (typeof LESSON_CATEGORIES)[number]["slug"];
