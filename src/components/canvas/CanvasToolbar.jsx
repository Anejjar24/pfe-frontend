import { useRef } from "react";

export default function CanvasToolbar({
  autosaveStatus,
  isExecuting,
  onDelete,
  onDuplicate,
  onExecute,
  onExport,
  onImport,
  onReset,
  onSave,
  onZoomIn,
  onZoomOut,
  selectedNode,
  zoom,
}) {
  const fileInputRef = useRef(null);

  return (
    <header className="workflow-toolbar">
      <div className="toolbar-group">
        <button onClick={onSave} title="Save workflow" type="button">
          <i className="fa fa-save" aria-hidden="true" />
        </button>
        <button onClick={onExport} title="Export JSON" type="button">
          <i className="fa fa-download" aria-hidden="true" />
        </button>
        <button onClick={() => fileInputRef.current?.click()} title="Import JSON" type="button">
          <i className="fa fa-upload" aria-hidden="true" />
          <input
            accept="application/json"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            ref={fileInputRef}
            style={{ display: "none" }}
            type="file"
          />
        </button>
      </div>
      <div className="toolbar-group">
        <button onClick={onZoomOut} title="Zoom out" type="button">
          <i className="fa fa-search-minus" aria-hidden="true" />
        </button>
        <span className="zoom-readout">{Math.round(zoom * 100)}%</span>
        <button onClick={onZoomIn} title="Zoom in" type="button">
          <i className="fa fa-search-plus" aria-hidden="true" />
        </button>
        <button onClick={onReset} title="Reset view" type="button">
          <i className="fa fa-compress" aria-hidden="true" />
        </button>
      </div>
      <div className="toolbar-group">
        <button disabled={!selectedNode} onClick={onDuplicate} title="Duplicate node" type="button">
          <i className="fa fa-clone" aria-hidden="true" />
        </button>
        <button disabled={!selectedNode} onClick={onDelete} title="Delete node" type="button">
          <i className="fa fa-trash" aria-hidden="true" />
        </button>
        <button className="execute-button" disabled={isExecuting} onClick={onExecute} title="Execute workflow" type="button">
          <i className={`fa ${isExecuting ? "fa-spinner fa-spin" : "fa-play"}`} aria-hidden="true" />
          <span>{isExecuting ? "Running" : "Run"}</span>
        </button>
      </div>
      <div className="autosave-indicator">{autosaveStatus}</div>
    </header>
  );
}