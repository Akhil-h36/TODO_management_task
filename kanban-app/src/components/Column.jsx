import TaskCard from "./TaskCard";
import Dropdown from "./ui/Dropdown";

const LIMIT_OPTIONS = [
  { value: "none", label: "No limit" },
  { value: "2", label: "Max 2" },
  { value: "3", label: "Max 3" },
  { value: "4", label: "Max 4" },
  { value: "5", label: "Max 5" },
  { value: "8", label: "Max 8" },
];

export default function Column({
  status,
  label,
  allTasksInColumn,
  visibleTasks,
  justMovedId,
  limit,
  isBlocked,
  onOpen,
  onDelete,
  onMove,
  onAdd,
  onSettled,
  onBlockedSettled,
  onSetLimit,
}) {
  const count = allTasksInColumn.length;
  const atLimit = limit != null && count >= limit;
  const overLimit = limit != null && count > limit;

  return (
    <div
      className={`column${isBlocked ? " limit-blocked" : ""}`}
      data-status={status}
      onAnimationEnd={() => isBlocked && onBlockedSettled()}
    >
      <div className="col-head">
        <h2>{label}</h2>
        <div className="col-head-right">
          <Dropdown
            className="limit-dropdown"
            value={limit == null ? "none" : String(limit)}
            options={LIMIT_OPTIONS}
            onChange={(v) => onSetLimit(status, v === "none" ? null : Number(v))}
          />
          <span className={`count-badge${overLimit ? " over-limit" : atLimit ? " at-limit" : ""}`}>
            {limit != null ? `${count}/${limit}` : count}
          </span>
        </div>
      </div>
      <div className="card-list">
        {visibleTasks.length === 0 ? (
          <div className="empty-state">
            {allTasksInColumn.length === 0 ? "Nothing here yet." : "No matches."}
          </div>
        ) : (
          visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={onOpen}
              onDelete={onDelete}
              onMove={onMove}
              justMoved={task.id === justMovedId}
              onSettled={onSettled}
            />
          ))
        )}
      </div>
      <button
        className="add-inline"
        disabled={atLimit}
        title={atLimit ? `${label} is at its limit (${count}/${limit})` : undefined}
        onClick={(e) => onAdd(status, e.currentTarget)}
      >
        {atLimit ? `Limit reached (${count}/${limit})` : "+ Add task"}
      </button>
    </div>
  );
}
