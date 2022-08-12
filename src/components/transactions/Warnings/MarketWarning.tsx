import { Trans } from '@lingui/macro';
import { AlertColor, Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

interface MarketWarningProps {
  learnMore?: boolean; // Modify wording on link text
  warningMessage: string;
  linkHref?: string;
  warningType: AlertColor;
  market?: string;
}
const HarmonyWarning =
  'Due to the Horizon bridge exploit, certain assets on the Harmony network are not at parity with Ethereum, which affects the Aave V3 Harmony market.';
const HarmonyHref =
  'https://governance.aave.com/t/harmony-horizon-bridge-exploit-consequences-to-aave-v3-harmony/8614';
const FantomWarning = 'Per the community, the fantom market has been disabled.';
const FantomHref =
  'https://snapshot.org/#/aave.eth/proposal/0xeefcd76e523391a14cfd0a79b531ea0a3faf0eb4a058e255fac13a2d224cc647';

export const MarketWarning = ({
  learnMore,
  warningMessage,
  linkHref,
  warningType,
  market,
}: MarketWarningProps) => {
  return (
    <Warning severity={warningType}>
      <Typography variant="caption">
        <Trans>
          {market === 'Harmony' && warningMessage === ''
            ? HarmonyWarning
            : market === 'Fantom' && warningMessage === ''
            ? FantomWarning
            : warningMessage}
          {market === 'Harmony' ? (
            <Link href={HarmonyHref} target="_blank">
              {learnMore ? ' Learn More' : ' Join the community discussion'}
            </Link>
          ) : market === 'Fantom' ? (
            <Link href={FantomHref} target="_blank">
              Learn More
            </Link>
          ) : (
            <Link href={linkHref} target="_blank">
              {learnMore ? ' Learn More' : ' Join the community discussion'}
            </Link>
          )}
        </Trans>
      </Typography>
    </Warning>
  );
};
