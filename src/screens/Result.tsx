import { FixedBottomCTA, Top } from "@toss/tds-mobile";
import html2canvas from "html2canvas";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { showUnlockAd } from "../engine/ad";
import { trackEvent } from "../engine/analytics";
import { getNameImage } from "../engine/nameImage";
import { matchNames } from "../engine/matchNames";
import { getPhoneticExplanation } from "../engine/phonetic";
import type { Element } from "../engine/saju";
import { ELEMENT_NAMES, ELEMENT_TRAITS, calculateSaju } from "../engine/saju";
import type { SajuInput } from "../types";

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

const NAME_IMAGE_VERSION = "20260513";

function getSajuFitPercent(score: number, minScore: number, maxScore: number) {
  if (maxScore <= minScore) return 90;

  const normalizedScore = (score - minScore) / (maxScore - minScore);
  return Math.round(76 + normalizedScore * 19);
}

interface Props {
  input: SajuInput;
}

export function Result({ input }: Props) {
  const [currentCard, setCurrentCard] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [sharing, setSharing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const result = useMemo(() => {
    const saju = calculateSaju(input.birthDate, input.birthTime);
    const names = matchNames(saju, input.gender!);
    return { saju, names };
  }, [input]);

  const { saju, names } = result;

  // 현재 표시할 이름 목록: 처음 3개 또는 잠금 해제 시 전체 10개
  const visibleNames = unlocked ? names : names.slice(0, 3);
  const maxFitScore = names[0]?.score ?? 0;
  const minFitScore = names[names.length - 1]?.score ?? maxFitScore;
  // 전체 슬라이드 수: 이름 카드 + (잠금 해제 전이면 광고CTA 1장)
  const totalSlides = unlocked ? visibleNames.length : visibleNames.length + 1;

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

  useEffect(() => {
    trackEvent({ ...trackData, event: "view" });
  }, [trackData]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.offsetWidth * 0.82;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setCurrentCard(Math.max(0, Math.min(totalSlides - 1, idx)));
  };

  // 광고 보고 7개 더 추천받기
  const handleUnlock = useCallback(() => {
    showUnlockAd(() => {
      setUnlocked(true);
    });
  }, []);

  const textOnlyShare = useCallback(() => {
    const text = `사주 분석 결과, 나에게 어울리는 영어이름은 "${names[0]?.name.name}"이래요! 너도 해봐 👉\n`;
    if (navigator.share) {
      navigator.share({
        title: "와츄어네임 - 사주로 찾는 나만의 영어이름",
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`).catch(() => {});
      alert("링크가 복사됐어요! 친구에게 보내주세요.");
    }
  }, [names]);

  // 1순위 카드 이미지 생성 후 공유
  const handleShare = useCallback(async () => {
    trackEvent({ ...trackData, event: "share" });

    const cardEl = cardRefs.current[0];
    if (!cardEl) {
      textOnlyShare();
      return;
    }

    setSharing(true);
    try {
      const canvas = await html2canvas(cardEl, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );

      if (!blob) {
        textOnlyShare();
        return;
      }

      const shareText = `사주 분석 결과, 나에게 어울리는 영어이름은 "${names[0]?.name.name}"이래요! 너도 해봐 👉\n`;
      const file = new File([blob], "whatyourname.png", { type: "image/png" });

      // 1차: 이미지 파일 포함 공유 시도
      try {
        const shareData: ShareData = {
          title: "와츄어네임 - 사주로 찾는 나만의 영어이름",
          text: shareText,
          url: window.location.href,
          files: [file],
        };

        if (navigator.canShare?.(shareData)) {
          await navigator.share(shareData);
          return;
        }
      } catch {
        // 파일 공유 실패 → 아래로
      }

      // 2차: 이미지 저장 + 링크 복사 + 팝업 (Android 폴백)
      try {
        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "whatyourname.png";
        link.click();
      } catch {
        // 다운로드 실패해도 링크 복사는 진행
      }

      try {
        await navigator.clipboard.writeText(`${shareText}${window.location.href}`);
      } catch {
        // clipboard 실패 무시
      }

      alert("카드 이미지가 저장되었어요!\n복사된 링크로 친구에게 공유해보세요.");
    } catch {
      textOnlyShare();
    } finally {
      setSharing(false);
    }
  }, [trackData, names, textOnlyShare]);

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
        {visibleNames.map((rec, idx) => {
          const mainEl = rec.name.elements[0];
          const colors = ELEMENT_COLORS[mainEl];
          const imagePath = getNameImage(rec.name);
          const fitPercent = getSajuFitPercent(rec.score, minFitScore, maxFitScore);
          const phoneticExplanation = rec.phoneticExplanationElement
            ? getPhoneticExplanation(rec.name.name, rec.phoneticExplanationElement)
            : "";

          return (
            <div
              key={rec.name.name}
              ref={(el) => { cardRefs.current[idx] = el; }}
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
                    src={`${import.meta.env.BASE_URL}${imagePath}?v=${NAME_IMAGE_VERSION}`}
                    alt=""
                    className="poke-card-avatar-img"
                  />
                </div>
              </div>

              {/* 이름 */}
              <div className="poke-card-name">{rec.name.name}</div>
              <div className="poke-card-pron">{rec.name.pronunciation}</div>
              <div className="poke-card-fit" style={{ color: colors.accent }}>
                사주 적합도 {fitPercent}%
              </div>

              {/* 구분선 */}
              <div className="poke-card-divider" style={{ borderColor: colors.light }} />

              {/* 정보 */}
              <div className="poke-card-info">
                <div className="poke-card-meaning">{rec.name.meaning}</div>
                <div className="poke-card-reason" style={{ color: colors.accent }}>
                  {rec.reason}
                </div>
                {rec.evidence.length > 1 ? (
                  <div className="poke-card-evidence-list">
                    {rec.evidence.slice(1).map((evidence) => (
                      <div key={evidence} className="poke-card-evidence-item">
                        {evidence}
                      </div>
                    ))}
                  </div>
                ) : null}
                {phoneticExplanation ? (
                  <div className="poke-card-phonetic">
                    {phoneticExplanation}
                  </div>
                ) : null}
              </div>

              {/* 하단 */}
              <div className="poke-card-footer">
                <div className="poke-card-personality">
                  {rec.name.personality}
                </div>
                <div className="poke-card-celeb">{rec.name.celebrity}</div>
              </div>
            </div>
          );
        })}

        {/* 광고 CTA 슬라이드 (잠금 해제 전에만 표시) */}
        {!unlocked && (
          <div className="poke-card poke-card-ad" onClick={handleUnlock}>
            <div className="poke-ad-content">
              <div className="poke-ad-icon">+7</div>
              <div className="poke-ad-title">이름 7개 더 추천받기</div>
              <div className="poke-ad-desc">
                짧은 광고를 보고<br />추가 추천을 받아보세요
              </div>
              <div className="poke-ad-btn">광고 보고 잠금 해제</div>
            </div>
          </div>
        )}
      </div>

      {/* 인디케이터 */}
      <div className="poke-dots">
        {Array.from({ length: totalSlides }, (_, idx) => (
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
            {ELEMENT_NAMES[saju.weakElements[0]]}이란?
          </div>
          <div className="element-tip-desc">
            {ELEMENT_TRAITS[saju.weakElements[0]]}를 의미해요. 이 기운을 가진
            이름을 사용하면 삶의 균형을 맞추는 데 도움이 될 수 있어요.
          </div>
        </div>
      )}

      <FixedBottomCTA onClick={handleShare} disabled={sharing}>
        {sharing ? "이미지 생성 중..." : "친구에게 공유하기"}
      </FixedBottomCTA>
    </div>
  );
}
