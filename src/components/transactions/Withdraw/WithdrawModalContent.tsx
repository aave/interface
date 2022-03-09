import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { useRef, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { WithdrawActions } from './WithdrawActions';

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
}

export const WithdrawModalContent = ({
  poolReserve,
  userReserve,
  unwrap: withdrawUnWrapped,
  setUnwrap: setWithdrawUnWrapped,
  symbol,
}: ModalWrapperProps & { unwrap: boolean; setUnwrap: (unwrap: boolean) => void }) => {
  const { gasLimit, mainTxState: withdrawTxState } = useModalContext();
  const { user } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const networkConfig = getNetworkConfig(currentChainId);

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

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToWithdraw.toString() : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString() : value;
    setAmount(value);
  };

  // health factor calculations
  let totalCollateralInETHAfterWithdraw = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold;
  let healthFactorAfterWithdraw = valueToBigNumber(user.healthFactor);

  if (userReserve.usageAsCollateralEnabledOnUser && poolReserve.usageAsCollateralEnabled) {
    const amountToWithdrawInEth = valueToBigNumber(amount).multipliedBy(
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
      (unborrowedLiquidity.eq('0') || valueToBigNumber(amount).gt(poolReserve.unborrowedLiquidity))
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

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(userReserve.reserve.priceInUSD);

  if (withdrawTxState.txError) return <TxErrorView errorMessage={withdrawTxState.txError} />;
  if (withdrawTxState.success)
    return (
      <TxSuccessView
        action="Withdrawed"
        amount={amountRef.current}
        symbol={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
      />
    );

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(),
            symbol: symbol,
            iconSymbol:
              withdrawUnWrapped && poolReserve.isWrappedBaseAsset
                ? networkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
          },
        ]}
        usdValue={usdValue.toString()}
        isMaxSelected={isMaxSelected}
        disabled={withdrawTxState.loading}
        maxValue={maxAmountToWithdraw.toString()}
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

      <TxModalDetails gasLimit={gasLimit}>
        {poolReserve.isWrappedBaseAsset && (
          <DetailsUnwrapSwitch
            unwrapped={withdrawUnWrapped}
            setUnWrapped={setWithdrawUnWrapped}
            symbol={poolReserve.symbol}
            unwrappedSymbol={networkConfig.baseAssetSymbol}
          />
        )}
        <DetailsNumberLine
          description={<Trans>Remaining supply</Trans>}
          value={underlyingBalance.minus(amount || '0').toString()}
          symbol={
            poolReserve.isWrappedBaseAsset ? networkConfig.baseAssetSymbol : poolReserve.symbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={healthFactorAfterWithdraw.toString()}
        />
      </TxModalDetails>

      {withdrawTxState.gasEstimationError && (
        <GasEstimationError error={withdrawTxState.gasEstimationError} />
      )}

      <WithdrawActions
        poolReserve={poolReserve}
        amountToWithdraw={
          isMaxSelected
            ? maxAmountToWithdraw.eq(underlyingBalance)
              ? '-1'
              : maxAmountToWithdraw.multipliedBy(0.995).toString()
            : amount
        }
        poolAddress={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
