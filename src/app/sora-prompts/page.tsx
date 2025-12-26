import { ModelPromptsPage } from "@/components/prompt/ModelPromptsPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sora Video Prompts - Cineprompt",
  description: "Sora-ready cinematic storyboards with shot-level prompts and continuity notes.",
  openGraph: {
    title: "Sora Video Prompts - Cineprompt",
    description: "Sora-ready cinematic storyboards with shot-level prompts and continuity notes.",
    type: "website",
  },
};

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
