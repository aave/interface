import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BorrowActions } from './BorrowActions';

export type BorrowModalContentProps = {
  underlyingAsset: string;
};

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  NOT_ENOUGH_COLLATERAL,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

export const BorrowModalContent = ({ underlyingAsset }: BorrowModalContentProps) => {
  const { mainTxState: borrowTxState, gasLimit } = useModalContext();
  const { reserves, user, marketReferencePriceInUsd } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [borrowUnWrapped, setBorrowUnWrapped] = useState(true);
  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(InterestRate.Variable);
  const [amount, setAmount] = useState('');
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();
  const [amountToBorrow, setAmountToBorrow] = useState(amount);

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user?.userReservesData.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  });

  // amount calculations
  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user, interestRateMode);
  const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);

  // We set this in a useEffect, so it doesnt constantly change when
  // max amount selected
  useEffect(() => {
    // case when user uses max button
    if (amount === '-1') {
      setAmountToBorrow(formattedMaxAmountToBorrow);
    } else {
      setAmountToBorrow(amount);
    }
  }, [amount]);

  // health factor calculations
  const amountToBorrowInUsd = valueToBigNumber(amountToBorrow)
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(user.totalBorrowsUSD).plus(
      amountToBorrowInUsd
    ),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // calculating input usd value
  const usdValue = valueToBigNumber(amountToBorrow).multipliedBy(poolReserve.priceInUSD);

  // error types handling
  useEffect(() => {
    if (interestRateMode === InterestRate.Stable && !poolReserve.stableBorrowRateEnabled) {
      setBlockingError(ErrorType.STABLE_RATE_NOT_ENABLED);
    } else if (
      interestRateMode === InterestRate.Stable &&
      userReserve?.usageAsCollateralEnabledOnUser &&
      valueToBigNumber(amountToBorrow).lt(userReserve?.underlyingBalance || 0)
    ) {
      setBlockingError(ErrorType.NOT_ENOUGH_BORROWED);
    } else if (valueToBigNumber(amountToBorrow).gt(poolReserve.formattedAvailableLiquidity)) {
      setBlockingError(ErrorType.NOT_ENOUGH_LIQUIDITY);
    } else if (maxAmountToBorrow.lt(amountToBorrow)) {
      setBlockingError(ErrorType.NOT_ENOUGH_COLLATERAL);
    } else if (!poolReserve.borrowingEnabled) {
      setBlockingError(ErrorType.BORROWING_NOT_AVAILABLE);
    } else {
      setBlockingError(undefined);
    }
  }, [
    interestRateMode,
    poolReserve.stableBorrowRateEnabled,
    poolReserve.formattedAvailableLiquidity,
    amountToBorrow,
    maxAmountToBorrow,
    poolReserve.borrowingEnabled,
  ]);

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return (
          <>
            <Trans>Borrowing is currently unavailable for </Trans>
            {poolReserve.symbol}.
          </>
        );
      case ErrorType.NOT_ENOUGH_BORROWED:
        return (
          <Trans>
            To prevent gaming the stable rate you can only borrow, when you borrow more then your
            current collateral in the same asset.
          </Trans>
        );
      case ErrorType.NOT_ENOUGH_COLLATERAL:
        return <Trans>Your collateral is not enough to borrow this amount</Trans>;
      case ErrorType.NOT_ENOUGH_LIQUIDITY:
        return (
          <>
            <Trans>There are not enough funds in the</Trans>
            {poolReserve.symbol}
            <Trans>reserve to borrow</Trans>
          </>
        );
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return <Trans>The Stable Rate is not enabled for this currency</Trans>;
      default:
        return null;
    }
  };

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
  };

  if (borrowTxState.txError) return <TxErrorView errorMessage={borrowTxState.txError} />;
  if (borrowTxState.success)
    return (
      <TxSuccessView
        action="Borrowed"
        amount={amountToBorrow}
        symbol={poolReserve.symbol}
        addToken={addToken}
      />
    );
  return (
    <>
      <TxModalTitle title="Borrow" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      <AssetInput
        value={amountToBorrow}
        onChange={setAmount}
        usdValue={usdValue.toString()}
        assets={[
          {
            balance: formattedMaxAmountToBorrow,
            symbol:
              borrowUnWrapped && poolReserve.isWrappedBaseAsset
                ? networkConfig.baseAssetSymbol
                : poolReserve.symbol,
          },
        ]}
        symbol={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.iconSymbol
        }
        capType={CapType.borrowCap}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}
      {blockingError === undefined &&
        newHealthFactor.toNumber() < 1.5 &&
        newHealthFactor.toNumber() >= 1 && (
          <Typography variant="helperText" color="warning.main">
            <Trans>Liquidation risk is high. Lower amounts recomended.</Trans>
          </Typography>
        )}

      <TxModalDetails
        showHf={true}
        healthFactor={user.healthFactor}
        futureHealthFactor={newHealthFactor.toString()}
        gasLimit={gasLimit}
        incentives={poolReserve.vIncentivesData}
        stableRateIncentives={poolReserve.sIncentivesData}
        setActionUnWrapped={poolReserve.isWrappedBaseAsset ? setBorrowUnWrapped : undefined}
        unWrappedSymbol={networkConfig.baseAssetSymbol}
        actionUnWrapped={borrowUnWrapped}
        symbol={poolReserve.symbol}
        apy={poolReserve.variableBorrowAPY}
        borrowStableRate={
          poolReserve.stableBorrowRateEnabled ? poolReserve.stableBorrowAPY : undefined
        }
        setInterestRateMode={setInterestRateMode}
        action="Borrow"
      />

      {borrowTxState.gasEstimationError && (
        <GasEstimationError error={borrowTxState.gasEstimationError} />
      )}

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amountToBorrow}
        poolAddress={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={
          borrowUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        blocked={blockingError !== undefined}
      />
    </>
  );
};
