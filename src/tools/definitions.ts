export type PlanTier = "basic" | "pro" | "free";

export interface ToolPricing {
  baseCost: number;
  previewCost: number;
  previewRequiresPro: boolean;
}

export interface ToolDefinitionMeta {
  id: string;
  name: string;
  description: string;
  pricing: ToolPricing;
  supportsPreview: boolean;
}

export const TOOL_DEFINITIONS: Record<string, ToolDefinitionMeta> = {
  "video-storyboard": {
    id: "video-storyboard",
    name: "AI Video Director",
    description: "Generate professional shot lists and prompts from a story idea.",
    pricing: {
      baseCost: 0,
      previewCost: 10,
      previewRequiresPro: true,
    },
    supportsPreview: true,
  },
};

export function getToolDefinition(toolId: string): ToolDefinitionMeta | undefined {
  return TOOL_DEFINITIONS[toolId];
}

export function getToolCost(
  tool: ToolDefinitionMeta,
  options: { withPreviewImage?: boolean; planTier?: PlanTier }
): { totalCost: number; previewAllowed: boolean } {
  const wantsPreview = !!options.withPreviewImage && tool.supportsPreview;
  const isPro = options.planTier === "pro";
  const previewAllowed = !wantsPreview
    ? true
    : !tool.pricing.previewRequiresPro || isPro;
  const totalCost = tool.pricing.baseCost + (wantsPreview ? tool.pricing.previewCost : 0);
  return { totalCost, previewAllowed };
}
