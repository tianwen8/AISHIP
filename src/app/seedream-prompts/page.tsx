import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seedream Video Prompts - Cineprompt",
  description: "Seedream and Jimeng-ready storyboards built for cinematic video continuity.",
  openGraph: {
    title: "Seedream Video Prompts - Cineprompt",
    description: "Seedream and Jimeng-ready storyboards built for cinematic video continuity.",
    type: "website",
  },
};

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
