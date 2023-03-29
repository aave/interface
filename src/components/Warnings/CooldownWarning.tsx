import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { STAKE } from 'src/utils/mixPanelEvents';

import { Link } from '../primitives/Link';
import { Warning } from '../primitives/Warning';

export const CooldownWarning = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  return (
    <Warning severity="warning" sx={{ '.MuiAlert-message': { p: 0 }, mb: 6 }}>
      <Typography variant="subheader1">
        <Trans>Cooldown period warning</Trans>
      </Typography>
      <Typography variant="caption">
        <Trans>
          The cooldown period is the time required prior to unstaking your tokens (10 days). You can
          only withdraw your assets from the Security Module after the cooldown period and within
          the unstake window.
          <Link
            href="https://docs.aave.com/faq/migration-and-staking"
            fontWeight={500}
            onClick={() => trackEvent(STAKE.COOLDOWN_WARNING_LINK)}
          >
            <Trans>Learn more</Trans>
          </Link>
        </Trans>
      </Typography>
    </Warning>
  );
};
