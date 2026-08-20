export const STATUSES = [
  { id: "todo", label: "To Do" },
  { id: "inprogress", label: "In Progress" },
  { id: "completed", label: "Completed" },
];

export const PRIORITIES = ["high", "medium", "low"];

export const STORAGE_KEY = "kanban-board:tasks:v1";
export const LIMITS_STORAGE_KEY = "kanban-board:limits:v1";

// In Progress ships with the classic Kanban WIP limit of 3; the other
// columns start unlimited (null) since capping To Do or Completed isn't
// standard practice. Any column's limit is user-editable from its header.
export const DEFAULT_LIMITS = { todo: null, inprogress: 3, completed: null };
