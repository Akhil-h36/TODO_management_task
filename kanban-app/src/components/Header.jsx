import { useState } from "react";
import { useTaskActions, useTaskState } from "../context/TaskContext";
import ConfirmDialog from "./ConfirmDialog";

export default function Header({ onNewTask }) {
  const { searchTerm, setSearchTerm, tasks } = useTaskState();
  const { clearAll } = useTaskActions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header>
      <div className="title-block">
        <h1>Kanban Board</h1>
        <p>Drag it. Drop it. Done.</p>
      </div>
      <div className="header-actions">
        <div className="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="btn-wipe"
          disabled={tasks.length === 0}
          title="Delete all tasks"
          onClick={() => setConfirmOpen(true)}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 6h18" />
            <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
            <path d="M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
          </svg>
          Wipe All
        </button>
        <button className="btn-new" onClick={onNewTask}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Task
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        message="Delete all tasks?"
        subtext={`This removes all ${tasks.length} task${tasks.length === 1 ? "" : "s"} from every column. This can't be undone.`}
        confirmLabel="Delete All"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          clearAll();
          setConfirmOpen(false);
        }}
      />
    </header>
  );
}
