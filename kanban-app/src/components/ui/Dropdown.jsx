import { useEffect, useRef, useState } from "react";

/**
 * Custom-styled single-select. Replaces a native <select> so the open
 * menu matches the app's neumorphic design instead of the OS/browser
 * default popup, which can't be restyled cross-browser.
 */
export default function Dropdown({ value, options, onChange, className = "" }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={`dropdown${open ? " open" : ""} ${className}`} ref={rootRef}>
      <button type="button" className="dropdown-trigger" onClick={() => setOpen((o) => !o)}>
        {selected?.dot && <span className={`dot ${selected.dot}`} />}
        <span className="dropdown-label">{selected?.label}</span>
        <svg className="dropdown-chevron" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul className="dropdown-menu" role="listbox">
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`dropdown-item${opt.value === value ? " active" : ""}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.dot && <span className={`dot ${opt.dot}`} />}
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
