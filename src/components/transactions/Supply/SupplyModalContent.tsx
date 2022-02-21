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
import React, { useEffect, useState } from 'react';
import { CollateralType, TxState } from 'src/helpers/types';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3ContextProvider';
import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
import { getNetworkConfig, isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import {
  ComputedReserveData,
  useAppDataContext,
} from '../../../hooks/app-data-provider/useAppDataProvider';
import { CapType } from '../../caps/helper';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
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
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  CAP_REACHED,
}

export const SupplyModalContent = ({ underlyingAsset, handleClose }: SupplyProps) => {
  const { walletBalances } = useWalletBalances();
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  const { currentChainId, currentMarketData } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [supplyTxState, setSupplyTxState] = useState<TxState>({ success: false });
  const [amount, setAmount] = useState('');
  const [amountToSupply, setAmountToSupply] = useState(amount);
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();
  const [maxAmount, setMaxAmount] = useState('0');
  const [isMax, setIsMax] = useState(false);

  const supplyUnWrapped = underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase();

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find((reserve) => {
    if (supplyUnWrapped) {
      return reserve.symbol === networkConfig.wrappedBaseAssetSymbol;
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

  useEffect(() => {
    if (amount === '-1') {
      setAmountToSupply(maxAmountToSupply.toString());
      setIsMax(true);
    } else {
      setAmountToSupply(amount);
      setIsMax(false);
    }
  }, [amount, maxAmountToSupply]);

  useEffect(() => {
    if (isMax) {
      setMaxAmount(maxAmountToSupply.toString());
    }
  }, [isMax]);

  // Calculation of future HF
  const amountIntEth = new BigNumber(amountToSupply).multipliedBy(
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
    valueToBigNumber(amountToSupply).gt(
      new BigNumber(poolReserve.supplyCap).minus(poolReserve.totalLiquidity)
    );

  // error handler
  useEffect(() => {
    if (valueToBigNumber(amountToSupply).gt(walletBalance)) {
      setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
    } else if (capReached) {
      setBlockingError(ErrorType.CAP_REACHED);
    } else {
      setBlockingError(undefined);
    }
  }, [walletBalance, amountToSupply, capReached]);

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

  const showHealthFactor =
    user &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // token info to add to wallet
  const addToken: ERC20TokenType = {
    address: poolReserve.aTokenAddress,
    symbol: poolReserve.symbol,
    decimals: poolReserve.decimals,
    aToken: true,
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

  return (
    <>
      {!supplyTxState.txError && !supplyTxState.success && (
        <>
          <TxModalTitle title="Supply" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}

          {showIsolationWarning && <IsolationModeWarning />}
          {showSupplyCapWarning && <SupplyCapWarning />}
          {poolReserve.symbol === 'AMPL' && <AMPLWarning />}
          {poolReserve.symbol === 'AAVE' && isFeatureEnabled.staking(currentMarketData) && (
            <AAVEWarning />
          )}
          {poolReserve.symbol === 'SNX' && !maxAmountToSupply.eq('0') && <SNXWarning />}

          <AssetInput
            value={isMax ? maxAmount : amountToSupply}
            onChange={setAmount}
            usdValue={amountInUsd.toString()}
            symbol={supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol}
            assets={[
              {
                balance: maxAmountToSupply.toString(),
                symbol: supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol,
              },
            ]}
            capType={CapType.supplyCap}
          />

          {blockingError !== undefined && (
            <Typography variant="helperText" color="error.main">
              {handleBlocked()}
            </Typography>
          )}

          <TxModalDetails
            apy={supplyApy}
            incentives={poolReserve.aIncentivesData}
            showHf={showHealthFactor || false}
            healthFactor={user ? user.healthFactor : '-1'}
            futureHealthFactor={healthFactorAfterDeposit.toString()}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            // TODO: need take a look usedAsCollateral
            usedAsCollateral={willBeUsedAsCollateral}
            action="Supply"
          />
        </>
      )}

      {supplyTxState.txError && <TxErrorView errorMessage={supplyTxState.txError} />}
      {supplyTxState.success && !supplyTxState.txError && (
        <TxSuccessView
          action="Supplied"
          amount={isMax ? maxAmount : amountToSupply}
          symbol={poolReserve.symbol}
          addToken={addToken}
        />
      )}
      {supplyTxState.gasEstimationError && (
        <GasEstimationError error={supplyTxState.gasEstimationError} />
      )}

      <SupplyActions
        setSupplyTxState={setSupplyTxState}
        poolReserve={poolReserve}
        amountToSupply={amountToSupply}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        setGasLimit={setGasLimit}
        poolAddress={supplyUnWrapped ? underlyingAsset : poolReserve.underlyingAsset}
        symbol={supplyUnWrapped ? networkConfig.baseAssetSymbol : poolReserve.symbol}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
