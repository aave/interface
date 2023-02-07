import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { onRampServices } from 'src/ui-config/onRampServicesConfig';

type BuyWithFiatModalProps = {
  cryptoSymbol: string;
  open: boolean;
  close: () => void;
};

export const BuyWithFiatModal = ({ cryptoSymbol, open, close }: BuyWithFiatModalProps) => {
  const { currentAccount: walletAddress } = useWeb3Context();
  const {
    currentNetworkConfig: { name: network },
  } = useProtocolDataContext();

  return (
    <BasicModal open={open} setOpen={close}>
      <Typography variant="h2">
        <Trans>Buy Crypto with Fiat</Trans>
      </Typography>
      <Typography sx={{ my: 6 }}>
        {onRampServices.length && onRampServices.length === 1 ? (
          <Trans>
            {onRampServices[0].name} on-ramp service is provided by External Provider and by
            selecting you agree to Terms of the Provider. Your access to the service might be
            reliant on the External Provider being operational.
          </Trans>
        ) : (
          <Trans>Choose one of the on-ramp services</Trans>
        )}
      </Typography>
      <Box>
        {onRampServices.map(({ name, makeLink, icon }) => (
          <Button
            key={name}
            variant="outlined"
            size="large"
            endIcon={
              <SvgIcon>
                <ExternalLinkIcon />
              </SvgIcon>
            }
            fullWidth
            sx={{ px: 4, '&:not(:first-of-type)': { mt: 4 } }}
            href={makeLink({ cryptoSymbol, network, walletAddress })}
            target="_blank"
            rel="noopener"
          >
            <Box sx={{ display: 'flex', flexGrow: 1 }}>
              <SvgIcon sx={{ mr: 2 }}>{icon}</SvgIcon>
              <Trans>
                {onRampServices.length === 1 ? 'Continue with ' : null}
                {name}
              </Trans>
            </Box>
          </Button>
        ))}
      </Box>
    </BasicModal>
  );
};
