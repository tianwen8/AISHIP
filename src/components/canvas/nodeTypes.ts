import { ImageRefNode } from './nodes/ImageRefNode'
import { TextPromptNode } from './nodes/TextPromptNode'
import { VideoRefNode } from './nodes/VideoRefNode'

/**
 * Node type registry for React Flow
 * Add new node types here to make them available in the canvas
 */
export const nodeTypes = {
  imageRef: ImageRefNode,
  textPrompt: TextPromptNode,
  videoRef: VideoRefNode,
}

// Export individual node components for direct use
export { ImageRefNode, TextPromptNode, VideoRefNode }
