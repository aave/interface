import { Trans } from '@lingui/macro';
import { Link, Typography, AlertColor } from '@mui/material';

import { Warning } from '../../primitives/Warning';

interface MarketWarningProps {
  learnMore?: boolean; // Modify wording on link text,
  warningMessage: string;
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
        <Trans>
          {warningMessage}
          <Link href={linkHref} target="_blank">
            {learnMore ? 'Learn More' : 'Join the community discussion'}
          </Link>
        </Trans>
      </Typography>
    </Warning>
  );
};
