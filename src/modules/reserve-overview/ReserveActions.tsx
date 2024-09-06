import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import { BigNumberValue, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  PaperProps,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { ComponentProps, ReactNode, useState } from 'react';
import { WalletIcon2 } from 'src/components/icons/WalletIcon2';
import { getMarketInfoById } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Warning } from 'src/components/primitives/Warning';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useTonBalance, useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { BuyWithFiat } from 'src/modules/staking/BuyWithFiat';
import { useRootStore } from 'src/store/root';
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { amountToUsd } from 'src/utils/utils';

import { CapType } from '../../components/caps/helper';
import { AvailableTooltip } from '../../components/infoTooltips/AvailableTooltip';
import { Link, ROUTES } from '../../components/primitives/Link';
import { useReserveActionState } from '../../hooks/useReserveActionState';

const amountToUSD = (
  amount: BigNumberValue,
  formattedPriceInMarketReferenceCurrency: string,
  marketReferencePriceInUsd: string
) => {
  return valueToBigNumber(amount)
    .multipliedBy(formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)
    .toString();
};

interface ReserveActionsProps {
  reserve: ComputedReserveData;
}

export const ReserveActions = ({ reserve }: ReserveActionsProps) => {
  const [selectedAsset, setSelectedAsset] = useState<string>(reserve.symbol);

  const { currentAccount, loading: loadingWeb3Context } = useWeb3Context();
  const { isConnectedTonWallet } = useTonConnectContext();
  const { openBorrow, openSupply } = useModalContext();
  const currentMarket = useRootStore((store) => store.currentMarket);
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  const {
    ghoReserveData,
    user,
    loading: loadingReserves,
    marketReferencePriceInUsd,
    yourWalletBalanceTon,
  } = useAppDataContext();
  const { walletBalances, loading: loadingWalletBalance } = useWalletBalances(currentMarketData);

  const [minRemainingBaseTokenBalance] = useRootStore((store) => [
    store.poolComputed.minRemainingBaseTokenBalance,
  ]);
  const { baseAssetSymbol } = currentNetworkConfig;
  let balance = walletBalances[reserve.underlyingAsset];
  if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
    balance = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()];
  }

  let maxAmountToBorrow = '0';
  let maxAmountToSupply = '0';
  const isGho = displayGhoForMintableMarket({ symbol: reserve.symbol, currentMarket });

  if (isGho && user) {
    const maxMintAmount = getMaxGhoMintAmount(user, reserve);
    maxAmountToBorrow = BigNumber.min(
      maxMintAmount,
      valueToBigNumber(ghoReserveData.aaveFacilitatorRemainingCapacity)
    ).toString();
    maxAmountToSupply = '0';
  } else if (user) {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(
      reserve,
      user,
      InterestRate.Variable,
      isConnectedTonWallet
    ).toString();

    maxAmountToSupply = getMaxAmountAvailableToSupply(
      balance?.amount || '0',
      reserve,
      reserve.underlyingAsset,
      minRemainingBaseTokenBalance
    ).toString();
  }

  const maxAmountToBorrowUsd = amountToUsd(
    maxAmountToBorrow,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd
  ).toString();

  const maxAmountToSupplyUsd = amountToUSD(
    maxAmountToSupply,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd
  ).toString();

  const { disableSupplyButton, disableBorrowButton, alerts } = useReserveActionState({
    balance: balance?.amount || '0',
    maxAmountToSupply: maxAmountToSupply.toString(),
    maxAmountToBorrow: maxAmountToBorrow.toString(),
    reserve,
  });

  if (!currentAccount) {
    return <ConnectWallet loading={loadingWeb3Context} />;
  }

  if ((loadingReserves || loadingWalletBalance) && !isConnectedTonWallet) {
    return <ActionsSkeleton />;
  }

  const onSupplyClicked = () => {
    if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
      openSupply(API_ETH_MOCK_ADDRESS.toLowerCase(), currentMarket, reserve.name, 'reserve', true);
    } else {
      openSupply(reserve.underlyingAsset, currentMarket, reserve.name, 'reserve', true);
    }
  };

  const { market } = getMarketInfoById(currentMarket);

  return (
    <PaperWrapper
      sx={(theme) => ({
        backgroundColor: theme.palette.background.top,
        boxShadow: 'none',
      })}
    >
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
      <Box sx={{ display: 'flex', gap: '8px 2px', flexWrap: 'wrap' }}>
        <WalletBalance
          balance={isConnectedTonWallet ? `${yourWalletBalanceTon}` : balance.amount}
          symbol={selectedAsset}
          marketTitle={market.marketTitle}
        />
        {!reserve.isFrozen && !reserve.isPaused && (
          <>
            {!isGho && (
              <SupplyAction
                reserve={reserve}
                value={maxAmountToSupply.toString()}
                usdValue={maxAmountToSupplyUsd}
                symbol={selectedAsset}
                disable={disableSupplyButton}
                onActionClicked={onSupplyClicked}
              />
            )}
            {reserve.borrowingEnabled && (
              <BorrowAction
                reserve={reserve}
                value={maxAmountToBorrow.toString()}
                usdValue={maxAmountToBorrowUsd}
                symbol={selectedAsset}
                disable={disableBorrowButton}
                onActionClicked={() => {
                  openBorrow(reserve.underlyingAsset, currentMarket, reserve.name, 'reserve', true);
                }}
              />
            )}
          </>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', mt: 5, gap: 2 }}>
        {alerts}
        {reserve.isPaused && <PauseWarning />}
        {reserve.isFrozen && <FrozenWarning />}
      </Box>
    </PaperWrapper>
  );
};

const PauseWarning = () => {
  return (
    <Warning sx={{ mb: 0 }} severity="error">
      <Trans>Because this asset is paused, no actions can be taken until further notice</Trans>
    </Warning>
  );
};

const FrozenWarning = () => {
  return (
    <Warning sx={{ mb: 0 }} severity="error">
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

const PaperWrapper = ({ children, sx }: PaperProps) => {
  return (
    <Paper
      sx={[{ py: { xs: 4, xsm: 7 }, px: { xs: 4, xsm: 5 } }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography variant="h2" sx={{ mb: { xs: 6, xsm: 8 } }}>
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
  reserve: ComputedReserveData;
}

const SupplyAction = ({
  reserve,
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0, width: '300px' }}>
      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', minWidth: '160px' }}>
        <AvailableTooltip
          variant="detail2"
          textColor="text.mainTitle"
          text={<Trans>Available to supply</Trans>}
          capType={CapType.supplyCap}
          event={{
            eventName: GENERAL.TOOL_TIP,
            eventParams: {
              tooltip: 'Available to supply: your info',
              asset: reserve.underlyingAsset,
              assetName: reserve.name,
            },
          }}
        />

        <ValueWithSymbol value={value} symbol={symbol} variant={'body6'} color="text.primary" />
        <FormattedNumber
          value={usdValue}
          variant="detail2"
          color="text.mainTitle"
          symbolsColor="text.mainTitle"
          symbol="USD"
        />
      </Box>
      <Button
        onClick={onActionClicked}
        disabled={disable}
        fullWidth={false}
        variant="contained"
        size="small"
        data-cy="supplyButton"
      >
        <Trans>Supply</Trans>
      </Button>
    </Box>
  );
};

const BorrowAction = ({
  reserve,
  value,
  usdValue,
  symbol,
  disable,
  onActionClicked,
}: ActionProps) => {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0, width: '300px' }}>
      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column', minWidth: '160px' }}>
        <AvailableTooltip
          variant="detail2"
          sx={{ whiteSpace: 'nowrap' }}
          textColor="text.mainTitle"
          text={<Trans>Available to borrow</Trans>}
          capType={CapType.borrowCap}
          event={{
            eventName: GENERAL.TOOL_TIP,
            eventParams: {
              tooltip: 'Available to borrow: your info',
              asset: reserve.underlyingAsset,
              assetName: reserve.name,
            },
          }}
        />

        <ValueWithSymbol value={value} symbol={symbol} variant={'body6'} color="text.primary" />
        <FormattedNumber
          value={usdValue}
          variant="detail2"
          color="text.mainTitle"
          symbolsColor="text.mainTitle"
          symbol="USD"
        />
      </Box>
      <Button
        onClick={onActionClicked}
        disabled={disable}
        fullWidth={false}
        variant="contained"
        color="primary"
        data-cy="borrowButton"
        size="small"
      >
        <Trans>Borrow </Trans>
      </Button>
    </Box>
  );
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
    <StyledTxModalToggleGroup
      color="standard"
      value={selectedAsset}
      exclusive
      onChange={(_, value) => setSelectedAsset(value)}
      sx={{ mb: 4 }}
    >
      <StyledTxModalToggleButton value={assetSymbol}>
        <Typography variant="body7">{assetSymbol}</Typography>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton value={baseAssetSymbol}>
        <Typography variant="body7">{baseAssetSymbol}</Typography>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  );
};

interface ValueWithSymbolProps {
  value: string;
  symbol: string;
  children?: ReactNode;
  variant?: ComponentProps<typeof Typography>['variant'];
  color?: string;
}

const ValueWithSymbol = ({ value, symbol, children, variant, color }: ValueWithSymbolProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <FormattedNumber
        value={value}
        variant={variant || 'detail2'}
        color={color || 'text.mainTitle'}
      />
      <Typography variant={variant || 'detail2'} color={color || 'text.mainTitle'}>
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
    <Stack
      direction="row"
      gap={3}
      alignItems="center"
      flexWrap="nowrap"
      sx={{ flexShrink: 0, width: '300px' }}
    >
      <Box
        sx={(theme) => ({
          background: theme.palette.background.primary,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '60px',
          height: '60px',
        })}
      >
        <WalletIcon2 sx={{ width: '40px', height: '35px' }} />
      </Box>
      <Box>
        <Typography
          variant="body6"
          color="text.primary"
          component="div"
          sx={{ mb: 2, whiteSpace: 'nowrap' }}
        >
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
