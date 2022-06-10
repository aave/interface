import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { ContentWithTooltip } from './ContentWithTooltip';

export const FaucetButton = () => {
  const [open, setOpen] = useState(false);

  const tooltip = (
    <Box>
      <Typography variant="caption">
        <Trans>Get free assets to test Aave protocol</Trans>
      </Typography>
    </Box>
  );

  const onClick = () => {
    window.open(`${window.location.origin}/faucet`);
  };

  return (
    <ContentWithTooltip tooltipContent={tooltip} open={open} setOpen={setOpen} withoutHover>
      <Button
        variant="outlined"
        size="small"
        onClick={onClick}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <Typography sx={{ display: 'inline-flex', alignItems: 'center' }} variant="buttonS">
          <Trans>Faucet</Trans>
          <SvgIcon sx={{ fontSize: '14px', mx: '2px' }}>
            <ExternalLinkIcon />
          </SvgIcon>
        </Typography>
      </Button>
    </ContentWithTooltip>
  );
};
