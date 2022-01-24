import { EthereumTransactionTypeExtended, transactionType } from '@aave/contract-helpers';
import React, { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from '../../libs/hooks/useWeb3Context';
import { SupplyDetails } from '../../flows/SupplyFlowModal/SupplyDetails';
import { useTxBuilderContext } from '../../hooks/useTxBuilder';
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
import BigNumber from 'bignumber.js';

export type SupplyProps = {
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserve;
  walletBalance: BigNumber;
  user: FormatUserSummaryAndIncentivesResponse;
  supplyApy: string;
};

export enum SupplyState {
  amountInput = 0,
  approval,
  sendTx,
  success,
  error,
}

export const Supply = ({ poolReserve, userReserve, walletBalance, user, supplyApy }: SupplyProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { marketReferencePriceInUsd } = useAppDataContext();
  const { networkConfig, currentMarketData } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();

  const [supplyStep, setSupplyStep] = useState<SupplyState>(SupplyState.amountInput);
  const [amountToSupply, setAmountToSupply] = useState('');
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  const handleTransactionData = (userId: string) => async () => {
    const txData = await lendingPool.deposit({
      user: userId,
      reserve: poolReserve.underlyingAsset,
      amount: amountToSupply.toString(),
      referralCode: undefined,
    });
    setTxData(txData);
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

  return (
    <div>
      <AaveModal open={open} onClose={onClose} title={'Supply'}>
        <AssetInput
          value={amountToSupply}
          onChange={setAmountToSupply}
          usdValue={amountInUsd.toString()}
          balance={walletBalance.toString()}
          symbol={poolReserve.symbol}
          sx={{ mb: '40px' }}
        />
        <SupplyDetails
          supplyApy={supplyApy}
          // supplyRewards={supplyRewards}
          healthFactor={healthFactorAfterDeposit.toString()}
        />
        <SupplyActions></SupplyActions>
      </AaveModal>
      <Button onClick={() => setOpen(true)}>Supply</Button>
    </div>
  );
};
