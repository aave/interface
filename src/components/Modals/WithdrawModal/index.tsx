import { Cancel, Close } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';

import { BaseModalProps, WithdrawModalProps } from '../types';
import {
  AmountDisplay,
  AmountInput,
  BalanceRow,
  Dialog,
  Header,
  ModalCard,
  OverviewRow,
  OverviewSection,
  SlippageRow,
  TokenInfo,
  TokenInputRow
} from './styles';

type Props = BaseModalProps & WithdrawModalProps;

export default function WithdrawModal({ open, onClose, token, balance }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">Withdraw {token}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Header>

        <Stack spacing={1} width="100%">
          <SlippageRow>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              Withdraw
            </Typography>
          </SlippageRow>

          <TokenInputRow>
            <AmountInput>
              <AmountDisplay>
                <Typography variant="h6">1</Typography>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  $1.00
                </Typography>
              </AmountDisplay>
              <TokenInfo>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Image src="/icons/networks/ethereum.svg" width={16} height={16} alt={token} />
                  <Typography variant="caption">{token}</Typography>
                </Stack>
                <BalanceRow>
                  <Typography variant="caption">Balance {balance}</Typography>
                  <Typography variant="caption" color="primary">
                    MAX
                  </Typography>
                </BalanceRow>
              </TokenInfo>
              <IconButton size="small" sx={{ opacity: 0.5 }}>
                <Cancel fontSize="small" />
              </IconButton>
            </AmountInput>
          </TokenInputRow>
        </Stack>

        <OverviewSection>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Transaction overview
          </Typography>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Remaining supply
            </Typography>
            <Typography variant="body2">
              8.00 {token} → 7.00 {token}
            </Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            <Typography variant="body2" color="success.main">
              1.70 → 1.56
            </Typography>
          </OverviewRow>
        </OverviewSection>

        <Button variant="contained" size="large" fullWidth>
          Withdraw {token}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
