import React, { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { SupplyDetails } from './SupplyDetails';
import { SupplyActions } from './SupplyActions';
import { Button, Divider } from '@mui/material';
import { AaveModal } from '../AaveModal/AaveModal';
import { AssetInput } from '../AssetInput';
import {
  calculateHealthFactorFromBalancesBigUnits,
  FormatUserSummaryAndIncentivesResponse,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

export type SupplyProps = {
  poolReserve: ComputedReserveData;
  // userReserve: ComputedUserReserve;
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
  // userReserve,
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

  console.log('healthFactorAfterDeposit: ', user);

  // TODO: what / how to show isolation statuses / warnings??
  return (
    <div>
      <AaveModal open={open} onClose={onClose} title={'Supply'} tokenSymbol={poolReserve.symbol}>
        <AssetInput
          value={amountToSupply}
          onChange={setAmountToSupply}
          usdValue={amountInUsd.toString()}
          balance={maxAmountToSupply.toString()}
          symbol={poolReserve.symbol}
          sx={{ mb: '40px' }}
        />
        <SupplyDetails
          supplyApy={supplyApy}
          // supplyRewards={supplyRewards}
          healthFactor={healthFactorAfterDeposit.toString()}
        />
        <Divider />
        <SupplyActions
          poolReserve={poolReserve}
          amountToSupply={amountToSupply}
          onClose={onClose}
        ></SupplyActions>
      </AaveModal>
      <Button onClick={() => setOpen(true)}>Supply</Button>
    </div>
  );
};
