import { Trans } from '@lingui/macro';
import { Typography, useTheme } from '@mui/material';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { Link } from '../primitives/Link';
import { Warning } from '../primitives/Warning';

export const CooldownWarning = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const theme = useTheme();
  return (
    <Warning
      severity="warning"
      sx={{
        '.MuiAlert-message': { p: 0 },
        boxShadow: 'none !important',
        '.MuiSvgIcon-root': { color: '#FB8509' },
        bgcolor: `${theme.palette.point.riskMedium} !important`,
      }}
    >
      <Typography variant="detail1" color={theme.palette.text.secondary}>
        <Trans>Cooldown period warning</Trans>
      </Typography>
      <br />
      <Typography variant="detail4" sx={{ mt: 1 }}>
        <Trans>
          The cooldown period is the time required prior to unstaking your tokens (20 days). You can
          only withdraw your assets from the Security Module after the cooldown period and within
          the unstake window.{' '}
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
