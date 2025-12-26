import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Cineprompt",
  description: "Contact the Cineprompt team.",
  openGraph: {
    title: "Contact - Cineprompt",
    description: "Contact the Cineprompt team.",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
