import { FixedBottomCTA, Top } from "@toss/tds-mobile";
import type { Gender } from "../types";

interface Props {
  value: Gender | null;
  onChange: (gender: Gender) => void;
  onNext: () => void;
}

export function StepGender({ value, onChange, onNext }: Props) {
  return (
    <div className="step">
      <Top
        upperGap={44}
        title={
          <Top.TitleParagraph size={28}>
            성별을 알려주세요
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            사주 풀이와 이름 추천에 사용돼요.
          </Top.SubtitleParagraph>
        }
      />

      <div className="gender-grid">
        <button
          type="button"
          className={`gender-card ${value === "male" ? "selected" : ""}`}
          onClick={() => onChange("male")}
        >
          <img
            className="gender-img"
            src={`${import.meta.env.BASE_URL}boy.png`}
            alt="남자"
          />
          <span className="gender-label">남자</span>
        </button>
        <button
          type="button"
          className={`gender-card ${value === "female" ? "selected" : ""}`}
          onClick={() => onChange("female")}
        >
          <img
            className="gender-img"
            src={`${import.meta.env.BASE_URL}girl.png`}
            alt="여자"
          />
          <span className="gender-label">여자</span>
        </button>
      </div>

      <FixedBottomCTA onClick={onNext} disabled={value == null}>
        다음
      </FixedBottomCTA>
    </div>
  );
}
