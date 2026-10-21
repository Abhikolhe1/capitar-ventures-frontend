import { useHomepage } from 'src/hooks/use-homepage';

import { MainLayout } from 'src/layouts/website/main-layout';

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
  return (
    <MainLayout global={content.global} loading={loading}>
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
