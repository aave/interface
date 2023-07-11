import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { MaxUint256 } from '@ethersproject/constants';
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
import { assetCanBeBorrowedByUser } from 'src/utils/getMaxAmountAvailableToBorrow';

import {
  ComputedUserReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { DebtSwitchActions } from './DebtSwitchActions';
import { DebtSwitchModalDetails } from './DebtSwitchModalDetails';

export type SupplyProps = {
  underlyingAsset: string;
};

interface SwitchTargetAsset extends Asset {
  variableApy: string;
}

// TODO: other errors?
enum ErrorType {
  INSUFFICIENT_LIQUIDITY,
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

  const switchTargets = reserves
    .filter(
      (r) =>
        r.underlyingAsset !== poolReserve.underlyingAsset &&
        r.availableLiquidity !== '0' &&
        assetCanBeBorrowedByUser(r, user)
    )
    .map<SwitchTargetAsset>((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
      variableApy: reserve.variableBorrowAPY,
    }));

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>('');
  const [targetReserve, setTargetReserve] = useState<Asset>(switchTargets[0]);
  const [maxSlippage, setMaxSlippage] = useState('0.1');

  const switchTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedUserReserveData;

  const maxAmountToSwitch =
    currentRateMode === InterestRate.Variable
      ? userReserve.variableBorrows
      : userReserve.stableBorrows;

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToSwitch : _amount;

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
    swapIn: { ...switchTarget.reserve, amount: '0' },
    max: isMaxSelected,
    skip: mainTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  });

  const loadingSkeleton = routeLoading && outputAmountUSD === '0';

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToSwitch : value;
    setAmount(value);
  };

  const availableBorrowCap =
    switchTarget.reserve.borrowCap === '0'
      ? valueToBigNumber(MaxUint256.toString())
      : valueToBigNumber(Number(switchTarget.reserve.borrowCap)).minus(
          valueToBigNumber(switchTarget.reserve.totalDebt)
        );
  const availableLiquidityOfTargetReserve = BigNumber.max(
    BigNumber.min(switchTarget.reserve.formattedAvailableLiquidity, availableBorrowCap),
    0
  );

  let blockingError: ErrorType | undefined = undefined;
  if (BigNumber(outputAmount).gt(availableLiquidityOfTargetReserve)) {
    blockingError = ErrorType.INSUFFICIENT_LIQUIDITY;
  }

  const BlockingError: React.FC = () => {
    switch (blockingError) {
      case ErrorType.INSUFFICIENT_LIQUIDITY:
        return (
          <Trans>
            There is not enough liquidity for the target asset to perform the switch. Try lowering
            the amount.
          </Trans>
        );
      default:
        return null;
    }
  };

  if (mainTxState.success)
    return (
      <TxSuccessView
        customAction={
          <Typography>
            <Trans>You switched borrow position of</Trans>
            <br />
            <FormattedNumber value={amountRef.current} compact variant="secondary14" />{' '}
            {poolReserve.symbol} <Trans>to</Trans>{' '}
            <FormattedNumber value={outputAmount} compact variant="secondary14" />{' '}
            {switchTarget.reserve.symbol}
          </Typography>
        }
        amount={amountRef.current}
        symbol={poolReserve.symbol}
      />
    );

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={outputAmountUSD}
        symbol={poolReserve.iconSymbol}
        assets={[
          {
            balance: maxAmountToSwitch,
            address: poolReserve.underlyingAsset,
            symbol: poolReserve.symbol,
            iconSymbol: poolReserve.iconSymbol,
          },
        ]}
        maxValue={maxAmountToSwitch}
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

        <PriceImpactTooltip
          loading={loadingSkeleton}
          outputAmountUSD={outputAmountUSD}
          inputAmountUSD={inputAmountUSD}
        />
      </Box>
      <AssetInput<SwitchTargetAsset>
        value={inputAmount}
        onSelect={setTargetReserve}
        usdValue={inputAmountUSD}
        symbol={targetReserve.symbol}
        assets={switchTargets}
        inputTitle={<Trans>Switch to</Trans>}
        balanceText={<Trans>Supply balance</Trans>}
        disableInput
        loading={loadingSkeleton}
        selectOptionHeader={<SelectOptionListHeader />}
        selectOption={(asset) => <SwitchTargetSelectOption asset={asset} />}
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
          switchSource={userReserve}
          switchTarget={switchTarget}
          toAmount={inputAmount}
          fromAmount={amount === '' ? '0' : amount}
          loading={loadingSkeleton}
          sourceBalance={maxAmountToSwitch}
          sourceBorrowAPY={
            currentRateMode === InterestRate.Variable
              ? poolReserve.variableBorrowAPY
              : poolReserve.stableBorrowAPY
          }
          targetBorrowAPY={switchTarget.reserve.variableBorrowAPY}
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
        targetReserve={switchTarget.reserve}
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

const SwitchTargetSelectOption = ({ asset }: { asset: SwitchTargetAsset }) => {
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
