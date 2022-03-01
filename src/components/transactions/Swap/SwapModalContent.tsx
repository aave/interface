import React, { useRef, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { SwapActions } from './SwapActions';
import { ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ComputedUserReserve } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { Trans } from '@lingui/macro';
import { remainingCap } from 'src/utils/getMaxAmountAvailableToSupply';
import { useSwap } from 'src/hooks/useSwap';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { TxModalTitle } from 'src/components/transactions/FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from 'src/components/transactions/Warnings/ChangeNetworkWarning';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { TxErrorView } from 'src/components/transactions/FlowCommons/Error';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { useModalContext } from 'src/hooks/useModal';
import { TxSuccessView } from '../FlowCommons/Success';
import { Box } from '@mui/system';
import { Row } from 'src/components/primitives/Row';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { calculateHFAfterSwap } from 'src/utils/hfUtils';

export type SupplyProps = {
  underlyingAsset: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  CAP_REACHED,
}

export const SwapModalContent = ({ underlyingAsset }: SupplyProps) => {
  const { reserves, user } = useAppDataContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { chainId: connectedChainId, currentAccount } = useWeb3Context();
  const { gasLimit, mainTxState: supplyTxState } = useModalContext();

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
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>('');
  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0]);
  const [maxSlippage, setMaxSlippage] = useState('0.1');

  const swapTarget = reserves.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedReserveData;

  const swapTargetUserReserve = user.userReservesData.find((userReserve) => {
    return targetReserve.address === userReserve.underlyingAsset;
  }) as ComputedUserReserve;

  // a user can never swap more then 100% of available as the txn would fail on withdraw step
  const maxAmountToSwap = BigNumber.min(
    userReserve.underlyingBalance,
    new BigNumber(poolReserve.availableLiquidity).multipliedBy(0.99)
  ).toString();

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToSwap : _amount;

  const { priceRoute, inputAmountUSD, outputAmount, outputAmountUSD } = useSwap({
    chainId: currentChainId,
    userId: currentAccount,
    variant: 'exactIn',
    swapIn: { ...poolReserve, amount: amountRef.current },
    swapOut: { ...swapTarget, amount: '0' },
    max: isMaxSelected,
  });

  const minimumReceived = new BigNumber(outputAmount || '0')
    .multipliedBy(new BigNumber(100).minus(maxSlippage).dividedBy(100))
    .toString();

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToSwap.toString() : value;
    setAmount(value);
  };

  const { hfAfterSwap, hfEffectOfFromAmount } = calculateHFAfterSwap({
    fromAmount: amount,
    fromAssetData: poolReserve,
    fromAssetUserData: userReserve,
    user,
    toAmountAfterSlippage: minimumReceived,
    toAssetData: swapTarget,
    toAssetUserData: swapTargetUserReserve,
  });

  // if the hf would drop below 1 from the hf effect a flashloan should be used to mitigate liquidation
  const shouldUseFlashloan =
    user.healthFactor !== '-1' &&
    new BigNumber(user.healthFactor).minus(hfEffectOfFromAmount).lt('1.1');

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

  if (supplyTxState.txError) return <TxErrorView errorMessage={supplyTxState.txError} />;
  if (supplyTxState.success)
    return <TxSuccessView action="Swapped" amount={maxAmountToSwap} symbol={poolReserve.symbol} />;

  // hf is only relevant when there are borrows
  const showHealthFactor =
    user &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // calculate impact based on $ difference
  const priceImpact =
    outputAmountUSD && outputAmountUSD !== '0'
      ? new BigNumber(1).minus(new BigNumber(inputAmountUSD).dividedBy(outputAmountUSD)).toString()
      : '0';

  return (
    <>
      <TxModalTitle title="Swap" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={currentNetworkConfig.name} chainId={currentChainId} />
      )}
      {/* {showIsolationWarning && (
            <Typography>You are about to enter into isolation. FAQ link</Typography>
          )} */}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={inputAmountUSD.toString()}
        symbol={poolReserve.iconSymbol}
        assets={[
          {
            balance: maxAmountToSwap,
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.iconSymbol,
          },
        ]}
        maxValue={maxAmountToSwap}
        isMaxSelected={isMaxSelected}
      />
      <AssetInput
        value={outputAmount}
        onSelect={setTargetReserve}
        usdValue={outputAmountUSD.toString()}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        disableInput={true}
      />
      <Box
        sx={{
          bgcolor: 'background.default',
          border: '1px solid rgba(56, 61, 81, 0.12)',
          borderRadius: '4px',
          padding: '8px 16px',
          mt: 6,
        }}
      >
        <Row caption={<Trans>Price impact</Trans>} captionVariant="subheader1">
          <FormattedNumber value={priceImpact} variant="secondary14" percent />
        </Row>
        <Row caption={<Trans>Minimum received</Trans>} captionVariant="subheader1" sx={{ mt: 4 }}>
          <FormattedNumber
            value={minimumReceived}
            variant="secondary14"
            symbol={swapTarget.symbol}
          />
        </Row>
        <Typography variant="description" sx={{ mt: 4 }}>
          <Trans>Max slippage rate</Trans>
        </Typography>
        <ToggleButtonGroup
          sx={{ mt: 2 }}
          value={maxSlippage}
          onChange={(e, value) => setMaxSlippage(value)}
          exclusive
        >
          <ToggleButton value="0.1" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">0.1%</Typography>
          </ToggleButton>
          <ToggleButton value="0.5" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">0.5%</Typography>
          </ToggleButton>
          <ToggleButton value="1" sx={{ minWidth: '74px' }}>
            <Typography variant="secondary14">1%</Typography>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Supply apy</Trans>}
          value={poolReserve.supplyAPY}
          futureValue={swapTarget.supplyAPY}
          percent
        />
        <DetailsIncentivesLine
          incentives={poolReserve.aIncentivesData}
          symbol={poolReserve.symbol}
          futureIncentives={swapTarget.aIncentivesData}
          futureSymbol={swapTarget.symbol}
        />
        {showHealthFactor && (
          <DetailsHFLine
            healthFactor={user.healthFactor}
            futureHealthFactor={hfAfterSwap.toString()}
          />
        )}
      </TxModalDetails>

      {supplyTxState.gasEstimationError && (
        <GasEstimationError error={supplyTxState.gasEstimationError} />
      )}
      <SwapActions
        isMaxSelected={isMaxSelected}
        poolReserve={poolReserve}
        amountToSwap={amountRef.current}
        amountToReceive={minimumReceived}
        isWrongNetwork={isWrongNetwork}
        targetReserve={swapTarget}
        symbol={poolReserve.symbol}
        blocked={surpassesTargetSupplyCap}
        priceRoute={priceRoute}
        useFlashLoan={shouldUseFlashloan}
      />
    </>
  );
};
