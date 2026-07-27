import AnalyticsBanner from 'src/components/Analytics/AnalyticsConsent';
import TopBarNotify from 'src/layouts/TopBarNotify';
import { SavingsGhoBanner } from 'src/modules/markets/Gho/GhoBanner';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

// Mainnet-keyed mock campaign so the (preview) top-bar banner always has content to render,
// independent of the store's current chain — TopBarNotify's preview mode also falls back to the
// first campaign here if the active chain doesn't match.
const PREVIEW_CAMPAIGNS = {
  1: {
    notifyText: 'Aave V4 is now live on Ethereum mainnet.',
    buttonText: 'Try it out',
    buttonAction: {
      type: 'url' as const,
      value: 'https://pro.aave.com',
      target: '_blank' as const,
    },
    bannerVersion: 'showcase',
  },
};

/**
 * Live gallery of the app's page-level banners. The two normally state-gated banners
 * (`TopBarNotify`, `AnalyticsBanner`) are rendered in `preview` mode so they always show and don't
 * read/mutate real dismissal or consent state; `SavingsGhoBanner` renders live off app context.
 */
export const BannersSection = () => (
  <Section
    title="Banners"
    description="Page-level promotional, announcement, and consent banners from across the app."
  >
    <Specimen label="sGHO markets banner — SavingsGhoBanner (default)" fullWidth>
      <SavingsGhoBanner hasLegacyPositionOverride={false} />
    </Specimen>
    <Specimen label="sGHO markets banner — SavingsGhoBanner (legacy stkGHO holder)" fullWidth>
      <SavingsGhoBanner hasLegacyPositionOverride />
    </Specimen>
    <Specimen label="V4 top-bar announcement — TopBarNotify" fullWidth>
      <TopBarNotify preview campaigns={PREVIEW_CAMPAIGNS} />
    </Specimen>
    <Specimen label="Analytics consent — AnalyticsBanner" fullWidth>
      <AnalyticsBanner preview />
    </Specimen>
  </Section>
);
