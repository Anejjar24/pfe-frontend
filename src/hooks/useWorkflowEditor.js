import { useCallback, useState } from "react";
import { downloadWorkflowJson } from "engine/graphSerializer";
import { loadWorkflowDraft } from "engine/autosaveManager";
import { executeWorkflowGraph } from "engine/workflowExecutorClient";
import { useAutosave } from "./useAutosave";
import { useJointGraph } from "./useJointGraph";

export function useWorkflowEditor() {
  const graph = useJointGraph();
  const [executionResult, setExecutionResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [editorMessage, setEditorMessage] = useState("");
  const [editingNode, setEditingNode] = useState(null);
  const autosaveStatus = useAutosave(graph.workflow);

  const exportJson = useCallback(() => {
    const workflow = graph.refreshWorkflow();
    if (workflow) downloadWorkflowJson(workflow);
  }, [graph]);

  const importJsonFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        graph.importWorkflow(JSON.parse(reader.result));
        setEditorMessage("Workflow imported");
      } catch (error) {
        setEditorMessage(error.message);
      }
    };
    reader.readAsText(file);
  }, [graph]);

  const loadAutosave = useCallback(() => {
    const draft = loadWorkflowDraft();
    if (draft) {
      graph.importWorkflow(draft);
      setEditorMessage("Draft restored");
    }
  }, [graph]);

  const execute = useCallback(async () => {
    const workflow = graph.refreshWorkflow();
    if (!workflow) return;

    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const result = await executeWorkflowGraph(workflow);
      setExecutionResult(result);
      setEditorMessage("Execution completed");
    } catch (error) {
      setExecutionResult({ error: error.message });
      setEditorMessage("Execution failed");
    } finally {
      setIsExecuting(false);
    }
  }, [graph]);

  return {
    ...graph,
    autosaveStatus,
    executionResult,
    isExecuting,
    editorMessage,
    editingNode,
    setEditingNode,
    exportJson,
    importJsonFile,
    loadAutosave,
    execute,
  };
}
