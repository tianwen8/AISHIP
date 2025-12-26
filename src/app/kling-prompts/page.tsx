import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kling Video Prompts - Cineprompt",
  description: "Kling-first prompt packs with motion beats and consistent character anchors.",
  openGraph: {
    title: "Kling Video Prompts - Cineprompt",
    description: "Kling-first prompt packs with motion beats and consistent character anchors.",
    type: "website",
  },
};

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
