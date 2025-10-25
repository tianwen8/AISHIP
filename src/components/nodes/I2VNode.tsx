/**
 * I2V (Image-to-Video) Node Component
 * Custom React Flow node for displaying I2V operations
 */

import { Handle, Position, NodeProps } from "reactflow";
import { useState } from "react";
import { I2V_MODELS, calculateI2VCost, getModelById } from "@/config/models";

type NodeStatus = 'pending' | 'running' | 'completed' | 'failed';

interface I2VNodeData {
  label: string;
  duration: number;
  model: string;
  credits: number;
  sceneIndex: number;
  status?: NodeStatus;
  artifactUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  onModelChange?: (nodeId: string, newModel: string, newCredits: number) => void;
}

export default function I2VNode({ data, selected, id }: NodeProps<I2VNodeData>) {
  const [copied, setCopied] = useState(false);
  const status = data.status || 'pending';

  const handleCopy = () => {
    navigator.clipboard.writeText(`Duration: ${data.duration}s, Model: ${data.model}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    const newCredits = calculateI2VCost(newModelId, data.duration);

    if (data.onModelChange) {
      data.onModelChange(id, newModelId, newCredits);
    }
  };

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
          backgroundColor: "#10b981",
          border: "2px solid white",
        }}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎬</span>
            <span className="font-semibold text-sm">Image to Video</span>
          </div>
          <div className="text-xs bg-white/20 px-2 py-1 rounded">
            Scene {data.sceneIndex}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Status Indicator */}
        {status === 'running' && (
          <div className="mb-3 flex items-center gap-2 text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Generating...</span>
          </div>
        )}

        {status === 'failed' && data.error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
            <div className="text-xs text-red-600">❌ {data.error}</div>
          </div>
        )}

        {/* Thumbnail (if completed) */}
        {status === 'completed' && data.thumbnailUrl && (
          <div className="mb-3">
            <img
              src={data.thumbnailUrl}
              alt="Generated Video"
              className="w-full h-32 object-cover rounded border border-gray-200"
            />
          </div>
        )}

        {/* Duration */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Duration</div>
          <div className="text-2xl font-bold text-gray-900">
            {data.duration}s
          </div>
        </div>

        {/* Model Selection */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Model</div>
          <select
            value={data.model}
            onChange={handleModelChange}
            disabled={status === 'running'}
            className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {I2V_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.credits}/s) - {model.quality}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Cost:</span>
            <span className="text-sm font-bold text-green-600">
              {data.credits.toFixed(1)} credits
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="text-xs text-gray-600 hover:text-green-600 transition px-2 py-1 rounded hover:bg-green-50"
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
          backgroundColor: "#10b981",
          border: "2px solid white",
        }}
      />
    </div>
  );
}
