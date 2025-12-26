import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";

export default async function VeoPromptsPage() {
  return (
    <ModelPromptsPage
      title="Veo Video Prompts"
      subtitle="Built for Veo cinematics"
      description="Browse Veo-focused storyboards with clear continuity notes, camera moves, and scene prompts tuned for video."
      modelFilters={["Veo"]}
    />
  );
}
