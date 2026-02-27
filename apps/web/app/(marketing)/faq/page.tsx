import Link from 'next/link';

import { ArrowRight, ChevronDown } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:faq'),
  };
};

async function FAQPage() {
  const { t } = await createI18nServerInstance();

  const faqItems = [
    {
      question: `What is a property tax grievance?`,
      answer: `A tax grievance is a formal appeal to your local Board of Assessment Review (BAR) challenging the assessed value of your property. If your property is over-assessed compared to its actual market value, you may be entitled to a reduction in your property taxes.`,
    },
    {
      question: `How does TaxGrievancePro determine if I'm eligible?`,
      answer: `We analyze your property's current assessed value against recent comparable sales in your area. If comparable properties have sold for less than your assessed value, it indicates your property may be over-assessed — making you a strong candidate for a tax grievance.`,
    },
    {
      question: `How much does the analysis cost?`,
      answer: `Our property tax analysis report costs just $9.99 — a one-time fee with no subscriptions or hidden charges. This includes a detailed comparable sales analysis, eligibility determination, and a professional PDF report you can use to support your grievance filing.`,
    },
    {
      question: `What areas do you currently serve?`,
      answer: `We currently serve Nassau County and Suffolk County on Long Island, New York. These areas have some of the highest property tax rates in the nation, making tax grievance filings especially valuable for homeowners.`,
    },
    {
      question: `When is the deadline to file a tax grievance?`,
      answer: `In Nassau County, the grievance filing deadline is typically March 1st each year. In Suffolk County, the deadline is the third Tuesday in May. We recommend starting your analysis well in advance to ensure you have time to prepare your filing.`,
    },
    {
      question: `What payment methods do you accept?`,
      answer: `We accept all major credit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe payment processing. Your payment information is never stored on our servers.`,
    },
  ];

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => {
      return {
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      };
    }),
  };

  return (
    <>
      <script
        key={'ld:json'}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className={'flex flex-col space-y-4 xl:space-y-8'}>
        <SitePageHeader
          title={t('marketing:faq')}
          subtitle={t('marketing:faqSubtitle')}
        />

        <div className={'container flex flex-col space-y-8 pb-16'}>
          <div className="flex w-full max-w-xl flex-col">
            {faqItems.map((item, index) => {
              return <FaqItem key={index} item={item} />;
            })}
          </div>

          <div>
            <Button asChild variant={'outline'}>
              <Link href={'mailto:support@taxgrievancepro.com'}>
                <span>
                  <Trans i18nKey={'marketing:contactFaq'} />
                </span>

                <ArrowRight className={'ml-2 w-4'} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default withI18n(FAQPage);

function FaqItem({
  item,
}: React.PropsWithChildren<{
  item: {
    question: string;
    answer: string;
  };
}>) {
  return (
    <details className={'group border-b px-2 py-4 last:border-b-transparent'}>
      <summary
        className={
          'flex items-center justify-between hover:cursor-pointer hover:underline'
        }
      >
        <h2
          className={
            'hover:underline-none cursor-pointer font-sans font-medium'
          }
        >
          <Trans i18nKey={item.question} defaults={item.question} />
        </h2>

        <div>
          <ChevronDown
            className={'h-5 transition duration-300 group-open:-rotate-180'}
          />
        </div>
      </summary>

      <div className={'text-muted-foreground flex flex-col space-y-2 py-1'}>
        <Trans i18nKey={item.answer} defaults={item.answer} />
      </div>
    </details>
  );
}
