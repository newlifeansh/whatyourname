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

  const helpingEl = getHelpingElement(saju.dayStemElement);

  const scored = candidates.map((name) => {
    let score = 0;
    const reasons: string[] = [];
    const phoneticEls = getPhoneticElements(name.name);

    // 이름이 가진 모든 오행 (의미 + 발음 합산, 중복 제거)
    const allElements = new Set([...name.elements, ...phoneticEls]);

    // ═══ 핵심: 부족 오행 보완 (최우선) ═══
    let weakMatch = 0;
    for (const weakEl of saju.weakElements) {
      // 의미 오행이 부족 오행과 일치
      if (name.elements.includes(weakEl)) {
        score += 50;
        weakMatch++;
        reasons.push(`부족한 ${elementKo(weakEl)}의 기운을 채워줘요`);
      }
      // 발음 오행도 부족 오행과 일치 → 추가 보너스
      if (phoneticEls.includes(weakEl)) {
        score += 30;
        weakMatch++;
        if (!reasons.length) {
          reasons.push(`'${name.name[0]}' 발음이 부족한 ${elementKo(weakEl)}의 기운을 보충해요`);
        }
      }
    }

    // 빈 오행(0개) 보완 보너스
    for (const el of allElements) {
      if (saju.elementCounts[el] === 0) {
        score += 15;
        if (!reasons.length) {
          reasons.push(`비어있는 ${elementKo(el)}의 기운을 보충해줘요`);
        }
      }
    }

    // ═══ 상생 관계 ═══
    if (allElements.has(helpingEl)) {
      score += 12;
      if (!reasons.length) {
        reasons.push(`${elementKo(saju.dayStemElement)} 일간과 조화로운 ${elementKo(helpingEl)}의 에너지`);
      }
    }

    // ═══ 과잉 오행 강한 감점 ═══
    for (const strongEl of saju.strongElements) {
      if (name.elements.includes(strongEl)) score -= 40;
      if (phoneticEls.includes(strongEl)) score -= 25;
    }

    // ═══ 오행 분포 세밀 점수 ═══
    for (const el of allElements) {
      const count = saju.elementCounts[el];
      score += Math.max(0, 4 - count) * 2;
    }

    // ═══ 결정적 셔플 (같은 오행 그룹 내 순위만 바꿈) ═══
    // 변동폭을 10 이하로 제한 → 부족 오행 매칭(50+30=80)을 절대 뒤집지 않음
    const nameHash = hashString(
      name.name + saju.yearPillar + saju.monthPillar + saju.dayPillar + (saju.timePillar ?? ""),
    );
    score += nameHash % 10;

    const reason = reasons.length > 0 ? reasons[0] : "당신의 사주와 잘 어울려요";
    return { name, score, reason };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 10);
}

function elementKo(el: Element): string {
  const map: Record<Element, string> = {
    wood: "목(木)", fire: "화(火)", earth: "토(土)", metal: "금(金)", water: "수(水)",
  };
  return map[el];
}

function getHelpingElement(myElement: Element): Element {
  const map: Record<Element, Element> = {
    wood: "water", fire: "wood", earth: "fire", metal: "earth", water: "metal",
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
