import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useMemo, useRef, useState } from 'react';
import { Warning } from 'src/components/primitives/Warning';
import { AMPLWarning } from 'src/components/Warnings/AMPLWarning';
import { CollateralType } from 'src/helpers/types';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';
import { useRootStore } from 'src/store/root';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { useAppDataContext } from '../../../hooks/app-data-provider/useAppDataProvider';
import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
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
import { AAVEWarning } from '../Warnings/AAVEWarning';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { SNXWarning } from '../Warnings/SNXWarning';
import { SupplyActions } from './SupplyActions';

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
    const { supplyCap, debtCeiling } = useAssetCaps();
    const {
      poolComputed: { minRemainingBaseTokenBalance },
    } = useRootStore();

    // states
    const [_amount, setAmount] = useState('');
    const amountRef = useRef<string>();
    const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

    const walletBalance = supplyUnWrapped ? nativeBalance : tokenBalance;

    const supplyApy = poolReserve.supplyAPY;

    // Calculate max amount to supply
    const maxAmountToSupply = getMaxAmountAvailableToSupply(
      walletBalance,
      poolReserve,
      underlyingAsset,
      minRemainingBaseTokenBalance
    );
    const isMaxSelected = _amount === '-1';
    const amount = isMaxSelected ? maxAmountToSupply.toString(10) : _amount;

    const handleChange = (value: string) => {
      const maxSelected = value === '-1';
      amountRef.current = maxSelected ? maxAmountToSupply.toString(10) : value;
      setAmount(value);
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

    // TODO: check if calc is correct to see if cap reached
    const capReached =
      poolReserve.supplyCap !== '0' &&
      valueToBigNumber(amount).gt(
        new BigNumber(poolReserve.supplyCap).minus(poolReserve.totalLiquidity)
      );

    // handle error for supply cap reached
    let blockingError: ErrorType | undefined = undefined;
    if (!supplyTxState.success) {
      if (capReached) {
        blockingError = ErrorType.CAP_REACHED;
      }
    }
    const handleBlocked = () => {
      switch (blockingError) {
        case ErrorType.CAP_REACHED:
          return <Trans>Cap reached. Lower supply amount</Trans>;
        default:
          return null;
      }
    };

    // token info to add to wallet
    const addToken: ERC20TokenType = {
      address: poolReserve.aTokenAddress,
      symbol: poolReserve.iconSymbol,
      decimals: poolReserve.decimals,
      aToken: true,
    };

    // collateralization state
    let willBeUsedAsCollateral: CollateralType = CollateralType.ENABLED;
    const userHasSuppliedReserve = userReserve && userReserve.scaledATokenBalance !== '0';
    const userHasCollateral = user.totalCollateralUSD !== '0';

    if (!poolReserve.usageAsCollateralEnabled) {
      willBeUsedAsCollateral = CollateralType.DISABLED;
    } else if (poolReserve.isIsolated) {
      // Note: is debt ceiling only used for isolated assets?
      if (debtCeiling.isMaxed) {
        willBeUsedAsCollateral = CollateralType.UNAVAILABLE;
      } else if (user.isInIsolationMode) {
        if (userHasSuppliedReserve) {
          willBeUsedAsCollateral = userReserve.usageAsCollateralEnabledOnUser
            ? CollateralType.ISOLATED_ENABLED
            : CollateralType.ISOLATED_DISABLED;
        } else {
          if (userHasCollateral) {
            willBeUsedAsCollateral = CollateralType.ISOLATED_DISABLED;
          }
        }
      } else {
        if (userHasCollateral) {
          willBeUsedAsCollateral = CollateralType.ISOLATED_DISABLED;
        } else {
          willBeUsedAsCollateral = CollateralType.ISOLATED_ENABLED;
        }
      }
    } else {
      if (user.isInIsolationMode) {
        willBeUsedAsCollateral = CollateralType.DISABLED;
      } else {
        if (userHasSuppliedReserve) {
          willBeUsedAsCollateral = userReserve.usageAsCollateralEnabledOnUser
            ? CollateralType.ENABLED
            : CollateralType.DISABLED;
        } else {
          willBeUsedAsCollateral = CollateralType.ENABLED;
        }
      }
    }

    const supplyActionsProps = useMemo(() => {
      return {
        amountToSupply: amount,
        isWrongNetwork,
        poolAddress: supplyUnWrapped ? API_ETH_MOCK_ADDRESS : poolReserve.underlyingAsset,
        symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
        blocked: blockingError !== undefined,
      };
    }, [
      amount,
      isWrongNetwork,
      supplyUnWrapped,
      poolReserve.underlyingAsset,
      poolReserve.symbol,
      currentNetworkConfig.baseAssetSymbol,
      blockingError,
    ]);

    if (supplyTxState.success)
      return (
        <TxSuccessView
          action={<Trans>Supplied</Trans>}
          amount={amountRef.current}
          symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
          addToken={addToken}
        />
      );

    return (
      <>
        {showIsolationWarning && <IsolationModeWarning asset={poolReserve.symbol} />}
        {supplyCap.determineWarningDisplay({ supplyCap })}
        {debtCeiling.determineWarningDisplay({ debtCeiling })}
        {poolReserve.symbol === 'AMPL' && (
          <Warning sx={{ mt: '16px', mb: '40px' }} severity="warning">
            <AMPLWarning />
          </Warning>
        )}
        {process.env.NEXT_PUBLIC_ENABLE_STAKING === 'true' &&
          poolReserve.symbol === 'AAVE' &&
          isFeatureEnabled.staking(currentMarketData) && <AAVEWarning />}
        {poolReserve.symbol === 'SNX' && !maxAmountToSupply.eq('0') && <SNXWarning />}

        <AssetInput
          value={amount}
          onChange={handleChange}
          usdValue={amountInUsd.toString(10)}
          symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
          assets={[
            {
              balance: maxAmountToSupply.toString(10),
              symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
              iconSymbol: supplyUnWrapped
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
            },
          ]}
          capType={CapType.supplyCap}
          isMaxSelected={isMaxSelected}
          disabled={supplyTxState.loading}
          maxValue={maxAmountToSupply.toString(10)}
          balanceText={<Trans>Wallet balance</Trans>}
        />

        {blockingError !== undefined && (
          <Typography variant="helperText" color="error.main">
            {handleBlocked()}
          </Typography>
        )}

        <TxModalDetails gasLimit={gasLimit}>
          <DetailsNumberLine description={<Trans>Supply APY</Trans>} value={supplyApy} percent />
          <DetailsIncentivesLine
            incentives={poolReserve.aIncentivesData}
            symbol={poolReserve.symbol}
          />
          <DetailsCollateralLine collateralType={willBeUsedAsCollateral} />
          <DetailsHFLine
            visibleHfChange={!!_amount}
            healthFactor={user ? user.healthFactor : '-1'}
            futureHealthFactor={healthFactorAfterDeposit.toString(10)}
          />
        </TxModalDetails>

        {txError && <GasEstimationError txError={txError} />}

        <SupplyActions {...supplyActionsProps} />
      </>
    );
  }
);
