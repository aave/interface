import React, { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { SupplyActions } from './SupplyActions';
import { Typography } from '@mui/material';
import { AssetInput } from '../AssetInput';
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
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { SupplyCapWarning } from '../Warnings/SupplyCapWarning';
import { TxState } from 'src/helpers/types';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';

export type SupplyProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export const SupplyModalContent = ({ underlyingAsset, handleClose }: SupplyProps) => {
  const { walletBalances } = useWalletBalances();
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [supplyTxState, setSupplyTxState] = useState<TxState>({ success: false });
  const [amountToSupply, setAmountToSupply] = useState('');
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);

  const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    if (supplyUnWrapped) {
      return reserve.symbol === networkConfig.wrappedBaseAssetSymbol;
    }
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  if (!user) {
    return null;
  }

  const userReserve = user.userReservesData.find((userReserve) => {
    if (supplyUnWrapped) {
      return poolReserve.underlyingAsset === userReserve.underlyingAsset;
    }
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserve;

  const walletBalance = walletBalances[underlyingAsset]?.amount;

  const supplyApy = poolReserve.supplyAPY;

  // Calculate max amount to supply
  let maxAmountToSupply = valueToBigNumber(walletBalance);
  if (
    maxAmountToSupply.gt(0) &&
    poolReserve.symbol.toUpperCase() === networkConfig.baseAssetSymbol
  ) {
    // keep it for tx gas cost
    maxAmountToSupply = maxAmountToSupply.minus('0.001');
  }

  if (poolReserve.supplyCap !== '0') {
    maxAmountToSupply = BigNumber.min(
      maxAmountToSupply,
      new BigNumber(poolReserve.supplyCap).minus(poolReserve.totalLiquidity).multipliedBy('0.995')
    );
  }

  if (maxAmountToSupply.lte(0)) {
    maxAmountToSupply = valueToBigNumber('0');
  }

  // Calculation of future HF
  const amountIntEth = new BigNumber(amountToSupply).multipliedBy(
    poolReserve.formattedPriceInMarketReferenceCurrency
  );
  // TODO: is it correct to ut to -1 if user doesnt exist?
  const amountInUsd = amountIntEth.multipliedBy(marketReferencePriceInUsd).shiftedBy(-USD_DECIMALS);
  const totalCollateralMarketReferenceCurrencyAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(amountIntEth)
    : '-1';

  const liquidationThresholdAfter = user
    ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
        .multipliedBy(user.currentLiquidationThreshold)
        .plus(amountIntEth.multipliedBy(poolReserve.formattedReserveLiquidationThreshold))
        .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
    : '-1';

  let healthFactorAfterDeposit = user ? valueToBigNumber(user.healthFactor) : '-1';

  if (
    user &&
    ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
      (user.isInIsolationMode &&
        user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
  ) {
    healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
      borrowBalanceMarketReferenceCurrency: valueToBigNumber(
        user.totalBorrowsMarketReferenceCurrency
      ),
      currentLiquidationThreshold: liquidationThresholdAfter,
    });
  }

  // ************** Warnings **********
  // supply cap warning
  const percentageOfCap = valueToBigNumber(poolReserve.totalLiquidity)
    .dividedBy(poolReserve.supplyCap)
    .toNumber();
  const showSupplyCapWarning: boolean =
    poolReserve.supplyCap !== '0' && percentageOfCap >= 0.99 && percentageOfCap < 1;

  // isolation warning
  const hasDifferentCollateral = user?.userReservesData.find(
    (reserve) => reserve.usageAsCollateralEnabledOnUser && reserve.reserve.id !== poolReserve.id
  );
  const showIsolationWarning: boolean =
    !user?.isInIsolationMode &&
    poolReserve.isIsolated &&
    !hasDifferentCollateral &&
    (userReserve?.underlyingBalance !== '0' ? userReserve?.usageAsCollateralEnabledOnUser : true);

  const showHealthFactor =
    user &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!supplyTxState.error && !supplyTxState.success && (
        <>
          <TxModalTitle title="Supply" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          {showIsolationWarning && (
            <Typography>You are about to enter into isolation. FAQ link</Typography>
          )}
          {showSupplyCapWarning && <SupplyCapWarning />}
          <AssetInput
            value={amountToSupply}
            onChange={setAmountToSupply}
            usdValue={amountInUsd.toString()}
            symbol={supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol}
            assets={[
              {
                balance: maxAmountToSupply.toString(),
                symbol: supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol,
              },
            ]}
          />
          <TxModalDetails
            sx={{ mt: '30px' }}
            apy={supplyApy}
            incentives={poolReserve.aIncentivesData}
            showHf={showHealthFactor || false}
            healthFactor={user ? user.healthFactor : '-1'}
            futureHealthFactor={healthFactorAfterDeposit.toString()}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            usedAsCollateral={userReserve.usageAsCollateralEnabledOnUser}
            action="Supply"
          />
        </>
      )}
      {supplyTxState.error && <TxErrorView errorMessage={supplyTxState.error} />}
      {supplyTxState.success && !supplyTxState.error && (
        <TxSuccessView action="Supplied" amount={amountToSupply} symbol={poolReserve.symbol} />
      )}
      <SupplyActions
        sx={{ mt: '48px' }}
        setSupplyTxState={setSupplyTxState}
        poolReserve={poolReserve}
        amountToSupply={amountToSupply}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        poolAddress={supplyUnWrapped ? underlyingAsset : poolReserve.underlyingAsset}
        symbol={supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol}
      />
    </>
  );
};
