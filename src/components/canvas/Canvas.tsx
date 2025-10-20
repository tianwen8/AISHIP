'use client'

import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  type Node,
  type Edge,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { nodeTypes } from './nodeTypes'

interface CanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onNodesChange?: (nodes: Node[]) => void
  onEdgesChange?: (edges: Edge[]) => void
}

export function Canvas({
  initialNodes = [],
  initialEdges = [],
  onNodesChange: externalNodesChange,
  onEdgesChange: externalEdgesChange,
}: CanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: any) => {
      const newEdge = {
        ...params,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: '#10b981' },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  // Notify external handlers when nodes/edges change
  React.useEffect(() => {
    if (externalNodesChange) {
      externalNodesChange(nodes)
    }
  }, [nodes, externalNodesChange])

  React.useEffect(() => {
    if (externalEdgesChange) {
      externalEdgesChange(edges)
    }
  }, [edges, externalEdgesChange])

  return (
    <div className="w-full h-full bg-neutral-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background className="opacity-60" gap={16} />
        <MiniMap className="!bottom-6 !right-6" />
        <Controls />
      </ReactFlow>
    </div>
  )
}
