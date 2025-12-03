import { healthFactorPreview } from '@aave/client/actions';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, ChainId, evmAddress } from '@aave/types';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { client } from 'pages/_app.page';
import { useEffect, useState } from 'react';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { ExtendedFormattedUser } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { roundToTokenDecimals } from 'src/utils/utils';

import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperSDKProps } from '../FlowCommons/ModalWrapperSDK';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsUnwrapSwitch,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { BorrowActionsSDK } from './BorrowActionsSDK';
import { BorrowAmountWarning } from './BorrowAmountWarning';
import { ParameterChangewarning } from './ParameterChangewarning';

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

export const BorrowModalContentSDK = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  unwrap: borrowUnWrapped,
  setUnwrap: setBorrowUnWrapped,
  symbol,
  user,
}: ModalWrapperSDKProps & {
  unwrap: boolean;
  setUnwrap: (unwrap: boolean) => void;
  user: ExtendedFormattedUser;
}) => {
  const { mainTxState: borrowTxState, gasLimit, txError } = useModalContext();
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const { currentAccount } = useWeb3Context();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const { borrowCap } = useAssetCapsSDK();
  const borrowNative = borrowUnWrapped && !!poolReserve.acceptsNative;
  console.log('BorrowModalContentSDK render borrowNative:', borrowNative);
  const borrowProtocolIncentives = mapAaveProtocolIncentives(poolReserve.incentives, 'borrow');

  const [amount, setAmount] = useState('');
  const [hfPreviewAfter, setHfPreviewAfter] = useState<string | undefined>();
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false);

  // amount calculations
  // const maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user);
  const maxAmountToBorrow = poolReserve.userState?.borrowable.amount.value || '0';

  // We set this in a useEffect, so it doesn't constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    if (_value === '-1') {
      setAmount(maxAmountToBorrow);
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(
        _value,
        poolReserve.underlyingToken.decimals
      );
      setAmount(decimalTruncatedValue);
    }
  };

  const isMaxSelected = amount === maxAmountToBorrow;

  // health factor calculations
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!amount || amount === '0') {
        setHfPreviewAfter(undefined);
        return;
      }

      try {
        const requestAmount =
          borrowUnWrapped && poolReserve.acceptsNative
            ? { native: bigDecimal(amount) }
            : {
                erc20: {
                  currency: evmAddress(poolReserve.underlyingToken.address),
                  value: bigDecimal(amount),
                },
              };

        const result = await healthFactorPreview(client, {
          action: {
            borrow: {
              market: evmAddress(currentMarketData.addresses.LENDING_POOL),
              amount: requestAmount,
              sender: evmAddress(currentAccount),
              onBehalfOf: evmAddress(currentAccount),
              chainId: currentMarketData.chainId as ChainId,
            },
          },
        });

        if (result.isOk()) {
          //!Debug
          console.log('healthFactorPreview result', result.value);
          setHfPreviewAfter(result.value.after?.toString());
        } else {
          setHfPreviewAfter(undefined);
        }
      } catch (error) {
        console.error('healthFactorPreview failed', error);
        setHfPreviewAfter(undefined);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    amount,
    currentAccount,
    currentMarketData.addresses.LENDING_POOL,
    currentMarketData.chainId,
    poolReserve.acceptsNative,
    poolReserve.underlyingToken.address,
    poolReserve.underlyingToken.decimals,
    borrowUnWrapped,
  ]);

  const hf = hfPreviewAfter ?? '-1';
  const hfBN = valueToBigNumber(hf);
  const displayRiskCheckbox = !hfBN.isEqualTo(-1) && hfBN.lt(1.5);

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.usdExchangeRate ?? '0');

  // error types handling
  let blockingError: ErrorType | undefined = undefined;
  if (valueToBigNumber(amount).gt(poolReserve.borrowInfo?.availableLiquidity.amount.value || '0')) {
    blockingError = ErrorType.NOT_ENOUGH_LIQUIDITY;
  } else if (poolReserve.borrowInfo?.borrowingState !== 'ENABLED') {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE;
  }

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return (
          <Trans>
            Borrowing is currently unavailable for {poolReserve.underlyingToken.symbol}.
          </Trans>
        );
      case ErrorType.NOT_ENOUGH_LIQUIDITY:
        return (
          <>
            <Trans>
              There are not enough funds in the
              {poolReserve.underlyingToken.symbol}
              reserve to borrow
            </Trans>
          </>
        );
      default:
        return null;
    }
  };

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: underlyingAsset,
    symbol: poolReserve.underlyingToken.symbol,
    decimals: poolReserve.underlyingToken.decimals,
  };

  const iconSymbol =
    borrowUnWrapped && !!poolReserve.acceptsNative
      ? currentNetworkConfig.baseAssetSymbol
      : poolReserve.underlyingToken.symbol;

  if (borrowTxState.success)
    return (
      <TxSuccessView
        action={<Trans>Borrowed</Trans>}
        amount={amount}
        symbol={iconSymbol}
        addToken={borrowUnWrapped && !!poolReserve.acceptsNative ? undefined : addToken}
      />
    );

  return (
    <>
      {borrowCap.determineWarningDisplay({ borrowCap })}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol,
            iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
        balanceText={<Trans>Available</Trans>}
        event={{
          eventName: GENERAL.MAX_INPUT_SELECTION,
          eventParams: {
            asset: poolReserve.underlyingToken.address,
            assetName: poolReserve.underlyingToken.name,
          },
        }}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      {!!poolReserve.acceptsNative && (
        <DetailsUnwrapSwitch
          unwrapped={borrowUnWrapped}
          setUnWrapped={setBorrowUnWrapped}
          label={
            <Typography>{`Unwrap ${poolReserve.underlyingToken.symbol} (to borrow ${currentNetworkConfig.baseAssetSymbol})`}</Typography>
          }
        />
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsIncentivesLine
          incentives={borrowProtocolIncentives}
          symbol={poolReserve.underlyingToken.symbol}
        />
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={hfPreviewAfter}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <BorrowAmountWarning
          riskCheckboxAccepted={riskCheckboxAccepted}
          onRiskCheckboxChange={() => {
            setRiskCheckboxAccepted(!riskCheckboxAccepted);
          }}
        />
      )}

      <ParameterChangewarning underlyingAsset={underlyingAsset} />

      <BorrowActionsSDK
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={borrowNative ? API_ETH_MOCK_ADDRESS : poolReserve.underlyingToken.address}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        borrowNative={borrowNative}
        blocked={blockingError !== undefined || (displayRiskCheckbox && !riskCheckboxAccepted)}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  );
};
