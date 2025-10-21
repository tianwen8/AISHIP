/**
 * Canvas Toolbar Component
 * Quick actions for adding nodes and controlling canvas view
 */

import { useReactFlow } from "reactflow";

interface CanvasToolbarProps {
  onAddNode: (nodeType: "t2i" | "i2v" | "tts" | "merge") => void;
  onSave: () => void;
  onShare: () => void;
}

export default function CanvasToolbar({ onAddNode, onSave, onShare }: CanvasToolbarProps) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2">
        {/* Add Node Buttons */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <button
            onClick={() => onAddNode("t2i")}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition flex items-center gap-1"
            title="Add Text-to-Image Node"
          >
            <span>🎨</span>
            <span>T2I</span>
          </button>
          <button
            onClick={() => onAddNode("i2v")}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-lg transition flex items-center gap-1"
            title="Add Image-to-Video Node"
          >
            <span>🎬</span>
            <span>I2V</span>
          </button>
          <button
            onClick={() => onAddNode("tts")}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700 rounded-lg transition flex items-center gap-1"
            title="Add Text-to-Speech Node"
          >
            <span>🎙️</span>
            <span>TTS</span>
          </button>
          <button
            onClick={() => onAddNode("merge")}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg transition flex items-center gap-1"
            title="Add Merge Node"
          >
            <span>🎞️</span>
            <span>Merge</span>
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Zoom In"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v12m6-6H6"
              />
            </svg>
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="w-8 h-8 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Zoom Out"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 12H4"
              />
            </svg>
          </button>
          <button
            onClick={() => fitView({ duration: 300, padding: 0.2 })}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Fit to Screen"
          >
            Fit View
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            💾 Save
          </button>
          <button
            onClick={onShare}
            className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            🔗 Share
          </button>
        </div>
      </div>
    </div>
  );
}
