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
  N: "wood" === "wood" ? "fire" : "fire", // N=ㄴ
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

/**
 * 영어 이름에서 발음 기반 오행을 추출
 * 첫 글자(초성) + 중간 핵심 자음들 분석
 */
export function getPhoneticElements(name: string): Element[] {
  const upper = name.toUpperCase();
  const elements: Set<Element> = new Set();

  // 1. 첫 소리 (가장 중요)
  const firstTwo = upper.slice(0, 2);
  if (DIGRAPH_ELEMENT[firstTwo]) {
    elements.add(DIGRAPH_ELEMENT[firstTwo]);
  } else if (CONSONANT_ELEMENT[upper[0]]) {
    elements.add(CONSONANT_ELEMENT[upper[0]]);
  }

  // 2. 이름 내 주요 자음들에서 추가 오행 (2번째로 강한 오행)
  const consonants = upper.split("").filter((ch) => !"AEIOU".includes(ch));
  // 첫 자음 제외하고 나머지에서 빈도 높은 오행
  const counts: Record<Element, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };
  for (let i = 1; i < consonants.length; i++) {
    const el = CONSONANT_ELEMENT[consonants[i]];
    if (el) counts[el]++;
  }
  // 가장 빈도 높은 오행을 2차 오행으로 추가
  const sorted = (Object.entries(counts) as [Element, number][])
    .filter(([el]) => !elements.has(el))
    .sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] > 0) {
    elements.add(sorted[0][0]);
  }

  return Array.from(elements);
}

/**
 * 발음 오행 한글 설명 생성
 */
export function getPhoneticExplanation(name: string): string {
  const upper = name.toUpperCase();
  const firstLetter = upper[0];
  const firstTwo = upper.slice(0, 2);

  let sound = firstLetter;
  if (DIGRAPH_ELEMENT[firstTwo]) {
    sound = firstTwo;
  }

  const elementMap: Record<Element, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };

  const elements = getPhoneticElements(name);
  if (elements.length === 0) return "";

  const primary = elementMap[elements[0]];
  return `'${sound}' 발음은 ${primary}의 기운을 가져요`;
}
