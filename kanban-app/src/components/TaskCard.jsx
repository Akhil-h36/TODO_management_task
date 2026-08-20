import { useEffect, useState } from "react";
import { useDraggableCard } from "../hooks/useDraggableCard";
import { fmtDate, isOverdue, tiltFor } from "../utils/helpers";
import { renderFormattedText } from "../utils/richText";
import ConfirmDialog from "./ConfirmDialog";

export default function TaskCard({ task, onOpen, onDelete, onMove, justMoved, onSettled }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const tilt = tiltFor(task.id);
  const { cardRef, handlePointerDown } = useDraggableCard({
    tilt,
    onDrop: (status) => {
      if (status !== task.status) onMove(task.id, status);
    },
    onClick: () => onOpen(task.id, cardRef.current),
  });

  useEffect(() => {
    if (!justMoved) return;
    const el = cardRef.current;
    if (!el) return;
    const clear = () => onSettled();
    el.addEventListener("animationend", clear, { once: true });
    return () => el.removeEventListener("animationend", clear);
  }, [justMoved, onSettled, cardRef]);

  const overdue = isOverdue(task);

  return (
    <div
      ref={cardRef}
      className={`card${overdue ? " overdue" : ""}${justMoved ? " settle" : ""}`}
      style={{ "--tilt": tilt }}
      onPointerDown={handlePointerDown}
    >
      <div className="card-actions">
        <button
          className="icon-btn del-btn"
          data-no-drag
          title="Delete"
          onClick={(e) => {
            e.stopPropagation();
            setConfirmOpen(true);
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
          </svg>
        </button>
      </div>
      <h3>{task.title}</h3>
      <p className="desc">{renderFormattedText(task.desc)}</p>
      <div className="card-meta">
        <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
        <span className="due-tag">
          {overdue ? "Overdue · " : ""}
          {fmtDate(task.due)}
        </span>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        message={
          <>
            Delete <strong>&ldquo;{task.title}&rdquo;</strong>?
          </>
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onDelete(task.id);
        }}
      />
    </div>
  );
}
