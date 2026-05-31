"use client";

import { useEffect, useState } from "react";

type LeadSuccessToastProps = {
  open: boolean;
  onClose: () => void;
};

export default function LeadSuccessToast({ open, onClose }: LeadSuccessToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const animationFrame = window.requestAnimationFrame(() => setVisible(true));
    const timer = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(onClose, 200);
    }, 5000);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 w-[min(92vw,22rem)] rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-lg transition-all duration-300 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
          ✅
        </div>
        <p className="flex-1 text-sm font-medium text-emerald-950">Thanks! Our team will be in touch soon.</p>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            window.setTimeout(onClose, 200);
          }}
          className="text-lg leading-none text-emerald-700 transition hover:text-emerald-900"
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}