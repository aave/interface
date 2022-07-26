import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';
import { onRampServices } from 'src/ui-config/onRampServicesConfig';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { BasicModal } from 'src/components/primitives/BasicModal';

type BuyWithFiatModalProps = {
  cryptoCode: string;
  open: boolean;
  close: () => void;
};

export const BuyWithFiatModal = ({ cryptoCode, open, close }: BuyWithFiatModalProps) => {
  const { currentAccount } = useWeb3Context();
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
            selecting you agree to Terms Terms of the Provider. Your access to the service might be
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
            sx={{ px: 4, '&:not(:first-child)': { mt: 4 } }}
            href={makeLink({ network, cryptoCode, walletAddress: currentAccount })}
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
