import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - Cineprompt",
  description: "Sign in to access Cineprompt storyboards and saved runs.",
  openGraph: {
    title: "Sign In - Cineprompt",
    description: "Sign in to access Cineprompt storyboards and saved runs.",
    type: "website",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
