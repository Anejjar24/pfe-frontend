

import { useState, useRef } from "react";
import EditorCanvas from "./EditorCanvas";
import EditorPalette from "./EditorPalette";
import EditorToolbar from "./EditorToolbar";
import { createBlock } from "./shapes";

export default function FlowEditorPage() {
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0 });
  const graphRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.clientX, y: e.clientY });
  };

  const addBlock = (type) => {
    if (!graphRef.current) return;

    const block = createBlock(type, menu.x - 200, menu.y - 120);
    graphRef.current.addCell(block);
    setMenu({ ...menu, visible: false });
  };

  return (
    <>
      <EditorToolbar />
      <EditorCanvas onContextMenu={handleContextMenu} graphRef={graphRef} />
      <EditorPalette
        visible={menu.visible}
        x={menu.x}
        y={menu.y}
        onAdd={addBlock}
      />
    </>
  );
}
