import React from 'react'
import { Handle, Position } from 'reactflow'

interface TextPromptNodeProps {
  data: {
    text?: string
    label?: string
    onChange?: (text: string) => void
  }
}

export function TextPromptNode({ data }: TextPromptNodeProps) {
  return (
    <div className="w-[340px] rounded-2xl bg-white shadow-sm border p-3 relative">
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        id="in"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ left: -6 }}
      />

      <div className="text-xs text-neutral-500 mb-1">{data.label || 'Text Prompt'}</div>
      <textarea
        defaultValue={data.text}
        onChange={(e) => data.onChange?.(e.target.value)}
        className="w-full h-32 resize-none outline-none rounded-xl border p-3 leading-6 text-sm"
        placeholder="Enter your prompt..."
      />

      {/* Output Handle - Right side */}
      <Handle
        type="source"
        id="text"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
        style={{ right: -6 }}
      />
    </div>
  )
}
