import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Director - Cineprompt",
  description: "Generate shot-level video storyboards and prompts with the Cineprompt AI Director.",
  openGraph: {
    title: "AI Video Director - Cineprompt",
    description: "Generate shot-level video storyboards and prompts with the Cineprompt AI Director.",
    type: "website",
  },
};

export default function VideoStoryboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
