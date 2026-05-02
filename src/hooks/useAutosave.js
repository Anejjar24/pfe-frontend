import { useEffect, useRef, useState } from "react";
import { saveWorkflowDraft } from "engine/autosaveManager";

export function useAutosave(workflow, enabled = true) {
  const [status, setStatus] = useState("Idle");
  const lastSavedRef = useRef("");

  useEffect(() => {
    if (!enabled || !workflow) return undefined;

    const serialized = JSON.stringify(workflow);
    if (serialized === lastSavedRef.current) return undefined;

    setStatus("Saving");
    const timeout = window.setTimeout(() => {
      saveWorkflowDraft(workflow);
      lastSavedRef.current = serialized;
      setStatus(`Saved ${new Date().toLocaleTimeString()}`);
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [workflow, enabled]);

  return status;
}
