import { useHomepage } from 'src/hooks/use-homepage';

import { MainLayout } from 'src/layouts/website/main-layout';

import { HeroSection } from 'src/sections/home/hero/hero-section';
import { CaseStudySection } from 'src/sections/home/case-study/case-study-section';
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
    </MainLayout>
  );
}
