import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";

export default async function SeedreamPromptsPage() {
  return (
    <ModelPromptsPage
      title="Seedream Video Prompts"
      subtitle="Seedream-ready storyboards"
      description="Explore Seedream and Jimeng style prompt packs built for cinematic video generation and stable continuity."
      modelFilters={["Seedream", "Jimeng"]}
    />
  );
}
