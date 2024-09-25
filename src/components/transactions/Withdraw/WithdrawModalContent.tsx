import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { WrappedTokenTooltipContent } from 'src/components/infoTooltips/WrappedTokenToolTipContent';
import { Warning } from 'src/components/primitives/Warning';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { ExtendedFormattedUser } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useTokenInForTokenOut } from 'src/hooks/token-wrapper/useTokenWrapper';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWrappedTokens } from 'src/hooks/useWrappedTokens';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';
import { useRootStore } from 'src/store/root';
import { calculateHFAfterWithdraw } from 'src/utils/hfUtils';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { calculateMaxWithdrawAmount } from './utils';
import { WithdrawActions } from './WithdrawActions';
import { WithdrawAndUnwrapAction } from './WithdrawAndUnwrapActions';
import { useWithdrawError } from './WithdrawError';

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawModalContent = ({
  poolReserve,
  userReserve,
  unwrap: withdrawUnWrapped,
  setUnwrap: setWithdrawUnWrapped,
  symbol,
  isWrongNetwork,
  user,
}: ModalWrapperProps & {
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
  user: ExtendedFormattedUser;
}) => {
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext();
  const { currentNetworkConfig } = useProtocolDataContext();

  const [_amount, setAmount] = useState('');
  const [withdrawMax, setWithdrawMax] = useState('');
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const amountRef = useRef<string>('');
  const trackEvent = useRootStore((store) => store.trackEvent);
  const wrappedTokenReserves = useWrappedTokens();

  const isMaxSelected = _amount === '-1';
  const maxAmountToWithdraw = calculateMaxWithdrawAmount(user, userReserve, poolReserve);
  const underlyingBalance = valueToBigNumber(userReserve?.underlyingBalance || '0');
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  const withdrawAmount = isMaxSelected ? maxAmountToWithdraw.toString(10) : _amount;

  const wrappedToken = wrappedTokenReserves.find(
    (r) => r.tokenOut.underlyingAsset === poolReserve.underlyingAsset
  );

  const canBeUnwrapped = !poolReserve.isWrappedBaseAsset && wrappedToken !== undefined;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString(10) : value;
    setAmount(value);
    if (maxSelected && maxAmountToWithdraw.eq(underlyingBalance)) {
      trackEvent(GENERAL.MAX_INPUT_SELECTION, { type: 'withdraw' });
      setWithdrawMax('-1');
    } else {
      setWithdrawMax(maxAmountToWithdraw.toString(10));
    }
  };

  const assetsBlockingWithdraw = useZeroLTVBlockingWithdraw();

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
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
      />
    );

  const unwrapFromSymbol = wrappedToken ? wrappedToken.tokenOut.symbol : poolReserve.symbol;
  const unwrapToSymbol = wrappedToken
    ? wrappedToken.tokenIn.symbol
    : currentNetworkConfig.baseAssetSymbol;

  return (
    <>
      <AssetInput
        value={withdrawAmount}
        onChange={handleChange}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(10),
            symbol: symbol,
            iconSymbol:
              withdrawUnWrapped && poolReserve.isWrappedBaseAsset
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

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {errorComponent}
        </Typography>
      )}

      {(poolReserve.isWrappedBaseAsset || canBeUnwrapped) && (
        <DetailsUnwrapSwitch
          unwrapped={withdrawUnWrapped}
          setUnWrapped={setWithdrawUnWrapped}
          label={
            <Typography>{`Unwrap ${unwrapFromSymbol} (to withdraw ${unwrapToSymbol})`}</Typography>
          }
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        {canBeUnwrapped && withdrawUnWrapped && (
          <UnwrapWithdrawDetails
            withdrawAmount={withdrawAmount}
            tokenOutDecimals={wrappedToken.tokenOut.decimals}
            tokenWrapperAddress={wrappedToken.tokenWrapperAddress}
            tokenInSymbol={unwrapFromSymbol}
            tokenOutSymbol={unwrapToSymbol}
          />
        )}
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

      {wrappedToken && withdrawUnWrapped ? (
        <WithdrawAndUnwrapAction
          poolReserve={poolReserve}
          amountToWithdraw={isMaxSelected ? withdrawMax : withdrawAmount}
          isWrongNetwork={isWrongNetwork}
          tokenWrapperAddress={wrappedToken.tokenWrapperAddress}
          blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
          sx={displayRiskCheckbox ? { mt: 0 } : {}}
        />
      ) : (
        <WithdrawActions
          poolReserve={poolReserve}
          amountToWithdraw={isMaxSelected ? withdrawMax : withdrawAmount}
          poolAddress={
            withdrawUnWrapped && poolReserve.isWrappedBaseAsset
              ? API_ETH_MOCK_ADDRESS
              : poolReserve.underlyingAsset
          }
          isWrongNetwork={isWrongNetwork}
          symbol={symbol}
          blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
          sx={displayRiskCheckbox ? { mt: 0 } : {}}
        />
      )}
    </>
  );
};

const UnwrapWithdrawDetails = ({
  withdrawAmount,
  tokenOutDecimals,
  tokenWrapperAddress,
  tokenInSymbol,
  tokenOutSymbol,
}: {
  withdrawAmount: string;
  tokenOutDecimals: number;
  tokenWrapperAddress: string;
  tokenInSymbol: string;
  tokenOutSymbol: string;
}) => {
  const { data: tokenInAmount, isFetching: loading } = useTokenInForTokenOut(
    withdrawAmount,
    tokenOutDecimals,
    tokenWrapperAddress
  );

  return (
    <DetailsNumberLine
      loading={loading}
      description={
        <TextWithTooltip text={<Trans>Amount to receive</Trans>}>
          <WrappedTokenTooltipContent
            action="withdrawn"
            decimals={tokenOutDecimals}
            tokenWrapperAddress={tokenWrapperAddress}
            tokenInSymbol={tokenInSymbol}
            tokenOutSymbol={tokenOutSymbol}
          />
        </TextWithTooltip>
      }
      value={tokenInAmount || '0'}
      symbol={tokenOutSymbol}
    />
  );
};
