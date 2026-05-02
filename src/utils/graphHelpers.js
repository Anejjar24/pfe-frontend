export function getCanvasDropPoint(event, paper) {
  const rect = paper.el.getBoundingClientRect();
  return paper.clientToLocalPoint({
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  });
}

export function hasGraphContent(workflow) {
  return Boolean(workflow?.nodes?.length);
}
