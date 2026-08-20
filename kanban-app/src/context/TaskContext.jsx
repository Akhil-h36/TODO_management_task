import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { seedTasks } from "../data/seedTasks";
import { DEFAULT_LIMITS, LIMITS_STORAGE_KEY, STORAGE_KEY } from "../utils/constants";
import { makeId } from "../utils/helpers";

const TaskStateContext = createContext(null);
const TaskDispatchContext = createContext(null);

function loadInitialTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to read tasks from localStorage, falling back to seed data.", err);
  }
  return seedTasks;
}

function loadInitialLimits() {
  try {
    const raw = localStorage.getItem(LIMITS_STORAGE_KEY);
    if (raw) return { ...DEFAULT_LIMITS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn("Failed to read column limits from localStorage, falling back to defaults.", err);
  }
  return DEFAULT_LIMITS;
}

function tasksReducer(tasks, action) {
  switch (action.type) {
    case "ADD_TASK":
      return [...tasks, action.task];
    case "UPDATE_TASK":
      return tasks.map((t) => (t.id === action.id ? { ...t, ...action.patch } : t));
    case "DELETE_TASK":
      return tasks.filter((t) => t.id !== action.id);
    case "MOVE_TASK":
      return tasks.map((t) => (t.id === action.id ? { ...t, status: action.status } : t));
    case "REPLACE_ALL":
      return action.tasks;
    case "CLEAR_ALL":
      return [];
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export function TaskProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, undefined, loadInitialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [limits, setLimits] = useState(loadInitialLimits);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.warn("Failed to persist tasks to localStorage.", err);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(LIMITS_STORAGE_KEY, JSON.stringify(limits));
    } catch (err) {
      console.warn("Failed to persist column limits to localStorage.", err);
    }
  }, [limits]);

  const actions = useMemo(
    () => ({
      addTask(fields) {
        dispatch({ type: "ADD_TASK", task: { id: makeId(), ...fields } });
      },
      updateTask(id, patch) {
        dispatch({ type: "UPDATE_TASK", id, patch });
      },
      deleteTask(id) {
        dispatch({ type: "DELETE_TASK", id });
      },
      moveTask(id, status) {
        dispatch({ type: "MOVE_TASK", id, status });
      },
      clearAll() {
        dispatch({ type: "CLEAR_ALL" });
      },
      setColumnLimit(status, limit) {
        setLimits((prev) => ({ ...prev, [status]: limit }));
      },
    }),
    []
  );

  const stateValue = useMemo(
    () => ({ tasks, searchTerm, activeFilter, limits, setSearchTerm, setActiveFilter }),
    [tasks, searchTerm, activeFilter, limits]
  );

  return (
    <TaskStateContext.Provider value={stateValue}>
      <TaskDispatchContext.Provider value={actions}>{children}</TaskDispatchContext.Provider>
    </TaskStateContext.Provider>
  );
}

export function useTaskState() {
  const ctx = useContext(TaskStateContext);
  if (!ctx) throw new Error("useTaskState must be used within a TaskProvider");
  return ctx;
}

export function useTaskActions() {
  const ctx = useContext(TaskDispatchContext);
  if (!ctx) throw new Error("useTaskActions must be used within a TaskProvider");
  return ctx;
}
