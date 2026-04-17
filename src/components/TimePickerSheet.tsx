import { Button } from "@toss/tds-mobile";
import { useEffect, useState } from "react";
import { SimpleSheet } from "./SimpleSheet";
import { ITEM_HEIGHT, VISIBLE_ROWS, WheelColumn } from "./WheelPicker";

interface Props {
  open: boolean;
  initial: { hour: number; minute: number };
  onClose: () => void;
  onConfirm: (hhmm: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function TimePickerSheet({ open, initial, onClose, onConfirm }: Props) {
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  useEffect(() => {
    if (open) {
      setHour(initial.hour);
      setMinute(initial.minute);
    }
  }, [open, initial.hour, initial.minute]);

  const handleConfirm = () => {
    const hhmm = `${pad2(hour)}${pad2(minute)}`;
    onClose();
    onConfirm(hhmm);
  };

  return (
    <SimpleSheet open={open} onClose={onClose} title="태어난 시간">
      <div
        className="wheel-wrap"
        style={{ height: ITEM_HEIGHT * VISIBLE_ROWS }}
      >
        <div className="wheel-cols">
          <div className="wheel-selected-row" />
          <WheelColumn
            items={HOURS}
            value={hour}
            onChange={(v) => setHour(Number(v))}
            suffix="시"
            align="right"
          />
          <WheelColumn
            items={MINUTES}
            value={minute}
            onChange={(v) => setMinute(Number(v))}
            suffix="분"
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
