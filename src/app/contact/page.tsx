export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900 font-display">Cineprompt</span>
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center font-display">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-12 text-center">
          Questions, feedback, or partnership ideas? We respond within 1-2 business days.
        </p>

        <div className="space-y-6 mb-12">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-emerald-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700 text-lg font-semibold flex-shrink-0">
                S
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Support</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Technical issues, account help, or general questions.
                </p>
                <a
                  href="mailto:support@promptship.ai"
                  className="text-emerald-600 hover:underline font-medium"
                >
                  support@promptship.ai
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-teal-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 text-lg font-semibold flex-shrink-0">
                B
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Business</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Partnerships, enterprise plans, or custom tooling.
                </p>
                <a
                  href="mailto:business@promptship.ai"
                  className="text-teal-600 hover:underline font-medium"
                >
                  business@promptship.ai
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-slate-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 text-lg font-semibold flex-shrink-0">
                P
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Privacy</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Privacy concerns, data requests, or compliance questions.
                </p>
                <a
                  href="mailto:privacy@promptship.ai"
                  className="text-slate-600 hover:underline font-medium"
                >
                  privacy@promptship.ai
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2 font-display">Response time</h3>
          <p className="text-gray-600 text-sm">
            We reply to all inquiries within 24-48 hours on business days.
          </p>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Back to Home
          </a>
        </div>
      </main>
    </div>
  );
}
