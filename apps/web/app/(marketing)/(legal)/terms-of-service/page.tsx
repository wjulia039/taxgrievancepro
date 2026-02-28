import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:termsOfService'),
  };
}

async function TermsOfServicePage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`marketing:termsOfService`)}
        subtitle={t(`marketing:termsOfServiceDescription`)}
      />

      <div className={'container mx-auto py-8 prose prose-gray dark:prose-invert max-w-3xl'}>
        <p className="text-sm text-muted-foreground">Effective Date: February 27, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the TaxGrievancePro website and services
          (&quot;Service&quot;), you agree to be bound by these Terms of
          Service. If you do not agree, please do not use the Service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          TaxGrievancePro provides an automated property tax grievance
          eligibility analysis and report preparation service for
          residential properties on Long Island, New York. The Service
          analyzes publicly available comparable sales data to help
          homeowners determine whether they may benefit from filing a
          property tax grievance with their local Board of Assessment
          Review (BAR).
        </p>

        <h2>3. Important Disclaimers</h2>
        <ul>
          <li>
            <strong>Not legal or tax advice.</strong> The Service does not
            provide legal, tax, or financial advice. Reports generated are
            informational estimates only.
          </li>
          <li>
            <strong>No government affiliation.</strong> TaxGrievancePro is
            not affiliated with, endorsed by, or connected to any
            government agency, county assessor&apos;s office, or Board of
            Assessment Review.
          </li>
          <li>
            <strong>No guarantee of results.</strong> We do not guarantee
            any reduction in your assessed value or property taxes.
            Outcomes depend on your local assessor&apos;s and BAR&apos;s
            independent review.
          </li>
          <li>
            <strong>Data accuracy.</strong> Our analysis relies on
            third-party data sources. While we strive for accuracy, we
            cannot guarantee the completeness or correctness of the
            underlying data.
          </li>
          <li>
            <strong>Free filing.</strong> Filing an RP-524 grievance with
            your local assessor or BAR is free of charge. You are
            purchasing report preparation and analysis only.
          </li>
        </ul>

        <h2>4. User Accounts</h2>
        <p>
          You must create an account to use certain features. You are
          responsible for maintaining the confidentiality of your login
          credentials and for all activities under your account.
        </p>

        <h2>5. User Obligations</h2>
        <p>You agree to:</p>
        <ul>
          <li>Provide accurate property information.</li>
          <li>Use the Service only for lawful purposes.</li>
          <li>Not attempt to reverse-engineer, scrape, or abuse the Service.</li>
          <li>Not resell or redistribute generated reports without permission.</li>
        </ul>

        <h2>6. Payment Terms</h2>
        <p>
          Reports are available for purchase at the price displayed at
          checkout. Payments are processed securely through Stripe. All
          sales are final once a report has been generated and delivered.
          If report generation fails and cannot be retried, you may
          contact us for a refund.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          All content, branding, algorithms, and report templates are the
          property of TaxGrievancePro. Reports you purchase are licensed
          for your personal use in connection with filing a property tax
          grievance.
        </p>

        <h2>8. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, TaxGrievancePro shall
          not be liable for any indirect, incidental, special, or
          consequential damages arising out of your use of the Service,
          including but not limited to lost profits or failed grievance
          outcomes. Our total liability shall not exceed the amount you
          paid for the applicable report.
        </p>

        <h2>9. Disclaimer of Warranties</h2>
        <p>
          The Service is provided &quot;as is&quot; and &quot;as
          available&quot; without warranties of any kind, either express
          or implied, including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, and
          non-infringement.
        </p>

        <h2>10. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless TaxGrievancePro, its
          officers, employees, and agents from any claims, damages, or
          expenses arising from your use of the Service or violation of
          these Terms.
        </p>

        <h2>11. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance
          with the laws of the State of New York, without regard to
          conflict of law principles.
        </p>

        <h2>12. Modifications</h2>
        <p>
          We reserve the right to update these Terms at any time. Changes
          will be posted on this page with an updated effective date.
          Continued use of the Service after changes constitutes
          acceptance of the revised Terms.
        </p>

        <h2>13. Termination</h2>
        <p>
          We may suspend or terminate your account at our discretion if
          you violate these Terms. You may delete your account at any time
          from your account settings.
        </p>

        <h2>14. Contact</h2>
        <p>
          Questions about these Terms? Contact us at{' '}
          <a href="mailto:support@taxgrievancepro.com">
            support@taxgrievancepro.com
          </a>.
        </p>
      </div>
    </div>
  );
}

export default withI18n(TermsOfServicePage);
