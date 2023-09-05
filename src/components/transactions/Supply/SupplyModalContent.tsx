import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Skeleton, Stack, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useMemo, useState } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { AMPLWarning } from 'src/components/Warnings/AMPLWarning';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { wrappedTokenConfig } from 'src/ui-config/wrappedTokenConfig';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { roundToTokenDecimals } from 'src/utils/utils';

import { useAppDataContext } from '../../../hooks/app-data-provider/useAppDataProvider';
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
import { useSavingsDaiWrapper } from './useSavingsDaiWrapper';

interface SupplyAsset extends Asset {
  balance: string;
}

export enum ErrorType {
  CAP_REACHED,
}

export const SupplyModalContent = React.memo(
  ({
    underlyingAsset,
    poolReserve,
    userReserve,
    isWrongNetwork,
    nativeBalance,
    tokenBalance,
  }: ModalWrapperProps) => {
    const { marketReferencePriceInUsd, user } = useAppDataContext();
    const { currentMarketData, currentNetworkConfig } = useProtocolDataContext();
    const { mainTxState: supplyTxState, gasLimit, txError } = useModalContext();
    const { supplyCap: supplyCapUsage, debtCeiling: debtCeilingUsage } = useAssetCaps();
    const minRemainingBaseTokenBalance = useRootStore(
      (state) => state.poolComputed.minRemainingBaseTokenBalance
    );

    // states
    const [tokenToSupply, setTokenToSupply] = useState<SupplyAsset>({
      address: poolReserve.underlyingAsset,
      symbol: poolReserve.symbol,
      iconSymbol: poolReserve.iconSymbol,
      balance: tokenBalance,
    });
    const [amount, setAmount] = useState('');
    const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

    const walletBalance = supplyUnWrapped ? nativeBalance : tokenBalance;

    const supplyApy = poolReserve.supplyAPY;
    const { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt } =
      poolReserve;

    // Calculate max amount to supply
    const maxAmountToSupply = useMemo(
      () =>
        getMaxAmountAvailableToSupply(
          walletBalance,
          { supplyCap, totalLiquidity, isFrozen, decimals, debtCeiling, isolationModeTotalDebt },
          underlyingAsset,
          minRemainingBaseTokenBalance
        ),
      [
        walletBalance,
        supplyCap,
        totalLiquidity,
        isFrozen,
        decimals,
        debtCeiling,
        isolationModeTotalDebt,
        underlyingAsset,
        minRemainingBaseTokenBalance,
      ]
    );

    const handleChange = (value: string) => {
      if (value === '-1') {
        setAmount(maxAmountToSupply);
      } else {
        const decimalTruncatedValue = roundToTokenDecimals(value, poolReserve.decimals);
        setAmount(decimalTruncatedValue);
      }
    };

    // Calculation of future HF
    const amountIntEth = new BigNumber(amount).multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency
    );
    // TODO: is it correct to ut to -1 if user doesnt exist?
    const amountInUsd = amountIntEth
      .multipliedBy(marketReferencePriceInUsd)
      .shiftedBy(-USD_DECIMALS);
    const totalCollateralMarketReferenceCurrencyAfter = user
      ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).plus(amountIntEth)
      : '-1';

    const liquidationThresholdAfter = user
      ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency)
          .multipliedBy(user.currentLiquidationThreshold)
          .plus(amountIntEth.multipliedBy(poolReserve.formattedReserveLiquidationThreshold))
          .dividedBy(totalCollateralMarketReferenceCurrencyAfter)
      : '-1';

    const isMaxSelected = amount === maxAmountToSupply;

    let healthFactorAfterDeposit = user ? valueToBigNumber(user.healthFactor) : '-1';

    if (
      user &&
      ((!user.isInIsolationMode && !poolReserve.isIsolated) ||
        (user.isInIsolationMode &&
          user.isolatedReserve?.underlyingAsset === poolReserve.underlyingAsset))
    ) {
      healthFactorAfterDeposit = calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency: totalCollateralMarketReferenceCurrencyAfter,
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(
          user.totalBorrowsMarketReferenceCurrency
        ),
        currentLiquidationThreshold: liquidationThresholdAfter,
      });
    }

    // ************** Warnings **********
    // isolation warning
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

    // token info to add to wallet
    const addToken: ERC20TokenType = {
      address: poolReserve.aTokenAddress,
      symbol: poolReserve.iconSymbol,
      decimals: poolReserve.decimals,
      aToken: true,
    };

    // collateralization state
    const collateralType = getAssetCollateralType(
      userReserve,
      user.totalCollateralUSD,
      user.isInIsolationMode,
      debtCeilingUsage.isMaxed
    );

    const supplyActionsProps = {
      amountToSupply: amount,
      isWrongNetwork,
      poolAddress: supplyUnWrapped ? API_ETH_MOCK_ADDRESS : poolReserve.underlyingAsset,
      symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
      blocked: false,
      decimals: poolReserve.decimals,
    };

    if (supplyTxState.success)
      return (
        <TxSuccessView
          action={<Trans>Supplied</Trans>}
          amount={amount}
          symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
          addToken={addToken}
        />
      );

    const assets = [
      {
        balance: maxAmountToSupply,
        symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
        iconSymbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.iconSymbol,
      },
    ];

    const wrappedTokenInConfig =
      wrappedTokenConfig[currentMarketData.chainId][poolReserve.underlyingAsset];
    if (wrappedTokenInConfig) {
      assets.push({
        balance: maxAmountToSupply,
        symbol: 'DAI', // TODO
        iconSymbol: 'DAI', // TODO
      });
    }

    const supplyingWrappedToken = tokenToSupply.address === wrappedTokenInConfig;

    return (
      <>
        {showIsolationWarning && <IsolationModeWarning asset={poolReserve.symbol} />}
        {supplyCapUsage.determineWarningDisplay({ supplyCap: supplyCapUsage })}
        {debtCeilingUsage.determineWarningDisplay({ debtCeiling: debtCeilingUsage })}
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
          symbol={tokenToSupply.symbol}
          assets={assets}
          onSelect={setTokenToSupply}
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
          exchangeRateComponent={
            poolReserve.symbol === 'sDAI' &&
            tokenToSupply.symbol === 'DAI' && <ExchangeRate supplyAmount={amount} />
          }
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
            futureHealthFactor={healthFactorAfterDeposit.toString(10)}
          />
        </TxModalDetails>

        {txError && <GasEstimationError txError={txError} />}

        {supplyingWrappedToken ? (
          <SupplyWrappedTokenActions
            tokenIn={wrappedTokenInConfig}
            amountToSupply={amount}
            decimals={18}
            symbol="DAI"
          />
        ) : (
          <SupplyActions {...supplyActionsProps} />
        )}
      </>
    );
  }
);

const ExchangeRate = ({ supplyAmount }: { supplyAmount: string }) => {
  const { loading, tokenOutAmount } = useSavingsDaiWrapper({ supplyAmount, decimals: 18 });

  console.log('tokenOutAmount', tokenOutAmount);

  return (
    <ContentWithTooltip tooltipContent={ExchangeRateTooltip}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="caption">Supply amount</Typography>
        <TokenIcon sx={{ fontSize: '16px' }} symbol="sdai" />
        {loading ? (
          <Skeleton variant="rectangular" width={80} height={14} />
        ) : (
          <>
            <FormattedNumber
              value={tokenOutAmount}
              variant="subheader2"
              color="text.primary"
              visibleDecimals={2}
            />
            <Typography variant="subheader2" color="text.secondary">
              sDAI
            </Typography>
          </>
        )}
      </Stack>
    </ContentWithTooltip>
  );
};
const ExchangeRateTooltip = (
  <>
    <Trans>
      DAI balance will be converted via DSR contracts and then supplied as sDAI to Aave reserve.
      Switching incurs no additional costs and no slippage.
    </Trans>{' '}
    <Link
      href="https://docs.aave.com/faq/aave-v3-features#how-does-isolation-mode-affect-my-borrowing-power"
      underline="always"
    >
      <Trans>Learn more</Trans>
    </Link>
  </>
);
