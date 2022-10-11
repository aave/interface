import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { GasEstimationError } from 'src/components/transactions/FlowCommons/GasEstimationError';
import { TxModalDetails } from 'src/components/transactions/FlowCommons/TxModalDetails';
import { useCollateralSwap } from 'src/hooks/paraswap/useCollateralSwap';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { remainingCap } from 'src/utils/getMaxAmountAvailableToSupply';
import { calculateHFAfterSwap } from 'src/utils/hfUtils';

import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { ErrorType, flashLoanNotAvailable, useFlashloan } from '../utils';
import { SwapActions } from './SwapActions';
import { SwapModalDetails } from './SwapModalDetails';

export type SupplyProps = {
  underlyingAsset: string;
};

export const SwapModalContent = ({
  poolReserve,
  userReserve,
  isWrongNetwork,
}: ModalWrapperProps) => {
  const { reserves, user } = useAppDataContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const { gasLimit, mainTxState: supplyTxState, txError } = useModalContext();

  const swapTargets = reserves
    .filter((r) => r.underlyingAsset !== poolReserve.underlyingAsset)
    .map((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
    }));

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>('');
  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0]);
  const [maxSlippage, setMaxSlippage] = useState('0.1');

  const swapTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedUserReserveData;

  // a user can never swap more then 100% of available as the txn would fail on withdraw step
  const maxAmountToSwap = BigNumber.min(
    userReserve.underlyingBalance,
    new BigNumber(poolReserve.availableLiquidity).multipliedBy(0.99)
  ).toString(10);

  const remainingCapBn = remainingCap(swapTarget.reserve);

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToSwap : _amount;

  const {
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    error,
    augustus,
    swapCallData,
  } = useCollateralSwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: currentAccount,
    swapIn: { ...poolReserve, amount: amountRef.current },
    swapOut: { ...swapTarget.reserve, amount: '0' },
    max: isMaxSelected,
    skip: supplyTxState.loading,
    maxSlippage: Number(maxSlippage),
  });

  const minimumReceived = new BigNumber(outputAmount || '0')
    .multipliedBy(new BigNumber(100).minus(maxSlippage).dividedBy(100))
    .toString(10);

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToSwap : value;
    setAmount(value);
  };

  const { hfAfterSwap, hfEffectOfFromAmount } = calculateHFAfterSwap({
    fromAmount: amount,
    fromAssetData: poolReserve,
    fromAssetUserData: userReserve,
    user,
    toAmountAfterSlippage: minimumReceived,
    toAssetData: swapTarget.reserve,
  });

  // if the hf would drop below 1 from the hf effect a flashloan should be used to mitigate liquidation
  const shouldUseFlashloan = useFlashloan(user.healthFactor, hfEffectOfFromAmount);

  const disableFlashLoan =
    shouldUseFlashloan &&
    flashLoanNotAvailable(
      userReserve.underlyingAsset,
      currentNetworkConfig.underlyingChainId || currentChainId
    );

  // consider caps
  // we cannot check this in advance as it's based on the swap result
  let blockingError: ErrorType | undefined = undefined;
  if (!remainingCapBn.eq('-1') && remainingCapBn.lt(amount)) {
    blockingError = ErrorType.SUPPLY_CAP_REACHED;
  } else if (!hfAfterSwap.eq('-1') && hfAfterSwap.lt('1.01')) {
    blockingError = ErrorType.HF_BELOW_ONE;
  } else if (disableFlashLoan) {
    blockingError = ErrorType.FLASH_LOAN_NOT_AVAILABLE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.SUPPLY_CAP_REACHED:
        return <Trans>Supply cap on target reserve reached. Try lowering the amount.</Trans>;
      case ErrorType.HF_BELOW_ONE:
        return (
          <Trans>
            The effects on the health factor would cause liquidation. Try lowering the amount.
          </Trans>
        );
      case ErrorType.FLASH_LOAN_NOT_AVAILABLE:
        return (
          <Trans>
            Due to a precision bug in the stETH contract, this asset can not be used in flashloan
            transactions
          </Trans>
        );
      default:
        return null;
    }
  };

  if (supplyTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Swapped</Trans>}
        amount={amountRef.current}
        symbol={poolReserve.symbol}
      />
    );

  // hf is only relevant when there are borrows
  const showHealthFactor =
    user &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.usageAsCollateralEnabled;

  // calculate impact based on $ difference
  const priceImpact =
    outputAmountUSD && outputAmountUSD !== '0'
      ? new BigNumber(1).minus(new BigNumber(inputAmountUSD).dividedBy(outputAmountUSD)).toFixed(2)
      : '0';

  return (
    <>
      {/* {showIsolationWarning && (
            <Typography>You are about to enter into isolation. FAQ link</Typography>
          )} */}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={inputAmountUSD}
        symbol={poolReserve.iconSymbol}
        assets={[
          {
            balance: maxAmountToSwap,
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.symbol,
            iconSymbol: poolReserve.iconSymbol,
          },
        ]}
        maxValue={maxAmountToSwap}
        inputTitle={<Trans>Supplied asset amount</Trans>}
        balanceText="Supply balance"
        isMaxSelected={isMaxSelected}
      />
      <Box sx={{ padding: '18px', pt: '14px', display: 'flex', justifyContent: 'space-between' }}>
        <SvgIcon sx={{ fontSize: '18px !important' }}>
          <SwitchVerticalIcon />
        </SvgIcon>

        <PriceImpactTooltip
          text={
            <Trans>
              Price impact{' '}
              <FormattedNumber value={priceImpact} variant="secondary12" color="text.secondary" />%
            </Trans>
          }
          variant="secondary14"
        />
      </Box>
      <AssetInput
        value={outputAmount}
        onSelect={setTargetReserve}
        usdValue={outputAmountUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        inputTitle={<Trans>Swap to</Trans>}
        disableInput
      />
      {error && (
        <Typography variant="helperText" color="error.main">
          {error}
        </Typography>
      )}
      {!error && blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          <ListSlippageButton selectedSlippage={maxSlippage} setSlippage={setMaxSlippage} />
        }
      >
        <SwapModalDetails
          showHealthFactor={showHealthFactor}
          healthFactor={user?.healthFactor}
          healthFactorAfterSwap={hfAfterSwap.toString(10)}
          swapSource={userReserve}
          swapTarget={swapTarget}
          toAmount={minimumReceived}
          fromAmount={amount === '' ? '0' : amount}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <SwapActions
        isMaxSelected={isMaxSelected}
        poolReserve={poolReserve}
        amountToSwap={inputAmount}
        amountToReceive={minimumReceived}
        isWrongNetwork={isWrongNetwork}
        targetReserve={swapTarget.reserve}
        symbol={poolReserve.symbol}
        blocked={blockingError !== undefined}
        useFlashLoan={shouldUseFlashloan}
        maxSlippage={Number(maxSlippage)}
        augustus={augustus}
        swapCallData={swapCallData}
      />
    </>
  );
};
