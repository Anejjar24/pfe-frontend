// src/pages/BuilderPage.jsx
import BuilderCanvas from "components/builder/BuilderCanvas.jsx";

export default function BuilderPage() {
  return (
    <div className="w-full min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-semibold mb-4">Builder</h1>
      <BuilderCanvas />
    </div>
  );
}