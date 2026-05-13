import type { EnglishName } from "./nameDb";
import type { Element } from "./saju";

const HERITAGES = [
  "Black",
  "East Asian",
  "South Asian",
  "Southeast Asian",
  "Latino",
  "Middle Eastern",
  "White",
  "Mixed-race",
] as const;

const SKIN_TONES = [
  "deep brown skin",
  "warm brown skin",
  "golden tan skin",
  "olive skin",
  "freckled light skin",
  "porcelain skin",
] as const;

const HAIR_BY_GENDER = {
  male: [
    "short curls",
    "clean side-part",
    "soft wavy hair",
    "close fade haircut",
    "messy medium hair",
    "braided top hairstyle",
  ],
  female: [
    "long curls",
    "sleek bob haircut",
    "braided hairstyle",
    "soft wavy hair",
    "high ponytail",
    "short textured cut",
  ],
} as const;

const OUTFIT_BY_ELEMENT: Record<Element, readonly string[]> = {
  wood: ["green cardigan and cream shirt", "sage bomber jacket", "leaf-patterned casual outfit"],
  fire: ["sunset orange hoodie", "red statement jacket", "warm coral casual outfit"],
  earth: ["sand beige knitwear", "camel overalls", "golden-brown cozy outfit"],
  metal: ["silver varsity jacket", "cool gray streetwear", "structured monochrome outfit"],
  water: ["navy raincoat", "blue layered casual look", "teal sporty outfit"],
};

const VIBE_BY_ELEMENT: Record<Element, readonly string[]> = {
  wood: ["gentle explorer", "creative daydreamer", "calm nature-loving kidult"],
  fire: ["confident performer", "bright extrovert", "charismatic storyteller"],
  earth: ["reliable best friend", "warm caretaker", "grounded thoughtful soul"],
  metal: ["sharp strategist", "stylish achiever", "cool-headed leader"],
  water: ["curious thinker", "quiet magician", "intuitive wanderer"],
};

const POSES = [
  "three-quarter shoulders turned slightly left",
  "three-quarter shoulders turned slightly right",
  "gentle forward lean",
  "upright confident posture",
  "one shoulder slightly raised",
  "relaxed asymmetrical shoulders",
] as const;

const EXPRESSIONS = [
  "wide delighted smile",
  "soft closed-mouth smile",
  "curious raised eyebrows",
  "playful smirk",
  "calm thoughtful look",
  "bright surprised eyes",
  "confident focused gaze",
  "shy warm smile",
] as const;

const GAZES = [
  "looking directly at the viewer",
  "eyes glancing slightly left",
  "eyes glancing slightly right",
  "looking a little upward",
  "head tilted down slightly with eyes up",
] as const;

const GESTURES = [
  "one hand partly visible near the lower edge",
  "fingertips lightly touching the collar",
  "small peace sign near the lower edge",
  "one hand resting near the chest",
  "subtle thumbs-up partly visible at the bottom",
  "hands out of frame for a clean portrait",
] as const;

function hashSimple(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: readonly T[], seed: number, offset = 0): T {
  return items[(seed + offset) % items.length];
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export interface CharacterConcept {
  slug: string;
  alt: string;
  prompt: string;
  heritage: string;
  vibe: string;
  outfit: string;
}

export function buildCharacterConcept(name: EnglishName): CharacterConcept {
  const seed = hashSimple(`${name.name}-${name.gender}-${name.meaning}`);
  const mainElement = name.elements[0] ?? "earth";
  const heritage = pick(HERITAGES, seed);
  const skinTone = pick(SKIN_TONES, seed, 1);
  const hair = pick(HAIR_BY_GENDER[name.gender === "female" ? "female" : "male"], seed, 2);
  const outfit = pick(OUTFIT_BY_ELEMENT[mainElement], seed, 3);
  const vibe = pick(VIBE_BY_ELEMENT[mainElement], seed, 4);
  const pose = pick(POSES, seed, 5);
  const expression = pick(EXPRESSIONS, seed, 6);
  const gaze = pick(GAZES, seed, 7);
  const gesture = pick(GESTURES, seed, 8);

  return {
    slug: slugify(name.name),
    alt: `${name.name} character portrait`,
    heritage,
    vibe,
    outfit,
    prompt: [
      "Original family-friendly 3D animated circular avatar portrait.",
      "Polished cinematic lighting, expressive eyes, soft skin shading, appealing proportions.",
      "Avoid copying any existing studio or copyrighted character design.",
      `${heritage} character with ${skinTone} and ${hair}.`,
      `${pose}, reframed as a centered head-and-shoulders avatar.`,
      `${expression}, ${gaze}, ${gesture}.`,
      `${outfit}.`,
      `Personality vibe: ${vibe}.`,
      `Name inspiration: ${name.name}, meaning "${name.meaning}".`,
      "Face large and centered, eyes around upper-middle, minimal torso.",
      "Keep generous margin around hair, chin, and ears so the character fits inside a circular crop.",
      "Vary expression and pose; avoid repeating the same front-facing smile or the same waving pose.",
      "Clean background, premium mobile-app ready square asset.",
    ].join(" "),
  };
}
