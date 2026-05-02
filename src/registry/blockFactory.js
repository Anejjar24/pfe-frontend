import { shapes } from "@joint/core";
import { getBlockDefinition, getDefaultProperties } from "./blockRegistry";

const nodeSize = { width: 190, height: 86 };

function createPorts(definition) {
  return {
    groups: {
      input: {
        position: { name: "left" },
        attrs: {
          circle: {
            magnet: "passive",
            r: 6,
            fill: "#ffffff",
            stroke: "#64748b",
            strokeWidth: 2,
          },
          text: {
            fill: "#475569",
            fontSize: 10,
            fontFamily: "Inter, Arial, sans-serif",
          },
        },
        label: { position: { name: "right", args: { y: 4 } } },
      },
      output: {
        position: { name: "right" },
        attrs: {
          circle: {
            magnet: true,
            r: 6,
            fill: "#ffffff",
            stroke: "#64748b",
            strokeWidth: 2,
          },
          text: {
            fill: "#475569",
            fontSize: 10,
            fontFamily: "Inter, Arial, sans-serif",
          },
        },
        label: { position: { name: "left", args: { y: 4 } } },
      },
    },
    items: [
      ...definition.inputs.map((port) => ({
        id: port.id,
        group: "input",
        attrs: { text: { text: port.label } },
      })),
      ...definition.outputs.map((port) => ({
        id: port.id,
        group: "output",
        attrs: { text: { text: port.label } },
      })),
    ],
  };
}

export function createWorkflowNode(type, position = { x: 80, y: 80 }, overrides = {}) {
  const definition = getBlockDefinition(type);
  if (!definition) {
    throw new Error(`Unknown workflow block type "${type}"`);
  }

  const properties = {
    ...getDefaultProperties(type),
    ...(overrides.properties || {}),
  };

  const node = new shapes.standard.Rectangle({
    position,
    size: overrides.size || nodeSize,
    ports: createPorts(definition),
    attrs: {
      body: {
        fill: "#ffffff",
        stroke: definition.color,
        strokeWidth: 2,
        rx: 7,
        ry: 7,
        filter: {
          name: "dropShadow",
          args: { dx: 0, dy: 3, blur: 4, color: "rgba(15, 23, 42, 0.16)" },
        },
      },
      label: {
        text: properties.label || definition.title,
        fill: "#0f172a",
        fontSize: 13,
        fontWeight: 700,
        fontFamily: "Inter, Arial, sans-serif",
      },
    },
  });

  node.set("workflow", {
    type,
    title: definition.title,
    icon: definition.icon,
    color: definition.color,
    properties,
  });

  if (overrides.id) node.set("id", overrides.id);
  return node;
}

export function createWorkflowLink(source, target) {
  const link = new shapes.standard.Link({
    source,
    target,
    attrs: {
      line: {
        stroke: "#64748b",
        strokeWidth: 2,
        targetMarker: {
          type: "path",
          d: "M 10 -5 0 0 10 5 z",
          fill: "#64748b",
        },
      },
    },
    router: { name: "manhattan" },
    connector: { name: "rounded" },
  });

  link.set("workflow", { type: "edge" });
  return link;
}

export function updateNodeProperties(node, properties) {
  const workflow = node.get("workflow") || {};
  const nextProperties = { ...(workflow.properties || {}), ...properties };
  node.set("workflow", { ...workflow, properties: nextProperties });
  node.attr("label/text", nextProperties.label || workflow.title || workflow.type);
}
