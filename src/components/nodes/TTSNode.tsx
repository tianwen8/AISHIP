/**
 * TTS (Text-to-Speech) Node Component
 * Custom React Flow node for displaying TTS operations
 */

import { Handle, Position, NodeProps } from "reactflow";
import { useState } from "react";

interface TTSNodeData {
  label: string;
  script: string;
  voice: string;
  model: string;
  credits: number;
}

export default function TTSNode({ data, selected }: NodeProps<TTSNodeData>) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          backgroundColor: "#f59e0b",
          border: "2px solid white",
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎙️</span>
            <span className="font-semibold text-sm">Text to Speech</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Script */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Script</div>
          <div className="text-sm text-gray-900 line-clamp-3">
            {data.script}
          </div>
        </div>

        {/* Voice */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Voice</div>
          <div className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded inline-block">
            {data.voice}
          </div>
        </div>

        {/* Model */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Model</div>
          <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
            {data.model}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Cost:</span>
            <span className="text-sm font-bold text-orange-600">
              {data.credits.toFixed(1)} credits
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-600 hover:text-orange-600 transition px-2 py-1 rounded hover:bg-orange-50"
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
        </div>
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 12,
          height: 12,
          backgroundColor: "#f59e0b",
          border: "2px solid white",
        }}
      />
    </div>
  );
}
