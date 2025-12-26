import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cineprompt Pricing - Video Prompt Plans",
  description: "Choose a plan for AI video prompts and Flux preview credits.",
  openGraph: {
    title: "Cineprompt Pricing - Video Prompt Plans",
    description: "Choose a plan for AI video prompts and Flux preview credits.",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
