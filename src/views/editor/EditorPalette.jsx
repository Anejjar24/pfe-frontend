
import React, { useEffect, useRef } from "react";
export default function EditorPalette({ visible, x, y, onAdd }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: y,
        left: x,
        background: "#fff",
        border: "1px solid #ccc",
        padding: 8,
        borderRadius: 6,
        zIndex: 1000
      }}
    >
      <div onClick={() => onAdd("Start")}>➕ Start</div>
      <div onClick={() => onAdd("Process")}>⚙ Process</div>
      <div onClick={() => onAdd("Decision")}>❓ Decision</div>
    </div>
  );
}
