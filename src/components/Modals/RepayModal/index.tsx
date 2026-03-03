import { Cancel, Close } from '@mui/icons-material';
import { Button, IconButton, Stack, Tab, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

import { BaseModalProps, RepayModalProps } from '../types';
import {
  AmountDisplay,
  AmountInput,
  BalanceRow,
  Dialog,
  Header,
  ModalCard,
  OverviewRow,
  OverviewSection,
  TabsFullWidth,
  TokenInfo,
  TokenInputRow,
} from './styles';

type Props = BaseModalProps & RepayModalProps;

export default function RepayModal({ open, onClose, token, balance }: Props) {
  const [sourceTab, setSourceTab] = useState(0);

  const isCollateral = sourceTab === 1;

  return (
    <Dialog open={open} onClose={onClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">Repay {token}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Header>

        <TabsFullWidth value={sourceTab} onChange={(_, v) => setSourceTab(v)}>
          <Tab label="Wallet balance" />
          <Tab label="Collateral" />
        </TabsFullWidth>

        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          Amount
        </Typography>

        <TokenInputRow>
          <AmountInput>
            <AmountDisplay>
              <Typography variant="h6">0.00108</Typography>
              <Typography variant="caption" sx={{ opacity: 0.5 }}>
                $1.87
              </Typography>
            </AmountDisplay>
            <TokenInfo>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Image src="/icons/networks/ethereum.svg" width={16} height={16} alt={token} />
                <Typography variant="caption">{token}</Typography>
              </Stack>
              <BalanceRow>
                <Typography variant="caption">
                  {isCollateral ? 'Supply balance' : 'Wallet balance'} {balance}
                </Typography>
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
              Remaining debt
            </Typography>
            <Typography variant="body2">
              0.00212 {token} → 0.00104 {token}
            </Typography>
          </OverviewRow>
          <OverviewRow>
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              Health factor
            </Typography>
            <Typography variant="body2" color="success.main">
              1.70 → 2.14
            </Typography>
          </OverviewRow>
        </OverviewSection>

        <Button variant="contained" size="large" fullWidth>
          {isCollateral ? `Repay with collateral` : `Repay ${token}`}
        </Button>
      </ModalCard>
    </Dialog>
  );
}
