import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";

export default async function SoraPromptsPage() {
  return (
    <ModelPromptsPage
      title="Sora Video Prompts"
      subtitle="Sora-ready cinematic storyboards"
      description="Explore Sora-ready storyboards with shot-level detail, character anchors, and camera language built for video generation."
      modelFilters={["Sora"]}
    />
  );
}
