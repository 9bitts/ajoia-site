"use client";

import { useEffect, useId, useRef, useState } from "react";

const STORAGE_KEY = "ajoia-maintenance-dismissed";

export function MaintenanceNotice() {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="maintenance-notice" role="presentation">
      <button
        type="button"
        className="maintenance-notice__backdrop"
        aria-label="Fechar aviso de manutenção"
        onClick={dismiss}
      />
      <div
        className="maintenance-notice__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <p className="maintenance-notice__kicker">Ajoia Brasil</p>
        <h2 id={titleId} className="maintenance-notice__title">
          Site em manutenção
        </h2>
        <p className="maintenance-notice__text">
          Estamos fazendo ajustes no portal. Algumas páginas podem ficar
          indisponíveis por alguns instantes.
        </p>
        <button
          ref={closeRef}
          type="button"
          className="btn-gold maintenance-notice__close"
          onClick={dismiss}
        >
          Entendi
        </button>
      </div>
    </div>
  );
}
