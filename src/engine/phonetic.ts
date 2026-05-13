import type { Element } from "./saju";

/**
 * 영어 이름의 첫 발음(초성)을 기반으로 오행을 매핑
 *
 * 한국 작명학 초성 오행:
 *   ㄱ,ㅋ = 木(wood)  → K, G, C(hard)
 *   ㄴ,ㄷ,ㅌ,ㄹ = 火(fire) → N, D, T, L, R
 *   ㅇ,ㅎ = 土(earth) → vowel(A,E,I,O,U), H
 *   ㅅ,ㅈ,ㅊ = 金(metal) → S, J, Ch, Z, X
 *   ㅁ,ㅂ,ㅍ = 水(water) → M, B, P, F, V, W
 */

const CONSONANT_ELEMENT: Record<string, Element> = {
  // 木(wood) — ㄱ,ㅋ 계열
  K: "wood",
  G: "wood",
  C: "wood", // hard C (Cat, Carl)
  Q: "wood", // Q는 K 발음

  // 火(fire) — ㄴ,ㄷ,ㅌ,ㄹ 계열
  N: "fire", // N=ㄴ
  D: "fire", // D=ㄷ
  T: "fire", // T=ㅌ
  L: "fire", // L=ㄹ
  R: "fire", // R=ㄹ

  // 土(earth) — ㅇ,ㅎ 계열
  A: "earth",
  E: "earth",
  I: "earth",
  O: "earth",
  U: "earth",
  H: "earth",
  Y: "earth", // Y는 모음 성격

  // 金(metal) — ㅅ,ㅈ,ㅊ 계열
  S: "metal",
  J: "metal",
  Z: "metal",
  X: "metal",

  // 水(water) — ㅁ,ㅂ,ㅍ 계열
  M: "water",
  B: "water",
  P: "water",
  F: "water",
  V: "water",
  W: "water",
};

// 특수 2글자 조합 (Ch, Sh, Th 등)
const DIGRAPH_ELEMENT: Record<string, Element> = {
  CH: "metal", // ㅊ
  SH: "metal", // ㅅ
  TH: "fire",  // ㄷ 계열
  PH: "water", // ㅍ → F 발음
  WH: "water", // W 계열
};

export interface PhoneticCue {
  source: string;
  element: Element;
  isPrimary: boolean;
}

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

function normalizeName(name: string): string {
  return name.toUpperCase().replace(/[^A-Z]/g, "");
}

function getInitialCue(upper: string): PhoneticCue | null {
  const firstTwo = upper.slice(0, 2);
  if (DIGRAPH_ELEMENT[firstTwo]) {
    return { source: firstTwo, element: DIGRAPH_ELEMENT[firstTwo], isPrimary: true };
  }

  const first = upper[0];
  if (!first || !CONSONANT_ELEMENT[first]) return null;

  return { source: first, element: CONSONANT_ELEMENT[first], isPrimary: true };
}

export function getPhoneticCues(name: string): PhoneticCue[] {
  const upper = normalizeName(name);
  if (!upper) return [];

  const cues: PhoneticCue[] = [];
  const primaryCue = getInitialCue(upper);
  if (primaryCue) {
    cues.push(primaryCue);
  }

  let index = primaryCue?.source.length ?? 1;
  while (index < upper.length) {
    const pair = upper.slice(index, index + 2);
    if (DIGRAPH_ELEMENT[pair]) {
      cues.push({ source: pair, element: DIGRAPH_ELEMENT[pair], isPrimary: false });
      index += 2;
      continue;
    }

    const letter = upper[index];
    if (CONSONANT_ELEMENT[letter] && !VOWELS.has(letter)) {
      cues.push({ source: letter, element: CONSONANT_ELEMENT[letter], isPrimary: false });
    }
    index += 1;
  }

  return cues;
}

/**
 * 영어 이름에서 발음 기반 오행을 추출
 * 첫 글자(초성) + 중간 핵심 자음들 분석
 */
export function getPhoneticElements(name: string): Element[] {
  const cues = getPhoneticCues(name);
  if (cues.length === 0) return [];

  const elements: Element[] = [cues[0].element];

  // 이름 내 주요 자음들에서 추가 오행 (2번째로 강한 오행)
  const counts: Record<Element, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };
  for (const cue of cues.slice(1)) {
    counts[cue.element]++;
  }

  const sorted = (Object.entries(counts) as [Element, number][])
    .filter(([el]) => !elements.includes(el))
    .sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] > 0) {
    elements.push(sorted[0][0]);
  }

  return elements;
}

export function getPhoneticCueForElement(
  name: string,
  targetElement: Element,
): PhoneticCue | null {
  const cues = getPhoneticCues(name);
  return cues.find((cue) => cue.element === targetElement) ?? null;
}

/**
 * 발음 오행 한글 설명 생성
 */
export function getPhoneticExplanation(
  name: string,
  targetElement?: Element | null,
): string {
  const elementMap: Record<Element, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };

  const cue = targetElement
    ? getPhoneticCueForElement(name, targetElement) ?? getPhoneticCues(name)[0]
    : getPhoneticCues(name)[0];
  if (!cue) return "";

  return `'${cue.source}' 발음은 ${elementMap[cue.element]}의 기운을 가져요`;
}
