import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useRef, useState } from 'react';
import { CollateralType } from 'src/helpers/types';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsCollateralLine,
  DetailsHFLine,
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { AAVEWarning } from '../Warnings/AAVEWarning';
import { AMPLWarning } from '../Warnings/AMPLWarning';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { SNXWarning } from '../Warnings/SNXWarning';
import { SupplyCapWarning } from '../Warnings/SupplyCapWarning';
import { SupplyActions } from './SupplyActions';

export type SupplyProps = {
  underlyingAsset: string;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  CAP_REACHED,
}

export const SupplyModalContent = ({ underlyingAsset }: SupplyProps) => {
  const { walletBalances } = useWalletBalances();
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  const { currentChainId, currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const { mainTxState: supplyTxState, gasLimit } = useModalContext();

  // states
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();
  const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

  const poolReserve = reserves.find((reserve) => {
    if (supplyUnWrapped) {
      return reserve.isWrappedBaseAsset;
    }
    return reserve.underlyingAsset === underlyingAsset;
  }) as ComputedReserveData;

  const userReserve = user.userReservesData.find((userReserve) => {
    if (supplyUnWrapped) {
      return poolReserve.underlyingAsset === userReserve.underlyingAsset;
    }
    return underlyingAsset === userReserve.underlyingAsset;
  }) as ComputedUserReserve;

  const walletBalance = walletBalances[underlyingAsset]?.amount;

  const supplyApy = poolReserve.supplyAPY;

  // Calculate max amount to supply
  const maxAmountToSupply = getMaxAmountAvailableToSupply(
    walletBalance,
    poolReserve,
    underlyingAsset
  );

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToSupply.toString() : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToSupply.toString() : value;
    setAmount(value);
  };

  // Calculation of future HF
  const amountIntEth = new BigNumber(amount).multipliedBy(
    poolReserve.formattedPriceInMarketReferenceCurrency
  );
  // TODO: is it correct to ut to -1 if user doesnt exist?
  const amountInUsd = amountIntEth.multipliedBy(marketReferencePriceInUsd).shiftedBy(-USD_DECIMALS);
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
  // supply cap warning
  const percentageOfCap = valueToBigNumber(poolReserve.totalLiquidity)
    .dividedBy(poolReserve.supplyCap)
    .toNumber();
  const showSupplyCapWarning: boolean =
    poolReserve.supplyCap !== '0' && percentageOfCap >= 0.99 && percentageOfCap < 1;

  // isolation warning
  const hasDifferentCollateral = user.userReservesData.find(
    (reserve) => reserve.usageAsCollateralEnabledOnUser && reserve.reserve.id !== poolReserve.id
  );
  const showIsolationWarning: boolean =
    !user.isInIsolationMode &&
    poolReserve.isIsolated &&
    !hasDifferentCollateral &&
    (userReserve?.underlyingBalance !== '0' ? userReserve?.usageAsCollateralEnabledOnUser : true);

  // TODO: check if calc is correct to see if cap reached
  const capReached =
    poolReserve.supplyCap !== '0' &&
    valueToBigNumber(amount).gt(
      new BigNumber(poolReserve.supplyCap).minus(poolReserve.totalLiquidity)
    );

  // error handler
  let blockingError: ErrorType | undefined = undefined;
  if (!supplyTxState.success) {
    if (valueToBigNumber(amount).gt(walletBalance)) {
      blockingError = ErrorType.NOT_ENOUGH_BALANCE;
    } else if (capReached) {
      blockingError = ErrorType.CAP_REACHED;
    }
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough balance on your wallet</Trans>;
      case ErrorType.CAP_REACHED:
        return <Trans>Cap reached. Lower supply amount</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: poolReserve.aTokenAddress,
    symbol: poolReserve.iconSymbol,
    decimals: poolReserve.decimals,
    aToken: true,
    aTokenPrefix: currentMarketData.aTokenPrefix,
  };

  // collateralization state
  let willBeUsedAsCollateral: CollateralType = poolReserve.usageAsCollateralEnabled
    ? CollateralType.ENABLED
    : CollateralType.DISABLED;
  const userHasSuppliedReserve = userReserve?.scaledATokenBalance !== '0';
  const userHasCollateral = user.totalCollateralUSD !== '0';

  if (poolReserve.isIsolated) {
    if (user.isInIsolationMode) {
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

  if (supplyTxState.txError) return <TxErrorView errorMessage={supplyTxState.txError} />;
  if (supplyTxState.success)
    return (
      <TxSuccessView
        action="Supplied"
        amount={amountRef.current}
        symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
        addToken={addToken}
      />
    );

  return (
    <>
      <TxModalTitle title="Supply" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={currentNetworkConfig.name} chainId={currentChainId} />
      )}

      {showIsolationWarning && <IsolationModeWarning />}
      {showSupplyCapWarning && <SupplyCapWarning />}
      {poolReserve.symbol === 'AMPL' && <AMPLWarning />}
      {poolReserve.symbol === 'AAVE' && isFeatureEnabled.staking(currentMarketData) && (
        <AAVEWarning />
      )}
      {poolReserve.symbol === 'SNX' && !maxAmountToSupply.eq('0') && <SNXWarning />}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={amountInUsd.toString()}
        symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
        assets={[
          {
            balance: maxAmountToSupply.toString(),
            symbol: supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol,
          },
        ]}
        capType={CapType.supplyCap}
        isMaxSelected={isMaxSelected}
        disabled={supplyTxState.loading}
        maxValue={maxAmountToSupply.toString()}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine description={<Trans>Supply APY</Trans>} value={supplyApy} />
        <DetailsIncentivesLine
          incentives={poolReserve.aIncentivesData}
          symbol={poolReserve.symbol}
        />
        <DetailsCollateralLine collateralType={willBeUsedAsCollateral} />
        <DetailsHFLine
          healthFactor={user ? user.healthFactor : '-1'}
          futureHealthFactor={healthFactorAfterDeposit.toString()}
        />
      </TxModalDetails>

      {supplyTxState.gasEstimationError && (
        <GasEstimationError error={supplyTxState.gasEstimationError} />
      )}

      <SupplyActions
        poolReserve={poolReserve}
        amountToSupply={amount}
        isWrongNetwork={isWrongNetwork}
        poolAddress={supplyUnWrapped ? underlyingAsset : poolReserve.underlyingAsset}
        symbol={supplyUnWrapped ? currentNetworkConfig.baseAssetSymbol : poolReserve.symbol}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
