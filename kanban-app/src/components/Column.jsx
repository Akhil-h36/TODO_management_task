import TaskCard from "./TaskCard";

export default function Column({ status, label, allTasksInColumn, visibleTasks, justMovedId, onOpen, onDelete, onMove, onAdd, onSettled }) {
  return (
    <div className="column" data-status={status}>
      <div className="col-head">
        <h2>{label}</h2>
        <span className="count-badge">{allTasksInColumn.length}</span>
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
      <button className="add-inline" onClick={(e) => onAdd(status, e.currentTarget)}>
        + Add task
      </button>
    </div>
  );
}
