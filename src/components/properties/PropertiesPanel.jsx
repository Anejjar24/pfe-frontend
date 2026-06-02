import { getBlockDefinition } from "registry/blockRegistry";
import PropertyField from "./PropertyField";

export default function PropertiesPanel({ editor }) {
  const workflow = editor.selectedNode?.get("workflow");
  const definition = workflow ? getBlockDefinition(workflow.type) : null;

  const handleChange = (name, value) => {
    editor.updateSelectedNode({ [name]: value });
  };

  return (
    <aside className="properties-panel">
      <div className="panel-heading">
        <span>Properties</span>
        <small>{workflow ? workflow.title : "No selection"}</small>
      </div>
      {!workflow && (
        <div className="empty-state">
          Select a node to edit its configuration.
        </div>
      )}
      {workflow && definition && (
        <>
          <div className="node-summary">
            <span className="block-icon" style={{ backgroundColor: workflow.color }}>
              <i className={`fa ${workflow.icon}`} aria-hidden="true" />
            </span>
            <div>
              <strong>{workflow.title}</strong>
              <small>{definition.description}</small>
            </div>
          </div>
          <div className="property-stack">
            {definition.properties.map((field) => (
              <PropertyField
                field={field}
                key={field.name}
                onChange={handleChange}
                value={workflow.data?.[field.name]}
              />
            ))}
          </div>
        </>
      )}
    </aside>
  );
}
