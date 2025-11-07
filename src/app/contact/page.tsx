export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">AI Video Studio</span>
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">Contact Us</h1>
        <p className="text-lg text-gray-600 mb-12 text-center">
          Have questions? We're here to help!
        </p>

        {/* Contact Cards */}
        <div className="space-y-6 mb-12">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                📧
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">General Support</h3>
                <p className="text-gray-600 text-sm mb-2">
                  For technical issues, account help, or general questions
                </p>
                <a
                  href="mailto:support@aivideostudio.com"
                  className="text-blue-600 hover:underline font-medium"
                >
                  support@aivideostudio.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-purple-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                💼
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Business Inquiries</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Partnerships, enterprise plans, or custom solutions
                </p>
                <a
                  href="mailto:business@aivideostudio.com"
                  className="text-purple-600 hover:underline font-medium"
                >
                  business@aivideostudio.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-green-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                🔒
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Privacy & Security</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Data protection, privacy concerns, or GDPR/CCPA requests
                </p>
                <a
                  href="mailto:privacy@aivideostudio.com"
                  className="text-green-600 hover:underline font-medium"
                >
                  privacy@aivideostudio.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-orange-500 transition">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-2xl flex-shrink-0">
                🐛
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">Report a Bug</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Found a bug or technical issue? Let us know!
                </p>
                <a
                  href="mailto:bugs@aivideostudio.com"
                  className="text-orange-600 hover:underline font-medium"
                >
                  bugs@aivideostudio.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Follow Us</h2>
          <div className="flex justify-center gap-6">
            <a
              href="https://twitter.com/aivideostudio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
              </svg>
              Twitter/X
            </a>
            <a
              href="https://linkedin.com/company/aivideostudio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Response Time</h3>
          <p className="text-gray-600 text-sm">
            We typically respond to all inquiries within 24-48 hours on business days.
            For urgent issues, please mention "URGENT" in your subject line.
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
