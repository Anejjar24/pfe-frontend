import React, { useEffect, useRef, useState } from "react";
import * as joint from "jointjs";
import "jointjs/dist/joint.css";

export default function DiagramEditor() {
  const paperRef = useRef(null);
  const graphRef = useRef(null);
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    const graph = new joint.dia.Graph();
    graphRef.current = graph;

    const paper = new joint.dia.Paper({
      el: paperRef.current,
      model: graph,
      width: "100%",
      height: 600,
      gridSize: 10,
      drawGrid: true,
      background: { color: "#f8f9fa" }
    });

    paperRef.current.addEventListener("contextmenu", e => {
      e.preventDefault();
      setMenu({ visible: true, x: e.clientX, y: e.clientY });
    });

    document.addEventListener("click", () =>
      setMenu(m => ({ ...m, visible: false }))
    );
  }, []);

  const addBlock = type => {
    const graph = graphRef.current;

    const block = new joint.shapes.standard.Rectangle();
    block.resize(140, 60);
    block.position(menu.x - 200, menu.y - 100);
    block.attr({
      body: { fill: "#5e72e4", rx: 8, ry: 8 },
      label: { text: type, fill: "white" }
    });

    graph.addCell(block);
  };

  return (
    <div style={{ position: "relative" }}>
      <div ref={paperRef} style={{ height: 600, border: "1px solid #ddd" }} />

      {menu.visible && (
        <div
          style={{
            position: "fixed",
            top: menu.y,
            left: menu.x,
            background: "white",
            border: "1px solid #ccc",
            padding: 10,
            borderRadius: 6,
            boxShadow: "0 2px 10px rgba(0,0,0,.2)",
            zIndex: 1000
          }}
        >
          <div onClick={() => addBlock("Start")}>➕ Start</div>
          <div onClick={() => addBlock("Process")}>⚙ Process</div>
          <div onClick={() => addBlock("Decision")}>❓ Decision</div>
        </div>
      )}
    </div>
  );
}
