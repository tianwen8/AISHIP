/**
 * Merge Node Component
 * Custom React Flow node for displaying final video merge operation
 */

import { Handle, Position, NodeProps } from "reactflow";

interface MergeNodeData {
  label: string;
  totalDuration: number;
  sceneCount: number;
  credits: number;
  hasVoiceover: boolean;
}

export default function MergeNode({ data, selected }: NodeProps<MergeNodeData>) {
  return (
    <div
      className={`bg-white rounded-xl border-2 shadow-lg transition-all ${
        selected ? "border-blue-500 shadow-xl" : "border-gray-200"
      }`}
      style={{ width: 280 }}
    >
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#8b5cf6",
          border: "2px solid white",
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-4 py-2 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎞️</span>
          <span className="font-semibold text-sm">Final Merge</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-xs text-gray-500 mb-1">Duration</div>
            <div className="text-lg font-bold text-gray-900">
              {data.totalDuration}s
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Scenes</div>
            <div className="text-lg font-bold text-gray-900">
              {data.sceneCount}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {data.hasVoiceover && (
              <div className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                🎙️ Voiceover
              </div>
            )}
            <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              🎬 Video Merge
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Merge Cost:</span>
            <span className="text-sm font-bold text-purple-600">
              {data.credits.toFixed(1)} credits
            </span>
          </div>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#8b5cf6",
          border: "2px solid white",
        }}
      />
    </div>
  );
}
