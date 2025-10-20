import React from 'react'
import { Handle, Position } from 'reactflow'

interface ImageRefNodeProps {
  data: {
    src?: string
    label?: string
  }
}

export function ImageRefNode({ data }: ImageRefNodeProps) {
  return (
    <div className="w-[220px] rounded-2xl bg-white shadow-sm border p-2 relative">
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        id="in"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ left: -6 }}
      />

      <div className="text-xs text-neutral-500 mb-1">{data.label || 'Image Reference'}</div>
      <div className="overflow-hidden rounded-xl aspect-square bg-neutral-100">
        {data.src ? (
          <img src={data.src} alt="ref" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            No Image
          </div>
        )}
      </div>

      {/* Output Handle - Right side */}
      <Handle
        type="source"
        id="out"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
        style={{ right: -6 }}
      />
    </div>
  )
}
