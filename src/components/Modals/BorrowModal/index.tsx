import { Cancel, Close } from '@mui/icons-material';
import { Button, IconButton, Stack, Typography } from '@mui/material';
import Image from 'next/image';

import { BaseModalProps, BorrowModalProps } from '../types';
import {
  AmountDisplay,
  AmountInput,
  BalanceRow,
  Dialog,
  Header,
  ModalCard,
  OverviewRow,
  OverviewSection,
  TokenInfo,
  TokenInputRow,
} from './styles';

type Props = BaseModalProps & BorrowModalProps;

export default function BorrowModal({ open, onClose, token, available }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">Borrow {token}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Header>

        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          Amount
        </Typography>

        <TokenInputRow>
          <AmountInput>
            <AmountDisplay>
              <Typography variant="h6">5.669627</Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                $5.67
              </Typography>
            </AmountDisplay>
            <TokenInfo>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Image src="/icons/networks/ethereum.svg" width={16} height={16} alt={token} />
                <Typography variant="caption">{token}</Typography>
              </Stack>
              <BalanceRow>
                <Typography variant="caption">Available {available}</Typography>
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

        <OverviewSection>
          <Typography variant="caption" sx={{ opacity: 0.5 }}>
            Transaction overview
          </Typography>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            <Typography variant="body2" color="success.main">
              2.15 → 1.56
            </Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Borrow APY rate
            </Typography>
            <Typography variant="body2">3.42%</Typography>
          </OverviewRow>
        </OverviewSection>

        <Button variant="contained" size="large" fullWidth>
          Borrow {token}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
