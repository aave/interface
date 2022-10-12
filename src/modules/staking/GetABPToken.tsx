import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { useState } from 'react';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

import { GetABPTokenModal } from './GetABPTokenModal';

export const GetABPToken = () => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <DarkTooltip title="Get ABP tokens to stake within the Aave Protocol">
        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          data-cy={`getAbp-token`}
          startIcon={
            <Box sx={{ mr: -1 }}>
              <TokenIcon symbol="BAL" sx={{ fontSize: '14px' }} />
            </Box>
          }
        >
          <Trans>Get ABP Token</Trans>
        </Button>
      </DarkTooltip>
      <GetABPTokenModal open={open} close={handleClose} />
    </>
  );
};
