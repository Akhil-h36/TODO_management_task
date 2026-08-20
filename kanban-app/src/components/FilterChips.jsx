import { useTaskState } from "../context/TaskContext";

const CHIPS = [
  { p: "all", label: "All" },
  { p: "high", label: "High" },
  { p: "medium", label: "Medium" },
  { p: "low", label: "Low" },
];

export default function FilterChips() {
  const { activeFilter, setActiveFilter } = useTaskState();

  return (
    <div className="filters">
      {CHIPS.map(({ p, label }) => (
        <button
          key={p}
          className={`chip${activeFilter === p ? " active" : ""}`}
          data-p={p}
          onClick={() => setActiveFilter(p)}
        >
          <span className="dot" />
          {label}
        </button>
      ))}
    </div>
  );
}
