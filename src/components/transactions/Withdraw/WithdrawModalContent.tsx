import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { WithdrawActions } from './WithdrawActions';

export type WithdrawModalContentProps = {
  underlyingAsset: string;
};
export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  NOT_ENOUGH_FUNDS_TO_WITHDRAW_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
}

export const WithdrawModalContent = ({ underlyingAsset }: WithdrawModalContentProps) => {
  const { gasLimit, mainTxState: withdrawTxState } = useModalContext();
  const { reserves, user } = useAppDataContext();
  const { currentChainId, currentMarketData } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [amount, setAmount] = useState('');
  const [amountToWithdraw, setAmountToWithdraw] = useState(amount);
  const [isMax, setIsMax] = useState(false);
  const [maxAmount, setMaxAmount] = useState('0');

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true);

  const userReserve = user.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  // calculations
  const underlyingBalance = valueToBigNumber(userReserve.underlyingBalance);
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  let maxAmountToWithdraw = BigNumber.min(underlyingBalance, unborrowedLiquidity);
  let maxCollateralToWithdrawInETH = valueToBigNumber('0');
  const reserveLiquidationThreshold =
    user.userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold;
  if (
    userReserve.usageAsCollateralEnabledOnUser &&
    poolReserve.usageAsCollateralEnabled &&
    user.totalBorrowsMarketReferenceCurrency !== '0'
  ) {
    // if we have any borrowings we should check how much we can withdraw without liquidation
    // with 0.5% gap to avoid reverting of tx
    const excessHF = valueToBigNumber(user.healthFactor).minus('1');
    if (excessHF.gt('0')) {
      maxCollateralToWithdrawInETH = excessHF
        .multipliedBy(user.totalBorrowsMarketReferenceCurrency)
        // because of the rounding issue on the contracts side this value still can be incorrect
        .div(Number(reserveLiquidationThreshold) + 0.01)
        .multipliedBy('0.99');
    }
    maxAmountToWithdraw = BigNumber.min(
      maxAmountToWithdraw,
      maxCollateralToWithdrawInETH.dividedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    );
  }

  // Handle max amount. V3 we can pass -1, but for v2 we need
  // to pass maxAmountToWithdraw as contracts dont accept max uint
  useEffect(() => {
    setAmountToWithdraw(amount);
    if (amount === '-1') {
      if (!userReserve.usageAsCollateralEnabledOnUser) {
        setAmountToWithdraw(amount);
        setIsMax(true);
      } else if (user.totalBorrowsMarketReferenceCurrency !== '0') {
        setAmountToWithdraw(maxAmountToWithdraw.toString());
      } else if (!currentMarketData.v3) {
        setAmountToWithdraw(maxAmountToWithdraw.toString());
      } else {
        setAmountToWithdraw(amount);
        setIsMax(true);
      }
    } else {
      setIsMax(false);
    }
  }, [amount, currentMarketData.v3]);

  useEffect(() => {
    if (isMax) {
      setMaxAmount(maxAmountToWithdraw.toString());
    }
  }, [isMax]);

  let displayAmountToWithdraw =
    amountToWithdraw === '' ? valueToBigNumber(0) : valueToBigNumber(amountToWithdraw);
  if (amountToWithdraw === '-1') {
    displayAmountToWithdraw = maxAmountToWithdraw;
  }

  // health factor calculations
  let totalCollateralInETHAfterWithdraw = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold;
  let healthFactorAfterWithdraw = valueToBigNumber(user.healthFactor);

  if (userReserve.usageAsCollateralEnabledOnUser && poolReserve.usageAsCollateralEnabled) {
    const amountToWithdrawInEth = displayAmountToWithdraw.multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency
    );
    totalCollateralInETHAfterWithdraw =
      totalCollateralInETHAfterWithdraw.minus(amountToWithdrawInEth);

    liquidationThresholdAfterWithdraw = valueToBigNumber(
      user.totalCollateralMarketReferenceCurrency
    )
      .multipliedBy(user.currentLiquidationThreshold)
      .minus(valueToBigNumber(amountToWithdrawInEth).multipliedBy(reserveLiquidationThreshold))
      .div(totalCollateralInETHAfterWithdraw)
      .toFixed(4, BigNumber.ROUND_DOWN);

    healthFactorAfterWithdraw = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralInETHAfterWithdraw,
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    });
  }

  let blockingError: ErrorType | undefined = undefined;
  if (!withdrawTxState.success && !withdrawTxState.txHash) {
    if (healthFactorAfterWithdraw.lt('1') && user.totalBorrowsMarketReferenceCurrency !== '0') {
      blockingError = ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT;
    } else if (
      !blockingError &&
      (underlyingBalance.eq('0') || underlyingBalance.lt(displayAmountToWithdraw))
    ) {
      blockingError = ErrorType.NOT_ENOUGH_FUNDS_TO_WITHDRAW_AMOUNT;
    } else if (
      !blockingError &&
      (unborrowedLiquidity.eq('0') || displayAmountToWithdraw.gt(poolReserve.unborrowedLiquidity))
    ) {
      blockingError = ErrorType.POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY;
    }
  }

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT:
        return (
          <Trans>You can not withdraw this amount because it will cause collateral call</Trans>
        );
      case ErrorType.NOT_ENOUGH_FUNDS_TO_WITHDRAW_AMOUNT:
        return <Trans>You do not have enough funds to withdraw this amount</Trans>;
      case ErrorType.POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY:
        return (
          <Trans>
            These funds have been borrowed and are not available for withdrawal at this time.
          </Trans>
        );
      default:
        return null;
    }
  };

  // hf
  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // calculating input usd value
  const usdValue = valueToBigNumber(
    amountToWithdraw === ''
      ? amountToWithdraw
      : isMax
      ? maxAmount
      : displayAmountToWithdraw.toString()
  ).multipliedBy(userReserve.reserve.priceInUSD);

  if (withdrawTxState.txError) return <TxErrorView errorMessage={withdrawTxState.txError} />;
  if (withdrawTxState.success)
    return (
      <TxSuccessView
        action="Withdrawed"
        amount={isMax ? maxAmount : displayAmountToWithdraw.toString()}
        symbol={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
      />
    );

  return (
    <>
      <TxModalTitle title="Withdraw" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      <AssetInput
        value={
          amountToWithdraw === ''
            ? amountToWithdraw
            : isMax
            ? maxAmount
            : displayAmountToWithdraw.toString()
        }
        onChange={setAmount}
        symbol={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        assets={[
          {
            balance: maxAmountToWithdraw.toString(),
            symbol:
              withdrawUnWrapped && poolReserve.isWrappedBaseAsset
                ? networkConfig.baseAssetSymbol
                : poolReserve.symbol,
          },
        ]}
        usdValue={usdValue.toString()}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}
      {blockingError === undefined &&
        healthFactorAfterWithdraw.toNumber() < 1.5 &&
        healthFactorAfterWithdraw.toNumber() >= 1 && (
          <Typography variant="helperText" color="warning.main">
            <Trans>Liquidation risk is high. Lower amounts recomended.</Trans>
          </Typography>
        )}

      {healthFactorAfterWithdraw.toString() === '-1' ? (
        <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
      ) : (
        <TxModalDetails
          showHf={showHealthFactor}
          healthFactor={user.healthFactor}
          futureHealthFactor={healthFactorAfterWithdraw.toString()}
          gasLimit={gasLimit}
          setActionUnWrapped={poolReserve.isWrappedBaseAsset ? setWithdrawUnWrapped : undefined}
          unWrappedSymbol={networkConfig.baseAssetSymbol}
          actionUnWrapped={withdrawUnWrapped}
          symbol={poolReserve.symbol}
        />
      )}

      {withdrawTxState.gasEstimationError && (
        <GasEstimationError error={withdrawTxState.gasEstimationError} />
      )}

      <WithdrawActions
        poolReserve={poolReserve}
        amountToWithdraw={amountToWithdraw.toString()}
        poolAddress={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        isWrongNetwork={isWrongNetwork}
        symbol={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        blocked={blockingError !== undefined}
      />
    </>
  );
};
