import { useMemo, useState } from "react";
import Column from "./Column";
import { STATUSES } from "../utils/constants";
import { useTaskActions, useTaskState } from "../context/TaskContext";

export default function Board({ onOpenTask, onAddTask }) {
  const { tasks, searchTerm, activeFilter } = useTaskState();
  const { deleteTask, moveTask } = useTaskActions();
  const [justMovedId, setJustMovedId] = useState(null);

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
          onOpen={onOpenTask}
          onDelete={deleteTask}
          onMove={handleMove}
          onAdd={onAddTask}
          onSettled={() => setJustMovedId(null)}
        />
      ))}
    </div>
  );
}
