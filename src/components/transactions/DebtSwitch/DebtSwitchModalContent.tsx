import { InterestRate } from '@aave/contract-helpers';
import { ArrowDownIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, ListItemText, ListSubheader, Stack, SvgIcon, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';
import { TxModalDetails } from 'src/components/transactions/FlowCommons/TxModalDetails';
import { useDebtSwitch } from 'src/hooks/paraswap/useDebtSwitch';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { selectCurrentBaseCurrencyData } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';
import { getDebtSwitchInfo } from 'src/utils/getDebtSwitchInfo';

import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { ErrorType, zeroLTVBlockingWithdraw } from '../utils';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { DebtSwitchActions } from './DebtSwitchActions';
import { DebtSwitchModalDetails } from './DebtSwitchModalDetails';

export type SupplyProps = {
  underlyingAsset: string;
};

interface SwapTargetAsset extends Asset {
  variableApy: string;
}

export const DebtSwitchModalContent = ({
  poolReserve,
  userReserve,
  isWrongNetwork,
  currentRateMode,
}: ModalWrapperProps & { currentRateMode: InterestRate }) => {
  const { reserves, user } = useAppDataContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { currentAccount } = useWeb3Context();
  const { gasLimit, mainTxState, txError } = useModalContext();
  const baseCurrencyData = useRootStore((state) => selectCurrentBaseCurrencyData(state));

  const swapTargets = reserves
    .filter(
      (r) => r.underlyingAsset !== poolReserve.underlyingAsset && !r.isFrozen && r.borrowingEnabled
    )
    .map<SwapTargetAsset>((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
      variableApy: reserve.variableBorrowAPY,
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
  const maxAmountToSwap =
    currentRateMode === InterestRate.Variable
      ? userReserve.variableBorrows
      : userReserve.stableBorrows;

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToSwap : _amount;

  const {
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    error,
    loading: routeLoading,
    buildTxFn,
  } = useDebtSwitch({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: currentAccount,
    swapOut: { ...poolReserve, amount: amountRef.current },
    swapIn: { ...swapTarget.reserve, amount: '0' },
    max: isMaxSelected,
    skip: mainTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  });

  const loadingSkeleton = routeLoading && outputAmountUSD === '0';

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToSwap : value;
    setAmount(value);
  };

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user);

  let blockingError: ErrorType | undefined = undefined;
  if (assetsBlockingWithdraw.length > 0 && !assetsBlockingWithdraw.includes(poolReserve.symbol)) {
    blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED;
  }

  const BlockingError: React.FC = () => {
    switch (blockingError) {
      case ErrorType.HF_BELOW_ONE:
        return (
          <Trans>
            The effects on the health factor would cause liquidation. Try lowering the amount.
          </Trans>
        );
      case ErrorType.ZERO_LTV_WITHDRAW_BLOCKED:
        return (
          <Trans>
            Assets with zero LTV ({assetsBlockingWithdraw}) must be withdrawn or disabled as
            collateral to perform this action
          </Trans>
        );
      default:
        return null;
    }
  };

  if (mainTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Switched borrow position</Trans>}
        amount={amountRef.current}
        symbol={poolReserve.symbol}
      />
    );

  // calculate impact based on $ difference
  const priceDifference: BigNumber = new BigNumber(outputAmountUSD).minus(inputAmountUSD);
  let priceImpact =
    inputAmountUSD && inputAmountUSD !== '0'
      ? priceDifference.dividedBy(inputAmountUSD).times(100).toFixed(2)
      : '0';
  if (priceImpact === '-0.00') {
    priceImpact = '0.00';
  }

  const { availableLiquidityOfTargetReserve, futureLTV } = getDebtSwitchInfo(
    poolReserve,
    swapTarget.reserve,
    amount,
    inputAmount,
    user,
    baseCurrencyData.marketReferenceCurrencyDecimals
  );

  //console.log('availableLiquidityOfTargetReserve', availableLiquidityOfTargetReserve);
  //console.log('futureLTV', futureLTV);
  // const { debtCeilingReached: sourceDebtCeiling } = getDebtCeilingData(swapTarget.reserve);
  // const swapSourceCollateralType = getAssetCollateralType(
  //   userReserve,
  //   user.totalCollateralUSD,
  //   user.isInIsolationMode,
  //   sourceDebtCeiling
  // );

  // const { debtCeilingReached: targetDebtCeiling } = getDebtCeilingData(swapTarget.reserve);
  // let swapTargetCollateralType = getAssetCollateralType(
  //   swapTarget,
  //   user.totalCollateralUSD,
  //   user.isInIsolationMode,
  //   targetDebtCeiling
  // );

  // If the user is swapping all of their isolated asset to an asset that is not supplied,
  // then the swap target will be enabled as collateral as part of the swap.
  // if (
  //   isMaxSelected &&
  //   swapSourceCollateralType === CollateralType.ISOLATED_ENABLED &&
  //   swapTarget.underlyingBalance === '0'
  // ) {
  //   if (swapTarget.reserve.isIsolated) {
  //     swapTargetCollateralType = CollateralType.ISOLATED_ENABLED;
  //   } else {
  //     swapTargetCollateralType = CollateralType.ENABLED;
  //   }
  // }

  // If the user is swapping all of their enabled asset to an isolated asset that is not supplied,
  // and no other supplied assets are being used as collateral,
  // then the swap target will be enabled as collateral and the user will be in isolation mode.
  // if (
  //   isMaxSelected &&
  //   swapSourceCollateralType === CollateralType.ENABLED &&
  //   swapTarget.underlyingBalance === '0' &&
  //   swapTarget.reserve.isIsolated
  // ) {
  //   const reservesAsCollateral = user.userReservesData.filter(
  //     (r) => r.usageAsCollateralEnabledOnUser
  //   );

  //   if (
  //     reservesAsCollateral.length === 1 &&
  //     reservesAsCollateral[0].underlyingAsset === userReserve.underlyingAsset
  //   ) {
  //     swapTargetCollateralType = CollateralType.ISOLATED_ENABLED;
  //   }
  // }

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={outputAmountUSD}
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
        inputTitle={<Trans>Borrowed asset amount</Trans>}
        balanceText={
          <React.Fragment>
            {currentRateMode === InterestRate.Variable ? (
              <Trans>Variable</Trans>
            ) : (
              <Trans>Stable</Trans>
            )}{' '}
            <Trans>Borrow balance</Trans>
          </React.Fragment>
        }
        isMaxSelected={isMaxSelected}
      />
      <Box sx={{ padding: '18px', pt: '14px', display: 'flex', justifyContent: 'space-between' }}>
        <SvgIcon sx={{ fontSize: '18px !important' }}>
          <ArrowDownIcon />
        </SvgIcon>

        <PriceImpactTooltip loading={loadingSkeleton} priceImpact={priceImpact} />
      </Box>
      <AssetInput<SwapTargetAsset>
        value={inputAmount}
        onSelect={setTargetReserve}
        usdValue={inputAmountUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        inputTitle={<Trans>Switch to</Trans>}
        balanceText={<Trans>Supply balance</Trans>}
        disableInput
        loading={loadingSkeleton}
        selectOptionHeader={<SelectOptionListHeader />}
        selectOption={(asset) => <SwapTargetSelectOption asset={asset} />}
      />
      {error && !loadingSkeleton && (
        <Typography variant="helperText" color="error.main">
          {error}
        </Typography>
      )}
      {!error && blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          <BlockingError />
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          <ListSlippageButton selectedSlippage={maxSlippage} setSlippage={setMaxSlippage} />
        }
      >
        <DebtSwitchModalDetails
          swapSource={userReserve}
          swapTarget={swapTarget}
          toAmount={inputAmount}
          fromAmount={amount === '' ? '0' : amount}
          loading={loadingSkeleton}
          sourceBalance={maxAmountToSwap}
          sourceBorrowAPY={
            currentRateMode === InterestRate.Variable
              ? poolReserve.variableBorrowAPY
              : poolReserve.stableBorrowAPY
          }
          targetBorrowAPY={swapTarget.reserve.variableBorrowAPY}
          showAPYTypeChange={currentRateMode === InterestRate.Stable}
        />
      </TxModalDetails>

      {txError && <ParaswapErrorDisplay txError={txError} />}

      <DebtSwitchActions
        isMaxSelected={isMaxSelected}
        poolReserve={poolReserve}
        amountToSwap={outputAmount}
        amountToReceive={inputAmount}
        isWrongNetwork={isWrongNetwork}
        targetReserve={swapTarget.reserve}
        symbol={poolReserve.symbol}
        blocked={blockingError !== undefined || error !== ''}
        loading={routeLoading}
        buildTxFn={buildTxFn}
        currentRateMode={currentRateMode}
      />
    </>
  );
};

const SelectOptionListHeader = () => {
  return (
    <ListSubheader sx={(theme) => ({ borderBottom: `1px solid ${theme.palette.divider}` })}>
      <Stack direction="row" sx={{ py: 4 }} gap={14}>
        <Typography variant="subheader2">
          <Trans>Select an asset</Trans>
        </Typography>
        <Typography variant="subheader2">
          <Trans>Borrow APY, variable</Trans>
        </Typography>
      </Stack>
    </ListSubheader>
  );
};

const SwapTargetSelectOption = ({ asset }: { asset: SwapTargetAsset }) => {
  return (
    <>
      <TokenIcon
        aToken={asset.aToken}
        symbol={asset.iconSymbol || asset.symbol}
        sx={{ fontSize: '22px', mr: 1 }}
      />
      <ListItemText sx={{ mr: 6 }}>{asset.symbol}</ListItemText>
      <FormattedNumber
        value={asset.variableApy}
        percent
        variant="secondary14"
        color="text.secondary"
      />
    </>
  );
};
