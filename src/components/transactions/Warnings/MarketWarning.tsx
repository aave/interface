import { Trans } from '@lingui/macro';
import { Link, Typography, AlertColor } from '@mui/material';
import { ReactNode } from 'react';

import { Warning } from '../../primitives/Warning';

interface MarketWarningProps {
  learnMore?: boolean; // Modify wording on link text,
  warningMessage: ReactNode;
  linkHref?: string;
  warningType: AlertColor;
}

export const MarketWarning = ({
  learnMore,
  warningMessage,
  linkHref,
  warningType,
}: MarketWarningProps) => {
  return (
    <Warning severity={warningType}>
      <Typography variant="caption">
        {warningMessage}{' '}
        <Link href={linkHref} target="_blank">
          {learnMore ? <Trans>Learn More</Trans> : <Trans>Join the community discussion</Trans>}
        </Link>
      </Typography>
    </Warning>
  );
};
