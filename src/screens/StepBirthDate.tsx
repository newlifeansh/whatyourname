import { FixedBottomCTA, Top } from "@toss/tds-mobile";
import { useState } from "react";
import { DatePickerSheet } from "../components/DatePickerSheet";

interface Props {
  value: string; // YYYYMMDD
  onChange: (v: string) => void;
  onNext: () => void;
}

function isValidDate(yyyymmdd: string): boolean {
  if (yyyymmdd.length !== 8) return false;
  const y = Number(yyyymmdd.slice(0, 4));
  const m = Number(yyyymmdd.slice(4, 6));
  const d = Number(yyyymmdd.slice(6, 8));
  if (y < 1950 || y > 2100) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function formatDisplay(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return "";
  return `${yyyymmdd.slice(0, 4)}.${yyyymmdd.slice(4, 6)}.${yyyymmdd.slice(6, 8)}`;
}

export function StepBirthDate({ value, onChange, onNext }: Props) {
  const [open, setOpen] = useState(false);

  const valid = isValidDate(value);

  // 시트 초기값: 입력값이 있으면 그 값, 없으면 2000-01-01
  const initial = valid
    ? {
        year: Number(value.slice(0, 4)),
        month: Number(value.slice(4, 6)),
        day: Number(value.slice(6, 8)),
      }
    : { year: 2000, month: 1, day: 1 };

  return (
    <div className="step">
      <Top
        upperGap={44}
        title={
          <Top.TitleParagraph size={28}>
            생년월일을 입력해주세요
          </Top.TitleParagraph>
        }
        subtitleBottom={
          <Top.SubtitleParagraph size={17}>
            양력 기준으로 알려주세요.
          </Top.SubtitleParagraph>
        }
      />

      <div className="step-field step-field-gap" onClick={() => setOpen(true)}>
        <div className="fake-input">
          <span className="fake-input-label">생년월일</span>
          <span className={`fake-input-value ${value ? "" : "placeholder"}`}>
            {value ? formatDisplay(value) : "예) 1987.07.15"}
          </span>
          <div className="fake-input-line" />
        </div>
      </div>

      <DatePickerSheet
        open={open}
        initial={initial}
        onClose={() => setOpen(false)}
        onConfirm={(yyyymmdd) => {
          onChange(yyyymmdd);
        }}
      />

      <FixedBottomCTA onClick={onNext} disabled={!valid}>
        다음
      </FixedBottomCTA>
    </div>
  );
}
