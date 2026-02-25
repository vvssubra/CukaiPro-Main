import ContentPageLayout from './ContentPageLayout';

export default function PrivacyPage() {
  return (
    <ContentPageLayout
      title="Privacy Policy"
      subtitle="How CukaiPro collects, uses, and protects your information. Last updated for reference; consult legal for final wording."
    >
      <div className="space-y-10 text-slate-custom/80 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-3">Information we collect</h2>
          <p className="leading-relaxed">
            We collect information you provide when you sign up, use the product, or contact us: name, email, company name, and data you enter into CukaiPro (invoices, deductions, tax filings, etc.). We also collect technical data such as IP address and browser type to operate and secure the service.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-3">How we use it</h2>
          <p className="leading-relaxed">
            We use your information to provide, improve, and secure CukaiPro; to communicate with you about your account and product updates; and to comply with applicable law. We do not sell your personal data to third parties.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-3">Data retention</h2>
          <p className="leading-relaxed">
            We retain your data for as long as your account is active and as needed to provide the service, resolve disputes, and comply with legal obligations. You can request deletion of your account and associated data by contacting us.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-3">Cookies and similar technologies</h2>
          <p className="leading-relaxed">
            We use cookies and similar technologies for authentication, preferences, and analytics to improve the product. You can control cookie settings in your browser.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-display font-bold text-slate-custom dark:text-white mb-3">Contact</h2>
          <p className="leading-relaxed">
            For privacy-related questions or requests, contact us at{' '}
            <a href="mailto:support@cukaipro.my?subject=Privacy%20-%20CukaiPro" className="text-primary dark:text-emerald-400 font-medium hover:underline">support@cukaipro.my</a>.
          </p>
        </section>
        <p className="text-sm text-slate-custom/60 dark:text-gray-500 pt-4">
          This page is a placeholder structure. Final privacy policy wording should be reviewed by legal counsel.
        </p>
      </div>
    </ContentPageLayout>
  );
}
