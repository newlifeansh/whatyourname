import type { Gender } from "../types";
import type { EnglishName } from "./nameDb";
import { NAME_DB } from "./nameDb";
import { getPhoneticElements } from "./phonetic";
import type { Element, SajuResult } from "./saju";

export interface NameRecommendation {
  name: EnglishName;
  score: number;
  reason: string;
}

export function matchNames(
  saju: SajuResult,
  gender: Gender,
): NameRecommendation[] {
  const candidates = NAME_DB.filter(
    (n) => n.gender === gender || n.gender === "unisex",
  );

  const scored = candidates.map((name) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. 부족한 오행 보완
    for (const weakEl of saju.weakElements) {
      if (name.elements.includes(weakEl)) {
        score += 40;
        reasons.push(`부족한 ${elementKo(weakEl)}의 기운을 채워줘요`);
      }
    }

    // 2. 완전히 빈(0개) 오행 보완 보너스
    for (const el of name.elements) {
      if (saju.elementCounts[el] === 0) {
        score += 20;
        if (!reasons.length) {
          reasons.push(`비어있는 ${elementKo(el)}의 기운을 보충해줘요`);
        }
      }
    }

    // 3. 일간 상생 관계 (나를 생해주는 오행)
    const helpingEl = getHelpingElement(saju.dayStemElement);
    if (name.elements.includes(helpingEl)) {
      score += 15;
      if (!reasons.length) {
        reasons.push(
          `${elementKo(saju.dayStemElement)} 일간과 조화로운 ${elementKo(helpingEl)}의 에너지`,
        );
      }
    }

    // 4. 일간이 생해주는 오행 (식상)
    const producingEl = getProducingElement(saju.dayStemElement);
    if (name.elements.includes(producingEl)) {
      score += 8;
      if (!reasons.length) {
        reasons.push(
          `${elementKo(saju.dayStemElement)}에서 뻗어나가는 ${elementKo(producingEl)}의 조화`,
        );
      }
    }

    // 5. 발음 기반 오행 점수 (초성 오행)
    const phoneticEls = getPhoneticElements(name.name);
    for (const pEl of phoneticEls) {
      // 발음 오행이 부족한 오행을 보완하면 가산
      if (saju.weakElements.includes(pEl)) {
        score += 25;
        if (!reasons.length) {
          reasons.push(`'${name.name[0]}' 발음이 부족한 ${elementKo(pEl)}의 기운을 보충해요`);
        }
      }
      // 발음 오행이 빈 오행(0개)이면 추가 보너스
      if (saju.elementCounts[pEl] === 0) {
        score += 12;
      }
      // 발음 오행이 일간 상생이면 가산
      if (pEl === helpingEl) {
        score += 10;
      }
      // 발음 오행이 과잉이면 감점
      if (saju.strongElements.includes(pEl)) {
        score -= 15;
      }
    }

    // 6. 과잉 오행 감점 (의미 기반)
    for (const strongEl of saju.strongElements) {
      if (name.elements.includes(strongEl)) {
        score -= 25;
      }
    }

    // 6. 오행 분포에 따른 세밀 점수
    // 각 이름의 오행이 사주에서 적을수록 높은 점수
    for (const el of name.elements) {
      const count = saju.elementCounts[el];
      score += Math.max(0, 5 - count) * 3; // 0개=+15, 1개=+12, 2개=+9, 3개=+6 ...
    }

    // 7. 사주 기반 결정적 셔플 (핵심!)
    // 같은 사주면 같은 결과, 다른 사주면 다른 결과
    // 변동폭을 충분히 크게 (0~30) → 동점 이름들 사이 순위가 바뀜
    const nameHash = hashString(name.name + saju.yearPillar + saju.monthPillar + saju.dayPillar + (saju.timePillar ?? ""));
    score += nameHash % 30;

    const reason = reasons.length > 0 ? reasons[0] : "당신의 사주와 잘 어울려요";

    return { name, score, reason };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

function elementKo(el: Element): string {
  const map: Record<Element, string> = {
    wood: "목(木)",
    fire: "화(火)",
    earth: "토(土)",
    metal: "금(金)",
    water: "수(水)",
  };
  return map[el];
}

function getHelpingElement(myElement: Element): Element {
  const map: Record<Element, Element> = {
    wood: "water",
    fire: "wood",
    earth: "fire",
    metal: "earth",
    water: "metal",
  };
  return map[myElement];
}

function getProducingElement(myElement: Element): Element {
  const map: Record<Element, Element> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };
  return map[myElement];
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}
