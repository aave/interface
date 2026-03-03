import { Cancel, Close } from '@mui/icons-material';
import { Button, IconButton, Stack, Tab, Typography } from '@mui/material';
import Image from 'next/image';
import { useState } from 'react';

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
  SwapToSection,
  TabsFullWidth,
  TokenInfo,
  TokenInputRow,
} from './styles';

type Props = BaseModalProps & WithdrawModalProps;

export default function WithdrawModal({ open, onClose, token, balance }: Props) {
  const [withdrawTab, setWithdrawTab] = useState(0);
  const [orderTab, setOrderTab] = useState(1);

  const isSwapMode = withdrawTab === 1;

  return (
    <Dialog open={open} onClose={onClose}>
      <ModalCard>
        <Header>
          <Typography variant="h5">Withdraw {token}</Typography>
          <IconButton size="small" onClick={onClose}>
            <Close fontSize="small" />
          </IconButton>
        </Header>

        <TabsFullWidth value={withdrawTab} onChange={(_, v) => setWithdrawTab(v)}>
          <Tab label="withdraw" />
          <Tab label="withdraw & swap" />
        </TabsFullWidth>

        {isSwapMode && (
          <TabsFullWidth value={orderTab} onChange={(_, v) => setOrderTab(v)}>
            <Tab label="market" />
            <Tab label="limit" />
          </TabsFullWidth>
        )}

        <Stack spacing={1} width="100%">
          <SlippageRow>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              Withdraw
            </Typography>
            {isSwapMode && (
              <Stack direction="row" spacing={0.5}>
                <Typography variant="caption" sx={{ opacity: 0.5 }}>
                  Auto Slippage:
                </Typography>
                <Typography variant="caption">2.11%</Typography>
              </Stack>
            )}
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

        {isSwapMode && (
          <SwapToSection>
            <Typography variant="caption" sx={{ opacity: 0.5 }}>
              And swap to
            </Typography>
            <TokenInputRow>
              <AmountInput>
                <AmountDisplay>
                  <Typography variant="h6">0.91742061649</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    $1.42
                  </Typography>
                </AmountDisplay>
                <TokenInfo>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Image src="/icons/networks/ethereum.svg" width={16} height={16} alt="ETH" />
                    <Typography variant="caption">ETH</Typography>
                  </Stack>
                </TokenInfo>
              </AmountInput>
            </TokenInputRow>
          </SwapToSection>
        )}

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
