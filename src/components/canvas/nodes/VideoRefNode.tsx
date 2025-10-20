import React from 'react'
import { Handle, Position } from 'reactflow'

interface VideoRefNodeProps {
  data: {
    videoUrl?: string
    label?: string
  }
}

export function VideoRefNode({ data }: VideoRefNodeProps) {
  return (
    <div className="w-[240px] h-[180px] rounded-2xl bg-white shadow-sm border p-3 flex flex-col relative">
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        id="in"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500 !border-2 !border-white"
        style={{ left: -6 }}
      />

      <div className="text-xs text-neutral-500">{data.label || 'Video Reference'}</div>
      <div className="flex-1 mt-2 rounded-xl border-2 border-dashed border-neutral-300 grid place-items-center text-neutral-400">
        {data.videoUrl ? (
          <video src={data.videoUrl} className="w-full h-full rounded-xl object-cover" controls />
        ) : (
          <div className="text-sm">Upload Video</div>
        )}
      </div>

      {/* Output Handle - Right side */}
      <Handle
        type="source"
        id="video"
        position={Position.Right}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-white"
        style={{ right: -6 }}
      />
    </div>
  )
}
