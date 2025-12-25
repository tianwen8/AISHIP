import { VideoStoryboardTool, VideoStoryboardInputSchema } from "./video-storyboard";
import { z } from "zod";
import { getToolDefinition, ToolDefinitionMeta } from "./definitions";

// Define the generic interface for any tool in AISHIP
export interface ToolDefinition<Input = any, Output = any> {
  meta: ToolDefinitionMeta;
  inputSchema: z.ZodType<Input>;
  run: (input: Input) => Promise<Output>;
}

// Instance of the Video Storyboard Tool
const videoStoryboardMeta = getToolDefinition("video-storyboard");
if (!videoStoryboardMeta) {
  throw new Error("Missing tool definition: video-storyboard");
}

const videoStoryboard: ToolDefinition = {
  meta: videoStoryboardMeta,
  inputSchema: VideoStoryboardInputSchema,
  run: async (input) => {
    const tool = new VideoStoryboardTool();
    return await tool.run(input);
  },
};

// The Registry Map
export const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  "video-storyboard": videoStoryboard,
  // Future tools go here:
  // "logo-generator": logoGenerator,
  // "script-writer": scriptWriter,
};

export function getTool(toolId: string): ToolDefinition | undefined {
  return TOOL_REGISTRY[toolId];
}
