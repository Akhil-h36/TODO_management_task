import { useEffect, useRef, useState } from "react";
import { useTaskActions, useTaskState } from "../context/TaskContext";
import { fmtDate, isOverdue } from "../utils/helpers";
import { renderFormattedText } from "../utils/richText";
import Dropdown from "./ui/Dropdown";
import DatePicker from "./ui/DatePicker";
import ConfirmDialog from "./ConfirmDialog";

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low priority", dot: "low" },
  { value: "medium", label: "Medium priority", dot: "medium" },
  { value: "high", label: "High priority", dot: "high" },
];

function makeDraft(task) {
  return {
    title: task?.title ?? "",
    desc: task?.desc ?? "",
    priority: task?.priority ?? "medium",
    due: task?.due ?? "",
  };
}

export default function TaskModal({ modalState, onClose, onRequestEdit }) {
  const { tasks } = useTaskState();
  const { addTask, updateTask, deleteTask } = useTaskActions();
  const paperRef = useRef(null);
  const titleInputRef = useRef(null);
  const descRef = useRef(null);

  const [isClosing, setIsClosing] = useState(false);
  const visible = modalState.mode !== "closed" || isClosing;
  const isEditing = modalState.mode === "edit" || modalState.mode === "new";
  const task = modalState.taskId ? tasks.find((t) => t.id === modalState.taskId) : null;

  const [draft, setDraft] = useState(() => makeDraft(task));
  const [errors, setErrors] = useState({ title: false, due: false, desc: false });
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Reset the draft whenever a different task (or a fresh "new task" form) opens.
  useEffect(() => {
    if (modalState.mode !== "closed") {
      setDraft(makeDraft(task));
      setErrors({ title: false, due: false, desc: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.taskId, modalState.mode]);

  // Grow-from-card open animation, matching the mockup's scale-from-origin effect.
  useEffect(() => {
    if (modalState.mode === "closed") return;
    const paper = paperRef.current;
    if (!paper) return;
    const origin = modalState.originEl;

    paper.style.transition = "none";
    if (origin && origin.isConnected) {
      const pr = paper.getBoundingClientRect();
      const r = origin.getBoundingClientRect();
      const ox = r.left + r.width / 2 - pr.left;
      const oy = r.top + r.height / 2 - pr.top;
      paper.style.transformOrigin = `${ox}px ${oy}px`;
      paper.style.transform = "scale(0.08) rotate(8deg)";
    } else {
      paper.style.transformOrigin = "50% 50%";
      paper.style.transform = "scale(0.85)";
    }
    paper.style.opacity = "0";

    const raf = requestAnimationFrame(() => {
      paper.style.transition = "transform .4s cubic-bezier(.22,1,.36,1), opacity .22s ease";
      paper.style.transform = "scale(1) rotate(0deg)";
      paper.style.opacity = "1";
    });

    if (isEditing) {
      const t = setTimeout(() => titleInputRef.current?.focus(), 150);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(t);
      };
    }
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalState.mode, modalState.taskId]);

  function requestClose() {
    const paper = paperRef.current;
    if (paper) {
      paper.style.transition = "transform .18s ease, opacity .18s ease";
      paper.style.transform = "scale(0.92)";
      paper.style.opacity = "0";
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 160);
  }

  function handleSave() {
    const title = draft.title.trim();
    const desc = draft.desc.trim();
    const due = draft.due;
    const nextErrors = { title: !title, due: !due, desc: !desc };
    if (nextErrors.title || nextErrors.due || nextErrors.desc) {
      setErrors(nextErrors);
      if (nextErrors.title) titleInputRef.current?.focus();
      return;
    }
    const fields = { title, desc, priority: draft.priority, due };
    if (task) {
      updateTask(task.id, fields);
    } else {
      addTask({ ...fields, status: modalState.pendingStatus });
    }
    requestClose();
  }

  function wrapDescSelection(marker) {
    const el = descRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd);
    const nextValue = value.slice(0, selectionStart) + marker + selected + marker + value.slice(selectionEnd);

    setDraft((d) => ({ ...d, desc: nextValue }));
    if (errors.desc) setErrors((er) => ({ ...er, desc: false }));

    requestAnimationFrame(() => {
      el.focus();
      const cursorStart = selectionStart + marker.length;
      el.setSelectionRange(cursorStart, cursorStart + selected.length);
    });
  }

  function handleConfirmDelete() {
    if (task) deleteTask(task.id);
    setConfirmOpen(false);
    requestClose();
  }

  if (!visible) return null;

  return (
    <div
      className={`overlay${modalState.mode !== "closed" ? " open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div className="big-paper" ref={paperRef}>
        <div className="pv-icons">
          {task && (
            <button className="pv-icon-btn" title="Delete" onClick={() => setConfirmOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M3 6h18" />
                <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
              </svg>
            </button>
          )}
          <button
            className={`pv-icon-btn${isEditing ? " save" : ""}`}
            title={isEditing ? "Save" : "Edit"}
            onClick={() => (isEditing ? handleSave() : onRequestEdit())}
          >
            {isEditing ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            )}
          </button>
          <button className="pv-icon-btn" title="Close" onClick={requestClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="big-paper-header" />
        <div className="big-paper-body">
        {isEditing ? (
          <div>
            <input
              ref={titleInputRef}
              className={`pv-title-input${errors.title ? " error" : ""}`}
              type="text"
              placeholder="Task title"
              value={draft.title}
              onChange={(e) => {
                setDraft((d) => ({ ...d, title: e.target.value }));
                if (errors.title) setErrors((er) => ({ ...er, title: false }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            {errors.title && <p className="field-error">Enter details</p>}

            <div className="pv-row">
              <div className="pv-field">
                <Dropdown
                  value={draft.priority}
                  options={PRIORITY_OPTIONS}
                  onChange={(v) => setDraft((d) => ({ ...d, priority: v }))}
                />
              </div>
              <div className="pv-field">
                <DatePicker
                  value={draft.due}
                  hasError={errors.due}
                  onChange={(v) => {
                    setDraft((d) => ({ ...d, due: v }));
                    if (errors.due) setErrors((er) => ({ ...er, due: false }));
                  }}
                />
                {errors.due && <p className="field-error">Enter details</p>}
              </div>
            </div>

            <div className="rt-toolbar">
              <button type="button" className="rt-btn" title="Bold selected text" onClick={() => wrapDescSelection("**")}>
                <strong>B</strong>
              </button>
              <button type="button" className="rt-btn" title="Highlight selected text" onClick={() => wrapDescSelection("==")}>
                <span className="rt-highlight-swatch">H</span>
              </button>
              <span className="rt-hint">Select text, then Bold or Highlight</span>
            </div>
            <textarea
              ref={descRef}
              className={`pv-desc-input${errors.desc ? " error" : ""}`}
              placeholder="Add a description..."
              value={draft.desc}
              onChange={(e) => {
                setDraft((d) => ({ ...d, desc: e.target.value }));
                if (errors.desc) setErrors((er) => ({ ...er, desc: false }));
              }}
            />
            {errors.desc && <p className="field-error">Enter details</p>}
          </div>
        ) : task ? (
          <div>
            <span className={`pv-priority-tag ${task.priority}`}>{task.priority}</span>
            <h2 className="pv-title">{task.title}</h2>
            <p className="pv-due">
              {isOverdue(task) ? "Overdue · " : "Due "}
              {fmtDate(task.due)}
            </p>
            <p className="pv-desc">{task.desc ? renderFormattedText(task.desc) : <em>No description.</em>}</p>
          </div>
        ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        message={
          <>
            Delete <strong>&ldquo;{task?.title ?? ""}&rdquo;</strong>?
          </>
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
