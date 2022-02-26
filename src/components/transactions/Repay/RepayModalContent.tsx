import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { CheckIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useEffect, useRef, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { Asset, AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsHFLine,
  DetailsNumberLineWithSub,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { RepayActions } from './RepayActions';

export type RepayProps = {
  underlyingAsset: string;
};

export const RepayModalContent = ({ underlyingAsset }: RepayProps) => {
  const { gasLimit, mainTxState: repayTxState } = useModalContext();
  const { walletBalances } = useWalletBalances();
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  const { currentChainId, currentMarketData } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  // states
  const [repayWithCollateral, setRepayWithCollateral] = useState(false);
  const [tokenToRepayWith, setTokenToRepayWith] = useState<Asset>({
    address: poolReserve.underlyingAsset,
    symbol: poolReserve.symbol,
    iconSymbol: poolReserve.iconSymbol,
    balance: walletBalances[poolReserve.underlyingAsset]?.amount,
  });
  const [assets, setAssets] = useState<Asset[]>([tokenToRepayWith]);
  const [repayMax, setRepayMax] = useState('');
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

  const userReserve = user?.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  const networkConfig = getNetworkConfig(currentChainId);

  const { underlyingBalance, usageAsCollateralEnabledOnUser, reserve } = userReserve;

  const repayWithATokens = tokenToRepayWith.address === poolReserve.aTokenAddress;

  const debtType =
    Number(userReserve.variableBorrows) > Number(userReserve.stableBorrows)
      ? InterestRate.Variable
      : InterestRate.Stable;

  const debt =
    debtType === InterestRate.Stable ? userReserve.stableBorrows : userReserve.variableBorrows;
  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  // calculate max amount abailable to repay
  let maxAmountToRepay: BigNumber;
  if (repayWithATokens) {
    maxAmountToRepay = BigNumber.min(underlyingBalance, debt);
  } else {
    const normalizedWalletBalance = valueToBigNumber(tokenToRepayWith.balance).minus(
      userReserve.reserve.symbol.toUpperCase() === networkConfig.baseAssetSymbol ? '0.004' : '0'
    );
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt);
  }

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToRepay.toString() : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToRepay.toString() : value;
    setAmount(value);
    if (currentMarketData.v3 && maxSelected && (repayWithATokens || maxAmountToRepay.eq(debt))) {
      setRepayMax('-1');
    } else {
      setRepayMax(BigNumber.min(safeAmountToRepayAll, maxAmountToRepay).toString());
    }
  };

  // token info
  useEffect(() => {
    const repayTokens: Asset[] = [];
    // set possible repay tokens
    if (!repayWithCollateral) {
      // if wrapped reserve push both wrapped / native
      if (poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol) {
        // we substract a bit so user can still pay for the tx
        const nativeTokenWalletBalance = valueToBigNumber(
          walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount
        ).minus('0.004');
        const maxNativeToken = BigNumber.max(
          nativeTokenWalletBalance,
          BigNumber.min(nativeTokenWalletBalance, debt)
        );
        repayTokens.push({
          address: API_ETH_MOCK_ADDRESS.toLowerCase(),
          symbol: networkConfig.baseAssetSymbol,
          balance: maxNativeToken.toString(),
        });
      }
      // push reserve asset
      const walletBalance = walletBalances[underlyingAsset]?.amount;
      const minReserveTokenRepay = BigNumber.min(valueToBigNumber(walletBalance), debt);
      const maxReserveTokenForRepay = BigNumber.max(minReserveTokenRepay, walletBalance);
      repayTokens.push({
        address: poolReserve.underlyingAsset,
        symbol: poolReserve.symbol,
        balance: maxReserveTokenForRepay.toString(),
      });
      // push reserve atoken
      if (currentMarketData.v3) {
        const aTokenBalance = valueToBigNumber(underlyingBalance);
        const maxBalance = BigNumber.max(
          aTokenBalance,
          BigNumber.min(aTokenBalance, debt).toString()
        );
        repayTokens.push({
          address: poolReserve.aTokenAddress,
          symbol: `${currentMarketData.aTokenPrefix.toLowerCase()}${poolReserve.symbol}`,
          iconSymbol: poolReserve.iconSymbol,
          aToken: true,
          balance: maxBalance.toString(),
        });
      }
    } else {
      // TODO: add collateral tokens
      // go through all collateral tokens and add them
    }
    setAssets(repayTokens);
    setTokenToRepayWith(repayTokens[0]);
  }, []);

  // debt remaining after repay
  const amountAfterRepay = valueToBigNumber(debt)
    .minus(amount || '0')
    .toString();
  const displayAmountAfterRepay = BigNumber.min(amountAfterRepay, maxAmountToRepay);
  const displayAmountAfterRepayInUsd = displayAmountAfterRepay
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  // health factor calculations
  // we use usd values instead of MarketreferenceCurrency so it has same precision
  const newHF = amount
    ? calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency:
          repayWithATokens && usageAsCollateralEnabledOnUser
            ? valueToBigNumber(user?.totalCollateralUSD || '0').minus(
                valueToBigNumber(reserve.priceInUSD).multipliedBy(amount)
              )
            : user?.totalCollateralUSD || '0',
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(user?.totalBorrowsUSD || '0').minus(
          valueToBigNumber(reserve.priceInUSD).multipliedBy(amount)
        ),
        currentLiquidationThreshold: user?.currentLiquidationThreshold || '0',
      }).toString()
    : user?.healthFactor;

  // TODO: add here repay with collateral calculations and maybe do a conditional with other????

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(reserve.priceInUSD);

  if (repayTxState.txError) return <TxErrorView errorMessage={repayTxState.txError} />;
  if (repayTxState.success)
    return (
      <TxSuccessView action="repayed" amount={amountRef.current} symbol={tokenToRepayWith.symbol} />
    );

  return (
    <>
      <TxModalTitle title="Repay" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {currentMarketData.enabledFeatures?.collateralRepay && (
        <Box sx={{ mb: 6 }}>
          <Typography mb={1} color="text.secondary">
            <Trans>Repay with</Trans>
          </Typography>

          <ToggleButtonGroup
            color="primary"
            value={repayWithCollateral}
            exclusive
            onChange={(_, value) => setRepayWithCollateral(value)}
            sx={{ width: '100%' }}
          >
            <ToggleButton value={repayWithCollateral} disabled={repayWithCollateral}>
              {!repayWithCollateral && (
                <SvgIcon sx={{ fontSize: '20px', mr: '2.5px' }}>
                  <CheckIcon />
                </SvgIcon>
              )}
              <Typography variant="subheader1" sx={{ mr: 1 }}>
                <Trans>Wallet balance</Trans>
              </Typography>
            </ToggleButton>

            <ToggleButton value={!repayWithCollateral} disabled={!repayWithCollateral}>
              {repayWithCollateral && (
                <SvgIcon sx={{ fontSize: '20px', mr: '2.5px' }}>
                  <CheckIcon />
                </SvgIcon>
              )}
              <Typography variant="subheader1" sx={{ mr: 1 }}>
                <Trans>Collateral</Trans>
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString()}
        symbol={tokenToRepayWith.symbol}
        assets={assets}
        onSelect={setTokenToRepayWith}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToRepay.toString()}
      />

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLineWithSub
          description={<Trans>Remaining debt</Trans>}
          amount={amountAfterRepay}
          amountUSD={displayAmountAfterRepayInUsd.toString()}
          symbol={poolReserve.iconSymbol}
        />
        <DetailsHFLine healthFactor={user?.healthFactor} futureHealthFactor={newHF?.toString()} />
      </TxModalDetails>

      {repayTxState.gasEstimationError && (
        <GasEstimationError error={repayTxState.gasEstimationError} />
      )}

      <RepayActions
        poolReserve={poolReserve}
        amountToRepay={isMaxSelected ? repayMax : amount}
        poolAddress={
          repayWithATokens ? poolReserve.underlyingAsset : tokenToRepayWith.address ?? ''
        }
        isWrongNetwork={isWrongNetwork}
        symbol={poolReserve.symbol}
        debtType={debtType}
        repayWithATokens={repayWithATokens}
      />
    </>
  );
};
