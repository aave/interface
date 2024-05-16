import { valueToBigNumber } from '@aave/math-utils';
import { ArrowDownIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Stack, SvgIcon, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import {
  ComputedUserReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { minimumReceivedAfterSlippage } from 'src/hooks/paraswap/common';
import { useCollateralSwap } from 'src/hooks/paraswap/useCollateralSwap';
import { useTokenInForTokenOut } from 'src/hooks/token-wrapper/useTokenWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWrappedTokens } from 'src/hooks/useWrappedTokens';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { roundToTokenDecimals } from 'src/utils/utils';

import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { DetailsHFLine, DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { calculateMaxWithdrawAmount } from './utils';
import { WithdrawAndSwitchActions } from './WithdrawAndSwitchActions';
import { WithdrawAndSwitchTxSuccessView } from './WithdrawAndSwitchSuccess';
import { WithdrawAndUnwrapAction } from './WithdrawAndUnwrapActions';
import { useWithdrawError } from './WithdrawError';

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawAndSwitchModalContent = ({
  poolReserve,
  userReserve,
  symbol,
  isWrongNetwork,
  user,
}: ModalWrapperProps & { user: ExtendedFormattedUser }) => {
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext();
  const { currentAccount } = useWeb3Context();
  const { reserves } = useAppDataContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();
  const wrappedTokenReserves = useWrappedTokens();

  const [_amount, setAmount] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const amountRef = useRef<string>('');
  const trackEvent = useRootStore((store) => store.trackEvent);
  const [maxSlippage, setMaxSlippage] = useState('0.1');

  let swapTargets = reserves
    .filter((r) => r.underlyingAsset !== poolReserve.underlyingAsset)
    .map((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
    }));

  // TODO: if withdrawing and unwrapping, should we show that asset at the top of the list?
  swapTargets = [
    ...swapTargets.filter((r) => r.symbol === 'GHO'),
    ...swapTargets.filter((r) => r.symbol !== 'GHO'),
  ];

  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0]);

  const isMaxSelected = _amount === '-1';

  const swapTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedUserReserveData;

  const maxAmountToWithdraw = calculateMaxWithdrawAmount(user, userReserve, poolReserve);
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');

  let withdrawAndUnwrap = false;
  const wrappedTokenConfig = wrappedTokenReserves.find(
    (config) => config.tokenOut.underlyingAsset === poolReserve.underlyingAsset
  );
  if (wrappedTokenConfig) {
    withdrawAndUnwrap = targetReserve.address === wrappedTokenConfig.tokenIn.underlyingAsset;
  }

  const { data: unwrappedAmount, isFetching: loadingTokenInForTokenOut } = useTokenInForTokenOut(
    amountRef.current,
    poolReserve.decimals,
    wrappedTokenConfig?.tokenWrapperAddress || ''
  );

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
    skip: withdrawAndUnwrap || withdrawTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  });

  let outputUSD = outputAmountUSD;
  if (withdrawAndUnwrap) {
    outputUSD = valueToBigNumber(unwrappedAmount || '0')
      .multipliedBy(wrappedTokenConfig?.tokenIn.priceInUSD || 0)
      .toString();
  }

  const loadingSkeleton =
    (routeLoading && outputAmountUSD === '0') || (withdrawAndUnwrap && loadingTokenInForTokenOut);

  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);

  const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();

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
    user,
  });

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    const truncatedValue = roundToTokenDecimals(value, poolReserve.decimals);
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString(10) : truncatedValue;
    setAmount(truncatedValue);
    if (maxSelected && maxAmountToWithdraw.eq(underlyingBalance)) {
      trackEvent(GENERAL.MAX_INPUT_SELECTION, { type: 'withdraw' });
    }
  };

  const displayRiskCheckbox =
    healthFactorAfterWithdraw.toNumber() >= 1 &&
    healthFactorAfterWithdraw.toNumber() < 1.5 &&
    userReserve.usageAsCollateralEnabledOnUser;

  // calculating input usd value
  const usdValue = valueToBigNumber(withdrawAmount).multipliedBy(
    userReserve?.reserve.priceInUSD || 0
  );

  const minimumAmountReceived = minimumReceivedAfterSlippage(
    outputAmount,
    maxSlippage,
    swapTarget.reserve.decimals
  );

  if (withdrawTxState.success) {
    let amount = inputAmount;
    let outAmount = minimumAmountReceived;
    if (withdrawAndUnwrap) {
      amount = amountRef.current;
      outAmount = unwrappedAmount || '0';
    }
    return (
      <WithdrawAndSwitchTxSuccessView
        txHash={withdrawTxState.txHash}
        amount={amount}
        symbol={
          poolReserve.isWrappedBaseAsset ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol
        }
        outSymbol={targetReserve.symbol}
        outAmount={outAmount}
      />
    );
  }

  return (
    <>
      <AssetInput
        inputTitle={<Trans>Withdraw</Trans>}
        value={withdrawAmount}
        onChange={handleChange}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(10),
            symbol: symbol,
            iconSymbol: poolReserve.isWrappedBaseAsset
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.iconSymbol,
          },
        ]}
        usdValue={usdValue.toString(10)}
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

        <PriceImpactTooltip
          loading={loadingSkeleton}
          outputAmountUSD={outputAmountUSD}
          inputAmountUSD={inputAmountUSD}
        />
      </Box>

      <AssetInput
        value={withdrawAndUnwrap ? unwrappedAmount || '' : outputAmount}
        onSelect={setTargetReserve}
        usdValue={outputUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        inputTitle={<Trans>Receive (est.)</Trans>}
        balanceText={<Trans>Supply balance</Trans>}
        disableInput
        loading={loadingSkeleton}
      />

      {error && !loadingSkeleton && !withdrawAndUnwrap && (
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
          withdrawAndUnwrap ? null : (
            <ListSlippageButton
              selectedSlippage={maxSlippage}
              setSlippage={setMaxSlippage}
              slippageTooltipHeader={
                <Stack direction="row" gap={2} alignItems="center" justifyContent="space-between">
                  <Trans>Minimum amount received</Trans>
                  <Stack alignItems="end">
                    <Stack direction="row">
                      <TokenIcon
                        symbol={swapTarget.reserve.iconSymbol}
                        sx={{ mr: 1, fontSize: '14px' }}
                      />
                      <FormattedNumber value={minimumAmountReceived} variant="secondary12" />
                    </Stack>
                  </Stack>
                </Stack>
              }
            />
          )
        }
      >
        <DetailsNumberLine
          description={<Trans>Remaining supply</Trans>}
          value={underlyingBalance.minus(withdrawAmount || '0').toString(10)}
          symbol={
            poolReserve.isWrappedBaseAsset
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.symbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={healthFactorAfterWithdraw.toString(10)}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <>
          <Warning severity="error" sx={{ my: 6 }}>
            <Trans>
              Withdrawing this amount will reduce your health factor and increase risk of
              liquidation.
            </Trans>
          </Warning>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              mx: '24px',
              mb: '12px',
            }}
          >
            <Checkbox
              checked={riskCheckboxAccepted}
              onChange={() => {
                setRiskCheckboxAccepted(!riskCheckboxAccepted),
                  trackEvent(GENERAL.ACCEPT_RISK, {
                    modal: 'Withdraw',
                    riskCheckboxAccepted: riskCheckboxAccepted,
                  });
              }}
              size="small"
              data-cy={`risk-checkbox`}
            />
            <Typography variant="description">
              <Trans>I acknowledge the risks involved.</Trans>
            </Typography>
          </Box>
        </>
      )}

      {withdrawAndUnwrap ? (
        <WithdrawAndUnwrapAction
          poolReserve={poolReserve}
          amountToWithdraw={amountRef.current}
          isWrongNetwork={isWrongNetwork}
          tokenWrapperAddress={wrappedTokenConfig?.tokenWrapperAddress || ''}
          sx={displayRiskCheckbox ? { mt: 0 } : {}}
          blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        />
      ) : (
        <WithdrawAndSwitchActions
          poolReserve={poolReserve}
          targetReserve={swapTarget.reserve}
          amountToSwap={inputAmount}
          amountToReceive={minimumAmountReceived}
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
