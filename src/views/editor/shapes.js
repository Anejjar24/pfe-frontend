import * as joint from "jointjs";

export const createBlock = (type, x, y) => {
  let el = new joint.shapes.standard.Rectangle();

  if (type === "Decision") {
    el = new joint.shapes.standard.Polygon();
    el.attr("body/refPoints", "50,0 100,50 50,100 0,50");
  }

  el.resize(140, 60);
  el.position(x, y);
  el.attr({
    body: { fill: "#5e72e4" },
    label: { text: type, fill: "white" }
  });

  return el;
};
