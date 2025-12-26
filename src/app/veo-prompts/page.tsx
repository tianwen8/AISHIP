import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Veo Video Prompts - Cineprompt",
  description: "Director-grade Veo storyboards with camera language and continuity anchors.",
  openGraph: {
    title: "Veo Video Prompts - Cineprompt",
    description: "Director-grade Veo storyboards with camera language and continuity anchors.",
    type: "website",
  },
};

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
