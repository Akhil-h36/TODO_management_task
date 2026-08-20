import { useState } from "react";
import Header from "./components/Header";
import FilterChips from "./components/FilterChips";
import Board from "./components/Board";
import TaskModal from "./components/TaskModal";
import { TaskProvider } from "./context/TaskContext";

const CLOSED_MODAL = { mode: "closed", taskId: null, pendingStatus: "todo", originEl: null };

export default function App() {
  const [modalState, setModalState] = useState(CLOSED_MODAL);

  function openTaskView(taskId, originEl) {
    setModalState({ mode: "view", taskId, pendingStatus: "todo", originEl });
  }

  function openNewTask(status, originEl = null) {
    setModalState({ mode: "new", taskId: null, pendingStatus: status, originEl });
  }

  function requestEdit() {
    setModalState((s) => ({ ...s, mode: "edit" }));
  }

  function closeModal() {
    setModalState(CLOSED_MODAL);
  }

  return (
    <TaskProvider>
      <div className="wrap">
        <Header onNewTask={() => openNewTask("todo")} />
        <FilterChips />
        <Board onOpenTask={openTaskView} onAddTask={openNewTask} />
      </div>
      <TaskModal modalState={modalState} onClose={closeModal} onRequestEdit={requestEdit} />
    </TaskProvider>
  );
}
