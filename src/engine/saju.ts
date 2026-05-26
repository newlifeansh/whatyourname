import { Lunar, Solar } from "lunar-typescript";

// 오행 타입
export type Element = "wood" | "fire" | "earth" | "metal" | "water";

// 천간 → 오행 매핑
const STEM_ELEMENT: Record<string, Element> = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

// 지지 → 오행 매핑
const BRANCH_ELEMENT: Record<string, Element> = {
  子: "water",
  丑: "earth",
  寅: "wood",
  卯: "wood",
  辰: "earth",
  巳: "fire",
  午: "fire",
  未: "earth",
  申: "metal",
  酉: "metal",
  戌: "earth",
  亥: "water",
};

export interface SajuResult {
  // 사주 팔자 (년주/월주/일주/시주)
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  timePillar: string | null;

  // 일간 (나의 본질)
  dayStem: string;
  dayStemElement: Element;

  // 오행 분포: { wood: 2, fire: 1, earth: 1, metal: 2, water: 0 }
  elementCounts: Record<Element, number>;

  // 부족한 오행 (가장 적은 것들)
  weakElements: Element[];

  // 강한 오행
  strongElements: Element[];

  // 용신 후보 오행 (이름 추천에 우선 적용)
  yongshinElements: Element[];
}

const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

const GENERATED_BY: Record<Element, Element> = {
  wood: "water",
  fire: "wood",
  earth: "fire",
  metal: "earth",
  water: "metal",
};

const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  fire: "metal",
  earth: "water",
  metal: "wood",
  water: "fire",
};

const CONTROLLED_BY: Record<Element, Element> = {
  wood: "metal",
  fire: "water",
  earth: "wood",
  metal: "fire",
  water: "earth",
};

export function calculateSaju(
  birthDate: string, // YYYYMMDD
  birthTime: string | null, // HHMM or null
): SajuResult {
  const y = Number(birthDate.slice(0, 4));
  const m = Number(birthDate.slice(4, 6));
  const d = Number(birthDate.slice(6, 8));

  const solar = Solar.fromYmd(y, m, d);
  const lunar = Lunar.fromSolar(solar);

  // 사주 팔자
  const eightChar = lunar.getEightChar();
  const yearPillar = eightChar.getYear();
  const monthPillar = eightChar.getMonth();
  const dayPillar = eightChar.getDay();

  let timePillar: string | null = null;
  if (birthTime && birthTime.length === 4) {
    const hour = Number(birthTime.slice(0, 2));
    const minute = Number(birthTime.slice(2, 4));
    // lunar-typescript에서 시주 계산
    const solarWithTime = Solar.fromYmdHms(y, m, d, hour, minute, 0);
    const lunarWithTime = Lunar.fromSolar(solarWithTime);
    const eightCharWithTime = lunarWithTime.getEightChar();
    timePillar = eightCharWithTime.getTime();
  }

  // 일간 (Day Stem) — 일주의 첫 글자
  const dayStem = dayPillar.charAt(0);
  const dayStemElement = STEM_ELEMENT[dayStem] ?? "earth";

  // 오행 카운트
  const elementCounts: Record<Element, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };

  // 년주, 월주, 일주 (각각 천간+지지 = 2글자)
  const pillars = [yearPillar, monthPillar, dayPillar];
  if (timePillar) pillars.push(timePillar);

  for (const pillar of pillars) {
    const stem = pillar.charAt(0);
    const branch = pillar.charAt(1);
    if (STEM_ELEMENT[stem]) elementCounts[STEM_ELEMENT[stem]]++;
    if (BRANCH_ELEMENT[branch]) elementCounts[BRANCH_ELEMENT[branch]]++;
  }

  // 부족한/강한 오행 계산
  const counts = Object.entries(elementCounts) as [Element, number][];
  const minCount = Math.min(...counts.map(([, c]) => c));
  const maxCount = Math.max(...counts.map(([, c]) => c));

  const weakElements = counts
    .filter(([, c]) => c === minCount)
    .map(([el]) => el);
  const strongElements = counts
    .filter(([, c]) => c === maxCount)
    .map(([el]) => el);
  const yongshinElements = getYongshinElements({
    dayStemElement,
    elementCounts,
    strongElements,
  });

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    timePillar,
    dayStem,
    dayStemElement,
    elementCounts,
    weakElements,
    strongElements,
    yongshinElements,
  };
}

function getYongshinElements({
  dayStemElement,
  elementCounts,
  strongElements,
}: {
  dayStemElement: Element;
  elementCounts: Record<Element, number>;
  strongElements: Element[];
}): Element[] {
  const total = Object.values(elementCounts).reduce((sum, count) => sum + count, 0);
  const average = total / 5;
  const dayCount = elementCounts[dayStemElement];
  const dayMasterIsWeak = dayCount <= average;

  const baseCandidates = dayMasterIsWeak
    ? [GENERATED_BY[dayStemElement], dayStemElement]
    : [GENERATES[dayStemElement], CONTROLLED_BY[dayStemElement], CONTROLS[dayStemElement]];
  const candidates = baseCandidates.filter((el) => !strongElements.includes(el));
  const fallbackCandidates = candidates.length > 0 ? candidates : baseCandidates;

  return Array.from(new Set(fallbackCandidates))
    .sort((a, b) => {
      const countDiff = elementCounts[a] - elementCounts[b];
      if (countDiff !== 0) return countDiff;
      return baseCandidates.indexOf(a) - baseCandidates.indexOf(b);
    })
    .slice(0, 2);
}

// 오행 한글 이름
export const ELEMENT_NAMES: Record<Element, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)",
};

// 오행 특성 설명
export const ELEMENT_TRAITS: Record<Element, string> = {
  wood: "성장과 창의력, 새로운 시작의 에너지",
  fire: "열정과 리더십, 밝고 따뜻한 에너지",
  earth: "안정과 신뢰, 든든한 중심의 에너지",
  metal: "결단력과 정의, 강인한 의지의 에너지",
  water: "지혜와 유연함, 깊은 통찰의 에너지",
};
