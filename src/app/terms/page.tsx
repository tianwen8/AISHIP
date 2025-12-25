export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg"></div>
            <span className="text-xl font-bold text-gray-900">PromptShip</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 7, 2025</p>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing or using PromptShip ("Service"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Service Description</h2>
            <p className="text-gray-700">
              PromptShip provides AI-powered video generation services on a subscription basis.
              We use cutting-edge AI models to help you create professional videos quickly and easily.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Account Responsibilities</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You must be at least 13 years old to use this service</li>
              <li>You must provide accurate and complete registration information</li>
              <li>You are responsible for maintaining the security of your account and password</li>
              <li>You are responsible for all activities that occur under your account</li>
              <li>You must notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-3">
              <strong>You may NOT use our service to create:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Illegal content or content that violates any laws or regulations</li>
              <li>Harmful, abusive, threatening, or discriminatory content</li>
              <li>Content that infringes on copyrights, trademarks, or other intellectual property rights</li>
              <li>Deepfakes or misleading content without clear disclosure</li>
              <li>Content depicting minors in inappropriate contexts</li>
              <li>Spam, malware, or content designed to harm computer systems</li>
              <li>Content that violates the privacy or publicity rights of others</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Violation of this policy may result in immediate account termination without refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Content</h3>
            <p className="text-gray-700 mb-3">
              You retain full ownership of videos you create using our service. We claim no ownership rights
              to your generated content.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Commercial Use</h3>
            <p className="text-gray-700 mb-3">
              Commercial use of generated videos is allowed with paid subscriptions (Starter, Pro, or Business plans).
              Free tier users may only use videos for personal, non-commercial purposes.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Platform</h3>
            <p className="text-gray-700">
              All rights, title, and interest in the PromptShip software, website, and branding remain
              our exclusive property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Billing & Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Subscriptions are billed monthly or annually depending on your chosen plan</li>
              <li>Subscriptions renew automatically until canceled</li>
              <li>You can cancel your subscription at any time (no refunds for unused credits)</li>
              <li>Power Units (credits) expire at the end of each billing period</li>
              <li>Unused credits do not roll over to the next billing period</li>
              <li>We reserve the right to change pricing with 30 days advance notice</li>
              <li>Refunds are issued at our sole discretion for service failures or errors on our part</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Availability</h2>
            <p className="text-gray-700">
              We strive to maintain 99% uptime but do not guarantee uninterrupted service. The service
              may be temporarily unavailable for maintenance, upgrades, or due to circumstances beyond
              our control. We are not liable for any losses resulting from service downtime.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Account Termination</h2>
            <p className="text-gray-700 mb-3">
              <strong>We may suspend or terminate your account if:</strong>
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>You violate these Terms of Service</li>
              <li>Your payment fails or you have an outstanding balance</li>
              <li>We suspect fraudulent or abusive activity</li>
              <li>Required by law or legal process</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You may delete your account at any time through account settings or by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimers</h2>
            <p className="text-gray-700">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.
              We disclaim all warranties, express or implied, including warranties of merchantability,
              fitness for a particular purpose, and non-infringement. We are not responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mt-3">
              <li>The accuracy, quality, or appropriateness of AI-generated content</li>
              <li>Third-party service failures (AI model providers, payment processors, etc.)</li>
              <li>Content created by other users displayed in our gallery</li>
              <li>Any losses or damages resulting from your use of the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, our total liability for all claims related to the
              service is limited to the amount you paid us in the past 12 months. We are not liable for
              any indirect, incidental, consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
            <p className="text-gray-700">
              You agree to indemnify and hold us harmless from any claims, damages, or expenses arising
              from your use of the service, your violation of these terms, or your violation of any rights
              of another party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law & Disputes</h2>
            <p className="text-gray-700 mb-3">
              These Terms are governed by the laws of [Your Country/State], without regard to conflict
              of law principles.
            </p>
            <p className="text-gray-700">
              Any disputes will be resolved through binding arbitration, except that either party may
              bring claims in small claims court if they qualify.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to Terms</h2>
            <p className="text-gray-700">
              We may modify these Terms at any time. We will notify you of material changes via email
              or a prominent notice on our service. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Information</h2>
            <p className="text-gray-700">
              For questions about these Terms, please contact:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p className="text-gray-700">Email: <a href="mailto:support@promptship.ai" className="text-emerald-600 hover:underline">support@promptship.ai</a></p>
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
