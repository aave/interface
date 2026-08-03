import { Trans } from '@lingui/macro';
import { Alert, AlertColor, Typography } from '@mui/material';

import { Link } from '../../primitives/Link';

interface IsolationModeWarningProps {
  asset?: string;
  severity?: AlertColor;
}

export const IsolationModeWarning = ({ asset, severity }: IsolationModeWarningProps) => {
  return (
    <Alert severity={severity || 'info'} sx={{ width: '100%', mb: 3 }}>
      <Typography variant="subheader1" mb={0.5}>
        <Trans>You are entering Isolation mode</Trans>
      </Typography>
      <Typography>
        <Trans>
          In Isolation mode, you cannot supply other assets as collateral. A global debt ceiling
          limits the borrowing power of the isolated asset. To exit isolation mode disable{' '}
          {asset ? asset : ''} as collateral before borrowing another asset. Read more in our{' '}
          <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">FAQ</Link>
        </Trans>
      </Typography>
    </Alert>
  );
};
