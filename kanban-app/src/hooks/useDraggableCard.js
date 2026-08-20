import { useCallback, useRef } from "react";

/**
 * Custom pointer-based drag (not native HTML5 DnD) so we can drive the
 * "paper card" physics from the mockup: a cloned ghost element that leans
 * into the drag direction and eases back to its resting tilt.
 *
 * Returns a pointerdown handler + ref to attach to the card element.
 * A drag that never crosses the movement threshold is treated as a click
 * (opens the task detail view) instead of a drop.
 */
export function useDraggableCard({ tilt, onDrop, onClick, disabled }) {
  const cardRef = useRef(null);

  const handlePointerDown = useCallback(
    (e) => {
      if (disabled) return;
      if (e.target.closest("[data-no-drag]")) return;
      if (e.button !== undefined && e.button !== 0) return;

      const cardEl = cardRef.current;
      if (!cardEl) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const rect = cardEl.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      const baseTilt = parseFloat(tilt) || 0;
      const threshold = 6;

      let dragging = false;
      let moved = false;
      let ghost = null;
      let raf = null;
      let currentRot = baseTilt;
      let targetRot = baseTilt;
      let lastX = startX;
      let ghostX = rect.left;
      let ghostY = rect.top;

      function startGhost() {
        cardEl.style.opacity = "0.25";
        ghost = cardEl.cloneNode(true);
        ghost.classList.add("drag-ghost");
        ghost.style.position = "fixed";
        ghost.style.left = rect.left + "px";
        ghost.style.top = rect.top + "px";
        ghost.style.width = rect.width + "px";
        ghost.style.margin = "0";
        ghost.style.pointerEvents = "none";
        document.body.appendChild(ghost);
        animate();
      }

      function animate() {
        currentRot += (targetRot - currentRot) * 0.22;
        targetRot += (baseTilt - targetRot) * 0.06;
        if (ghost) {
          ghost.style.left = ghostX + "px";
          ghost.style.top = ghostY + "px";
          ghost.style.transform = `rotate(${currentRot}deg) scale(1.06)`;
        }
        raf = requestAnimationFrame(animate);
      }

      function onMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!moved && Math.hypot(dx, dy) > threshold) {
          moved = true;
          dragging = true;
          startGhost();
        }
        if (dragging) {
          ghostX = ev.clientX - offsetX;
          ghostY = ev.clientY - offsetY;
          const ddx = ev.clientX - lastX;
          targetRot = Math.max(-16, Math.min(16, ddx * 1.6)) + baseTilt;
          lastX = ev.clientX;
          document.querySelectorAll(".column").forEach((c) => c.classList.remove("drag-over"));
          const col = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".column");
          if (col) col.classList.add("drag-over");
        }
      }

      function onUp(ev) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (dragging) {
          cancelAnimationFrame(raf);
          document.querySelectorAll(".column").forEach((c) => c.classList.remove("drag-over"));
          const col = document.elementFromPoint(ev.clientX, ev.clientY)?.closest(".column");
          if (ghost) {
            ghost.remove();
            ghost = null;
          }
          cardEl.style.opacity = "";
          if (col?.dataset.status) onDrop?.(col.dataset.status);
        } else {
          onClick?.();
        }
      }

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [tilt, onDrop, onClick, disabled]
  );

  return { cardRef, handlePointerDown };
}
