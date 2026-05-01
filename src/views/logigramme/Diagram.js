import React, { useEffect, useRef } from "react";
import * as joint from "jointjs";
import "jointjs/dist/joint.css";

function Diagram() {
  const paperRef = useRef(null);

  useEffect(() => {
    const graph = new joint.dia.Graph();

    const paper = new joint.dia.Paper({
      el: paperRef.current,
      model: graph,
      width: "100%",
      height: 600,
      gridSize: 10,
      drawGrid: true,
      background: { color: "#f8f9fa" }
    });

    const rect1 = new joint.shapes.standard.Rectangle();
    rect1.position(100, 100);
    rect1.resize(120, 50);
    rect1.attr({
      body: { fill: "#5e72e4" },
      label: { text: "Start", fill: "white" }
    });

    const rect2 = new joint.shapes.standard.Rectangle();
    rect2.position(350, 200);
    rect2.resize(120, 50);
    rect2.attr({
      body: { fill: "#11cdef" },
      label: { text: "Process", fill: "white" }
    });

    const link = new joint.shapes.standard.Link();
    link.source(rect1);
    link.target(rect2);
    link.attr({
      line: { stroke: "#333", strokeWidth: 2 }
    });

    graph.addCells([rect1, rect2, link]);
  }, []);

  return <div ref={paperRef} style={{ width: "100%", height: "600px" }} />;
}

export default Diagram;
