import { healthFactorPreview } from '@aave/client/actions';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { WithdrawRequest } from '@aave/graphql';
import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, ChainId, evmAddress } from '@aave/types';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { client } from 'pages/_app.page';
import { useEffect, useRef, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { ExtendedFormattedUser } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useModalContext } from 'src/hooks/useModal';
import { useZeroLTVBlockingWithdraw } from 'src/hooks/useZeroLTVBlockingWithdraw';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperSDKProps } from '../FlowCommons/ModalWrapperSDK';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { calculateMaxWithdrawAmountSDK } from './utils';
import { WithdrawActionsSDK } from './WithdrawActionsSDK';
import { useWithdrawErrorSDK } from './WithdrawErrorSDK';

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawModalContentSDK = ({
  poolReserve,
  reserveUserState,
  marketUserState,
  userSupplies,
  unwrap: withdrawUnWrapped,
  setUnwrap: setWithdrawUnWrapped,
  symbol,
  isWrongNetwork,
  user,
}: ModalWrapperSDKProps & {
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
  user: ExtendedFormattedUser;
}) => {
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext();

  const [_amount, setAmount] = useState('');
  const [withdrawMax, setWithdrawMax] = useState('');
  const [hfPreviewAfter, setHfPreviewAfter] = useState<string | undefined>(undefined);
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);
  const amountRef = useRef<string>('');
  const [trackEvent, currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentNetworkConfig, store.currentMarketData])
  );
  const { currentAccount } = useWeb3Context();
  const isMaxSelected = _amount === '-1';

  const userSuppliedPosition = userSupplies?.find(
    (supply) =>
      supply.currency.address.toLowerCase() === poolReserve.underlyingToken.address.toLowerCase()
  );

  const underlyingBalance = valueToBigNumber(userSuppliedPosition?.balance.amount.value ?? '0');
  const unborrowedLiquidity = valueToBigNumber(
    poolReserve.borrowInfo?.availableLiquidity.amount.value ?? '0'
  );

  const maxAmountToWithdraw = calculateMaxWithdrawAmountSDK(
    marketUserState,
    reserveUserState,
    poolReserve,
    underlyingBalance
  );

  const withdrawAmount = isMaxSelected ? maxAmountToWithdraw.toFixed() : _amount;
  const normalizedWithdrawAmount = valueToBigNumber(withdrawAmount || '0').toFixed();

  const requestAmount: WithdrawRequest['amount'] =
    withdrawUnWrapped && poolReserve.acceptsNative
      ? { native: { value: { exact: bigDecimal(normalizedWithdrawAmount) } } }
      : {
          erc20: {
            currency: evmAddress(poolReserve.underlyingToken.address),
            value: { exact: bigDecimal(normalizedWithdrawAmount) },
          },
        };

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

  // health factor calculations
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!withdrawAmount || withdrawAmount === '0') {
        setHfPreviewAfter(undefined);
        return;
      }

      try {
        const result = await healthFactorPreview(client, {
          action: {
            withdraw: {
              market: evmAddress(currentMarketData.addresses.LENDING_POOL),
              amount: requestAmount,
              sender: evmAddress(currentAccount),
              chainId: currentMarketData.chainId as ChainId,
            },
          },
        });

        if (result.isOk()) {
          setHfPreviewAfter(result.value.after?.toString());
        } else {
          setHfPreviewAfter(undefined);
        }
      } catch (error) {
        setHfPreviewAfter(undefined);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    withdrawAmount,
    currentAccount,
    currentMarketData.addresses.LENDING_POOL,
    currentMarketData.chainId,
    poolReserve.acceptsNative,
    poolReserve.underlyingToken.address,
    poolReserve.underlyingToken.decimals,
    withdrawUnWrapped,
  ]);
  const hfPreviewAfterBN = valueToBigNumber(hfPreviewAfter ?? '0');

  const { blockingError, errorComponent } = useWithdrawErrorSDK({
    assetsBlockingWithdraw,
    poolReserve,
    hfPreviewAfter: hfPreviewAfterBN,
    withdrawAmount,
    userState: marketUserState,
  });

  const futureHfNumber = hfPreviewAfter !== undefined ? Number(hfPreviewAfter) : undefined;
  const displayRiskCheckbox =
    futureHfNumber !== undefined &&
    futureHfNumber >= 1 &&
    futureHfNumber < 1.5 &&
    !!reserveUserState?.canBeCollateral;

  // calculating input usd value
  const usdValue = valueToBigNumber(withdrawAmount).multipliedBy(
    poolReserve.usdExchangeRate ?? '0'
  );

  if (withdrawTxState.success)
    return (
      <TxSuccessView
        action={<Trans>withdrew</Trans>}
        amount={amountRef.current}
        symbol={
          withdrawUnWrapped && !!poolReserve.acceptsNative
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.underlyingToken.symbol
        }
      />
    );

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
              withdrawUnWrapped && !!poolReserve.acceptsNative
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.underlyingToken.symbol,
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

      {!!poolReserve.acceptsNative && (
        <DetailsUnwrapSwitch
          unwrapped={withdrawUnWrapped}
          setUnWrapped={setWithdrawUnWrapped}
          label={
            <Typography>{`Unwrap ${poolReserve.underlyingToken.symbol} (to withdraw ${currentNetworkConfig.baseAssetSymbol})`}</Typography>
          }
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>Remaining supply</Trans>}
          value={underlyingBalance.minus(withdrawAmount || '0').toString(10)}
          symbol={
            !!poolReserve.acceptsNative
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.underlyingToken.symbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={hfPreviewAfter}
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

      <WithdrawActionsSDK
        poolReserve={poolReserve}
        amountToWithdraw={isMaxSelected ? withdrawMax : withdrawAmount}
        poolAddress={
          withdrawUnWrapped && !!poolReserve.acceptsNative
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingToken.address
        }
        isWrongNetwork={isWrongNetwork}
        withdrawNative={withdrawUnWrapped}
        usdAmount={usdValue.toString(10)}
        requestAmount={requestAmount}
        symbol={symbol}
        blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
