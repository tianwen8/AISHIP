import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tools - Cineprompt",
  description: "Explore Cineprompt tools for AI video prompts and storyboards.",
  openGraph: {
    title: "Tools - Cineprompt",
    description: "Explore Cineprompt tools for AI video prompts and storyboards.",
    type: "website",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
