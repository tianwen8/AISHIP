/**
 * Merge Node Component
 * Custom React Flow node for displaying final video merge operation
 */

import { Handle, Position, NodeProps } from "reactflow";

type NodeStatus = 'pending' | 'running' | 'completed' | 'failed';

interface MergeNodeData {
  label: string;
  totalDuration: number;
  sceneCount: number;
  credits: number;
  hasVoiceover: boolean;
  status?: NodeStatus;
  artifactUrl?: string;
  error?: string;
}

export default function MergeNode({ data, selected }: NodeProps<MergeNodeData>) {
  const status = data.status || 'pending';

  // Status-based styling
  const getBorderClass = () => {
    if (selected) return "border-blue-500 shadow-xl";
    switch (status) {
      case 'running':
        return "border-blue-400 shadow-lg animate-pulse";
      case 'completed':
        return "border-green-500 shadow-lg";
      case 'failed':
        return "border-red-500 shadow-lg";
      default:
        return "border-gray-300 opacity-60";
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border-2 transition-all ${getBorderClass()}`}
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
        {/* Status Indicator */}
        {status === 'running' && (
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Merging...</span>
          </div>
        )}

        {status === 'failed' && data.error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-xs text-red-600">❌ {data.error}</div>
          </div>
        )}

        {/* Video Preview (if completed) */}
        {status === 'completed' && data.artifactUrl && (
          <div className="mb-3">
            <video controls className="w-full rounded border border-gray-200">
              <source src={data.artifactUrl} type="video/mp4" />
            </video>
          </div>
        )}

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
              {data.credits.toFixed(1)} Power Units
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
