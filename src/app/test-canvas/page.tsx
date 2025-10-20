'use client'

import { Canvas } from '@/components/canvas'
import 'reactflow/dist/style.css'

export default function TestCanvasPage() {
  const initialNodes = [
    {
      id: '1',
      type: 'textPrompt',
      position: { x: 100, y: 100 },
      data: {
        text: 'A girl gently approaches a cat, and the cat nuzzles against her. A gentle breeze blows through her hair...',
        label: 'Text Prompt'
      }
    },
    {
      id: '2',
      type: 'imageRef',
      position: { x: 500, y: 80 },
      data: {
        src: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&auto=format',
        label: 'Reference Image 1'
      }
    },
    {
      id: '3',
      type: 'imageRef',
      position: { x: 500, y: 320 },
      data: {
        src: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&auto=format',
        label: 'Reference Image 2'
      }
    },
    {
      id: '4',
      type: 'videoRef',
      position: { x: 900, y: 180 },
      data: {
        label: 'Video Reference'
      }
    }
  ]

  const initialEdges = [
    {
      id: 'e1-4',
      source: '1',
      target: '4',
      sourceHandle: 'text',
      style: { stroke: '#10b981' }
    },
    {
      id: 'e2-4',
      source: '2',
      target: '4',
      sourceHandle: 'out',
      style: { stroke: '#10b981' }
    },
    {
      id: 'e3-4',
      source: '3',
      target: '4',
      sourceHandle: 'out',
      style: { stroke: '#10b981' }
    }
  ]

  return (
    <div className="w-screen h-screen flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-white border-b flex items-center px-6 gap-4">
        <a href="/" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to Home
        </a>
        <div className="flex-1 text-center font-semibold text-gray-900">
          React Flow Canvas Test
        </div>
        <div className="text-sm text-gray-600">Phase 0 Complete ✅</div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <Canvas initialNodes={initialNodes} initialEdges={initialEdges} />
      </div>

      {/* Info Panel */}
      <div className="absolute right-6 top-24 w-72 bg-white rounded-lg shadow-lg p-4 border">
        <h3 className="font-semibold text-gray-900 mb-3">Test Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Drag nodes to test interaction</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>Scroll wheel to zoom canvas</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>View node connections</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>MiniMap in bottom right</span>
          </li>
        </ul>
        <div className="mt-4 pt-4 border-t text-xs text-gray-500">
          <p>Node Types:</p>
          <ul className="mt-2 space-y-1">
            <li>• TextPromptNode - Text input</li>
            <li>• ImageRefNode - Image reference</li>
            <li>• VideoRefNode - Video reference</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
