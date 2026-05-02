export function serializeGraph(graph) {
  const nodes = graph
    .getElements()
    .map((node) => {
      const workflow = node.get("workflow") || {};
      const position = node.position();
      const size = node.size();

      return {
        id: String(node.id),
        type: workflow.type,
        position,
        size,
        data: workflow.properties || {},
      };
    })
    .filter((node) => node.type);

  const edges = graph.getLinks().map((link) => {
    const source = link.source();
    const target = link.target();

    return {
      id: String(link.id),
      source: String(source.id || ""),
      sourcePort: source.port || null,
      target: String(target.id || ""),
      targetPort: target.port || null,
    };
  });

  return {
    id: "local-workflow",
    name: "Workflow Builder",
    version: 1,
    updatedAt: new Date().toISOString(),
    nodes,
    edges,
  };
}

export function downloadWorkflowJson(workflow) {
  const blob = new Blob([JSON.stringify(workflow, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${workflow.name || "workflow"}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
