import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="text-lg font-bold text-gray-900 font-display">Cineprompt</div>
            <p className="text-sm text-gray-500 mt-2">
              Shot-level prompts and storyboards for AI video creators.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <Link href="/library" className="hover:text-gray-900">Library</Link>
            <Link href="/tools/video-storyboard" className="hover:text-gray-900">AI Director</Link>
            <Link href="/pricing" className="hover:text-gray-900">Pricing</Link>
            <Link href="/contact" className="hover:text-gray-900">Contact</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
          </div>
        </div>
        <div className="mt-6 text-xs text-gray-400">
          © {new Date().getFullYear()} Cineprompt. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
