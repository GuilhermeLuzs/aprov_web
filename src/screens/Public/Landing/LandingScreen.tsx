import { AboutSection } from './AboutSection';
import { CommunitySection } from './CommunitySection';
import { CompanyBand } from './CompanyBand';
import { FaqSection } from './FaqSection';
import { FinalCallSection } from './FinalCallSection';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { MauricioSection } from './MauricioSection';
import { RewardsSection } from './RewardsSection';
import { HighlightsStrip } from './HighlightsStrip';

export default function LandingScreen() {
  return (
    <>
      <HeroSection />
      <HighlightsStrip />
      <AboutSection />
      <HowItWorksSection />
      <RewardsSection />
      <MauricioSection />
      <CommunitySection />
      <CompanyBand />
      <FaqSection />
      <FinalCallSection />
    </>
  );
}
