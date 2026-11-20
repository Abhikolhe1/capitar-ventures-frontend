import { useHomepage } from 'src/hooks/use-homepage';

import { MainLayout } from 'src/layouts/website/main-layout';

import { PageMeta } from 'src/components/website/page-meta';

import { TeamSection } from 'src/sections/home/team/team-section';
import { HeroSection } from 'src/sections/home/hero/hero-section';
import { CaseStudySection } from 'src/sections/home/case-study/case-study-section';
import { TestimonialsSection } from 'src/sections/home/testimonials/testimonials-section';
import { InsightsNewsSection } from 'src/sections/home/insights-news/insights-news-section';
import { CapitalEfficiencySection } from 'src/sections/home/capital-efficiency/capital-efficiency-section';
import { CapitarDifferenceSection } from 'src/sections/home/capitar-difference/capitar-difference-section';
import { PortfolioProofPointsSection } from 'src/sections/home/portfolio-proof-points/portfolio-proof-points-section';

export default function HomePage() {
  const { content, loading } = useHomepage();
  const footer = content.global.footer;
  const origin = window.location.origin;
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Capitar Ventures',
    url: `${origin}/`,
    logo: `${origin}/assets/capitar/logo.svg`,
    ...(footer?.email ? { email: footer.email } : {}),
    ...(footer?.phone ? { telephone: footer.phone } : {}),
    ...(footer?.address ? { address: { '@type': 'PostalAddress', streetAddress: footer.address, addressCountry: 'IN' } } : {}),
    sameAs: (footer?.socialLinks ?? []).filter((link) => link.enabled && link.href?.startsWith('https://')).map((link) => link.href),
  };
  return (
    <MainLayout global={content.global} loading={loading}>
      <PageMeta
        setTitle
        title="Capitar Ventures | Venture Debt for Startups in India"
        description="Capitar Ventures is a SEBI-registered Category II AIF providing venture debt to early-stage startups in India."
        path="/"
        jsonLd={organization}
      />
      <HeroSection data={content.hero} />
      <PortfolioProofPointsSection data={content.portfolioProofPoints} />
      <CapitalEfficiencySection data={content.capitalEfficiency} />
      <CapitarDifferenceSection data={content.capitarDifference} />
      <CaseStudySection data={content.caseStudy} />
      <TeamSection data={content.team} />
      <InsightsNewsSection data={content.insightsNews} />
      <TestimonialsSection data={content.testimonials} />
    </MainLayout>
  );
}
