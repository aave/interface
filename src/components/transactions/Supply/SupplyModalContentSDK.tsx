import { bigDecimal, evmAddress } from '@aave/client';
import { healthFactorPreview } from '@aave/client/actions';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { ChainId, ChainId as ClientChainId } from '@aave/types';
import { Trans } from '@lingui/macro';
import { Skeleton, Stack, Typography } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { parseUnits } from 'ethers/lib/utils';
import { client } from 'pages/_app.page';
import React, { useEffect, useState } from 'react';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
import { WrappedTokenTooltipContent } from 'src/components/infoTooltips/WrappedTokenToolTipContent';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { AMPLWarning } from 'src/components/Warnings/AMPLWarning';
import { CollateralType } from 'src/helpers/types';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import {
  useTokenInForTokenOut,
  useTokenOutForTokenIn,
} from 'src/hooks/token-wrapper/useTokenWrapper';
import { useAssetCapsSDK } from 'src/hooks/useAssetCapsSDK';
import { useModalContext } from 'src/hooks/useModal';
import { useWrappedTokens, WrappedTokenConfig } from 'src/hooks/useWrappedTokens';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import {
  getMaxAmountAvailableToSupplySDK,
  remainingCap,
} from 'src/utils/getMaxAmountAvailableToSupply';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { roundToTokenDecimals } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import {
  ExtendedFormattedUser,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { CapType } from '../../caps/helper';
import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperSDKProps } from '../FlowCommons/ModalWrapperSDK';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsCollateralLine,
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { getAssetCollateralTypeSdk } from '../utils';
import { AAVEWarning } from '../Warnings/AAVEWarning';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { SNXWarning } from '../Warnings/SNXWarning';
import { USDTResetWarning } from '../Warnings/USDTResetWarning';
import { SupplyActions } from './SupplyActions';
import { SupplyWrappedTokenActionsSDK } from './SupplyWrappedTokenActionsSDK';

export enum ErrorType {
  CAP_REACHED,
}

export const SupplyModalContentWrapperSDK = (
  params: ModalWrapperSDKProps & { user: ExtendedFormattedUser }
) => {
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const wrappedTokenReserves = useWrappedTokens();
  const { walletBalances } = useWalletBalances(currentMarketData);
  const { supplyCap: supplyCapUsage, debtCeiling: debtCeilingUsage } = useAssetCapsSDK();
  const { supplyReserves } = useAppDataContext(); //! with SDK
  const { poolReserve, reserveUserState, marketUserState } = params;

  const wrappedToken = wrappedTokenReserves.find(
    (r) => r.tokenOut.underlyingAsset === params.underlyingAsset
  );

  const canSupplyAsWrappedToken =
    wrappedToken &&
    walletBalances[wrappedToken.tokenIn.underlyingAsset.toLowerCase()].amount !== '0';

  const hasDifferentCollateral = supplyReserves.some(
    (r) =>
      r.id !== poolReserve.id &&
      r.userState?.balance.amount.value !== '0' &&
      r.userState?.canBeCollateral === true
  );

  const showIsolationWarning =
    !marketUserState?.isInIsolationMode &&
    !!poolReserve.isolationModeConfig?.canBeCollateral &&
    !hasDifferentCollateral &&
    (reserveUserState?.balance.amount.value !== '0'
      ? reserveUserState?.canBeCollateral === true
      : true);

  const props: SupplyModalContentPropsSDK = {
    ...params,
    isolationModeWarning: showIsolationWarning ? (
      <IsolationModeWarning asset={poolReserve.underlyingToken.symbol} />
    ) : null,
    addTokenProps: {
      address: poolReserve.aToken.address,
      symbol: poolReserve.underlyingToken.symbol,
      decimals: poolReserve.underlyingToken.decimals,
      aToken: true,
    },
    collateralType: getAssetCollateralTypeSdk({
      reserve: poolReserve,
      reserveUserState,
      marketUserState,
      debtCeilingIsMaxed: debtCeilingUsage.isMaxed,
    }),
    supplyCapWarning: supplyCapUsage.determineWarningDisplay({ supplyCap: supplyCapUsage }),
    debtCeilingWarning: debtCeilingUsage.determineWarningDisplay({ debtCeiling: debtCeilingUsage }),
    wrappedTokenConfig: wrappedTokenReserves.find(
      (r) => r.tokenOut.underlyingAsset === params.underlyingAsset
    ),
  };

  return canSupplyAsWrappedToken ? (
    <SupplyWrappedTokenModalContentSDK {...props} />
  ) : (
    <SupplyModalContentSDK {...props} />
  );
};

interface SupplyModalContentPropsSDK extends ModalWrapperSDKProps {
  addTokenProps: ERC20TokenType;
  collateralType: CollateralType;
  isolationModeWarning: React.ReactNode;
  supplyCapWarning: React.ReactNode;
  debtCeilingWarning: React.ReactNode;
  wrappedTokenConfig?: WrappedTokenConfig;
  user: ExtendedFormattedUser;
}

export const SupplyModalContentSDK = React.memo(
  ({
    underlyingAsset,
    poolReserve,
    isWrongNetwork,
    nativeBalance,
    tokenBalance,
    isolationModeWarning,
    addTokenProps,
    collateralType,
    supplyCapWarning,
    debtCeilingWarning,
    user,
  }: SupplyModalContentPropsSDK) => {
    // const { marketReferencePriceInUsd } = useAppDataContext();
    const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
    const { chainId, currentAccount } = useWeb3Context();
    const [minRemainingBaseTokenBalance, currentMarketData, currentNetworkConfig] = useRootStore(
      useShallow((state) => [
        state.poolComputed.minRemainingBaseTokenBalance,
        state.currentMarketData,
        state.currentNetworkConfig,
      ])
    );

    // states
    const [amount, setAmount] = useState('');
    const [showUSDTResetWarning, setShowUSDTResetWarning] = useState(false);
    const [hfPreviewAfter, setHfPreviewAfter] = useState<string | undefined>();
    const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();
    const supplyProtocolIncentives = mapAaveProtocolIncentives(poolReserve.incentives, 'supply');
    const walletBalance = supplyUnWrapped ? nativeBalance : tokenBalance;

    const supplyApy = poolReserve.supplyInfo.apy.value;

    // Calculate max amount to supply
    const maxAmountToSupply = getMaxAmountAvailableToSupplySDK({
      walletBalance,
      reserve: poolReserve, // ReserveWithId del SDK
      isNativeSelected: !!poolReserve.acceptsNative && supplyUnWrapped,
      minRemainingBaseTokenBalance,
    });

    const handleChange = (value: string) => {
      if (value === '-1') {
        setAmount(maxAmountToSupply);
      } else {
        const decimalTruncatedValue = roundToTokenDecimals(
          value,
          poolReserve.underlyingToken.decimals
        );
        setAmount(decimalTruncatedValue);
      }
    };

    const amountInUsd = new BigNumber(amount).multipliedBy(poolReserve.usdExchangeRate ?? '0');

    const isMaxSelected = amount === maxAmountToSupply;

    useEffect(() => {
      const timer = setTimeout(async () => {
        if (!amount || amount === '0' || !currentAccount) {
          setHfPreviewAfter(undefined);
          return;
        }

        try {
          const baseAmount = parseUnits(amount, poolReserve.underlyingToken.decimals).toString();

          const requestAmount =
            supplyUnWrapped && poolReserve.acceptsNative
              ? { native: bigDecimal(baseAmount) }
              : {
                  erc20: {
                    currency: evmAddress(poolReserve.underlyingToken.address),
                    value: bigDecimal(baseAmount),
                    permitSig: null,
                  },
                };

          const result = await healthFactorPreview(client, {
            action: {
              supply: {
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
      }, 2000);

      return () => clearTimeout(timer);
    }, [
      amount,
      currentAccount,
      currentMarketData.addresses.LENDING_POOL,
      currentMarketData.chainId,
      poolReserve.acceptsNative,
      poolReserve.underlyingToken.address,
      poolReserve.underlyingToken.decimals,
      supplyUnWrapped,
    ]);

    const supplyActionsProps = {
      amountToSupply: amount,
      isWrongNetwork,
      poolAddress: supplyUnWrapped ? API_ETH_MOCK_ADDRESS : poolReserve.underlyingToken.address,
      symbol: supplyUnWrapped
        ? currentNetworkConfig.baseAssetSymbol
        : poolReserve.underlyingToken.symbol,
      blocked: false,
      decimals: poolReserve.underlyingToken.decimals,
      isWrappedBaseAsset: !!poolReserve.acceptsNative,
      setShowUSDTResetWarning,
      chainId,
    };

    if (supplyTxState.success)
      return (
        <TxSuccessView
          action={<Trans>Supplied</Trans>}
          amount={amount}
          symbol={
            supplyUnWrapped
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.underlyingToken.symbol
          }
          addToken={addTokenProps}
        />
      );

    return (
      <>
        {isolationModeWarning}
        {supplyCapWarning}
        {debtCeilingWarning}
        {poolReserve.underlyingToken.symbol === 'AMPL' && (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="warning">
            <AMPLWarning />
          </Warning>
        )}
        {process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true' &&
          poolReserve.underlyingToken.symbol === 'AAVE' &&
          isFeatureEnabled.staking(currentMarketData) && <AAVEWarning />}
        {poolReserve.underlyingToken.symbol === 'SNX' && maxAmountToSupply !== '0' && (
          <SNXWarning />
        )}

        <AssetInput
          value={amount}
          onChange={handleChange}
          usdValue={amountInUsd.toString(10)}
          symbol={
            supplyUnWrapped
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.underlyingToken.symbol
          }
          assets={[
            {
              balance: maxAmountToSupply,
              symbol: supplyUnWrapped
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.underlyingToken.symbol,
              iconSymbol: supplyUnWrapped
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.underlyingToken.symbol,
            },
          ]}
          capType={CapType.supplyCap}
          isMaxSelected={isMaxSelected}
          disabled={supplyTxState.loading}
          maxValue={maxAmountToSupply}
          balanceText={<Trans>Wallet balance</Trans>}
          event={{
            eventName: GENERAL.MAX_INPUT_SELECTION,
            eventParams: {
              asset: poolReserve.underlyingToken.address,
              assetName: poolReserve.underlyingToken.name,
            },
          }}
        />

        <TxModalDetails gasLimit={gasLimit} skipLoad={true} disabled={Number(amount) === 0}>
          <DetailsNumberLine description={<Trans>Supply APY</Trans>} value={supplyApy} percent />
          <DetailsIncentivesLine
            incentives={supplyProtocolIncentives}
            symbol={poolReserve.underlyingToken.symbol}
          />
          <DetailsCollateralLine collateralType={collateralType} />
          <DetailsHFLine
            visibleHfChange={!!amount}
            healthFactor={user ? user.healthFactor : '-1'}
            futureHealthFactor={hfPreviewAfter?.toString()}
          />
        </TxModalDetails>

        {txError && <GasEstimationError txError={txError} />}

        {showUSDTResetWarning && <USDTResetWarning />}

        <SupplyActions {...supplyActionsProps} />
      </>
    );
  }
);

export const SupplyWrappedTokenModalContentSDK = ({
  poolReserve,
  wrappedTokenConfig,
  isolationModeWarning,
  supplyCapWarning,
  debtCeilingWarning,
  addTokenProps,
  collateralType,
  isWrongNetwork,
  user,
}: SupplyModalContentPropsSDK) => {
  const currentMarketData = useRootStore((state) => state.currentMarketData);
  const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
  const { currentAccount } = useWeb3Context();
  const { walletBalances } = useWalletBalances(currentMarketData);
  const minRemainingBaseTokenBalance = useRootStore(
    (state) => state.poolComputed.minRemainingBaseTokenBalance
  );
  const [hfPreviewAfter, setHfPreviewAfter] = useState<string | undefined>();
  const supplyProtocolIncentives = mapAaveProtocolIncentives(poolReserve.incentives, 'supply');

  if (!wrappedTokenConfig) {
    throw new Error('Wrapped token config is not defined');
  }

  const tokenInBalance = walletBalances[wrappedTokenConfig.tokenIn.underlyingAsset].amount;
  const tokenOutBalance = walletBalances[wrappedTokenConfig.tokenOut.underlyingAsset].amount;

  const assets = [
    {
      balance: tokenInBalance,
      symbol: wrappedTokenConfig.tokenIn.symbol,
      iconSymbol: wrappedTokenConfig.tokenIn.symbol,
      address: wrappedTokenConfig.tokenIn.underlyingAsset,
    },
  ];

  if (tokenOutBalance !== '0') {
    assets.unshift({
      balance: tokenOutBalance,
      symbol: wrappedTokenConfig.tokenOut.symbol,
      iconSymbol: wrappedTokenConfig.tokenOut.symbol,
      address: wrappedTokenConfig.tokenOut.underlyingAsset,
    });
  }

  const [tokenToSupply, setTokenToSupply] = useState<Asset>(assets[0]);
  const [amount, setAmount] = useState('');
  const [convertedTokenInAmount, setConvertedTokenInAmount] = useState<string>('0');
  const { data: exchangeRate } = useTokenInForTokenOut(
    '1',
    poolReserve.underlyingToken.decimals,
    wrappedTokenConfig.tokenWrapperAddress
  );

  useEffect(() => {
    if (!exchangeRate) return;
    const convertedAmount = new BigNumber(tokenInBalance).multipliedBy(exchangeRate).toString();
    setConvertedTokenInAmount(convertedAmount);
  }, [exchangeRate, tokenInBalance]);

  const supplyCap = poolReserve.supplyInfo.supplyCap.amount.value;
  const totalLiquidity = poolReserve.supplyInfo.total.value;

  const maxAmountToSupplyTokenOut = getMaxAmountAvailableToSupplySDK({
    walletBalance: tokenOutBalance,
    reserve: poolReserve,
    isNativeSelected: false,
    minRemainingBaseTokenBalance,
  });

  const tokenOutRemainingSupplyCap = remainingCap(supplyCap, totalLiquidity);

  let maxAmountOfTokenInToSupply = tokenInBalance;
  if (BigNumber(convertedTokenInAmount).isGreaterThan(tokenOutRemainingSupplyCap)) {
    maxAmountOfTokenInToSupply = BigNumber(tokenOutRemainingSupplyCap)
      .dividedBy(exchangeRate || '0')
      .toString();

    maxAmountOfTokenInToSupply = roundToTokenDecimals(
      maxAmountOfTokenInToSupply,
      poolReserve.underlyingToken.decimals
    );
  }

  let supplyingWrappedToken = false;
  if (wrappedTokenConfig) {
    supplyingWrappedToken = tokenToSupply.address === wrappedTokenConfig.tokenIn.underlyingAsset;
  }

  const handleChange = (value: string) => {
    if (value === '-1') {
      if (supplyingWrappedToken) {
        setAmount(maxAmountOfTokenInToSupply);
      } else {
        setAmount(maxAmountToSupplyTokenOut);
      }
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(
        value,
        poolReserve.underlyingToken.decimals
      );
      setAmount(decimalTruncatedValue);
    }
  };

  const amountOutForPool = supplyingWrappedToken
    ? new BigNumber(amount).multipliedBy(exchangeRate || '0')
    : new BigNumber(amount);
  const amountOutForPoolStr = amountOutForPool.toString(10);

  const amountInUsd = amountOutForPool.multipliedBy(poolReserve.usdExchangeRate ?? '0');

  const isMaxSelected =
    amount === (supplyingWrappedToken ? maxAmountOfTokenInToSupply : maxAmountToSupplyTokenOut);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!amount || amount === '0' || !currentAccount) {
        setHfPreviewAfter(undefined);
        return;
      }

      try {
        const baseAmount = parseUnits(
          amountOutForPoolStr,
          poolReserve.underlyingToken.decimals
        ).toString();

        const requestAmount = {
          erc20: {
            currency: evmAddress(poolReserve.underlyingToken.address),
            value: bigDecimal(baseAmount),
            permitSig: null,
          },
        };

        const result = await healthFactorPreview(client, {
          action: {
            supply: {
              market: evmAddress(currentMarketData.addresses.LENDING_POOL),
              amount: requestAmount,
              sender: evmAddress(currentAccount),
              onBehalfOf: evmAddress(currentAccount),
              chainId: currentMarketData.chainId as ClientChainId,
            },
          },
        });

        if (result.isOk()) {
          setHfPreviewAfter(result.value.after?.toString());
        } else {
          setHfPreviewAfter(undefined);
        }
      } catch (error) {
        console.error('healthFactorPreview failed', error);
        setHfPreviewAfter(undefined);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    amount,
    amountOutForPoolStr,
    currentAccount,
    currentMarketData.addresses.LENDING_POOL,
    currentMarketData.chainId,
    poolReserve.underlyingToken.address,
    poolReserve.underlyingToken.decimals,
  ]);

  if (supplyTxState.success) {
    const successModalAmount = supplyingWrappedToken
      ? BigNumber(amount)
          .dividedBy(exchangeRate || '1')
          .toString()
      : amount;

    return (
      <TxSuccessView
        action={<Trans>Supplied</Trans>}
        amount={successModalAmount}
        symbol={poolReserve.underlyingToken.symbol}
        addToken={addTokenProps}
      />
    );
  }

  return (
    <>
      {isolationModeWarning}
      {supplyCapWarning}
      {debtCeilingWarning}
      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString(10)}
        symbol={tokenToSupply.symbol}
        assets={assets}
        onSelect={setTokenToSupply}
        capType={CapType.supplyCap}
        isMaxSelected={isMaxSelected}
        disabled={supplyTxState.loading}
        balanceText={<Trans>Wallet balance</Trans>}
        event={{
          eventName: GENERAL.MAX_INPUT_SELECTION,
          eventParams: {
            asset: poolReserve.underlyingToken.address,
            assetName: poolReserve.underlyingToken.name,
          },
        }}
        exchangeRateComponent={
          supplyingWrappedToken && (
            <ExchangeRate
              supplyAmount={amount}
              decimals={poolReserve.underlyingToken.decimals}
              tokenWrapperAddress={wrappedTokenConfig.tokenWrapperAddress}
              tokenInSymbol={wrappedTokenConfig.tokenIn.symbol}
              tokenOutSymbol={wrappedTokenConfig.tokenOut.symbol}
            />
          )
        }
      />

      <TxModalDetails gasLimit={gasLimit} skipLoad={true} disabled={Number(amount) === 0}>
        <DetailsNumberLine
          description={<Trans>Supply APY</Trans>}
          value={poolReserve.supplyInfo.apy.value}
          percent
        />
        <DetailsIncentivesLine
          incentives={supplyProtocolIncentives}
          symbol={poolReserve.underlyingToken.symbol}
        />
        <DetailsCollateralLine collateralType={collateralType} />
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={hfPreviewAfter}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {supplyingWrappedToken ? (
        <SupplyWrappedTokenActionsSDK
          tokenWrapperAddress={wrappedTokenConfig.tokenWrapperAddress}
          tokenIn={wrappedTokenConfig.tokenIn.underlyingAsset}
          amountToSupply={amount}
          decimals={18}
          symbol={wrappedTokenConfig.tokenIn.symbol}
          isWrongNetwork={isWrongNetwork}
          reserve={poolReserve}
        />
      ) : (
        <SupplyActions
          isWrongNetwork={isWrongNetwork}
          amountToSupply={amount}
          poolAddress={poolReserve.underlyingToken.address}
          symbol={poolReserve.underlyingToken.symbol}
          blocked={false}
          decimals={poolReserve.underlyingToken.decimals}
          isWrappedBaseAsset={false}
        />
      )}
    </>
  );
};

const ExchangeRate = ({
  supplyAmount,
  decimals,
  tokenInSymbol,
  tokenOutSymbol,
  tokenWrapperAddress,
}: {
  supplyAmount: string;
  decimals: number;
  tokenInSymbol: string;
  tokenOutSymbol: string;
  tokenWrapperAddress: string;
}) => {
  const { isFetching: loading, data: tokenOutAmount } = useTokenOutForTokenIn(
    supplyAmount,
    decimals,
    tokenWrapperAddress
  );

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <Typography variant="caption">Supply amount</Typography>
      <TokenIcon sx={{ fontSize: '16px' }} symbol="sdai" />
      {loading ? (
        <Skeleton variant="rectangular" width={80} height={14} />
      ) : (
        <>
          <FormattedNumber
            value={tokenOutAmount || ''}
            variant="subheader2"
            color="text.primary"
            visibleDecimals={2}
          />
          <Typography variant="subheader2" color="text.secondary">
            sDAI
          </Typography>
        </>
      )}
      <TextWithTooltip>
        <WrappedTokenTooltipContent
          decimals={decimals}
          tokenWrapperAddress={tokenWrapperAddress}
          tokenInSymbol={tokenInSymbol}
          tokenOutSymbol={tokenOutSymbol}
        />
      </TextWithTooltip>
    </Stack>
  );
};
