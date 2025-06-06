import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';

import { Link } from '../primitives/Link';
import { Warning } from '../primitives/Warning';
import { SecondsToString } from '../SecondsToString';

const TWENTY_DAYS = 20 * 24 * 60 * 60;

export const CooldownWarning = ({ cooldownSeconds }: { cooldownSeconds?: number }) => {
  const cooldownTime = cooldownSeconds || TWENTY_DAYS;

  const trackEvent = useRootStore((store) => store.trackEvent);
  return (
    <Warning severity="warning" sx={{ '.MuiAlert-message': { p: 0 }, mb: 6 }}>
      <Typography variant="subheader1">
        <Trans>Cooldown period warning</Trans>
      </Typography>
      <Typography variant="caption">
        <Trans>
          The cooldown period is the time required prior to unstaking your tokens (
          <SecondsToString seconds={cooldownTime} />
          ). You can only withdraw your assets from the Security Module after the cooldown period
          and within the unstake window.{' '}
          <Link
            href="https://docs.aave.com/faq/migration-and-staking"
            fontWeight={500}
            onClick={() =>
              trackEvent(GENERAL.EXTERNAL_LINK, {
                Link: 'Cooldown Period Warning',
              })
            }
          >
            <Trans>Learn more</Trans>
          </Link>
        </Trans>
      </Typography>
    </Warning>
  );
};
