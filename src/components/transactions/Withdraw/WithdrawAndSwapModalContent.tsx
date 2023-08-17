import { valueToBigNumber } from '@aave/math-utils';
import { ArrowDownIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, SvgIcon, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { PriceImpactTooltip } from 'src/components/infoTooltips/PriceImpactTooltip';
import { Warning } from 'src/components/primitives/Warning';
import {
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCollateralSwap } from 'src/hooks/paraswap/useCollateralSwap';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ListSlippageButton } from 'src/modules/dashboard/lists/SlippageList';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine, DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { zeroLTVBlockingWithdraw } from '../utils';
import { calculateMaxWithdrawAmount } from './utils';
import { WithdrawAndSwapActions } from './WithdrawAndSwapActions';
import { useWithdrawError } from './WithdrawError';

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawAndSwapModalContent = ({
  poolReserve,
  userReserve,
  symbol,
  isWrongNetwork,
}: ModalWrapperProps) => {
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext();
  const { currentAccount } = useWeb3Context();
  const { user, reserves } = useAppDataContext();
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext();

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

  swapTargets = [
    ...swapTargets.filter((r) => r.symbol === 'GHO'),
    ...swapTargets.filter((r) => r.symbol !== 'GHO'),
  ];

  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0]);

  const isMaxSelected = _amount === '-1';

  const swapTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address
  ) as ComputedUserReserveData;

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
    max: isMaxSelected,
    skip: withdrawTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  });

  const loadingSkeleton = routeLoading && outputAmountUSD === '0';
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  const maxAmountToWithdraw = calculateMaxWithdrawAmount(user, userReserve, poolReserve);

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

  // calculating input usd value
  const usdValue = valueToBigNumber(withdrawAmount).multipliedBy(
    userReserve?.reserve.priceInUSD || 0
  );

  if (withdrawTxState.success)
    return (
      <TxSuccessView
        action={<Trans>withdrew</Trans>}
        amount={amountRef.current}
        symbol={
          poolReserve.isWrappedBaseAsset ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol
        }
      />
    );

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
        value={outputAmount}
        onSelect={setTargetReserve}
        usdValue={outputAmountUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        inputTitle={<Trans>Receive (est.)</Trans>}
        balanceText={<Trans>Supply balance</Trans>}
        disableInput
        loading={loadingSkeleton}
      />

      {error && !loadingSkeleton && (
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
          <ListSlippageButton selectedSlippage={maxSlippage} setSlippage={setMaxSlippage} />
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

      <WithdrawAndSwapActions
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
    </>
  );
};
