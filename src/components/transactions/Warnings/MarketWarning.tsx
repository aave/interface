import { Trans } from '@lingui/macro';
import { Link, Typography } from '@mui/material';

import { Warning } from '../../primitives/Warning';

const WarningMessage = ({ market }: { market: string }) => {
  if (market) {
    return <Trans>Per the community, the {market} has been frozen.</Trans>;
  } else {
    return null;
  }
};

const getLink = (market: string): string => {
  //NOTE: Deprecated - can add market link again if needed
  if (market) {
    return `https://app.aave.com/governance`;
  }
  return '';
};

interface MarketWarningProps {
  marketName: string;
  forum?: boolean;
}

// NOTE: Deprecated for now as no frozen markets
export const MarketWarning = ({ marketName, forum }: MarketWarningProps) => {
  return (
    <Warning severity="error">
      <Typography variant="caption">
        <WarningMessage market={marketName} />{' '}
        <Link href={getLink(marketName)} target="_blank">
          {forum ? <Trans>Join the community discussion</Trans> : <Trans>Learn more</Trans>}
        </Link>
      </Typography>
    </Warning>
  );
};
