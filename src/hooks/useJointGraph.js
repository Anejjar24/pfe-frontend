import { useCallback, useRef, useState } from "react";
import { dia, shapes } from "@joint/core";
import { createWorkflowLink, createWorkflowNode, updateNodeProperties } from "registry/blockFactory";
import { deserializeGraph } from "engine/graphDeserializer";
import { serializeGraph } from "engine/graphSerializer";

export function useJointGraph() {
  const graphRef = useRef(null);
  const paperRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [zoom, setZoom] = useState(1);

  const refreshWorkflow = useCallback(() => {
    if (!graphRef.current) return null;
    const nextWorkflow = serializeGraph(graphRef.current);
    setWorkflow(nextWorkflow);
    return nextWorkflow;
  }, []);

  const initialize = useCallback((element, options = {}) => {
    const graph = new dia.Graph({}, { cellNamespace: shapes });
    const paper = new dia.Paper({
      el: element,
      model: graph,
      width: "100%",
      height: "100%",
      gridSize: 20,
      drawGrid: { name: "mesh", args: { color: "#d9e2ec", thickness: 1 } },
      background: { color: "#f8fafc" },
      cellViewNamespace: shapes,
      sorting: dia.Paper.sorting.APPROX,
      defaultLink: () => createWorkflowLink({}, {}),
      defaultConnector: { name: "rounded" },
      defaultRouter: { name: "manhattan" },
      linkPinning: false,
      validateConnection: (sourceView, sourceMagnet, targetView, targetMagnet) => {
        if (!sourceMagnet || !targetMagnet || sourceView === targetView) return false;
        return sourceMagnet.getAttribute("port-group") === "output" && targetMagnet.getAttribute("port-group") === "input";
      },
      interactive: { linkMove: false },
      markAvailable: true,
    });

    graphRef.current = graph;
    paperRef.current = paper;

    paper.on("element:pointerclick", (elementView) => setSelectedNode(elementView.model));
    paper.on("element:pointerdblclick", (elementView) => options.onEdit?.(elementView.model));
    paper.on("blank:pointerclick", () => setSelectedNode(null));
    graph.on("add remove change:position change:target change:source change:workflow", refreshWorkflow);

    return () => {
      paper.remove();
      graph.clear();
      graphRef.current = null;
      paperRef.current = null;
    };
  }, [refreshWorkflow]);

  const addNode = useCallback((type, position) => {
    const node = createWorkflowNode(type, position);
    node.addTo(graphRef.current);
    setSelectedNode(node);
    refreshWorkflow();
  }, [refreshWorkflow]);

  const updateSelectedNode = useCallback((properties) => {
    if (!selectedNode) return;
    updateNodeProperties(selectedNode, properties);
    setSelectedNode(selectedNode);
    refreshWorkflow();
  }, [refreshWorkflow, selectedNode]);

  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    selectedNode.remove();
    setSelectedNode(null);
    refreshWorkflow();
  }, [refreshWorkflow, selectedNode]);

  const duplicateSelectedNode = useCallback(() => {
    if (!selectedNode) return;
    const workflowData = selectedNode.get("workflow");
    const position = selectedNode.position();
    const node = createWorkflowNode(workflowData.type, { x: position.x + 36, y: position.y + 36 }, {
      properties: { ...(workflowData.properties || {}) },
    });
    node.addTo(graphRef.current);
    setSelectedNode(node);
    refreshWorkflow();
  }, [refreshWorkflow, selectedNode]);

  const importWorkflow = useCallback((nextWorkflow) => {
    deserializeGraph(graphRef.current, nextWorkflow);
    setSelectedNode(null);
    refreshWorkflow();
  }, [refreshWorkflow]);

  const setPaperZoom = useCallback((nextZoom) => {
    const value = Math.min(1.8, Math.max(0.45, nextZoom));
    paperRef.current.scale(value);
    setZoom(value);
  }, []);

  const resetView = useCallback(() => {
    paperRef.current.scale(1);
    paperRef.current.translate(0, 0);
    setZoom(1);
  }, []);

  return {
    graphRef,
    paperRef,
    selectedNode,
    workflow,
    zoom,
    initialize,
    addNode,
    updateSelectedNode,
    deleteSelectedNode,
    duplicateSelectedNode,
    importWorkflow,
    refreshWorkflow,
    setPaperZoom,
    resetView,
  };
}
