import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Cineprompt",
  description: "Privacy policy for Cineprompt.",
  openGraph: {
    title: "Privacy Policy - Cineprompt",
    description: "Privacy policy for Cineprompt.",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
