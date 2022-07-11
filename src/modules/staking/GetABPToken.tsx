import { useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon, Typography } from '@mui/material';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { GetAPBTokenModal } from './GetABPTokenModal';

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
        <Button variant="outlined" size="small" onClick={handleClick}>
          <Typography sx={{ display: 'inline-flex', alignItems: 'center' }} variant="buttonS">
            <Trans>Get ABP Token</Trans>
            <SvgIcon sx={{ fontSize: '14px', mx: '2px' }}>
              <ChevronRightIcon />
            </SvgIcon>
          </Typography>
        </Button>
      </DarkTooltip>
      <GetAPBTokenModal open={open} close={handleClose} />
    </>
  );
};
