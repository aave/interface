import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';

export const BUSDOffBoardingWarning = () => {
  return (
    <Trans>
      This asset is planned to be offboarded due to an Aave Protocol Governance decision.{' '}
      <Link
        href="https://governance.aave.com/t/arfc-busd-offboarding-plan/12170"
        sx={{ textDecoration: 'underline' }}
      >
        <Trans>More details</Trans>
      </Link>
    </Trans>
  );
};
