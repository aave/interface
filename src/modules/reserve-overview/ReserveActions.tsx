import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { WalletIcon } from 'src/components/icons/WalletIcon';
import { getMarketInfoById } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Warning } from 'src/components/primitives/Warning';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { usePermissions } from 'src/hooks/usePermissions';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { BuyWithFiat } from 'src/modules/staking/BuyWithFiat';
import { useRootStore } from 'src/store/root';
import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { amountToUSD } from 'src/utils/utils';

import { CapType } from '../../components/caps/helper';
import { AvailableTooltip } from '../../components/infoTooltips/AvailableTooltip';
import { Link, ROUTES } from '../../components/primitives/Link';
import { useReserveActionState } from '../../hooks/useReserveActionState';

interface ReserveActionsProps {
  reserve: ComputedReserveData;
}

export const ReserveActions = ({ reserve }: ReserveActionsProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string>(reserve.symbol);

  const { currentAccount, loading: loadingWeb3Context } = useWeb3Context();
  const { isPermissionsLoading } = usePermissions();
  const { openBorrow, openSupply } = useModalContext();
  const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
  const { user, loading: loadingReserves, marketReferencePriceInUsd } = useAppDataContext();
  const { walletBalances, loading: loadingWalletBalance } = useWalletBalances();
  const {
    poolComputed: { minRemainingBaseTokenBalance },
  } = useRootStore();

  const { baseAssetSymbol } = currentNetworkConfig;
  let balance = walletBalances[reserve.underlyingAsset];
  if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
    balance = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()];
  }

  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(
    reserve,
    user,
    InterestRate.Variable
  ).toString();

  const maxAmountToBorrowUSD = amountToUSD(
    maxAmountToBorrow,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd
  ).toString();

  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    balance?.amount || '0',
    reserve,
    reserve.underlyingAsset,
    minRemainingBaseTokenBalance
  ).toString();

  const maxAmountToSupplyUSD = amountToUSD(
    maxAmountToSupply,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd
  ).toString();

  const { disableSupplyButton, disableBorrowButton, alerts } = useReserveActionState({
    balance: balance?.amount || '0',
    maxAmountToSupply,
    maxAmountToBorrow,
    reserve,
  });

  if (!currentAccount && !isPermissionsLoading) {
    return <ConnectWallet loading={loadingWeb3Context} />;
  }

  if (loadingReserves || loadingWalletBalance) {
    return <ActionsSkeleton />;
  }

  const onSupplyClicked = () => {
    if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
      openSupply(API_ETH_MOCK_ADDRESS.toLowerCase());
    } else {
      openSupply(reserve.underlyingAsset);
    }
  };

  const { market } = getMarketInfoById(currentMarket);

  return (
    <PaperWrapper>
      {reserve.isWrappedBaseAsset && (
        <Box>
          <WrappedBaseAssetSelector
            assetSymbol={reserve.symbol}
            baseAssetSymbol={baseAssetSymbol}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />
        </Box>
      )}
      <WalletBalance
        balance={balance.amount}
        symbol={selectedAsset}
        marketTitle={market.marketTitle}
      />
      {reserve.isFrozen ? (
        <Box sx={{ mt: 3 }}>
          <FrozenWarning />
        </Box>
      ) : (
        <>
          <Divider sx={{ my: 6 }} />
          <Stack gap={3}>
            <SupplyAction
              value={maxAmountToSupply}
              usdValue={maxAmountToSupplyUSD}
              symbol={selectedAsset}
              disable={disableSupplyButton}
              onActionClicked={onSupplyClicked}
            />
            <BorrowAction
              value={maxAmountToBorrow}
              usdValue={maxAmountToBorrowUSD}
              symbol={selectedAsset}
              disable={disableBorrowButton}
              onActionClicked={() => openBorrow(reserve.underlyingAsset)}
            />
            {alerts}
          </Stack>
        </>
      )}
    </PaperWrapper>
  );
};

const FrozenWarning = () => {
  return (
    <Warning sx={{ mb: 0 }} severity="error" icon={true}>
      <Trans>
        Since this asset is frozen, the only available actions are withdraw and repay which can be
        accessed from the <Link href={ROUTES.dashboard}>Dashboard</Link>
      </Trans>
    </Warning>
  );
};

const ActionsSkeleton = () => {
  const RowSkeleton = (
    <Stack>
      <Skeleton width={150} height={14} />
      <Stack
        sx={{ height: '44px' }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <Skeleton width={100} height={14} sx={{ mt: 1, mb: 2 }} />
          <Skeleton width={75} height={12} />
        </Box>
        <Skeleton height={36} width={96} />
      </Stack>
    </Stack>
  );

  return (
    <PaperWrapper>
      <Stack direction="row" gap={3}>
        <Skeleton width={42} height={42} sx={{ borderRadius: '12px' }} />
        <Box>
          <Skeleton width={100} height={12} sx={{ mt: 1, mb: 2 }} />
          <Skeleton width={100} height={14} />
        </Box>
      </Stack>
      <Divider sx={{ my: 6 }} />
      <Box>
        <Stack gap={3}>
          {RowSkeleton}
          {RowSkeleton}
        </Stack>
      </Box>
    </PaperWrapper>
  );
};

const PaperWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
      <Typography variant="h3" sx={{ mb: 6 }}>
        <Trans>Your info</Trans>
      </Typography>

      {children}
    </Paper>
  );
};

const ConnectWallet = ({ loading }: { loading: boolean }) => {
  return (
    <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
            <Trans>Your info</Trans>
          </Typography>
          <Typography sx={{ mb: 6 }} color="text.secondary">
            <Trans>Please connect a wallet to view your personal information here.</Trans>
          </Typography>
          <ConnectWalletButton />
        </>
      )}
    </Paper>
  );
};

interface ActionProps {
  value: string;
  usdValue: string;
  symbol: string;
  disable: boolean;
  onActionClicked: () => void;
}

const SupplyAction = ({ value, usdValue, symbol, disable, onActionClicked }: ActionProps) => {
  return (
    <Stack>
      <AvailableTooltip
        variant="description"
        text={<Trans>Available to supply</Trans>}
        capType={CapType.supplyCap}
      />
      <Stack
        sx={{ height: '44px' }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <ValueWithSymbol value={value} symbol={symbol} />
          <FormattedNumber
            value={usdValue}
            variant="subheader2"
            color="text.muted"
            symbolsColor="text.muted"
            symbol="USD"
          />
        </Box>
        <Button
          sx={{ height: '36px', width: '96px' }}
          onClick={onActionClicked}
          disabled={disable}
          fullWidth={false}
          variant="contained"
          data-cy="supplyButton"
        >
          <Trans>Supply</Trans>
        </Button>
      </Stack>
    </Stack>
  );
};

const BorrowAction = ({ value, usdValue, symbol, disable, onActionClicked }: ActionProps) => {
  return !disable ? (
    <Stack>
      <AvailableTooltip
        variant="description"
        text={<Trans>Available to borrow</Trans>}
        capType={CapType.borrowCap}
      />
      <Stack
        sx={{ height: '44px' }}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box>
          <ValueWithSymbol value={value} symbol={symbol} />
          <FormattedNumber
            value={usdValue}
            variant="subheader2"
            color="text.muted"
            symbolsColor="text.muted"
            symbol="USD"
          />
        </Box>
        <Button
          sx={{ height: '36px', width: '96px' }}
          onClick={onActionClicked}
          disabled={disable}
          fullWidth={false}
          variant="contained"
          data-cy="borrowButton"
        >
          <Trans>Borrow</Trans>
        </Button>
      </Stack>
    </Stack>
  ) : null;
};

const WrappedBaseAssetSelector = ({
  assetSymbol,
  baseAssetSymbol,
  selectedAsset,
  setSelectedAsset,
}: {
  assetSymbol: string;
  baseAssetSymbol: string;
  selectedAsset: string;
  setSelectedAsset: (value: string) => void;
}) => {
  return (
    <StyledToggleButtonGroup
      color="primary"
      value={selectedAsset}
      exclusive
      onChange={(_, value) => setSelectedAsset(value)}
      sx={{ width: '100%', height: '36px', p: 0.5, mb: 4 }}
    >
      <StyledToggleButton value={assetSymbol}>
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          {assetSymbol}
        </Typography>
      </StyledToggleButton>

      <StyledToggleButton value={baseAssetSymbol}>
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          {baseAssetSymbol}
        </Typography>
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
};

interface ValueWithSymbolProps {
  value: string;
  symbol: string;
  children?: ReactNode;
}

const ValueWithSymbol = ({ value, symbol, children }: ValueWithSymbolProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <FormattedNumber value={value} variant="h4" color="text.primary" />
      <Typography variant="buttonL" color="text.secondary">
        {symbol}
      </Typography>
      {children}
    </Stack>
  );
};

interface WalletBalanceProps {
  balance: string;
  symbol: string;
  marketTitle: string;
}
const WalletBalance = ({ balance, symbol, marketTitle }: WalletBalanceProps) => {
  const theme = useTheme();

  return (
    <Stack direction="row" gap={3}>
      <Box
        sx={(theme) => ({
          width: '42px',
          height: '42px',
          background: theme.palette.background.surface,
          border: `0.5px solid ${theme.palette.background.disabled}`,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <WalletIcon sx={{ stroke: `${theme.palette.text.secondary}` }} />
      </Box>
      <Box>
        <Typography variant="description" color="text.secondary">
          Wallet balance
        </Typography>
        <ValueWithSymbol value={balance} symbol={symbol}>
          <Box sx={{ ml: 2 }}>
            <BuyWithFiat cryptoSymbol={symbol} networkMarketName={marketTitle} />
          </Box>
        </ValueWithSymbol>
      </Box>
    </Stack>
  );
};
