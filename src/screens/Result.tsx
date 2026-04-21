import { FixedBottomCTA, Top } from "@toss/tds-mobile";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "../engine/analytics";
import { matchNames } from "../engine/matchNames";
import { getPhoneticExplanation } from "../engine/phonetic";
import type { Element } from "../engine/saju";
import { ELEMENT_NAMES, ELEMENT_TRAITS, calculateSaju } from "../engine/saju";
import type { SajuInput } from "../types";

const MALE_EMOJIS = [
  "img5.png", "img6.png", "img7.png", "img8.png", "img9.png",
  "img10.png", "img11.png", "img13.png", "img14.png", "img15.png",
  "img16.png", "img17.png", "img18.png", "img19.png", "img21.png",
  "img22.png", "img23.png", "img24.png", "img60.png", "img61.png",
  "img62.png", "img63.png", "img64.png", "img70.png", "img71.png",
  "img80.png", "img81.png", "img82.png", "img83.png", "img84.png",
  "img105.png", "img106.png", "img107.png", "img108.png", "img109.png",
];

const FEMALE_EMOJIS = [
  "img25.png", "img26.png", "img27.png", "img28.png", "img29.png",
  "img30.png", "img31.png", "img32.png", "img33.png", "img34.png",
  "img35.png", "img36.png", "img37.png", "img38.png", "img39.png",
  "img40.png", "img41.png", "img42.png", "img43.png", "img44.png",
  "img45.png", "img46.png", "img47.png", "img48.png", "img49.png",
  "img50.png", "img65.png", "img66.png", "img67.png", "img75.png",
  "img91.png", "img92.png", "img93.png", "img100.png", "img101.png",
];

const ELEMENT_COLORS: Record<Element, { bg: string; accent: string; light: string }> = {
  wood: { bg: "#f0fdf4", accent: "#22c55e", light: "#bbf7d0" },
  fire: { bg: "#fef2f2", accent: "#ef4444", light: "#fecaca" },
  earth: { bg: "#fffbeb", accent: "#f59e0b", light: "#fde68a" },
  metal: { bg: "#f5f3ff", accent: "#8b5cf6", light: "#ddd6fe" },
  water: { bg: "#eff6ff", accent: "#3b82f6", light: "#bfdbfe" },
};

const ELEMENT_EMOJI: Record<Element, string> = {
  wood: "🌿",
  fire: "🔥",
  earth: "⛰️",
  metal: "⚔️",
  water: "💧",
};

function pickEmoji(seed: number, idx: number, gender: "male" | "female"): string {
  const pool = gender === "male" ? MALE_EMOJIS : FEMALE_EMOJIS;
  const i = ((seed * 7 + idx * 13 + 3) % pool.length + pool.length) % pool.length;
  return pool[i];
}

interface Props {
  input: SajuInput;
}

export function Result({ input }: Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    const saju = calculateSaju(input.birthDate, input.birthTime);
    const names = matchNames(saju, input.gender!);
    const seed = Number(input.birthDate) || 42;
    return { saju, names, seed };
  }, [input]);

  const { saju, names, seed } = result;

  const trackData = useMemo(
    () => ({
      gender: input.gender ?? "",
      birthYear: input.birthDate.slice(0, 4),
      name1: names[0]?.name.name ?? "",
      name2: names[1]?.name.name ?? "",
      name3: names[2]?.name.name ?? "",
      weakElements: saju.weakElements.map((el) => ELEMENT_NAMES[el]).join(", "),
    }),
    [input, names, saju],
  );

  // 결과 조회 이벤트
  useEffect(() => {
    trackEvent({ ...trackData, event: "view" });
  }, [trackData]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.offsetWidth * 0.82;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setCurrentCard(Math.max(0, Math.min(2, idx)));
  };

  return (
    <div className="step">
      <Top
        upperGap={44}
        title={
          <Top.TitleParagraph size={28}>
            당신에게 어울리는 영어이름
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            사주 분석을 기반으로 추천했어요.
          </Top.SubtitleParagraph>
        }
      />

      {/* 사주 요약 */}
      <div className="saju-summary">
        <div className="saju-summary-title">나의 사주 오행</div>
        <div className="saju-elements">
          {(["wood", "fire", "earth", "metal", "water"] as const).map((el) => (
            <div
              key={el}
              className={`saju-el ${saju.weakElements.includes(el) ? "weak" : ""} ${saju.strongElements.includes(el) ? "strong" : ""}`}
            >
              <span className="saju-el-name">{ELEMENT_NAMES[el]}</span>
              <span className="saju-el-count">{saju.elementCounts[el]}</span>
            </div>
          ))}
        </div>
        {saju.weakElements.length > 0 && (
          <div className="saju-weak-msg">
            {saju.weakElements.map((el) => ELEMENT_NAMES[el]).join(", ")}의
            기운이 부족해요
          </div>
        )}
      </div>

      {/* 포켓몬 카드 슬라이드 */}
      <div className="poke-slide" ref={scrollRef} onScroll={handleScroll}>
        {names.map((rec, idx) => {
          const mainEl = rec.name.elements[0];
          const colors = ELEMENT_COLORS[mainEl];
          const emoji = pickEmoji(seed, idx, input.gender!);

          return (
            <div
              key={rec.name.name}
              className="poke-card"
              style={{
                background: `linear-gradient(180deg, ${colors.bg} 0%, #fff 60%)`,
                borderColor: colors.accent,
              }}
            >
              {/* 상단 헤더 */}
              <div className="poke-card-top">
                <span className="poke-card-rank" style={{ background: colors.accent }}>
                  {idx + 1}위
                </span>
                <span className="poke-card-element" style={{ color: colors.accent }}>
                  {ELEMENT_EMOJI[mainEl]} {ELEMENT_NAMES[mainEl]}
                </span>
              </div>

              {/* 캐릭터 이모지 */}
              <div className="poke-card-avatar">
                <div
                  className="poke-card-avatar-ring"
                  style={{ borderColor: colors.light }}
                >
                  <img
                    src={`${import.meta.env.BASE_URL}Result/${emoji}`}
                    alt=""
                    className="poke-card-avatar-img"
                  />
                </div>
              </div>

              {/* 이름 */}
              <div className="poke-card-name">{rec.name.name}</div>
              <div className="poke-card-pron">{rec.name.pronunciation}</div>

              {/* 구분선 */}
              <div className="poke-card-divider" style={{ borderColor: colors.light }} />

              {/* 정보 */}
              <div className="poke-card-info">
                <div className="poke-card-meaning">{rec.name.meaning}</div>
                <div className="poke-card-reason" style={{ color: colors.accent }}>
                  {rec.reason}
                </div>
                <div className="poke-card-phonetic">
                  🔤 {getPhoneticExplanation(rec.name.name)}
                </div>
              </div>

              {/* 하단 */}
              <div className="poke-card-footer">
                <div className="poke-card-personality">
                  ✨ {rec.name.personality}
                </div>
                <div className="poke-card-celeb">⭐ {rec.name.celebrity}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 인디케이터 */}
      <div className="poke-dots">
        {names.map((_, idx) => (
          <div
            key={idx}
            className={`poke-dot ${currentCard === idx ? "active" : ""}`}
          />
        ))}
      </div>

      {/* 오행 설명 */}
      {saju.weakElements.length > 0 && (
        <div className="element-tip">
          <div className="element-tip-title">
            💡 {ELEMENT_NAMES[saju.weakElements[0]]}이란?
          </div>
          <div className="element-tip-desc">
            {ELEMENT_TRAITS[saju.weakElements[0]]}를 의미해요. 이 기운을 가진
            이름을 사용하면 삶의 균형을 맞추는 데 도움이 될 수 있어요.
          </div>
        </div>
      )}

      <FixedBottomCTA onClick={() => {
        trackEvent({ ...trackData, event: "share" });
        if (navigator.share) {
          navigator.share({
            title: "와츄어네임 - 사주로 찾는 나만의 영어이름",
            text: `사주 분석 결과, 나에게 어울리는 영어이름은 "${names[0]?.name.name}"이래요! 너도 해봐 👉`,
            url: window.location.href,
          }).catch(() => {});
        } else {
          navigator.clipboard.writeText(
            `사주 분석 결과, 나에게 어울리는 영어이름은 "${names[0]?.name.name}"이래요! 너도 해봐 👉 ${window.location.href}`
          );
          alert("링크가 복사됐어요! 친구에게 보내주세요.");
        }
      }}>
        친구에게 알려주기
      </FixedBottomCTA>
    </div>
  );
}
