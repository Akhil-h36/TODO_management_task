import { useEffect, useRef, useState } from "react";
import { fmtDateLong, isSameDay, parseISO, toISO } from "../../utils/helpers";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/**
 * Custom calendar popup. Replaces a native <input type="date"> so the
 * picker matches the app's design instead of the OS-native calendar,
 * which can't be restyled via CSS.
 */
export default function DatePicker({ value, onChange, className = "", hasError = false }) {
  const [open, setOpen] = useState(false);
  const selected = parseISO(value);
  const [viewDate, setViewDate] = useState(selected || new Date());
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) setViewDate(selected || new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells = Array(startWeekday).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  function selectDay(d) {
    onChange(toISO(new Date(year, month, d)));
    setOpen(false);
  }

  return (
    <div className={`datepicker${open ? " open" : ""}${hasError ? " error" : ""} ${className}`} ref={rootRef}>
      <button type="button" className="datepicker-trigger" onClick={() => setOpen((o) => !o)}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        <span className={value ? "" : "placeholder"}>{value ? fmtDateLong(value) : "Select date"}</span>
      </button>
      {open && (
        <div className="datepicker-pop">
          <div className="datepicker-head">
            <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} aria-label="Previous month">
              ‹
            </button>
            <span>{viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="datepicker-weekdays">
            {WEEKDAYS.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>
          <div className="datepicker-grid">
            {cells.map((d, i) => {
              if (d === null) return <span key={i} className="datepicker-cell empty" />;
              const cellDate = new Date(year, month, d);
              return (
                <button
                  type="button"
                  key={i}
                  className={`datepicker-cell${isSameDay(cellDate, selected) ? " selected" : ""}${isSameDay(cellDate, today) ? " today" : ""}`}
                  onClick={() => selectDay(d)}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
