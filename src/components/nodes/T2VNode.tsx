/**
 * T2V (Text-to-Video) Node Component
 * Custom React Flow node for displaying direct T2V operations (e.g. Sora 2)
 */

import { Handle, Position, NodeProps } from "reactflow";
import { useState } from "react";
import { I2V_MODELS, calculateI2VCost, getModelById } from "@/config/models";

type NodeStatus = 'pending' | 'running' | 'completed' | 'failed';

interface T2VNodeData {
  label: string;
  duration: number;
  model: string;
  credits: number;
  sceneIndex: number;
  prompt?: string;
  status?: NodeStatus;
  artifactUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  onModelChange?: (nodeId: string, newModel: string, newCredits: number) => void;
}

export default function T2VNode({ data, selected, id }: NodeProps<T2VNodeData>) {
  const [copied, setCopied] = useState(false);
  const status = data.status || 'pending';

  const handleCopy = () => {
    navigator.clipboard.writeText(`Prompt: ${data.prompt || 'N/A'}, Duration: ${data.duration}s, Model: ${data.model}`);
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
      className={`min-w-[280px] max-w-[320px] bg-white rounded-lg border-2 transition-all ${getBorderClass()}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-t-md flex items-center gap-2">
        <span className="text-xl">🎬</span>
        <div className="flex-1">
          <div className="font-semibold text-sm">Text to Video</div>
          <div className="text-xs opacity-90">{data.label}</div>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded">Scene {data.sceneIndex}</span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Prompt Display (for T2V) */}
        {data.prompt && (
          <div>
            <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <span className="text-purple-500">✏️</span>
              Prompt
              {copied && <span className="ml-2 text-purple-500 font-medium">(Copied!)</span>}
            </div>
            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 line-clamp-2">
              {data.prompt}
            </div>
          </div>
        )}

        {/* Duration */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Duration</div>
          <div className="font-medium text-gray-800">{data.duration}s</div>
        </div>

        {/* Model Selector */}
        <div>
          <div className="text-xs text-gray-500 mb-1">Model</div>
          <select
            value={data.model}
            onChange={handleModelChange}
            className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 bg-white hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition"
            disabled={status === 'running'}
          >
            {I2V_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.credits.toFixed(2)} credits{model.id.includes('kling') ? '/s' : ''})
              </option>
            ))}
          </select>
        </div>

        {/* Cost Display */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
          <span className="text-gray-500">Cost</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium transition"
          >
            <span>{data.credits.toFixed(2)} credits</span>
            <span className="text-gray-400">📋</span>
            {!copied && <span className="text-gray-400 ml-1">Copy</span>}
          </button>
        </div>

        {/* Status Indicator */}
        {status !== 'pending' && (
          <div className={`text-xs px-3 py-2 rounded-md ${
            status === 'running' ? 'bg-blue-50 text-blue-700' :
            status === 'completed' ? 'bg-green-50 text-green-700' :
            'bg-red-50 text-red-700'
          }`}>
            {status === 'running' && '⏳ Generating video...'}
            {status === 'completed' && '✅ Video generated'}
            {status === 'failed' && `❌ ${data.error || 'Generation failed'}`}
          </div>
        )}

        {/* Video Preview (when completed) */}
        {status === 'completed' && data.artifactUrl && (
          <div className="mt-3">
            <video
              src={data.artifactUrl}
              controls
              className="w-full rounded border border-gray-200"
              style={{ maxHeight: '180px' }}
            />
          </div>
        )}
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-purple-500 border-2 border-white"
      />
    </div>
  );
}
