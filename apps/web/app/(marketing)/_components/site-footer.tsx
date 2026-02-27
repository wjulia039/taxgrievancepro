import { Footer } from '@kit/ui/marketing';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import { ComplianceBanner } from '~/components/compliance-banner';
import appConfig from '~/config/app.config';

export function SiteFooter() {
  return (
    <footer>
      <Footer
        logo={<AppLogo className="w-[85px] md:w-[95px]" />}
        description={<Trans i18nKey="marketing:footerDescription" />}
        copyright={
          <Trans
            i18nKey="marketing:copyright"
            values={{
              product: appConfig.name,
              year: new Date().getFullYear(),
            }}
          />
        }
        sections={[
          {
            heading: 'Product',
            links: [
              {
                href: '/#how-it-works',
                label: 'How It Works',
              },
              {
                href: '/home/check',
                label: 'Check Eligibility',
              },
              {
                href: '/faq',
                label: 'FAQ',
              },
            ],
          },
          {
            heading: 'Account',
            links: [
              {
                href: '/auth/sign-in',
                label: <Trans i18nKey="auth:signIn" />,
              },
              {
                href: '/auth/sign-up',
                label: <Trans i18nKey="auth:signUp" />,
              },
            ],
          },
          {
            heading: <Trans i18nKey="marketing:legal" />,
            links: [
              {
                href: '/terms-of-service',
                label: <Trans i18nKey="marketing:termsOfService" />,
              },
              {
                href: '/privacy-policy',
                label: <Trans i18nKey="marketing:privacyPolicy" />,
              },
              {
                href: '/cookie-policy',
                label: <Trans i18nKey="marketing:cookiePolicy" />,
              },
            ],
          },
        ]}
      />

      {/* PRD §19, §22: Persistent sitewide NY compliance copy */}
      <ComplianceBanner />
    </footer>
  );
}
