import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";

export default async function KlingPromptsPage() {
  return (
    <ModelPromptsPage
      title="Kling Video Prompts"
      subtitle="Kling-first storyboards"
      description="Discover Kling-friendly prompt packs with motion beats, framing notes, and consistent character anchors."
      modelFilters={["Kling"]}
    />
  );
}
