import { useEffect, useRef } from "react";
import { deserializeGraph } from "engine/graphDeserializer";
import { loadWorkflowDraft } from "engine/autosaveManager";
import CanvasToolbar from "./CanvasToolbar";
import JointPaper from "./JointPaper";

const starterWorkflow = {
  nodes: [
    { id: "input-1", type: "input", position: { x: 80, y: 120 }, data: { label: "Input", value: "10" } },
    { id: "action-1", type: "action", position: { x: 360, y: 120 }, data: { label: "Multiply", operation: "multiply", factor: 2 } },
    { id: "output-1", type: "output", position: { x: 650, y: 120 }, data: { label: "Output", format: "json" } },
  ],
  edges: [
    { source: "input-1", sourcePort: "out", target: "action-1", targetPort: "in" },
    { source: "action-1", sourcePort: "out", target: "output-1", targetPort: "in" },
  ],
};

export default function FlowCanvas({ editor, onSave }) {
  const editorRef = useRef(editor);
  editorRef.current = editor;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const currentEditor = editorRef.current;
      if (!currentEditor.graphRef.current || currentEditor.workflow?.nodes?.length) return;
      deserializeGraph(currentEditor.graphRef.current, loadWorkflowDraft() || starterWorkflow);
      currentEditor.refreshWorkflow();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <section className="workflow-canvas-panel">
      <CanvasToolbar
        autosaveStatus={editor.autosaveStatus}
        isExecuting={editor.isExecuting}
        onDelete={editor.deleteSelectedNode}
        onDuplicate={editor.duplicateSelectedNode}
        onExecute={editor.execute}
        onExport={editor.exportJson}
        onImport={editor.importJsonFile}
        onReset={editor.resetView}
        onSave={onSave}
        onZoomIn={() => editor.setPaperZoom(editor.zoom + 0.1)}
        onZoomOut={() => editor.setPaperZoom(editor.zoom - 0.1)}
        selectedNode={editor.selectedNode}
        zoom={editor.zoom}
      />
      <JointPaper editor={editor} />
    </section>
  );
}
