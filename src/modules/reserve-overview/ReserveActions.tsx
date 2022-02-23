import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';

import { CapType } from '../../components/caps/helper';
import { ConnectWalletPaper } from '../../components/ConnectWalletPaper';
import { AvailableTooltip } from '../../components/infoTooltips/AvailableTooltip';
import { Row } from '../../components/primitives/Row';

const PaperWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
      <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
        <Trans>Your info</Trans>
      </Typography>

      {children}
    </Paper>
  );
};

interface ReserveActionsProps {
  underlyingAsset: string;
}

export const ReserveActions = ({ underlyingAsset }: ReserveActionsProps) => {
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { openBorrow, openSupply } = useModalContext();

  const { currentAccount, loading: web3Loading } = useWeb3Context();
  const { user, reserves, loading: loadingReserves } = useAppDataContext();
  const { walletBalances, loading: loadingBalance } = useWalletBalances();

  if (!currentAccount)
    return (
      <ConnectWalletPaper
        description={
          <Trans>To see your supplies and borrowings options, connect your wallet.</Trans>
        }
        loading={web3Loading}
        sx={{ minHeight: 301 }}
      />
    );

  if (loadingReserves || loadingBalance)
    return (
      <PaperWrapper>
        <Row
          caption={<Skeleton width={100} height={20} />}
          align="flex-start"
          mb={6}
          captionVariant="description"
        >
          <Skeleton width={70} height={20} />
        </Row>

        <Row caption={<Skeleton width={100} height={20} />} mb={3}>
          <Skeleton width={70} height={20} />
        </Row>

        <Row caption={<Skeleton width={100} height={20} />} mb={10}>
          <Skeleton width={70} height={20} />
        </Row>

        <Stack direction="row" spacing={2}>
          <Skeleton width={downToXSM ? '100%' : 70} height={36} />
          <Skeleton width={downToXSM ? '100%' : 70} height={36} />
        </Stack>
      </PaperWrapper>
    );

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const balance = walletBalances[underlyingAsset];
  const canBorrow = assetCanBeBorrowedByUser(poolReserve, user);
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(
    poolReserve,
    user,
    InterestRate.Variable
  ).toString();
  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    balance.amount,
    poolReserve,
    underlyingAsset
  ).toString();

  return (
    <PaperWrapper>
      <Row
        caption={<Trans>Wallet balance</Trans>}
        align="flex-start"
        mb={6}
        captionVariant="description"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <FormattedNumber
            value={balance?.amount || 0}
            variant="secondary14"
            symbol={poolReserve.symbol}
          />
          <FormattedNumber
            value={balance?.amountUSD || '0'}
            variant="helperText"
            color="text.muted"
            symbolsColor="text.muted"
            symbol="USD"
          />
        </Box>
      </Row>

      <Row
        caption={
          <AvailableTooltip
            variant="description"
            text={<Trans>Available to supply</Trans>}
            capType={CapType.supplyCap}
          />
        }
        mb={3}
      >
        <FormattedNumber
          value={maxAmountToSupply}
          variant="secondary14"
          symbol={poolReserve.symbol}
        />
      </Row>

      <Row
        caption={
          <AvailableTooltip
            variant="description"
            text={<Trans>Available to borrow</Trans>}
            capType={CapType.borrowCap}
          />
        }
        mb={10}
      >
        <FormattedNumber
          value={canBorrow ? maxAmountToBorrow : '0'}
          variant="secondary14"
          symbol={poolReserve.symbol}
        />
      </Row>

      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          onClick={() => openSupply(underlyingAsset)}
          fullWidth={downToXSM}
        >
          <Trans>Supply</Trans> {downToXSM && poolReserve.symbol}
        </Button>
        <Button
          disabled={!canBorrow}
          variant="contained"
          onClick={() => openBorrow(underlyingAsset)}
          fullWidth={downToXSM}
        >
          <Trans>Borrow</Trans> {downToXSM && poolReserve.symbol}
        </Button>
      </Stack>
    </PaperWrapper>
  );
};
