import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:privacyPolicy'),
  };
}

async function PrivacyPolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t('marketing:privacyPolicy')}
        subtitle={t('marketing:privacyPolicyDescription')}
      />

      <div className={'container mx-auto py-8 prose prose-gray dark:prose-invert max-w-3xl'}>
        <p className="text-sm text-muted-foreground">Effective Date: February 27, 2026</p>

        <h2>1. Introduction</h2>
        <p>
          TaxGrievancePro (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;)
          is committed to protecting your privacy. This Privacy Policy
          explains how we collect, use, and safeguard your information
          when you use our website and services.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>Account Information</h3>
        <ul>
          <li>Email address (for account creation and communication)</li>
          <li>Name (if provided)</li>
        </ul>
        <h3>Property Information</h3>
        <ul>
          <li>Property addresses you submit for analysis</li>
          <li>Publicly available property data (assessed values, sales records)</li>
        </ul>
        <h3>Payment Information</h3>
        <ul>
          <li>
            Payment details are processed securely by Stripe. We do not
            store your credit card number on our servers.
          </li>
        </ul>
        <h3>Automatically Collected Data</h3>
        <ul>
          <li>IP address</li>
          <li>Browser type and version</li>
          <li>Pages visited and usage patterns</li>
          <li>Device information</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide and deliver our eligibility analysis and reports</li>
          <li>To process payments</li>
          <li>To send transactional emails (e.g., report ready notifications)</li>
          <li>To improve our Service and user experience</li>
          <li>To enforce our Terms of Service and prevent fraud</li>
        </ul>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services to operate:</p>
        <ul>
          <li>
            <strong>Supabase</strong> &mdash; Authentication and database
            hosting
          </li>
          <li>
            <strong>Stripe</strong> &mdash; Payment processing
          </li>
          <li>
            <strong>Google Maps Platform</strong> &mdash; Address
            autocomplete and geocoding
          </li>
          <li>
            <strong>ATTOM / RentCast</strong> &mdash; Property and
            comparable sales data
          </li>
          <li>
            <strong>Vercel</strong> &mdash; Website hosting
          </li>
          <li>
            <strong>Resend</strong> &mdash; Transactional email delivery
          </li>
        </ul>
        <p>
          Each third-party service has its own privacy policy governing
          data handling. We encourage you to review their policies.
        </p>

        <h2>5. Data Retention</h2>
        <p>
          We retain your account data and generated reports for as long as
          your account is active. Property analysis data is stored to
          enable report generation and future reference. You may request
          deletion of your account and associated data at any time.
        </p>

        <h2>6. Data Security</h2>
        <p>
          We implement industry-standard security measures including
          encryption in transit (TLS), secure authentication, and
          row-level security in our database. However, no method of
          transmission or storage is 100% secure.
        </p>

        <h2>7. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of marketing communications</li>
          <li>Request a copy of your data in a portable format</li>
        </ul>
        <p>
          To exercise these rights, contact us at{' '}
          <a href="mailto:support@taxgrievancepro.com">
            support@taxgrievancepro.com
          </a>.
        </p>

        <h2>8. Cookies</h2>
        <p>
          We use cookies and similar technologies for authentication,
          preferences, and analytics. See our{' '}
          <a href="/cookie-policy">Cookie Policy</a> for details.
        </p>

        <h2>9. Children&apos;s Privacy</h2>
        <p>
          Our Service is not directed to children under 18. We do not
          knowingly collect personal information from children. If you
          believe we have collected data from a child, please contact us
          immediately.
        </p>

        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes
          will be posted on this page with an updated effective date.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about this Privacy Policy? Contact us at{' '}
          <a href="mailto:support@taxgrievancepro.com">
            support@taxgrievancepro.com
          </a>.
        </p>
      </div>
    </div>
  );
}

export default withI18n(PrivacyPolicyPage);
