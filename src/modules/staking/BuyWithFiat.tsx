import { CreditCardIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon } from '@mui/material';
import { useState } from 'react';
import { useCryptoBuyAvailable } from 'src/hooks/useCryptoBuyAvailable';

import { BuyWithFiatModal } from './BuyWithFiatModal';

type BuyWithFiatProps = {
  cryptoSymbol: string;
  networkMarketName: string;
};

export const BuyWithFiat = ({ cryptoSymbol, networkMarketName }: BuyWithFiatProps) => {
  const { isAvailable } = useCryptoBuyAvailable(cryptoSymbol, networkMarketName);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return isAvailable ? (
    <>
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
        <Trans>Buy {cryptoSymbol} with Fiat</Trans>
      </Button>
      <BuyWithFiatModal cryptoSymbol={cryptoSymbol} open={open} close={handleClose} />
    </>
  ) : null;
};
