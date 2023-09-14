import { valueToBigNumber } from '@aave/math-utils';
import { ArrowDownIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { ReactNode, useRef, useState } from 'react';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';
import { RiskAcknowledge } from 'src/components/RiskAcknowledge';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCollateralSwap } from 'src/hooks/paraswap/useCollateralSwap';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useDaiForSavingsDai } from 'src/hooks/useSavingsDai';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { selectWrappedTokenConfig } from 'src/store/poolSelectors';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { DetailsHFLine, DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { zeroLTVBlockingWithdraw } from '../utils';
import { calculateMaxWithdrawAmount } from './utils';
import { WithdrawAndSwitchActions } from './WithdrawAndSwitchActions';
import { WithdrawAndSwitchTxSuccessView } from './WithdrawAndSwitchSuccess';
import { WithdrawAndUnwrapActions } from './WithdrawAndUnwrapActions';
import { useWithdrawError } from './WithdrawError';

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawAndSwitchModalContent = ({
  poolReserve,
  userReserve,
  isWrongNetwork,
}: ModalWrapperProps) => {
  const { mainTxState: withdrawTxState } = useModalContext();
  const { currentAccount } = useWeb3Context();
  const { user, reserves } = useAppDataContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();

  const [_amount, setAmount] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const amountRef = useRef<string>('');

  const [maxSlippage, setMaxSlippage] = useState('0.1');

  let swapTargets = reserves
    .filter((r) => r.underlyingAsset !== poolReserve.underlyingAsset)
    .map((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
      priceInUsd: reserve.priceInUSD,
    }));

  // TODO: if withdrawing and unwrapping, should we show that asset at the top of the list?
  swapTargets = [
    ...swapTargets.filter((r) => r.symbol === 'GHO'),
    ...swapTargets.filter((r) => r.symbol !== 'GHO'),
  ];

  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0]);

  const [trackEvent, wrappedTokenConfig] = useRootStore((store) => [
    store.trackEvent,
    selectWrappedTokenConfig(store, poolReserve.underlyingAsset),
  ]);

  const isMaxSelected = _amount === '-1';

  const swapTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedUserReserveData;

  const maxAmountToWithdraw = calculateMaxWithdrawAmount(user, userReserve, poolReserve);
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');

  const useParaswap =
    !wrappedTokenConfig ||
    targetReserve.address !== wrappedTokenConfig.tokenIn.reserve.underlyingAsset;

  const { loading: loadingDaiForSavingsDai, tokenInAmount } = useDaiForSavingsDai({
    amount: amountRef.current,
    decimals: 18,
    skip: useParaswap,
  });

  const {
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    error,
    loading: routeLoading,
    buildTxFn,
  } = useCollateralSwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: currentAccount,
    swapIn: { ...poolReserve, amount: amountRef.current },
    swapOut: { ...swapTarget.reserve, amount: '0' },
    max: isMaxSelected && maxAmountToWithdraw.eq(underlyingBalance),
    skip: !useParaswap || withdrawTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  });

  let loadingSkeleton = false;
  if (useParaswap) {
    loadingSkeleton = routeLoading && outputAmountUSD === '0';
  } else {
    loadingSkeleton = loadingDaiForSavingsDai;
  }

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user);

  const withdrawAmount = isMaxSelected ? maxAmountToWithdraw.toString(10) : _amount;

  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve,
    poolReserve,
    withdrawAmount,
  });

  const { blockingError, errorComponent } = useWithdrawError({
    assetsBlockingWithdraw,
    poolReserve,
    healthFactorAfterWithdraw,
    withdrawAmount,
  });

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString(10) : value;
    setAmount(value);
    if (maxSelected && maxAmountToWithdraw.eq(underlyingBalance)) {
      trackEvent(GENERAL.MAX_INPUT_SELECTION, { type: 'withdraw' });
    }
  };

  const displayRiskCheckbox =
    healthFactorAfterWithdraw.toNumber() >= 1 &&
    healthFactorAfterWithdraw.toNumber() < 1.5 &&
    userReserve.usageAsCollateralEnabledOnUser;

  const withdrawAmountUSD = useParaswap
    ? inputAmountUSD
    : valueToBigNumber(withdrawAmount)
        .multipliedBy(userReserve?.reserve.priceInUSD || 0)
        .toString();

  const amountReceivedUSD = useParaswap
    ? outputAmountUSD
    : valueToBigNumber(tokenInAmount)
        .multipliedBy(targetReserve.priceInUsd || 0)
        .toString();

  const iconSymbol = poolReserve.isWrappedBaseAsset
    ? currentNetworkConfig.baseAssetSymbol
    : poolReserve.iconSymbol;

  if (withdrawTxState.success)
    return (
      <WithdrawAndSwitchTxSuccessView
        txHash={withdrawTxState.txHash}
        amount={inputAmount}
        symbol={iconSymbol}
        outSymbol={targetReserve.symbol}
        outAmount={outputAmount}
      />
    );

  const props: WithdrawAndSwitchParametersProps = {
    withdrawAmount,
    withdrawAmountUSD,
    outputAmount: useParaswap ? outputAmount : tokenInAmount,
    outputAmountUSD: amountReceivedUSD,
    maxSlippage: useParaswap ? maxSlippage : undefined,
    healthFactorAfterWithdraw: healthFactorAfterWithdraw.toString(10),
    targetReserve,
    swapTargets,
    loading: loadingSkeleton,
    error: useParaswap ? error : '',
    blockingError,
    errorComponent,
    poolReserve,
    userReserve,
    iconSymbol,
    isMaxSelected,
    showPriceImpact: useParaswap,
    receiveInputTitle: useParaswap ? <Trans>Receive (est.)</Trans> : <Trans>Receive</Trans>,
    onTargetReserveSelected: setTargetReserve,
    onMaxSlippageChange: setMaxSlippage,
    onWithdrawAmountChange: handleChange,
  };

  return (
    <>
      <WithdrawAndSwitchParameters {...props} />

      {displayRiskCheckbox && (
        <RiskAcknowledge
          checked={riskCheckboxAccepted}
          onChange={(value) => {
            setRiskCheckboxAccepted(value);
            trackEvent(GENERAL.ACCEPT_RISK, {
              modal: 'Withdraw',
              riskCheckboxAccepted: value,
            });
          }}
          title={
            <Trans>
              Withdrawing this amount will reduce your health factor and increase risk of
              liquidation.
            </Trans>
          }
        />
      )}

      {wrappedTokenConfig ? (
        <WithdrawAndUnwrapActions
          poolReserve={poolReserve}
          symbol={iconSymbol}
          amountToWithdraw={amountRef.current}
        />
      ) : (
        <WithdrawAndSwitchActions
          poolReserve={poolReserve}
          targetReserve={swapTarget.reserve}
          amountToSwap={inputAmount}
          amountToReceive={outputAmount}
          isMaxSelected={isMaxSelected && maxAmountToWithdraw.eq(underlyingBalance)}
          isWrongNetwork={isWrongNetwork}
          blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
          buildTxFn={buildTxFn}
          sx={displayRiskCheckbox ? { mt: 0 } : {}}
        />
      )}
    </>
  );
};

interface WithdrawAndSwitchParametersProps {
  withdrawAmount: string;
  withdrawAmountUSD: string;
  outputAmount: string;
  outputAmountUSD: string;
  maxSlippage?: string;
  healthFactorAfterWithdraw: string;
  targetReserve: Asset;
  error: string;
  swapTargets: {
    address: string;
    symbol: string;
    iconSymbol: string;
  }[];
  loading: boolean;
  blockingError?: ErrorType;
  errorComponent?: ReactNode;
  poolReserve: ComputedReserveData;
  userReserve: ComputedUserReserveData;
  iconSymbol: string;
  isMaxSelected: boolean;
  showPriceImpact: boolean;
  receiveInputTitle: ReactNode;
  onTargetReserveSelected: (reserve: Asset) => void;
  onMaxSlippageChange?: (value: string) => void;
  onWithdrawAmountChange: (value: string) => void;
}

const WithdrawAndSwitchParameters = ({
  withdrawAmount,
  withdrawAmountUSD,
  outputAmount,
  outputAmountUSD,
  maxSlippage,
  healthFactorAfterWithdraw,
  targetReserve,
  swapTargets,
  loading,
  error,
  blockingError,
  errorComponent,
  poolReserve,
  userReserve,
  iconSymbol,
  isMaxSelected,
  showPriceImpact,
  receiveInputTitle,
  onTargetReserveSelected,
  onMaxSlippageChange,
  onWithdrawAmountChange,
}: WithdrawAndSwitchParametersProps) => {
  const { user } = useAppDataContext();
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext();

  const maxAmountToWithdraw = calculateMaxWithdrawAmount(user, userReserve, poolReserve);
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);

  const symbol = poolReserve.symbol;

  return (
    <>
      <AssetInput
        inputTitle={<Trans>Withdraw</Trans>}
        value={withdrawAmount}
        onChange={onWithdrawAmountChange}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(10),
            symbol,
            iconSymbol,
          },
        ]}
        usdValue={withdrawAmountUSD}
        isMaxSelected={isMaxSelected}
        disabled={withdrawTxState.loading}
        maxValue={maxAmountToWithdraw.toString(10)}
        balanceText={
          unborrowedLiquidity.lt(underlyingBalance) ? (
            <Trans>Available</Trans>
          ) : (
            <Trans>Supply balance</Trans>
          )
        }
      />

      <Box sx={{ padding: '18px', pt: '14px', display: 'flex', justifyContent: 'space-between' }}>
        <SvgIcon sx={{ fontSize: '18px !important' }}>
          <ArrowDownIcon />
        </SvgIcon>

        {showPriceImpact && (
          <PriceImpactTooltip
            loading={loading}
            outputAmountUSD={outputAmountUSD}
            inputAmountUSD={withdrawAmountUSD}
          />
        )}
      </Box>

      <AssetInput
        value={outputAmount}
        onSelect={onTargetReserveSelected}
        usdValue={outputAmountUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        inputTitle={receiveInputTitle}
        balanceText={<Trans>Supply balance</Trans>}
        disableInput
        loading={loading}
      />

      {error && !loading && (
        <Typography variant="helperText" color="error.main">
          {error}
        </Typography>
      )}

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {errorComponent}
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          maxSlippage && onMaxSlippageChange ? (
            <ListSlippageButton selectedSlippage={maxSlippage} setSlippage={onMaxSlippageChange} />
          ) : undefined
        }
      >
        <DetailsNumberLine
          description={<Trans>Remaining supply</Trans>}
          value={underlyingBalance.minus(withdrawAmount || '0').toString(10)}
          symbol={iconSymbol}
        />
        <DetailsHFLine
          visibleHfChange={!!withdrawAmount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={healthFactorAfterWithdraw}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}
    </>
  );
};
