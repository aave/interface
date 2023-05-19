import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

const WarningMessage = ({ market }: { market: string }) => {
  if (market === 'Harmony') {
    return (
      <Trans>
        Due to the Horizon bridge exploit, certain assets on the Harmony network are not at parity
        with Ethereum, which affects the Aave V3 Harmony market.
      </Trans>
    );
  } else if (market === 'Fantom') {
    return <Trans>Per the community, the Fantom market has been frozen.</Trans>;
  } else {
    // TODO REMOVE AFTER AIP
    return (
      <Trans>
        A recently implemented AIP (Aave Improvement Proposal) has unexpectedly disrupted the
        interest rate strategy on the WETH, WBTC, WMATIC, and USDT reserves. As a consequence, it is
        not possible to deposit, withdraw or transfer from the impacted reserves.
      </Trans>
    );
  }
};

const getLink = (market: string, forum: boolean | undefined): string => {
  if (market === 'Harmony') {
    if (forum) {
      return 'https://governance.aave.com/t/harmony-horizon-bridge-exploit-consequences-to-aave-v3-harmony/8614';
    } else {
      return 'https://snapshot.org/#/aave.eth/proposal/0x81a78109941e5e0ac6cb5ebf82597c839c20ad6821a8c3ff063dba39032533d4';
    }
  } else if (market === 'Fantom') {
    if (forum) {
      return 'https://governance.aave.com/t/arc-aave-v3-fantom-freeze-reserves/9166';
    } else {
      return 'https://snapshot.org/#/aave.eth/proposal/0xeefcd76e523391a14cfd0a79b531ea0a3faf0eb4a058e255fac13a2d224cc647';
    }
  } else {
    // TODO REMOVE AFTER AIP

    return 'https://governance.aave.com/t/arfc-aave-v2-interest-rate-curve-recommendations-from-gauntlet-2023-04-21/12846/11';
  }
};

interface MarketWarningProps {
  marketName: string;
  forum?: boolean;
}

export const MarketWarning = ({ marketName, forum }: MarketWarningProps) => {
  return (
    <Warning severity="error">
      <Typography variant="caption">
        <WarningMessage market={marketName} />{' '}
        <Link href={getLink(marketName, forum)} target="_blank">
          {forum ? <Trans>Join the community discussion</Trans> : <Trans>Learn more</Trans>}
        </Link>
      </Typography>
    </Warning>
  );
};
