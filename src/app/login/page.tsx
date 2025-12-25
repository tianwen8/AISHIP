"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
const githubEnabled = process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED === "true";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/account");
    }
  }, [status, router]);

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: "/account" });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2 font-display">
            PromptShip
          </h1>
          <p className="text-gray-600">
            Generate cinematic shot lists and prompts in minutes.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {[
            "Director-level shot planning",
            "Free credits for new accounts",
            "Export prompts for Sora, Kling, Veo, Runway",
            "Prompt library + SEO pages built-in",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="text-emerald-600 font-semibold">-</span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {googleEnabled && (
            <Button
              onClick={() => handleSignIn("google")}
              disabled={isLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 flex items-center justify-center gap-3"
            >
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>
          )}

          {githubEnabled && (
            <Button
              onClick={() => handleSignIn("github")}
              disabled={isLoading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center gap-3"
            >
              {isLoading ? "Signing in..." : "Continue with GitHub"}
            </Button>
          )}
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={() => router.push("/")}
            className="text-sm text-gray-600"
          >
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
