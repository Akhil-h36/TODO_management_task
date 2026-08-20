import { useMemo, useState } from "react";
import Column from "./Column";
import { STATUSES } from "../utils/constants";
import { useTaskActions, useTaskState } from "../context/TaskContext";

export default function Board({ onOpenTask, onAddTask }) {
  const { tasks, searchTerm, activeFilter, limits } = useTaskState();
  const { deleteTask, moveTask, setColumnLimit } = useTaskActions();
  const [justMovedId, setJustMovedId] = useState(null);
  const [blockedColumn, setBlockedColumn] = useState(null);

  const tasksByColumn = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const map = {};
    for (const { id: status } of STATUSES) {
      const all = tasks.filter((t) => t.status === status);
      const visible = all.filter((t) => {
        const matchesFilter = activeFilter === "all" || t.priority === activeFilter;
        const matchesSearch = !term || `${t.title} ${t.desc}`.toLowerCase().includes(term);
        return matchesFilter && matchesSearch;
      });
      map[status] = { all, visible };
    }
    return map;
  }, [tasks, searchTerm, activeFilter]);

  function handleMove(id, status) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;

    const limit = limits[status];
    const currentCount = tasksByColumn[status].all.length;
    if (limit && currentCount >= limit) {
      setBlockedColumn(status);
      return;
    }

    moveTask(id, status);
    setJustMovedId(id);
  }

  return (
    <div className="board">
      {STATUSES.map(({ id: status, label }) => (
        <Column
          key={status}
          status={status}
          label={label}
          allTasksInColumn={tasksByColumn[status].all}
          visibleTasks={tasksByColumn[status].visible}
          justMovedId={justMovedId}
          limit={limits[status]}
          isBlocked={blockedColumn === status}
          onOpen={onOpenTask}
          onDelete={deleteTask}
          onMove={handleMove}
          onAdd={onAddTask}
          onSettled={() => setJustMovedId(null)}
          onBlockedSettled={() => setBlockedColumn(null)}
          onSetLimit={setColumnLimit}
        />
      ))}
    </div>
  );
}
