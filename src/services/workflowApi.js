const API_URL = process.env.REACT_APP_WORKFLOW_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json();
}

export function saveWorkflow(workflow) {
  return request("/flows", {
    method: "POST",
    body: JSON.stringify({ name: workflow.name || "Workflow Builder", graph: workflow }),
  });
}

export function executeWorkflow(workflow) {
  return request("/flows/execute", {
    method: "POST",
    body: JSON.stringify({ graph: workflow, input: {} }),
  });
}
