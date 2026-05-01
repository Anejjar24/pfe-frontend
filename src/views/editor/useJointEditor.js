import { useRef } from "react";

export default function useJointEditor() {
  const graphRef = useRef(null);
  return graphRef;
}
