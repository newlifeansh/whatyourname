import { Checkbox, FixedBottomCTA, Top } from "@toss/tds-mobile";
import { useState } from "react";
import { TimePickerSheet } from "../components/TimePickerSheet";

interface Props {
  value: string | null; // HHMM | null(모름)
  onChange: (v: string | null) => void;
  onSubmit: () => void;
}

function isValidTime(hhmm: string): boolean {
  if (hhmm.length !== 4) return false;
  const h = Number(hhmm.slice(0, 2));
  const m = Number(hhmm.slice(2, 4));
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function formatDisplay(hhmm: string): string {
  if (hhmm.length !== 4) return "";
  return `${hhmm.slice(0, 2)}:${hhmm.slice(2, 4)}`;
}

export function StepBirthTime({ value, onChange, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const unknown = value === null;
  const valid = unknown || isValidTime(value ?? "");

  const initial =
    value && isValidTime(value)
      ? { hour: Number(value.slice(0, 2)), minute: Number(value.slice(2, 4)) }
      : { hour: 12, minute: 0 };

  return (
    <div className="step">
      <Top
        upperGap={44}
        title={
          <Top.TitleParagraph size={28}>
            태어난 시간을 알려주세요
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            시간을 모르면 아래에서 체크해주세요.
          </Top.SubtitleParagraph>
        }
      />

      <div className="step-field step-field-gap">
        <div onClick={() => { if (!unknown) setOpen(true); }}>
          <div className={`fake-input ${unknown ? "disabled" : ""}`}>
            <span className="fake-input-label">태어난 시간</span>
            <span className={`fake-input-value ${!unknown && value && isValidTime(value) ? "" : "placeholder"}`}>
              {unknown ? "시간을 몰라요" : (value && isValidTime(value) ? formatDisplay(value) : "예) 14:30")}
            </span>
            <div className="fake-input-line" />
          </div>
        </div>

        <label className="unknown-row">
          <Checkbox.Circle
            checked={unknown}
            onCheckedChange={(c) => onChange(c ? null : "")}
            aria-label="태어난 시간을 몰라요"
          />
          <span>태어난 시간을 몰라요</span>
        </label>
      </div>

      <TimePickerSheet
        open={open}
        initial={initial}
        onClose={() => setOpen(false)}
        onConfirm={(hhmm) => {
          onChange(hhmm);
        }}
      />

      <FixedBottomCTA
        onClick={onSubmit}
        disabled={!valid}
        topAccessory={
          <div className="cta-disclaimer">
            광고를 보는 동안 사주를 분석해드릴게요.
          </div>
        }
      >
        10초 광고보고 결과보기
      </FixedBottomCTA>
    </div>
  );
}
