import React, { useEffect, useRef, useState } from "react";
import * as joint from "jointjs";
import "jointjs/dist/joint.css";


export default function Diag() {

  const paperRef = useRef(null);

  useEffect(() => {

    const graph = new joint.dia.Graph();

    const paper = new joint.dia.Paper({
      el: paperRef.current,
      model: graph,
      width: 800,
      height: 600,
      gridSize: 10,
      drawGrid: true,
      background: { color: "#f5f5f5" }
    });

    // TEST : ajouter un rectangle
    const rect = new joint.shapes.standard.Rectangle();
    rect.position(100, 100);
    rect.resize(120, 50);
    rect.attr({
      body: { fill: "#3498db" },
      label: { text: "Hello JointJS", fill: "white" }
    });

    rect.addTo(graph);

    return () => paper.remove();

  }, []);

  return <div ref={paperRef} />;
}
