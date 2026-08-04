import { Trans } from '@lingui/macro';
import { Alert, AlertColor, AlertTitle } from '@mui/material';

import { Link } from '../../primitives/Link';

interface IsolationModeWarningProps {
  asset?: string;
  severity?: AlertColor;
}

export const IsolationModeWarning = ({ asset, severity }: IsolationModeWarningProps) => {
  return (
    <Alert severity={severity || 'info'} sx={{ width: '100%', mb: 3 }}>
      <AlertTitle>
        <Trans>You are entering Isolation mode</Trans>
      </AlertTitle>
      <Trans>
        In Isolation mode, you cannot supply other assets as collateral. A global debt ceiling
        limits the borrowing power of the isolated asset. To exit isolation mode disable{' '}
        {asset ? asset : ''} as collateral before borrowing another asset. Read more in our{' '}
        <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">FAQ</Link>
      </Trans>
    </Alert>
  );
};
