import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:cookiePolicy'),
  };
}

async function CookiePolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <SitePageHeader
        title={t(`marketing:cookiePolicy`)}
        subtitle={t(`marketing:cookiePolicyDescription`)}
      />

      <div className={'container mx-auto py-8 prose prose-gray dark:prose-invert max-w-3xl'}>
        <p className="text-sm text-muted-foreground">Effective Date: February 27, 2026</p>

        <h2>1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device when you
          visit a website. They help the site remember your preferences
          and understand how you interact with the service.
        </p>

        <h2>2. Cookies We Use</h2>

        <h3>Essential Cookies</h3>
        <p>
          These cookies are required for the Service to function. They
          include authentication session cookies managed by Supabase,
          which keep you logged in securely. You cannot opt out of
          essential cookies as they are necessary for core functionality.
        </p>

        <h3>Functional Cookies</h3>
        <p>
          These cookies remember your preferences, such as theme settings
          (light or dark mode) and language selection.
        </p>

        <h3>Analytics Cookies</h3>
        <p>
          We may use analytics cookies to understand how visitors use our
          website, which pages are most popular, and how users navigate
          the Service. This data helps us improve the experience. Analytics
          data is aggregated and does not personally identify you.
        </p>

        <h2>3. Third-Party Cookies</h2>
        <p>Some third-party services used on our site may set their own cookies:</p>
        <ul>
          <li>
            <strong>Stripe</strong> &mdash; May set cookies for fraud
            prevention during payment processing.
          </li>
          <li>
            <strong>Google Maps</strong> &mdash; May set cookies when the
            address autocomplete feature is used.
          </li>
        </ul>

        <h2>4. Managing Cookies</h2>
        <p>
          Most web browsers allow you to control cookies through their
          settings. You can typically:
        </p>
        <ul>
          <li>View what cookies are stored on your device</li>
          <li>Delete individual or all cookies</li>
          <li>Block cookies from specific or all websites</li>
          <li>Configure your browser to notify you when a cookie is set</li>
        </ul>
        <p>
          Please note that disabling essential cookies may prevent you
          from using certain features of the Service, including logging in
          to your account.
        </p>

        <h2>5. Changes to This Policy</h2>
        <p>
          We may update this Cookie Policy from time to time. Changes will
          be posted on this page with an updated effective date.
        </p>

        <h2>6. Contact</h2>
        <p>
          Questions about our use of cookies? Contact us at{' '}
          <a href="mailto:support@taxgrievancepro.com">
            support@taxgrievancepro.com
          </a>.
        </p>
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
