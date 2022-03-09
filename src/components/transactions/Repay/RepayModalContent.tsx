import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
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
import { RepayActions } from './RepayActions';
import { ReserveModalProps } from './RepayModal';

enum RepayType {
  BALANCE,
  COLLATERAL,
}
interface RepayAsset extends Asset {
  balance: string;
}

export const RepayModalContent = ({
  poolReserve,
  userReserve,
  symbol: modalSymbol,
  tokenBalance,
  nativeBalance,
  isWrongNetwork,
}: ReserveModalProps) => {
  const { gasLimit, mainTxState: repayTxState } = useModalContext();
  const { marketReferencePriceInUsd, user } = useAppDataContext();
  const { currentChainId, currentMarketData } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  // states
  const [repayWithCollateral, setRepayWithCollateral] = useState(RepayType.BALANCE);
  const [tokenToRepayWith, setTokenToRepayWith] = useState<RepayAsset>({
    address: poolReserve.underlyingAsset,
    symbol: poolReserve.symbol,
    iconSymbol: poolReserve.iconSymbol,
    balance: tokenBalance,
  });
  const [assets, setAssets] = useState<RepayAsset[]>([tokenToRepayWith]);
  const [repayMax, setRepayMax] = useState('');
  const [_amount, setAmount] = useState('');
  const amountRef = useRef<string>();

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
  let balance: string;
  if (repayWithATokens) {
    maxAmountToRepay = BigNumber.min(underlyingBalance, debt);
    balance = underlyingBalance;
  } else {
    const normalizedWalletBalance = valueToBigNumber(tokenToRepayWith.balance).minus(
      userReserve.reserve.symbol.toUpperCase() === networkConfig.baseAssetSymbol ? '0.004' : '0'
    );
    balance = normalizedWalletBalance.toString();
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt);
  }

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? maxAmountToRepay.toString() : _amount;

  const handleChange = (value: string) => {
    const maxSelected = value === '-1';
    amountRef.current = maxSelected ? maxAmountToRepay.toString() : value;
    setAmount(value);
    if (currentMarketData.v3 && maxSelected && (repayWithATokens || maxAmountToRepay.eq(debt))) {
      if (tokenToRepayWith.address === API_ETH_MOCK_ADDRESS.toLowerCase()) {
        setRepayMax(safeAmountToRepayAll.toString());
      } else {
        setRepayMax('-1');
      }
    } else {
      setRepayMax(
        safeAmountToRepayAll.lt(balance)
          ? safeAmountToRepayAll.toString()
          : maxAmountToRepay.toString()
      );
    }
  };

  // token info
  useEffect(() => {
    const repayTokens: RepayAsset[] = [];
    // set possible repay tokens
    if (!repayWithCollateral) {
      // if wrapped reserve push both wrapped / native
      if (poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol) {
        // we substract a bit so user can still pay for the tx
        const nativeTokenWalletBalance = valueToBigNumber(nativeBalance).minus('0.004');
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
      const walletBalance = tokenBalance;
      const minReserveTokenRepay = BigNumber.min(valueToBigNumber(walletBalance), debt);
      const maxReserveTokenForRepay = BigNumber.max(minReserveTokenRepay, walletBalance);
      repayTokens.push({
        address: poolReserve.underlyingAsset,
        symbol: poolReserve.symbol,
        iconSymbol: poolReserve.iconSymbol,
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
      repayTokens.push(
        ...user?.userReservesData
          .filter((userReserve) => userReserve.underlyingBalance !== '0')
          .map((userReserve) => ({
            address: userReserve.underlyingAsset,
            balance: userReserve.underlyingBalance,
            symbol: userReserve.reserve.symbol,
            iconSymbol: userReserve.reserve.iconSymbol,
            aToken: true,
          }))
      );
    }
    setAssets(repayTokens);
    setTokenToRepayWith(repayTokens[0]);
  }, [repayWithCollateral]);

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

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(reserve.priceInUSD);

  if (repayTxState.txError) return <TxErrorView errorMessage={repayTxState.txError} />;
  if (repayTxState.success)
    return (
      <TxSuccessView action="repayed" amount={amountRef.current} symbol={tokenToRepayWith.symbol} />
    );

  return (
    <>
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
            <ToggleButton
              value={RepayType.BALANCE}
              disabled={repayWithCollateral === RepayType.BALANCE}
            >
              <Typography variant="subheader1" sx={{ mr: 1 }}>
                <Trans>Wallet balance</Trans>
              </Typography>
            </ToggleButton>

            <ToggleButton
              value={RepayType.COLLATERAL}
              disabled={repayWithCollateral === RepayType.COLLATERAL}
            >
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
          symbol={
            poolReserve.iconSymbol === networkConfig.wrappedBaseAssetSymbol
              ? networkConfig.baseAssetSymbol
              : poolReserve.iconSymbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user?.healthFactor}
          futureHealthFactor={newHF?.toString()}
        />
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
        symbol={modalSymbol}
        debtType={debtType}
        repayWithATokens={repayWithATokens}
      />
    </>
  );
};
