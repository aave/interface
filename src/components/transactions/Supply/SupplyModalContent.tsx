import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Skeleton, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useEffect, useState } from 'react';
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
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWrappedTokens, WrappedTokenConfig } from 'src/hooks/useWrappedTokens';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import {
  getMaxAmountAvailableToSupply,
  remainingCap,
} from 'src/utils/getMaxAmountAvailableToSupply';
import { calculateHFAfterSupply } from 'src/utils/hfUtils';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { roundToTokenDecimals } from 'src/utils/utils';

import {
  ExtendedFormattedUser,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { CapType } from '../../caps/helper';
import { Asset, AssetInput } from '../AssetInput';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsCollateralLine,
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { getAssetCollateralType } from '../utils';
import { AAVEWarning } from '../Warnings/AAVEWarning';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { SNXWarning } from '../Warnings/SNXWarning';
import { SupplyActions } from './SupplyActions';
import { SupplyWrappedTokenActions } from './SupplyWrappedTokenActions';

export enum ErrorType {
  CAP_REACHED,
}

export const SupplyModalContentWrapper = (
  params: ModalWrapperProps & { user: ExtendedFormattedUser }
) => {
  const user = params.user;
  const { currentMarketData } = useProtocolDataContext();
  const wrappedTokenReserves = useWrappedTokens();
  const { walletBalances } = useWalletBalances(currentMarketData);
  const { supplyCap: supplyCapUsage, debtCeiling: debtCeilingUsage } = useAssetCaps();

  const { poolReserve, userReserve } = params;

  const wrappedToken = wrappedTokenReserves.find(
    (r) => r.tokenOut.underlyingAsset === params.underlyingAsset
  );

  const canSupplyAsWrappedToken =
    wrappedToken &&
    walletBalances[wrappedToken.tokenIn.underlyingAsset.toLowerCase()].amount !== '0';

  const hasDifferentCollateral = user.userReservesData.find(
    (reserve) => reserve.usageAsCollateralEnabledOnUser && reserve.reserve.id !== poolReserve.id
  );

  const showIsolationWarning: boolean =
    !user.isInIsolationMode &&
    poolReserve.isIsolated &&
    !hasDifferentCollateral &&
    (userReserve && userReserve.underlyingBalance !== '0'
      ? userReserve.usageAsCollateralEnabledOnUser
      : true);

  const props: SupplyModalContentProps = {
    ...params,
    isolationModeWarning: showIsolationWarning ? (
      <IsolationModeWarning asset={poolReserve.symbol} />
    ) : null,
    addTokenProps: {
      address: poolReserve.aTokenAddress,
      symbol: poolReserve.iconSymbol,
      decimals: poolReserve.decimals,
      aToken: true,
    },
    collateralType: getAssetCollateralType(
      userReserve,
      user.totalCollateralUSD,
      user.isInIsolationMode,
      debtCeilingUsage.isMaxed
    ),
    supplyCapWarning: supplyCapUsage.determineWarningDisplay({ supplyCap: supplyCapUsage }),
    debtCeilingWarning: debtCeilingUsage.determineWarningDisplay({ debtCeiling: debtCeilingUsage }),
    wrappedTokenConfig: wrappedTokenReserves.find(
      (r) => r.tokenOut.underlyingAsset === params.underlyingAsset
    ),
  };

  return canSupplyAsWrappedToken ? (
    <SupplyWrappedTokenModalContent {...props} />
  ) : (
    <SupplyModalContent {...props} />
  );
};

interface SupplyModalContentProps extends ModalWrapperProps {
  addTokenProps: ERC20TokenType;
  collateralType: CollateralType;
  isolationModeWarning: React.ReactNode;
  supplyCapWarning: React.ReactNode;
  debtCeilingWarning: React.ReactNode;
  wrappedTokenConfig?: WrappedTokenConfig;
  user: ExtendedFormattedUser;
}

export const SupplyModalContent = React.memo(
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
  }: SupplyModalContentProps) => {
    const { marketReferencePriceInUsd } = useAppDataContext();
    const { currentMarketData, currentNetworkConfig } = useProtocolDataContext();
    const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
    const minRemainingBaseTokenBalance = useRootStore(
      (state) => state.poolComputed.minRemainingBaseTokenBalance
    );

    // states
    const [amount, setAmount] = useState('');
    const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

    const walletBalance = supplyUnWrapped ? nativeBalance : tokenBalance;

    const supplyApy = poolReserve.supplyAPY;
    const { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt } =
      poolReserve;

    // Calculate max amount to supply
    const maxAmountToSupply = getMaxAmountAvailableToSupply(
      walletBalance,
      { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt },
      underlyingAsset,
      minRemainingBaseTokenBalance
    );

    const handleChange = (value: string) => {
      if (value === '-1') {
        setAmount(maxAmountToSupply);
      } else {
        const decimalTruncatedValue = roundToTokenDecimals(value, poolReserve.decimals);
        setAmount(decimalTruncatedValue);
      }
    };

    const amountInEth = new BigNumber(amount).multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency
    );

    const amountInUsd = amountInEth
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);

    const isMaxSelected = amount === maxAmountToSupply;

    const healfthFactorAfterSupply = calculateHFAfterSupply(user, poolReserve, amountInEth);

    const supplyActionsProps = {
      amountToSupply: amount,
      isWrongNetwork,
      poolAddress: supplyUnWrapped ? API_ETH_MOCK_ADDRESS : poolReserve.underlyingAsset,
      symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
      blocked: false,
      decimals: poolReserve.decimals,
      isWrappedBaseAsset: poolReserve.isWrappedBaseAsset,
    };

    if (supplyTxState.success)
      return (
        <TxSuccessView
          action={<Trans>Supplied</Trans>}
          amount={amount}
          symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
          addToken={addTokenProps}
        />
      );

    return (
      <>
        {isolationModeWarning}
        {supplyCapWarning}
        {debtCeilingWarning}
        {poolReserve.symbol === 'AMPL' && (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="warning">
            <AMPLWarning />
          </Warning>
        )}
        {process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true' &&
          poolReserve.symbol === 'AAVE' &&
          isFeatureEnabled.staking(currentMarketData) && <AAVEWarning />}
        {poolReserve.symbol === 'SNX' && maxAmountToSupply !== '0' && <SNXWarning />}

        <AssetInput
          value={amount}
          onChange={handleChange}
          usdValue={amountInUsd.toString(10)}
          symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
          assets={[
            {
              balance: maxAmountToSupply,
              symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
              iconSymbol: supplyUnWrapped
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
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
              asset: poolReserve.underlyingAsset,
              assetName: poolReserve.name,
            },
          }}
        />

        <TxModalDetails gasLimit={gasLimit} skipLoad={true} disabled={Number(amount) === 0}>
          <DetailsNumberLine description={<Trans>Supply APY</Trans>} value={supplyApy} percent />
          <DetailsIncentivesLine
            incentives={poolReserve.aIncentivesData}
            symbol={poolReserve.symbol}
          />
          <DetailsCollateralLine collateralType={collateralType} />
          <DetailsHFLine
            visibleHfChange={!!amount}
            healthFactor={user ? user.healthFactor : '-1'}
            futureHealthFactor={healfthFactorAfterSupply.toString()}
          />
        </TxModalDetails>

        {txError && <GasEstimationError txError={txError} />}

        <SupplyActions {...supplyActionsProps} />
      </>
    );
  }
);

export const SupplyWrappedTokenModalContent = ({
  poolReserve,
  wrappedTokenConfig,
  isolationModeWarning,
  supplyCapWarning,
  debtCeilingWarning,
  addTokenProps,
  collateralType,
  isWrongNetwork,
  user,
}: SupplyModalContentProps) => {
  const { marketReferencePriceInUsd } = useAppDataContext();
  const { currentMarketData } = useProtocolDataContext();
  const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
  const { walletBalances } = useWalletBalances(currentMarketData);
  const minRemainingBaseTokenBalance = useRootStore(
    (state) => state.poolComputed.minRemainingBaseTokenBalance
  );

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
    poolReserve.decimals,
    wrappedTokenConfig.tokenWrapperAddress
  );

  useEffect(() => {
    if (!exchangeRate) return;
    const convertedAmount = valueToBigNumber(tokenInBalance).multipliedBy(exchangeRate).toString();
    setConvertedTokenInAmount(convertedAmount);
  }, [exchangeRate, tokenInBalance]);

  const { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt } =
    poolReserve;

  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    tokenOutBalance,
    { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt },
    poolReserve.underlyingAsset,
    minRemainingBaseTokenBalance
  );

  const tokenOutRemainingSupplyCap = remainingCap(
    poolReserve.supplyCap,
    poolReserve.totalLiquidity
  );

  let maxAmountOfTokenInToSupply = tokenInBalance;
  if (BigNumber(convertedTokenInAmount).isGreaterThan(tokenOutRemainingSupplyCap)) {
    maxAmountOfTokenInToSupply = BigNumber(tokenOutRemainingSupplyCap)
      .dividedBy(exchangeRate || '0')
      .toString();

    maxAmountOfTokenInToSupply = roundToTokenDecimals(
      maxAmountOfTokenInToSupply,
      poolReserve.decimals
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
        setAmount(maxAmountToSupply);
      }
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(value, poolReserve.decimals);
      setAmount(decimalTruncatedValue);
    }
  };

  const amountInEth = new BigNumber(amount).multipliedBy(
    supplyingWrappedToken
      ? wrappedTokenConfig.tokenIn.formattedPriceInMarketReferenceCurrency
      : poolReserve.formattedPriceInMarketReferenceCurrency
  );

  const amountInUsd = amountInEth.multipliedBy(marketReferencePriceInUsd).shiftedBy(-USD_DECIMALS);

  const isMaxSelected = amount === maxAmountToSupply;

  const healfthFactorAfterSupply = calculateHFAfterSupply(user, poolReserve, amountInEth);

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
        symbol={poolReserve.symbol}
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
            asset: poolReserve.underlyingAsset,
            assetName: poolReserve.name,
          },
        }}
        exchangeRateComponent={
          supplyingWrappedToken && (
            <ExchangeRate
              supplyAmount={amount}
              decimals={poolReserve.decimals}
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
          value={poolReserve.supplyAPY}
          percent
        />
        <DetailsIncentivesLine
          incentives={poolReserve.aIncentivesData}
          symbol={poolReserve.symbol}
        />
        <DetailsCollateralLine collateralType={collateralType} />
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={healfthFactorAfterSupply.toString()}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {supplyingWrappedToken ? (
        <SupplyWrappedTokenActions
          tokenWrapperAddress={wrappedTokenConfig.tokenWrapperAddress}
          tokenIn={wrappedTokenConfig.tokenIn.underlyingAsset}
          amountToSupply={amount}
          decimals={18}
          symbol={wrappedTokenConfig.tokenIn.symbol}
          isWrongNetwork={isWrongNetwork}
        />
      ) : (
        <SupplyActions
          isWrongNetwork={isWrongNetwork}
          amountToSupply={amount}
          poolAddress={poolReserve.underlyingAsset}
          symbol={poolReserve.symbol}
          blocked={false}
          decimals={poolReserve.decimals}
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
