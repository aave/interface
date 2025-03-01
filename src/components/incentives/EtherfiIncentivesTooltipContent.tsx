import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { useState } from 'react';
import { useRootStore } from 'src/store/root';
import { DASHBOARD } from 'src/utils/mixPanelEvents';

import { Link } from '../primitives/Link';

export const EtherFiAirdropTooltipContent = ({ multiplier }: { multiplier: number }) => {
  return (
    <Box>
      <Trans>
        {`This asset is eligible for the Ether.fi Loyalty program with a `}
        <b>x{multiplier} multiplier</b>
        {`.`}
      </Trans>
      <br />
      <Trans>Learn more about the Ether.fi program</Trans>{' '}
      <Link
        href="https://etherfi.gitbook.io/etherfi/getting-started/loyalty-points"
        sx={{ textDecoration: 'underline' }}
        variant="caption"
        color="text.secondary"
      >
        here
      </Link>
      .
      <br />
      <br />
      <Trans>Aave Labs does not guarantee the program and accepts no liability.</Trans>
    </Box>
  );
};

export const ContentEtherfiButton = ({ multiplier }: { multiplier: number }) => {
  const [open, setOpen] = useState(false);
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Box
      sx={(theme) => ({
        p: { xs: '0 4px', xsm: '2px 4px' },
        border: `1px solid ${open ? theme.palette.action.disabled : theme.palette.divider}`,
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.2s ease',
        bgcolor: open ? 'action.hover' : 'transparent',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'action.disabled',
        },
      })}
      onClick={() => {
        trackEvent(DASHBOARD.VIEW_LM_DETAILS_DASHBOARD, {});
        setOpen(!open);
      }}
    >
      <Box sx={{ mr: 2 }}>
        <Typography component="span" variant="secondary12" color="text.secondary">
          {`${multiplier}x`}
        </Typography>
      </Box>
      <Box sx={{ display: 'inline-flex' }}>
        <img src={'/icons/other/ether.fi.svg'} width={12} height={12} alt="ether.fi-icon" />
      </Box>
    </Box>
  );
};
