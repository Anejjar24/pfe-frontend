

import React, { useEffect, useRef } from "react";
import * as joint from "jointjs";
import "jointjs/dist/joint.css";

export default function EditorCanvas({ onContextMenu, graphRef }) {
  const paperRef = useRef(null);

  useEffect(() => {
    const graph = new joint.dia.Graph();
    graphRef.current = graph;

    const paper = new joint.dia.Paper({
      el: paperRef.current,
      model: graph,
      width: "100%",
      height: 650,
      gridSize: 10,
      drawGrid: true
    });

    paperRef.current.addEventListener("contextmenu", onContextMenu);
  }, []);

  return <div ref={paperRef} style={{ height: 650 }} />;
}

