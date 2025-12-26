export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">Cineprompt</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: November 7, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Account information (email, name, profile picture via OAuth)</li>
              <li>Content you create (video prompts, generated videos)</li>
              <li>Payment information (processed securely via Creem)</li>
              <li>Usage data (page views, feature usage, error logs)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide and improve our services</li>
              <li>Process payments and manage your account</li>
              <li>Send service updates and marketing (opt-out available)</li>
              <li>Ensure security and prevent fraud</li>
              <li>Analyze usage patterns to enhance user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
            <p className="text-gray-700 mb-3">
              We do not sell your personal information. We share data only with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Service providers</strong>: Fal.ai (AI processing), Creem (payments), Vercel (hosting), Supabase (database)</li>
              <li><strong>Legal compliance</strong>: When required by law or to protect our rights</li>
              <li><strong>Business transfers</strong>: In connection with any merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Your Rights (GDPR/CCPA)</h2>
            <p className="text-gray-700 mb-3">
              You have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Access</strong>: Request a copy of your data</li>
              <li><strong>Deletion</strong>: Request deletion of your account and data</li>
              <li><strong>Correction</strong>: Update inaccurate information</li>
              <li><strong>Opt-out</strong>: Unsubscribe from marketing emails</li>
              <li><strong>Data portability</strong>: Export your data in machine-readable format</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Contact us at <a href="mailto:privacy@promptship.ai" className="text-emerald-600 hover:underline">privacy@promptship.ai</a> to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-3">
              We use cookies and similar technologies:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li><strong>Essential cookies</strong>: Required for authentication and core functionality</li>
              <li><strong>Analytics cookies</strong>: Optional, help us understand how you use our service</li>
              <li><strong>Preference cookies</strong>: Remember your settings and preferences</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can manage cookie preferences in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>HTTPS encryption for all data in transit</li>
              <li>Encrypted databases for data at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing via PCI-DSS compliant providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <p className="text-gray-700">
              We retain your data for as long as your account is active or as needed to provide services.
              When you delete your account, we will delete your personal information within 30 days,
              except where we are required to retain it for legal compliance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700">
              Our service is not intended for users under 13 years old. We do not knowingly collect
              information from children. If you believe we have collected information from a child,
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <p className="text-gray-700">
              Your data may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data in compliance
              with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes via email or a prominent notice on our service. Your continued use of the service
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700">
              For privacy-related questions or concerns, please contact:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-gray-700">Email: <a href="mailto:privacy@promptship.ai" className="text-emerald-600 hover:underline">privacy@promptship.ai</a></p>
              <p className="text-gray-700 mt-2">
                Or visit our <a href="/contact" className="text-emerald-600 hover:underline">Contact page</a>
              </p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-teal-700 transition"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
