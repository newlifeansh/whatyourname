import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function SimpleSheet({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-header">{title}</div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>
  );
}
