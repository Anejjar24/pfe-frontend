import { createWorkflowLink, createWorkflowNode } from "registry/blockFactory";

export function deserializeGraph(graph, workflow) {
  if (!workflow || !Array.isArray(workflow.nodes)) {
    throw new Error("Workflow JSON must contain a nodes array.");
  }

  graph.clear();
  const nodesById = new Map();

  workflow.nodes.forEach((nodeData) => {
    const node = createWorkflowNode(nodeData.type, nodeData.position || { x: 100, y: 100 }, {
      id: nodeData.id,
      properties: nodeData.data || nodeData.properties || {},
      size: nodeData.size,
    });
    node.addTo(graph);
    nodesById.set(String(nodeData.id), node);
  });

  (workflow.edges || []).forEach((edgeData) => {
    const source = nodesById.get(String(edgeData.source));
    const target = nodesById.get(String(edgeData.target));
    if (!source || !target) return;

    createWorkflowLink(
      { id: source.id, port: edgeData.sourcePort || "out" },
      { id: target.id, port: edgeData.targetPort || "in" }
    ).addTo(graph);
  });
}
