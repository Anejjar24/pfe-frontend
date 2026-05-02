import { useEffect, useState } from "react";
import { getBlockDefinition } from "registry/blockRegistry";
import PropertyField from "./PropertyField";

export default function NodeEditorModal({ node, onClose, onSave }) {
  const workflow = node?.get("workflow");
  const definition = workflow ? getBlockDefinition(workflow.type) : null;
  const [properties, setProperties] = useState({});

  useEffect(() => {
    setProperties(workflow?.properties || {});
  }, [workflow]);

  if (!node || !definition) return null;

  return (
    <div className="modal-backdrop">
      <div className="node-modal">
        <header>
          <div>
            <strong>Edit {workflow.title}</strong>
            <small>Double-click editor</small>
          </div>
          <button onClick={onClose} title="Close" type="button">
            <i className="fa fa-times" aria-hidden="true" />
          </button>
        </header>
        <div className="property-stack">
          {definition.properties.map((field) => (
            <PropertyField
              field={field}
              key={field.name}
              onChange={(name, value) => setProperties((current) => ({ ...current, [name]: value }))}
              value={properties[field.name]}
            />
          ))}
        </div>
        <footer>
          <button onClick={onClose} type="button">Cancel</button>
          <button
            className="primary-action"
            onClick={() => {
              onSave(properties);
              onClose();
            }}
            type="button"
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}
