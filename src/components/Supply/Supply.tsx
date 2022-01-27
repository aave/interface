import React, { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { SupplyDetails } from './SupplyDetails';
import { SupplyActions } from './SupplyActions';
import { Button, Divider, Typography } from '@mui/material';
import { AssetInput } from '../AssetInput';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  FormatUserSummaryAndIncentivesResponse,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { BasicModal } from '../primitives/BasicModal';

export type SupplyProps = {
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserve;
  walletBalance: string;
  user: FormatUserSummaryAndIncentivesResponse;
  supplyApy: string;
};

export enum SupplyState {
  amountInput = 0,
  approval,
  sendTx,
  success,
  error,
  networkMisMatch,
}

export const Supply = ({
  poolReserve,
  userReserve,
  walletBalance,
  user,
  supplyApy,
}: SupplyProps) => {
  const { marketReferencePriceInUsd } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();

  const [amountToSupply, setAmountToSupply] = useState('');
  const [open, setOpen] = useState(false);

  const networkConfig = getNetworkConfig(currentChainId);

  const onClose = () => {
    setOpen(false);
  };

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
  const amountIntEth = valueToBigNumber(amountToSupply).multipliedBy(
    poolReserve.priceInMarketReferenceCurrency
  );
  const amountInUsd = amountIntEth.multipliedBy(marketReferencePriceInUsd).shiftedBy(-USD_DECIMALS);

  const totalCollateralMarketReferenceCurrencyAfter = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  ).plus(amountIntEth);

  const liquidationThresholdAfter = valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
    .multipliedBy(user.currentLiquidationThreshold)
    .plus(amountIntEth.multipliedBy(poolReserve.formattedReserveLiquidationThreshold))
    .dividedBy(totalCollateralMarketReferenceCurrencyAfter);

  let healthFactorAfterDeposit = valueToBigNumber(user.healthFactor);

  if (
    (!user.isInIsolationMode && !poolReserve.isIsolated) ||
    (user.isInIsolationMode &&
      user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset)
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
    user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

  return (
    <div>
      {showIsolationWarning && (
        <Typography>You are about to enter into isolation. FAQ link</Typography>
      )}
      {showSupplyCapWarning && (
        <Typography>You are about to get supply capped. FAQ link</Typography>
      )}
      <BasicModal open={open} setOpen={onClose}>
        <Typography variant="h2" sx={{ mb: '26px' }}>
          Supply {poolReserve.symbol}
        </Typography>
        <AssetInput
          value={amountToSupply}
          onChange={setAmountToSupply}
          usdValue={amountInUsd.toString()}
          balance={maxAmountToSupply.toString()}
          symbol={poolReserve.symbol}
        />
        <SupplyDetails
          supplyApy={supplyApy}
          // supplyRewards={supplyRewards}
          showHf={showHealthFactor}
          healthFactor={user.healthFactor}
          futureHealthFactor={healthFactorAfterDeposit.toString()}
        />
        <Divider />
        <SupplyActions
          poolReserve={poolReserve}
          amount={amountToSupply}
          amountToSupply={amountToSupply}
          onClose={onClose}
        ></SupplyActions>
      </BasicModal>
      <Button onClick={() => setOpen(true)}>Supply</Button>
    </div>
  );
};
