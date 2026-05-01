// src/components/builder/BuilderCanvas.jsx
import { useEffect, useRef } from "react";
import { dia, shapes } from "@joint/core";
import "jointjs/dist/joint.css";
export default function BuilderCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Graph
    const graph = new dia.Graph({}, { cellNamespace: shapes });

    // Paper
    const paper = new dia.Paper({
      el: canvasRef.current,
      model: graph,
      width: "100%",
      height: 700,
      gridSize: 20,
      drawGrid: {
        name: "dot",
        args: {
          color: "#dcdcdc",
          scaleFactor: 1.2,
          thickness: 1,
        },
      },
      background: {
        color: "#f8f9fb",
      },
      cellViewNamespace: shapes,
      interactive: true,
      async: true,
      sorting: dia.Paper.sorting.APPROX,
    });

    // ===== Meeting Node =====
    const meeting = new shapes.standard.Rectangle();
    meeting.position(250, 80);
    meeting.resize(230, 90);
    meeting.attr({
      body: {
        fill: "#ffffff",
        stroke: "#d9d9d9",
        rx: 10,
        ry: 10,
      },
      label: {
        text: "Meeting\n+1 day(s), 15 min, 09:00 - 12:00\nN / A",
        fill: "#1f2937",
        fontSize: 14,
        fontFamily: "Arial",
      },
    });
    meeting.addTo(graph);

    // ===== Communication Node =====
    const communication = new shapes.standard.Rectangle();
    communication.position(200, 300);
    communication.resize(240, 90);
    communication.attr({
      body: {
        fill: "#ffffff",
        stroke: "#d9d9d9",
        rx: 10,
        ry: 10,
      },
      label: {
        text: "Communication\n+1 day(s)\nSilo Team",
        fill: "#1f2937",
        fontSize: 14,
        fontFamily: "Arial",
      },
    });
    communication.addTo(graph);

    // ===== Action Node =====
    const action = new shapes.standard.Rectangle();
    action.position(620, 220);
    action.resize(220, 90);
    action.attr({
      body: {
        fill: "#ffffff",
        stroke: "#d9d9d9",
        rx: 10,
        ry: 10,
      },
      label: {
        text: "Action name\n+1 day(s)\nOnboardee",
        fill: "#1f2937",
        fontSize: 14,
        fontFamily: "Arial",
      },
    });
    action.addTo(graph);

    // ===== Link Meeting -> Action =====
    const link1 = new shapes.standard.Link();
    link1.source(meeting);
    link1.target(action);
    link1.attr({
      line: {
        stroke: "#7c7c7c",
        strokeWidth: 2,
        targetMarker: {
          type: "path",
          d: "M 10 -5 0 0 10 5 z",
        },
      },
    });
    link1.labels([
      {
        attrs: {
          text: {
            text: "Meeting",
            fill: "#22c55e",
            fontSize: 13,
          },
        },
        position: 0.55,
      },
    ]);
    link1.addTo(graph);

    // ===== Link Communication -> Action =====
    const link2 = new shapes.standard.Link();
    link2.source(communication);
    link2.target(action);
    link2.attr({
      line: {
        stroke: "#7c7c7c",
        strokeWidth: 2,
        targetMarker: {
          type: "path",
          d: "M 10 -5 0 0 10 5 z",
        },
      },
    });
    link2.labels([
      {
        attrs: {
          text: {
            text: "Coms",
            fill: "#22c55e",
            fontSize: 13,
          },
        },
        position: 0.35,
      },
    ]);
    link2.addTo(graph);

    return () => {
      paper.remove();
    };
  }, []);

  return (
    <div
      ref={canvasRef}
      className="w-full rounded-2xl border border-gray-200 overflow-hidden"
    />
  );
}