export type Media = {
  url: string;
  alternativeText?: string;
  width?: number;
  height?: number;
  mime?: string;
};
export type ContentLink = {
  label: string;
  href?: string;
  enabled: boolean;
  showIndicator?: boolean;
};
export type GlobalContent = {
  brandLogo?: Media;
  navigation: ContentLink[];
  headerCta?: ContentLink;
};
export type HeroContent = {
  enabled: boolean;
  announcementText?: string;
  announcementLink?: ContentLink;
  heading: string;
  emphasisText?: string;
  description?: string;
  backgroundImage?: Media;
  backgroundImageMobile?: Media;
  backgroundVideo?: Media;
  primaryCta?: ContentLink;
  trustedClientsTitle?: string;
  trustedClients: { name: string; logo: Media; width: number; height?: number }[];
};
export type ProofMetricContent = {
  value: number;
  prefix?: string;
  valueSuffix?: string;
  suffix?: string;
  label: string;
};
export type PortfolioProofPointsContent = {
  enabled: boolean;
  sectionLabel: string;
  heading: string;
  mutedText?: string;
  backgroundLeft?: Media;
  backgroundRight?: Media;
  metrics: ProofMetricContent[];
};
export type HomepageContent = {
  global: GlobalContent;
  hero: HeroContent;
  portfolioProofPoints?: PortfolioProofPointsContent;
  capitalEfficiency?: CapitalEfficiencyContent;
};
export type CapitalBenefitContent = {
  title: string;
  description?: string;
  layout: 'standard' | 'wide' | 'tall';
  artworkWidth?: number;
  icon?: Media;
  artwork?: Media;
};
export type CapitalEfficiencyContent = {
  enabled: boolean;
  sectionLabel: string;
  heading: string;
  description?: string;
  backgroundImage?: Media;
  benefits: CapitalBenefitContent[];
};
