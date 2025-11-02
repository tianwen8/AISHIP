/**
 * TTS (Text-to-Speech) Node Component
 * Custom React Flow node for displaying TTS operations
 */

import { Handle, Position, NodeProps } from "reactflow";
import { useState } from "react";
import { TTS_MODELS, getModelById } from "@/config/models";

type NodeStatus = 'pending' | 'running' | 'completed' | 'failed';

interface TTSNodeData {
  label: string;
  script: string;
  voice: string;
  model: string;
  credits: number;
  status?: NodeStatus;
  artifactUrl?: string;
  error?: string;
  onModelChange?: (nodeId: string, newModel: string, newCredits: number) => void;
}

export default function TTSNode({ data, selected, id }: NodeProps<TTSNodeData>) {
  const [copied, setCopied] = useState(false);
  const status = data.status || 'pending';

  const handleCopy = () => {
    navigator.clipboard.writeText(data.script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = e.target.value;
    const modelConfig = getModelById(newModelId, 'tts');

    if (modelConfig && data.onModelChange) {
      data.onModelChange(id, newModelId, modelConfig.credits);
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

        {/* Audio Player (if completed) */}
        {status === 'completed' && data.artifactUrl && (
          <div className="mb-3">
            <audio controls className="w-full">
              <source src={data.artifactUrl} type="audio/mpeg" />
            </audio>
          </div>
        )}

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

        {/* Model Selection */}
        <div className="mb-3">
          <div className="text-xs text-gray-500 mb-1">Model</div>
          <select
            value={data.model}
            onChange={handleModelChange}
            disabled={status === 'running'}
            className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            {TTS_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} ({model.credits} PU) - {model.quality}
              </option>
            ))}
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Cost:</span>
            <span className="text-sm font-bold text-orange-600">
              {data.credits.toFixed(1)} Power Units
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
