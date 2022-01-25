import React, { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { SupplyDetails } from '../../flows/SupplyFlowModal/SupplyDetails';
import { SupplyActions } from './SupplyActions';
import { Button } from '@mui/material';
import { AaveModal } from '../AaveModal/AaveModal';
import { AssetInput } from '../AssetInput';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  FormatUserSummaryAndIncentivesResponse,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';

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

  const [supplyStep, setSupplyStep] = useState<SupplyState>(SupplyState.amountInput);
  const [amountToSupply, setAmountToSupply] = useState('');
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

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
    .plus(amountIntEth.multipliedBy(poolReserve.reserveLiquidationThreshold))
    .dividedBy(totalCollateralMarketReferenceCurrencyAfter);

  const healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(
      user.totalBorrowsMarketReferenceCurrency
    ),
    currentLiquidationThreshold: liquidationThresholdAfter,
  });

  // TODO: what / how to show isolation statuses / warnings??
  // TODO: what to do with network mismatch
  return (
    <div>
      <AaveModal open={open} onClose={onClose} title={'Supply'}>
        <AssetInput
          value={amountToSupply}
          onChange={setAmountToSupply}
          usdValue={amountInUsd.toString()}
          balance={walletBalance}
          symbol={poolReserve.symbol}
          sx={{ mb: '40px' }}
        />
        <SupplyDetails
          supplyApy={supplyApy}
          // supplyRewards={supplyRewards}
          healthFactor={healthFactorAfterDeposit.toString()}
        />
        <SupplyActions
          poolReserve={poolReserve}
          setSupplyStep={setSupplyStep}
          supplyStep={supplyStep}
          amountToSupply={amountToSupply}
          onClose={onClose}
        ></SupplyActions>
      </AaveModal>
      <Button onClick={() => setOpen(true)}>Supply</Button>
    </div>
  );
};
