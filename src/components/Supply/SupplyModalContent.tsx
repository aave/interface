import React, { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { SupplyDetails } from './SupplyDetails';
import { SupplyActions } from './SupplyActions';
import { Button, Typography } from '@mui/material';
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
import { Trans } from '@lingui/macro';
import { TxErrorView } from '../TxViews/Error';
import { TxSuccessView } from '../TxViews/Success';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';

export type SupplyProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export type TxState = {
  error: string | null;
  success: boolean;
};

export const SupplyModalContent = ({ underlyingAsset, handleClose }: SupplyProps) => {
  const { walletBalances } = useWalletBalances();
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  console.log('underlying asset: ', underlyingAsset);
  console.log('reserve', reserves);
  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;
  console.log('supply apy: ', poolReserve);
  const supplyApy = poolReserve.supplyAPY;
  const userReserve = user?.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;
  const walletBalance = walletBalances[underlyingAsset]?.amount;
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId, switchNetwork } = useWeb3Context();

  const [supplyTxState, setSupplyTxState] = useState<TxState>({ success: false, error: null });

  const [amountToSupply, setAmountToSupply] = useState('');
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);

  const networkConfig = getNetworkConfig(currentChainId);

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
          <Typography variant="h2" sx={{ mb: '26px' }}>
            Supply {poolReserve.symbol}
          </Typography>
          {isWrongNetwork && (
            <Typography sx={{ mb: '24px', backgroundColor: '#FEF5E8', color: 'black' }}>
              <Trans>Please Switch to {networkConfig.name}.</Trans>
              <Button
                variant="text"
                sx={{ ml: '2px' }}
                onClick={() => switchNetwork(currentChainId)}
              >
                <Typography color="black">Switch Network</Typography>
              </Button>
            </Typography>
          )}
          {showIsolationWarning && (
            <Typography>You are about to enter into isolation. FAQ link</Typography>
          )}
          {showSupplyCapWarning && (
            <Typography>You are about to get supply capped. FAQ link</Typography>
          )}
          <AssetInput
            value={amountToSupply}
            onChange={setAmountToSupply}
            usdValue={amountInUsd.toString()}
            balance={maxAmountToSupply.toString()}
            symbol={poolReserve.symbol}
          />
          <SupplyDetails
            supplyApy={supplyApy}
            incentives={poolReserve.aIncentivesData}
            showHf={showHealthFactor || false}
            healthFactor={user ? user.healthFactor : '-1'}
            futureHealthFactor={healthFactorAfterDeposit.toString()}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
          />
        </>
      )}
      {supplyTxState.error && <TxErrorView errorMessage={supplyTxState.error} />}
      {supplyTxState.success && !supplyTxState.error && (
        <TxSuccessView action="Supplied" amount={amountToSupply} symbol={poolReserve.symbol} />
      )}
      <SupplyActions
        setSupplyTxState={setSupplyTxState}
        poolReserve={poolReserve}
        amountToSupply={amountToSupply}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
      />
    </>
  );
};
