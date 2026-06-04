import { useEffect, useState } from "react";
import { getBlockDefinition } from "registry/blockRegistry";
import PropertyField from "./PropertyField";

export default function NodeEditorModal({ node, onClose, onSave }) {
  const workflow = node?.get("workflow");
  const definition = workflow ? getBlockDefinition(workflow.type) : null;
  const [properties, setProperties] = useState({});

  useEffect(() => {
    setProperties(workflow?.data || {});
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
          {definition.properties
            .filter((field) => {
              if (!field.showFor) return true;
              const op = properties.operation ?? definition.properties.find((f) => f.name === "operation")?.defaultValue;
              return field.showFor.includes(op);
            })
            .map((field) => (
              <PropertyField
                field={field}
                key={field.name}
                onChange={(name, value) => setProperties((current) => ({ ...current, [name]: value }))}
                value={properties[field.name]}
                allValues={properties}
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
