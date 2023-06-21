import { CreditCardIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Button, SvgIcon } from '@mui/material';
import { useState } from 'react';
import { useCryptoBuyAvailable } from 'src/hooks/useCryptoBuyAvailable';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { BuyWithFiatModal } from './BuyWithFiatModal';

type BuyWithFiatProps = {
  cryptoSymbol: string;
  networkMarketName: string;
  funnel?: string;
};

export const BuyWithFiat = ({ cryptoSymbol, networkMarketName, funnel }: BuyWithFiatProps) => {
  const { isAvailable } = useCryptoBuyAvailable(cryptoSymbol, networkMarketName);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const open = Boolean(anchorEl);
  const trackEvent = useRootStore((store) => store.trackEvent);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    trackEvent(GENERAL.OPEN_MODAL, {
      modal: 'Buy crypto with fiat',
      assetName: cryptoSymbol,
      funnel: funnel,
    });
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
