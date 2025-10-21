/**
 * Prompt Node Component
 * Initial node showing user's prompt and reference image
 */

import { Handle, Position, NodeProps } from "reactflow";

interface PromptNodeData {
  prompt: string;
  referenceImage?: string;
}

export default function PromptNode({ data, selected }: NodeProps<PromptNodeData>) {
  return (
    <div
      className={`bg-white rounded-xl border-2 shadow-lg transition-all ${
        selected ? "border-blue-500 shadow-xl" : "border-gray-200"
      }`}
      style={{ width: 320 }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-t-xl">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <span className="font-semibold text-sm">User Prompt</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Prompt */}
        <div className="mb-3">
          <div className="text-sm text-gray-900 line-clamp-4">
            {data.prompt}
          </div>
        </div>

        {/* Reference Image */}
        {data.referenceImage && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Reference Image</div>
            <img
              src={data.referenceImage}
              alt="Reference"
              className="w-full h-32 object-cover rounded border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#3b82f6",
          border: "2px solid white",
        }}
      />
    </div>
  );
}
