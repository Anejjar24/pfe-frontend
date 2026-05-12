import apiClient from './apiClient';

export function saveWorkflow(workflow) {
  return apiClient.post('/flows', {
    name: workflow.name || 'Workflow Builder',
    graph: workflow,
  }).then((res) => res.data);
}

export function executeWorkflow(workflow) {
  return apiClient.post('/flows/execute', {
    graph: workflow,
    input: {},
  }).then((res) => res.data);
}
