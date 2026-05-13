// reactstrap components
import { Card, Container, Row } from "reactstrap";

// core components
import Header from "components/Headers/Header.js";

import BlockSidebar from "components/Blocksidebar/BlockSidebar";
import FlowCanvas from "components/canvas/FlowCanvas";
import NodeEditorModal from "components/properties/NodeEditorModal";
import PropertiesPanel from "components/properties/PropertiesPanel";
import { saveWorkflowDraft } from "engine/autosaveManager";
import { saveWorkflow } from "services/workflowApi";
import { useWorkflowEditor } from "hooks/useWorkflowEditor";
import "./workflowBuilder.css";

export default function BuilderPage() {
  const editor = useWorkflowEditor();

  const handleSave = async () => {
    const workflow = editor.refreshWorkflow();
    if (!workflow) return;
    saveWorkflowDraft(workflow);
    try {
      await saveWorkflow(workflow);
    } catch (error) {
      // Local save still succeeds when the backend is not running.
    }
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">

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
    </>
  );
}