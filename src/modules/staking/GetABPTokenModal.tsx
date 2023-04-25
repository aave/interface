import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import ExternalLinkButton from 'src/components/ExternalLinkButton';
import { BasicModal } from 'src/components/primitives/BasicModal';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

type GetABPTokenModalProps = {
  open: boolean;
  close: () => void;
};

export const GetABPTokenModal = ({ open, close }: GetABPTokenModalProps) => (
  <BasicModal open={open} setOpen={close}>
    <Typography variant="h2">
      <Trans>Get ABP Token</Trans>
    </Typography>
    <Typography sx={{ my: 6 }}>
      <Trans>
        The Aave Balancer Pool Token (ABPT) is a liquidity pool token. You can receive ABPT by
        depositing a combination of AAVE + ETH in the Balancer liquidity pool. You can then stake
        your BPT in the Safety Module to secure the protocol and earn Safety Incentives.
      </Trans>
    </Typography>
    <ExternalLinkButton
      size="large"
      fullWidth
      sx={{ px: 4 }}
      href="https://pools.balancer.exchange/#/pool/0xc697051d1c6296c24ae3bcef39aca743861d9a81/"
      target="_blank"
      rel="noopener"
    >
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <TokenIcon symbol="BAL" sx={{ mr: 2 }} />
        <Trans>Go to Balancer Pool</Trans>
      </Box>
    </ExternalLinkButton>
  </BasicModal>
);
