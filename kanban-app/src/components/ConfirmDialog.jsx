import { createPortal } from "react-dom";

/**
 * Rendered via a portal to document.body so it lands correctly even when
 * triggered from inside a rotated .card (a CSS transform on an ancestor
 * would otherwise reposition a plain `position: fixed` child).
 */
export default function ConfirmDialog({
  open,
  message,
  subtext = "This can't be undone.",
  confirmLabel = "Delete",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="confirm-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="confirm-box">
        <p className="confirm-title">{message}</p>
        <p className="confirm-sub">{subtext}</p>
        <div className="confirm-actions">
          <button type="button" className="confirm-btn cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="confirm-btn danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
