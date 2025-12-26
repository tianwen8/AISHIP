"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sparkles, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function Header() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [previewCredits, setPreviewCredits] = useState<number | null>(null);
  const [planTier, setPlanTier] = useState<"basic" | "pro" | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Fetch credits when session is active
  const refreshCredits = async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/user/credits");
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setPreviewCredits(data.data.preview_credits ?? 0);
        setPlanTier(data.data.plan_tier || null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    refreshCredits();
  }, [status, pathname]);

  useEffect(() => {
    const handler = () => {
      refreshCredits();
    };
    window.addEventListener("credits-updated", handler);
    return () => window.removeEventListener("credits-updated", handler);
  }, [status]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            P
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight font-display">PromptShip</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/library" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            Library
          </Link>
          <Link href="/tools/video-storyboard" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            AI Director
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition">
            Pricing
          </Link>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          {status === "loading" ? (
             <div className="w-20 h-8 bg-gray-100 rounded animate-pulse"></div>
          ) : status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-4">
              {/* Plan Badge */}
              <Link href="/pricing" className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-xs font-semibold border border-gray-100 hover:bg-gray-100 transition">
                <span>{planTier === "pro" ? "Pro" : planTier === "basic" ? "Basic" : "Free"}</span>
              </Link>

              {/* Credits Badge */}
              <Link href="/pricing" className="group flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100 hover:bg-emerald-100 transition">
                <Sparkles className="w-3 h-3 text-emerald-600 group-hover:animate-pulse" />
                <span>
                  Preview {previewCredits !== null ? previewCredits : "..."}
                </span>
              </Link>

              {/* User Dropdown (Simplified as direct links for MVP) */}
              <div className="flex items-center gap-3">
                 <Link href="/account" title="Dashboard">
                    {session.user.image ? (
                        <img 
                            src={session.user.image} 
                            alt={session.user.name || "User"} 
                            className="w-8 h-8 rounded-full border border-gray-200"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white text-xs font-bold">
                            {session.user.name?.[0] || "U"}
                        </div>
                    )}
                 </Link>
                 
                 <button 
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-400 hover:text-red-600 transition"
                    title="Sign Out"
                 >
                    <LogOut className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition"
              >
                Sign In
              </Link>
              <Link
                href="/login" // Or register
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition shadow-sm hover:translate-y-[-1px]"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-600"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-4 pb-6 shadow-lg absolute w-full left-0">
          <nav className="flex flex-col gap-4">
            <Link href="/library" className="text-base font-medium text-gray-900 py-2 border-b border-gray-50">Library</Link>
            <Link href="/tools/video-storyboard" className="text-base font-medium text-gray-900 py-2 border-b border-gray-50">AI Director Tool</Link>
            <Link href="/pricing" className="text-base font-medium text-gray-900 py-2 border-b border-gray-50">Pricing</Link>
            
            {status === "authenticated" ? (
               <>
                 <Link href="/account" className="text-base font-medium text-emerald-700 py-2 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" /> My Dashboard
                 </Link>
                 <button 
                    onClick={() => signOut()}
                    className="text-base font-medium text-red-600 py-2 flex items-center gap-2 text-left"
                 >
                    <LogOut className="w-4 h-4" /> Sign Out
                 </button>
               </>
            ) : (
               <Link href="/login" className="mt-2 w-full py-3 bg-gray-900 text-white text-center rounded-lg font-medium">
                 Sign In / Sign Up
               </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
