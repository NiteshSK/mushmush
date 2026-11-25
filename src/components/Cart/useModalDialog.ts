"use client";

import { useEffect, useRef } from "react";

/**
 * Opens a native <dialog> as a modal while the component is mounted.
 * The browser keeps focus inside it and fires "cancel" on Escape. When it closes,
 * focus returns to `returnFocus()` or, by default, to the control that opened it.
 */
export function useModalDialog(returnFocus?: () => HTMLElement | null | undefined) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef(returnFocus);
  returnTo.current = returnFocus;

  useEffect(() => {
    const element = ref.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (element && !element.open) {
      // jsdom has no showModal(); open the element so tests can still read it.
      if (typeof element.showModal === "function") element.showModal();
      else element.setAttribute("open", "");
    }
    element?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      if (element?.open && typeof element.close === "function") element.close();
      document.body.style.overflow = previous;
      const target = returnTo.current?.() ?? trigger;
      if (target?.isConnected) target.focus();
    };
  }, []);

  return ref;
}
