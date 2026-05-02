const autosaveKey = "workflow-builder-autosave";

export function saveWorkflowDraft(workflow) {
  localStorage.setItem(autosaveKey, JSON.stringify(workflow));
}

export function loadWorkflowDraft() {
  const rawDraft = localStorage.getItem(autosaveKey);
  if (!rawDraft) return null;

  try {
    return JSON.parse(rawDraft);
  } catch (error) {
    localStorage.removeItem(autosaveKey);
    return null;
  }
}

export function clearWorkflowDraft() {
  localStorage.removeItem(autosaveKey);
}
