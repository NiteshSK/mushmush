import { useEffect, useRef } from "react";

export function useUnsavedDraft() {
  const changed = useRef(false);
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (changed.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const navigate = (e: MouseEvent) => {
      if (!changed.current || e.defaultPrevented || e.ctrlKey || e.metaKey || !(e.target instanceof Element))
        return;
      const link = e.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.href === location.href) return;
      if (!window.confirm("Leave this draft and discard unsaved changes?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", unload);
    document.addEventListener("click", navigate, true);
    return () => {
      window.removeEventListener("beforeunload", unload);
      document.removeEventListener("click", navigate, true);
    };
  }, []);
  return {
    markDirty: () => {
      changed.current = true;
    },
    markSaved: () => {
      changed.current = false;
    },
    leave: () => !changed.current || window.confirm("Discard unsaved changes?"),
  };
}
