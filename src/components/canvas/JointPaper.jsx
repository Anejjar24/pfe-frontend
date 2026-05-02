import { useEffect, useRef, useState } from "react";
import "jointjs/dist/joint.css";
import { getCanvasDropPoint } from "utils/graphHelpers";

export default function JointPaper({ editor }) {
  const paperElementRef = useRef(null);
  const editorRef = useRef(editor);
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef(null);

  editorRef.current = editor;

  useEffect(() => {
    if (!paperElementRef.current) return undefined;
    return editorRef.current.initialize(paperElementRef.current, { onEdit: editorRef.current.setEditingNode });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target?.tagName === "INPUT" || event.target?.tagName === "TEXTAREA") return;
      if (event.key === "Delete" || event.key === "Backspace") editorRef.current.deleteSelectedNode();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        editorRef.current.duplicateSelectedNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleDrop = (event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData("application/workflow-block");
    if (!type || !editor.paperRef.current) return;
    const point = getCanvasDropPoint(event, editor.paperRef.current);
    editor.addNode(type, { x: point.x, y: point.y });
  };

  const handleMouseDown = (event) => {
    if (event.button !== 1 && !(event.button === 0 && event.altKey)) return;
    setIsPanning(true);
    const paper = editor.paperRef.current;
    panRef.current = {
      x: event.clientX,
      y: event.clientY,
      tx: paper.translate().tx,
      ty: paper.translate().ty,
    };
  };

  const handleMouseMove = (event) => {
    if (!isPanning || !panRef.current) return;
    const paper = editor.paperRef.current;
    paper.translate(
      panRef.current.tx + event.clientX - panRef.current.x,
      panRef.current.ty + event.clientY - panRef.current.y
    );
  };

  const stopPan = () => setIsPanning(false);

  return (
    <div
      className={`joint-paper-host ${isPanning ? "is-panning" : ""}`}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseLeave={stopPan}
      onMouseMove={handleMouseMove}
      onMouseUp={stopPan}
      ref={paperElementRef}
    />
  );
}
