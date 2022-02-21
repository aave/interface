import React, { useEffect, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { SwapActions } from './SwapActions';
import { Typography } from '@mui/material';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { TxState } from 'src/helpers/types';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  getMaxAmountAvailableToSupply,
  remainingCap,
} from 'src/utils/getMaxAmountAvailableToSupply';
import { useSwap } from 'src/hooks/useSwap';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import { TxModalDetails } from 'src/components/transactions/FlowCommons/TxModalDetails';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';

export type SupplyProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  CAP_REACHED,
}

export const SwapModalContent = ({ underlyingAsset, handleClose }: SupplyProps) => {
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { chainId: connectedChainId, currentAccount } = useWeb3Context();

  const poolReserve = reserves.find((reserve) => {
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user.userReservesData.find((userReserve) => {
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserve;

  const swapTargets = reserves
    .filter((r) => r.underlyingAsset !== poolReserve.underlyingAsset)
    .map((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.iconSymbol,
    }));

  // states
  const [supplyTxState, setSupplyTxState] = useState<TxState>({ success: false });
  const [_amount, setAmount] = useState('');
  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0]);
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const swapTarget = reserves.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedReserveData;

  // a user can never swap more then 100% of available as the txn would fail on withdraw step
  const maxAmountToSwap = BigNumber.min(
    userReserve.underlyingBalance,
    new BigNumber(poolReserve.availableLiquidity).multipliedBy(0.99)
  ).toString();

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToSwap : _amount;

  const supplyApy = poolReserve.supplyAPY;

  const {
    priceRoute,
    reserveIn,
    reserveOut,
    error,
    inputAmount,
    inputAmountUSD,
    outputAmount,
    outputAmountUSD,
  } = useSwap({
    chainId: currentChainId,
    userId: currentAccount,
    variant: 'exactIn',
    swapIn: { address: poolReserve.underlyingAsset, amount },
    swapOut: { address: targetReserve.address as string, amount: '0' },
    max: isMaxSelected,
  });

  // consider caps
  // we cannot check this in advance as it's based on the swap result
  const surpassesTargetSupplyCap =
    swapTarget.supplyCap !== '0' ? remainingCap(swapTarget).lt(amount) : false;
  // TODO: show some error
  if (user.isInIsolationMode && poolReserve.isIsolated) {
    // TODO: make sure hf doesn't go below 1 because swapTarget will not be a collateral
  } else {
    // TODO: make sure hf doesn't go below 1
  }

  // v2 edge cases
  // 1. swap more then available liquidity

  // v3 edge cases
  // 2. swap more then supply cap of target allows
  // 3. swap isolated asset when isolated -> make sure hf doesn't go below 1 as the target will no longer be collateral
  // 4. swap isolated asset when isolated -> when no borrows i can probably swap all & new asset will in fact be collateral
  // 5. swap non-isolated when isolated -> can swap to anything

  // // Calculation of future HF
  // const amountIntEth = new BigNumber(amountToSupply).multipliedBy(
  //   poolReserve.formattedPriceInMarketReferenceCurrency
  // );
  // // TODO: is it correct to ut to -1 if user doesnt exist?
  // const amountInUsd = amountIntEth.multipliedBy(marketReferencePriceInUsd).shiftedBy(-USD_DECIMALS);
  // const totalCollateralMarketReferenceCurrencyAfter = user
  //   ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(amountIntEth)
  //   : '-1';

  // const liquidationThresholdAfter = user
  //   ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
  //       .multipliedBy(user.currentLiquidationThreshold)
  //       .plus(amountIntEth.multipliedBy(poolReserve.formattedReserveLiquidationThreshold))
  //       .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
  //   : '-1';

  // let healthFactorAfterSwap = user ? valueToBigNumber(user.healthFactor) : '-1';

  // if (
  //   user &&
  //   ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
  //     (user.isInIsolationMode &&
  //       user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
  // ) {
  //   healthFactorAfterSwap = calculateHealthFactorFromBalancesBigUnits({
  //     collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
  //     borrowBalanceMarketReferenceCurrency: valueToBigNumber(
  //       user.totalBorrowsMarketReferenceCurrency
  //     ),
  //     currentLiquidationThreshold: liquidationThresholdAfter,
  //   });
  // }

  // ************** Warnings **********
  // isolation warning
  // const hasDifferentCollateral = user.userReservesData.find(
  //   (reserve) => reserve.usageAsCollateralEnabledOnUser && reserve.reserve.id !== poolReserve.id
  // );
  // const showIsolationWarning: boolean =
  //   !user.isInIsolationMode &&
  //   poolReserve.isIsolated &&
  //   !hasDifferentCollateral &&
  //   (userReserve?.underlyingBalance !== '0' ? userReserve?.usageAsCollateralEnabledOnUser : true);

  // // TODO: check if calc is correct to see if cap reached
  // const capReached =
  //   poolReserve.supplyCap !== '0' &&
  //   valueToBigNumber(amountToSupply).gt(
  //     new BigNumber(poolReserve.supplyCap).minus(poolReserve.totalLiquidity)
  //   );

  // // error handler
  // useEffect(() => {
  //   if (valueToBigNumber(amountToSupply).gt(walletBalance)) {
  //     setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
  //   } else if (capReached) {
  //     setBlockingError(ErrorType.CAP_REACHED);
  //   } else {
  //     setBlockingError(undefined);
  //   }
  // }, [walletBalance, amountToSupply, capReached]);

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough balance on your wallet</Trans>;
      case ErrorType.CAP_REACHED:
        return <Trans>Cap reached. Lower supply amount</Trans>;
      default:
        return null;
    }
  };

  const showHealthFactor =
    user &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!supplyTxState.txError && !supplyTxState.success && (
        <>
          <TxModalTitle title="Swap" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning
              networkName={currentNetworkConfig.name}
              chainId={currentChainId}
            />
          )}
          {/* {showIsolationWarning && (
            <Typography>You are about to enter into isolation. FAQ link</Typography>
          )} */}
          <AssetInput
            value={amount}
            onChange={setAmount}
            usdValue={inputAmountUSD.toString()}
            symbol={poolReserve.iconSymbol}
            assets={[
              {
                balance: maxAmountToSwap,
                address: poolReserve.underlyingAsset,
                symbol: poolReserve.iconSymbol,
              },
            ]}
          />
          <AssetInput
            value={outputAmount}
            onChange={setAmount}
            onSelect={setTargetReserve}
            usdValue={outputAmountUSD.toString()}
            symbol={targetReserve.symbol}
            assets={swapTargets}
          />
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}
          <TxModalDetails
            apy={supplyApy}
            incentives={poolReserve.aIncentivesData}
            showHf={showHealthFactor || false}
            healthFactor={user ? user.healthFactor : '-1'}
            // futureHealthFactor={healthFactorAfterDeposit.toString()}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            action="Swap"
          />
        </>
      )}
      {supplyTxState.txError && <TxErrorView errorMessage={supplyTxState.txError} />}
      {/* {supplyTxState.success && !supplyTxState.txError && (
        <TxSuccessView action="Swapped" amount={amountToSupply} symbol={poolReserve.symbol} />
      )} */}
      {supplyTxState.gasEstimationError && (
        <GasEstimationError error={supplyTxState.gasEstimationError} />
      )}
      <SwapActions
        sx={{ mt: '48px' }}
        setSupplyTxState={setSupplyTxState}
        poolReserve={poolReserve}
        amountToSupply={amount}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        targetReserve={targetReserve}
        symbol={poolReserve.symbol}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
