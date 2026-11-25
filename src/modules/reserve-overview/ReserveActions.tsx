import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { BigNumberValue, USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box, Button, Divider, Paper, Skeleton, Stack, Typography } from '@mui/material';
import React, { ReactNode, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { FunSupplyButton } from 'src/components/transactions/FunCheckout/FunSupplyButton';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { cardPaddingSx } from 'src/utils/cardStyles';
import { GENERAL } from 'src/utils/events';
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from 'src/utils/getMaxAmountAvailableToBorrow';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { amountToUsd } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

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

  const { currentAccount } = useWeb3Context();
  const { openBorrow } = useModalContext();
  const [currentMarket, currentNetworkConfig, currentMarketData, minRemainingBaseTokenBalance] =
    useRootStore(
      useShallow((store) => [
        store.currentMarket,
        store.currentNetworkConfig,
        store.currentMarketData,
        store.poolComputed.minRemainingBaseTokenBalance,
      ])
    );
  const { user, loading: loadingReserves, marketReferencePriceInUsd } = useAppDataContext();
  const { walletBalances, loading: loadingWalletBalance } = useWalletBalances(currentMarketData);
  const { baseAssetSymbol } = currentNetworkConfig;
  let balance = walletBalances[reserve.underlyingAsset];
  if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
    balance = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()];
  }

  let maxAmountToBorrow = '0';
  let maxAmountToSupply = '0';

  if (user) {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(reserve, user).toString();

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
    return <ConnectWallet />;
  }

  if (loadingReserves || loadingWalletBalance) {
    return <ActionsSkeleton />;
  }

  // The native supply flow on this page can supply the wrapped base asset's
  // underlying as native ETH (mock address) when the toggle selects it.
  const supplyUnderlyingAsset =
    reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol
      ? API_ETH_MOCK_ADDRESS.toLowerCase()
      : reserve.underlyingAsset;

  // Collateral flag shown in the funkit checkout — mirror the dashboard list by
  // using the user's actual per-position toggle, falling back to reserve-level
  // eligibility when they hold no position yet. Matched on the real underlying
  // (not the wrapped-base-asset's native-mock address) so an existing position
  // is found.
  const collateralEnabled =
    user?.userReservesData.find((r) => r.reserve.underlyingAsset === reserve.underlyingAsset)
      ?.usageAsCollateralEnabledOnUser ?? reserve.usageAsCollateralEnabled;

  return (
    <PaperWrapper>
      {reserve.isWrappedBaseAsset && (
        <Box sx={{ mt: '1.5rem' }}>
          <WrappedBaseAssetSelector
            assetSymbol={reserve.symbol}
            baseAssetSymbol={baseAssetSymbol}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
          />
        </Box>
      )}
      {reserve.isFrozen || reserve.isPaused ? (
        <Box sx={{ mt: '1.5rem' }}>{reserve.isPaused ? <PauseWarning /> : <FrozenWarning />}</Box>
      ) : (
        <>
          <Stack divider={<Divider />}>
            <SupplyAction
              reserve={reserve}
              value={maxAmountToSupply.toString()}
              usdValue={maxAmountToSupplyUsd}
              symbol={selectedAsset}
              disable={disableSupplyButton}
              underlyingAsset={supplyUnderlyingAsset}
              collateralEnabled={collateralEnabled}
              walletBalance={balance?.amount || '0'}
            />
            {assetCanBeBorrowedByUser(reserve, user) && (
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
          </Stack>
          {alerts}
        </>
      )}
    </PaperWrapper>
  );
};

const PauseWarning = () => {
  return (
    <Alert sx={{ width: '100%', mb: 0 }} severity="error">
      <Trans>Because this asset is paused, no actions can be taken until further notice</Trans>
    </Alert>
  );
};

const FrozenWarning = () => {
  return (
    <Alert sx={{ width: '100%', mb: 0 }} severity="error">
      <Trans>
        Since this asset is frozen, the only available actions are withdraw and repay which can be
        accessed from the <Link href={ROUTES.dashboard}>Dashboard</Link>
      </Trans>
    </Alert>
  );
};

const POSITION_ROW_SX = { py: '1.25rem', '&:last-child': { pb: 0 } };

const ActionsSkeleton = () => {
  const RowSkeleton = (
    <Box sx={POSITION_ROW_SX}>
      <Skeleton width={150} height={20} />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: '0.75rem' }}
      >
        <Box>
          <Skeleton width={120} height={22} />
          <Skeleton width={60} height={20} sx={{ mt: '0.25rem' }} />
        </Box>
        <Skeleton height={36} width={76} />
      </Stack>
    </Box>
  );

  return (
    <PaperWrapper>
      <Stack divider={<Divider />}>
        {RowSkeleton}
        {RowSkeleton}
      </Stack>
    </PaperWrapper>
  );
};

const PaperWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Paper variant="card" sx={{ ...cardPaddingSx, pt: { xs: '1rem', xsm: '1.25rem' } }}>
      <Typography variant="h5" component="h2">
        <Trans>Your Position</Trans>
      </Typography>
      <Divider sx={{ mt: '1.25rem' }} />

      {children}
    </Paper>
  );
};

const ConnectWallet = () => {
  return (
    <PaperWrapper>
      <Typography sx={{ mt: '1.5rem', mb: 6 }} color="fg-2">
        <Trans>Please connect a wallet to view your personal information here.</Trans>
      </Typography>
      <ConnectWalletButton />
    </PaperWrapper>
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
  underlyingAsset,
  collateralEnabled,
  walletBalance,
}: Omit<ActionProps, 'onActionClicked'> & {
  underlyingAsset: string;
  collateralEnabled: boolean;
  walletBalance: string;
}) => {
  return (
    <PositionRow
      reserve={reserve}
      label={<Trans>Available to supply</Trans>}
      capType={CapType.supplyCap}
      tooltip="Available to supply: your info"
      value={value}
      usdValue={usdValue}
      symbol={symbol}
      action={
        <FunSupplyButton
          sx={{ height: '36px', flexShrink: 0 }}
          disabled={disable}
          fullWidth={false}
          variant="contained"
          size="medium"
          data-cy="supplyButton"
          underlyingAsset={underlyingAsset}
          name={reserve.name}
          symbol={symbol}
          iconSymbol={reserve.iconSymbol}
          supplyAPY={reserve.supplyAPY}
          collateralEnabled={collateralEnabled}
          walletBalance={walletBalance}
          funnel="reserve"
          isReserve
        />
      }
    />
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
    <PositionRow
      reserve={reserve}
      label={<Trans>Available to borrow</Trans>}
      capType={CapType.borrowCap}
      tooltip="Available to borrow: your info"
      value={value}
      usdValue={usdValue}
      symbol={symbol}
      action={
        <Button
          sx={{ height: '36px', flexShrink: 0 }}
          onClick={onActionClicked}
          disabled={disable}
          fullWidth={false}
          variant="contained"
          data-cy="borrowButton"
        >
          <Trans>Borrow </Trans>
        </Button>
      }
    />
  );
};

interface PositionRowProps {
  reserve: ComputedReserveData;
  label: ReactNode;
  capType: CapType;
  tooltip: string;
  value: string;
  usdValue: string;
  symbol: string;
  action: ReactNode;
}

const PositionRow = ({
  reserve,
  label,
  capType,
  tooltip,
  value,
  usdValue,
  symbol,
  action,
}: PositionRowProps) => {
  return (
    <Box sx={POSITION_ROW_SX}>
      <AvailableTooltip
        variant="description"
        textColor="fg-3"
        text={label}
        capType={capType}
        event={{
          eventName: GENERAL.TOOL_TIP,
          eventParams: {
            tooltip,
            asset: reserve.underlyingAsset,
            assetName: reserve.name,
          },
        }}
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap="1rem"
        sx={{ mt: '0.75rem' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" gap="0.5rem" sx={{ minWidth: 0 }}>
            <FormattedNumber value={value} variant="h3" color="fg-1" />
            <Typography variant="h3" color="fg-3" noWrap>
              {symbol}
            </Typography>
          </Stack>
          <FormattedNumber
            value={usdValue}
            variant="description"
            color="fg-3"
            symbolsColor="fg-3"
            symbol="USD"
            sx={{ display: 'flex', mt: '0.25rem' }}
          />
        </Box>
        {action}
      </Stack>
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
      color="primary"
      value={selectedAsset}
      exclusive
      onChange={(_, value) => setSelectedAsset(value)}
      sx={{ mb: 4 }}
    >
      <StyledTxModalToggleButton value={assetSymbol}>
        <Typography variant="h5">{assetSymbol}</Typography>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton value={baseAssetSymbol}>
        <Typography variant="h5">{baseAssetSymbol}</Typography>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  );
};
