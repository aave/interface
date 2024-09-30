import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

const WarningMessage = ({ market }: { market: string }) => {
  if (market === 'Ethereum AMM') {
    return <Trans>Per the community, the V2 AMM market has been deprecated.</Trans>;
  } else {
    return null;
  }
};

const getLink = (market: string): string => {
  if (market === 'Ethereum AMM') {
    return 'https://governance-v2.aave.com/governance/proposal/239';
  } else {
    return '';
  }
};

interface MarketWarningProps {
  marketName: string;
  forum?: boolean;
}

export const PolygonWarning = () => {
  return (
    <Warning severity="error">
      <Typography variant="caption">
        <Trans>
          Update: Disruptions reported for WETH, WBTC, WMATIC, and USDT. AIP 230 will resolve the
          disruptions and the market will be operating as normal on ~26th May 13h00 UTC.{' '}
        </Trans>
        <Link href={getLink('proto_polygon', true)} target="_blank">
          <Trans>Read more here.</Trans>
        </Link>
      </Typography>
    </Warning>
  );
};

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
