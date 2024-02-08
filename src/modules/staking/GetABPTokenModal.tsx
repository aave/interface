import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

type GetABPTokenModalProps = {
  open: boolean;
  close: () => void;
};

export const GetABPTokenModal = ({ open, close }: GetABPTokenModalProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <>
      <BasicModal open={open} setOpen={close}>
        <Typography variant="h2">
          <Trans>Get ABP v2 Token</Trans>
        </Typography>
        <Typography sx={{ my: 6 }}>
          <Trans>
            The Aave Balancer Pool Token (ABPT) is a liquidity pool token. You can receive ABPT by
            depositing a combination of AAVE + wstETH in the Balancer liquidity pool. You can then
            stake your BPT in the Safety Module to secure the protocol and earn Safety Incentives.
          </Trans>
        </Typography>
        <Button
          variant="outlined"
          size="large"
          endIcon={
            <SvgIcon>
              <ExternalLinkIcon />
            </SvgIcon>
          }
          fullWidth
          sx={{ px: 4 }}
          href="https://app.balancer.fi/#/ethereum/pool/0x3de27efa2f1aa663ae5d458857e731c129069f29000200000000000000000588"
          target="_blank"
          rel="noopener"
          onClick={() =>
            trackEvent(GENERAL.EXTERNAL_LINK, {
              Link: 'Get APBT Tokens',
            })
          }
        >
          <Box sx={{ display: 'flex', flexGrow: 1 }}>
            <TokenIcon symbol="BAL" sx={{ mr: 2 }} />
            <Trans>Go to Balancer Pool</Trans>
          </Box>
        </Button>
      </BasicModal>
    </>
  );
};
