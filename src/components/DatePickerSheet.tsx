import { Button } from "@toss/tds-mobile";
import { useEffect, useMemo, useState } from "react";
import { SimpleSheet } from "./SimpleSheet";
import { ITEM_HEIGHT, VISIBLE_ROWS, WheelColumn } from "./WheelPicker";

interface Props {
  open: boolean;
  initial: { year: number; month: number; day: number };
  onClose: () => void;
  onConfirm: (yyyymmdd: string) => void;
}

const NOW_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: NOW_YEAR - 1950 + 1 }, (_, i) => 1950 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function DatePickerSheet({ open, initial, onClose, onConfirm }: Props) {
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);

  useEffect(() => {
    if (open) {
      setYear(initial.year);
      setMonth(initial.month);
      setDay(initial.day);
    }
  }, [open, initial.year, initial.month, initial.day]);

  const days = useMemo(() => {
    const max = getDaysInMonth(year, month);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [year, month]);

  useEffect(() => {
    const max = getDaysInMonth(year, month);
    if (day > max) setDay(max);
  }, [year, month, day]);

  const handleConfirm = () => {
    const yyyymmdd = `${year}${pad2(month)}${pad2(day)}`;
    onClose();
    onConfirm(yyyymmdd);
  };

  return (
    <SimpleSheet open={open} onClose={onClose} title="생년월일">
      <div
        className="wheel-wrap"
        style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}
      >
        <div className="wheel-cols">
          <div className="wheel-selected-row" />
          <WheelColumn
            items={YEARS}
            value={year}
            onChange={(v) => setYear(Number(v))}
            suffix="년"
            align="right"
          />
          <WheelColumn
            items={MONTHS}
            value={month}
            onChange={(v) => setMonth(Number(v))}
            suffix="월"
            align="center"
          />
          <WheelColumn
            items={days}
            value={day}
            onChange={(v) => setDay(Number(v))}
            suffix="일"
            align="left"
          />
        </div>
      </div>
      <div style={{ padding: "16px 24px 24px" }}>
        <Button
          display="block"
          size="xlarge"
          color="primary"
          onClick={handleConfirm}
        >
          선택하기
        </Button>
      </div>
    </SimpleSheet>
  );
}
