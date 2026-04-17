import { useEffect, useRef } from "react";

export const ITEM_HEIGHT = 52;
export const VISIBLE_ROWS = 5;
const PADDING_ROWS = (VISIBLE_ROWS - 1) / 2;

interface Props {
  items: (number | string)[];
  value: number | string;
  onChange: (v: number | string) => void;
  suffix?: string;
  align?: "left" | "right" | "center";
}

export function WheelColumn({
  items,
  value,
  onChange,
  suffix,
  align = "center",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<number | null>(null);
  const lastNotifiedIdx = useRef<number>(-1);

  useEffect(() => {
    const idx = items.findIndex((i) => i === value);
    if (idx < 0) return;
    const el = ref.current;
    if (!el) return;
    const target = idx * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 1) {
      el.scrollTop = target;
      lastNotifiedIdx.current = idx;
    }
  }, [value, items]);

  const handleScroll = () => {
    if (settleTimer.current != null) {
      window.clearTimeout(settleTimer.current);
    }
    settleTimer.current = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(items.length - 1, idx));
      const target = clamped * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - target) > 0.5) {
        el.scrollTo({ top: target, behavior: "smooth" });
      }
      if (clamped !== lastNotifiedIdx.current) {
        lastNotifiedIdx.current = clamped;
        onChange(items[clamped]);
      }
    }, 80);
  };

  return (
    <div
      className={`wheel-col wheel-align-${align}`}
      ref={ref}
      onScroll={handleScroll}
    >
      <div style={{ height: PADDING_ROWS * ITEM_HEIGHT }} />
      {items.map((it, idx) => {
        const selected = it === value;
        return (
          <div
            key={idx}
            className={`wheel-item ${selected ? "selected" : ""}`}
            style={{ height: ITEM_HEIGHT }}
          >
            {it}
            {suffix ?? ""}
          </div>
        );
      })}
      <div style={{ height: PADDING_ROWS * ITEM_HEIGHT }} />
    </div>
  );
}
