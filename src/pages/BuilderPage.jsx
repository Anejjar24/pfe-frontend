// reactstrap components
import { Badge, Button, Card, Container, Row } from "reactstrap";

// core components
import Header from "components/Headers/Header.js";

import BlockSidebar from "components/Blocksidebar/BlockSidebar";
import FlowCanvas from "components/canvas/FlowCanvas";
import NodeEditorModal from "components/properties/NodeEditorModal";
import PropertiesPanel from "components/properties/PropertiesPanel";
import WorkflowSettingsModal from "components/workflow/WorkflowSettingsModal";
import { saveWorkflowDraft } from "engine/autosaveManager";
import { saveWorkflow } from "services/workflowApi";
import { useWorkflowEditor } from "hooks/useWorkflowEditor";
import { useState } from "react";
import "./workflowBuilder.css";

export default function BuilderPage() {
  const editor = useWorkflowEditor();

  // ─── Trigger / settings state ───────────────────────────────────────────────
  // Stored here (page level) because it's workflow-level metadata, not node data.
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [triggerSettings, setTriggerSettings] = useState({
    name: '',
    triggerType: 'manual',
    triggerConfig: {},
    isActive: false,
  });

  // ─── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const workflow = editor.refreshWorkflow();
    if (!workflow) return;
    saveWorkflowDraft(workflow);
    try {
      await saveWorkflow(workflow, triggerSettings);
    } catch {
      // Local save still succeeds when the backend is not running.
    }
  };

  // ─── Settings save ──────────────────────────────────────────────────────────
  const handleSettingsSave = async (settings) => {
    setTriggerSettings(settings);
    // Immediately persist the trigger config together with the current graph
    const workflow = editor.refreshWorkflow();
    if (workflow) {
      saveWorkflowDraft(workflow);
      try {
        await saveWorkflow(workflow, settings);
      } catch {
        // Offline — will sync next time
      }
    }
  };

  // ─── Derived display ────────────────────────────────────────────────────────
  const triggerLabel =
    triggerSettings.triggerType === 'scheduled'
      ? `⏱ ${triggerSettings.triggerConfig?.cron || 'no cron'}`
      : triggerSettings.triggerType === 'sensor_threshold'
      ? `📡 threshold`
      : 'manual';

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">

              {/* ── Workflow toolbar ─────────────────────────────────── */}
              <div className="d-flex align-items-center px-3 pt-3 pb-2" style={{ gap: 8 }}>
                <Button
                  size="sm"
                  color="secondary"
                  onClick={() => setSettingsOpen(true)}
                  title="Workflow trigger settings"
                >
                  <i className="ni ni-settings mr-1" />
                  Settings
                </Button>
                <Badge
                  color={triggerSettings.isActive ? 'success' : 'secondary'}
                  className="text-xs"
                  title={`Trigger: ${triggerSettings.triggerType}`}
                >
                  {triggerLabel}
                </Badge>
                {triggerSettings.isActive && (
                  <Badge color="success" className="text-xs">Active</Badge>
                )}
              </div>

              <main className="workflow-builder">
                <BlockSidebar />
                <FlowCanvas editor={editor} onSave={handleSave} />
                <PropertiesPanel editor={editor} />
                <NodeEditorModal
                  node={editor.editingNode}
                  onClose={() => editor.setEditingNode(null)}
                  onSave={editor.updateSelectedNode}
                />
                {editor.editorMessage && (
                  <div className="workflow-toast">{editor.editorMessage}</div>
                )}
              </main>

            </Card>
          </div>
        </Row>
      </Container>

      {/* ── Workflow Settings Modal ────────────────────────────────────── */}
      <WorkflowSettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSave}
        initial={triggerSettings}
      />
    </>
  );
}
