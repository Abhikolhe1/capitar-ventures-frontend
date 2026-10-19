import { useHomepage } from 'src/hooks/use-homepage';

import { MainLayout } from 'src/layouts/website/main-layout';

import { HeroSection } from 'src/sections/home/hero/hero-section';
import { PortfolioProofPointsSection } from 'src/sections/home/portfolio-proof-points/portfolio-proof-points-section';

export default function HomePage() {
  const { content, loading } = useHomepage();
  return (
    <MainLayout global={content.global} loading={loading}>
      <HeroSection data={content.hero} />
      <PortfolioProofPointsSection data={content.portfolioProofPoints} />
    </MainLayout>
  );
}
