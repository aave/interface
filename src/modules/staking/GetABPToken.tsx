import { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { GetAPBTokenModal } from './GetABPTokenModal';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

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
          startIcon={
            <Box sx={{ mr: -1 }}>
              <TokenIcon symbol="BAL" sx={{ fontSize: '14px' }} />
            </Box>
          }
        >
          <Trans>Get ABP Token</Trans>
        </Button>
      </DarkTooltip>
      <GetAPBTokenModal open={open} close={handleClose} />
    </>
  );
};
