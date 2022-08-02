import React, { useState } from 'react';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon } from '@mui/material';
import { CreditCardIcon } from '@heroicons/react/outline';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { BuyWithFiatModal } from './BuyWithFiatModal';

type BuyWithFiatProps = {
  cryptoCode: string;
};

export const BuyWithFiat = ({ cryptoCode }: BuyWithFiatProps) => {
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
      <DarkTooltip title={`Buy ${cryptoCode} to stake within the Safety Module`}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClick}
          startIcon={
            <SvgIcon sx={{ mr: -1 }}>
              <CreditCardIcon />
            </SvgIcon>
          }
        >
          <Trans>Buy {cryptoCode} with Fiat</Trans>
        </Button>
      </DarkTooltip>
      <BuyWithFiatModal cryptoCode={cryptoCode} open={open} close={handleClose} />
    </>
  );
};
