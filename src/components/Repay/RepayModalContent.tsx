import {
  API_ETH_MOCK_ADDRESS,
  InterestRate,
  synthetixProxyByChainId,
} from '@aave/contract-helpers';
import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  USD_DECIMALS,
  valueToBigNumber,
} from '@aave/math-utils';
import { useEffect, useState } from 'react';
import { TxState } from 'src/helpers/types';
import {
  useAppDataContext,
  ComputedReserveData,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { Asset, AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import BigNumber from 'bignumber.js';
import { RepayActions } from './RepayActions';
import { Box, Button, Typography } from '@mui/material';
import { Trans } from '@lingui/macro';
import { CheckIcon } from '@heroicons/react/outline';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';

export type RepayProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  NOT_ENOUGH_ATOKEN_BALANCE,
}

export const RepayModalContent = ({ underlyingAsset, handleClose }: RepayProps) => {
  const { walletBalances } = useWalletBalances();
  const { marketReferencePriceInUsd, reserves, user } = useAppDataContext();
  const { currentChainId, currentMarketData, currentChainId: chainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  // states
  const [repayTxState, setRepayTxState] = useState<TxState>({ success: false });
  const [amount, setAmount] = useState('0');
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [repayWithCollateral, setRepayWithCollateral] = useState(false);
  const [tokenToRepayWith, setTokenToRepayWith] = useState<Asset>({
    address: poolReserve.underlyingAsset,
    symbol: poolReserve.symbol,
    balance: walletBalances[poolReserve.underlyingAsset]?.amount,
  });
  const [assets, setAssets] = useState<Asset[]>([tokenToRepayWith]);
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();
  const [amountToRepay, setAmountToRepay] = useState(amount);

  const userReserve = user?.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  const networkConfig = getNetworkConfig(currentChainId);

  const walletBalance = walletBalances[underlyingAsset]?.amount;
  const { underlyingBalance, usageAsCollateralEnabledOnUser, reserve } = userReserve;

  const repayWithATokens = tokenToRepayWith.address === poolReserve.aTokenAddress;

  const debtType =
    Number(userReserve.variableBorrows) > Number(userReserve.stableBorrows)
      ? InterestRate.Variable
      : InterestRate.Stable;

  const debt =
    debtType === InterestRate.Stable ? userReserve.stableBorrows : userReserve.variableBorrows;

  // token info
  useEffect(() => {
    const repayTokens: Asset[] = [];
    // set possible repay tokens
    if (!repayWithCollateral) {
      // push reserve asset
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
          symbol: `${currentMarketData.aTokenPrefix}${poolReserve.symbol}`,
          balance: maxBalance.toString(),
        });
      }
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
    } else {
      // TODO: add collateral tokens
      // go through all collateral tokens and add them
    }
    setAssets(repayTokens);
    setTokenToRepayWith(repayTokens[0]);
  }, []);

  const safeAmountToRepayAll = valueToBigNumber(debt).multipliedBy('1.0025');

  // calculate max amount abailable to repay
  let maxAmountToRepay: BigNumber;
  if (repayWithATokens) {
    maxAmountToRepay = BigNumber.min(new BigNumber(underlyingBalance), debt);
  } else {
    const normalizedWalletBalance = valueToBigNumber(walletBalance).minus(
      userReserve.reserve.symbol.toUpperCase() === networkConfig.baseAssetSymbol ? '0.004' : '0'
    );
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt);
  }

  // We set this in a useEffect, so it doesnt constantly change when
  // max amount selected
  useEffect(() => {
    // case when user uses max button
    if (amount === '-1') {
      if (
        synthetixProxyByChainId[chainId] &&
        reserve.underlyingAsset.toLowerCase() === synthetixProxyByChainId[chainId].toLowerCase()
      ) {
        setAmountToRepay(BigNumber.min(walletBalance, safeAmountToRepayAll).toString());
      } else {
        setAmountToRepay(amount);
      }
    } else {
      setAmountToRepay(amount);
    }
  }, [amount, chainId, walletBalance, safeAmountToRepayAll]);

  let amountToRepayUI = valueToBigNumber(amountToRepay);
  if (amountToRepay === '-1') {
    amountToRepayUI = BigNumber.min(
      repayWithATokens ? underlyingBalance : walletBalance,
      maxAmountToRepay
    );
  }

  // debt remaining after repay
  const amountAfterRepay = maxAmountToRepay.minus(amountToRepayUI).toString();
  const displayAmountAfterRepay = BigNumber.min(amountAfterRepay, maxAmountToRepay);
  const displayAmountAfterRepayInUsd = displayAmountAfterRepay
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

  // health factor calculations
  const newHF = amountToRepayUI
    ? calculateHealthFactorFromBalancesBigUnits({
        collateralBalanceMarketReferenceCurrency:
          repayWithATokens && usageAsCollateralEnabledOnUser
            ? valueToBigNumber(user?.totalCollateralMarketReferenceCurrency || '0').minus(
                valueToBigNumber(reserve.formattedPriceInMarketReferenceCurrency).multipliedBy(
                  amountToRepayUI
                )
              )
            : user?.totalCollateralMarketReferenceCurrency || '0',
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(
          user?.totalBorrowsMarketReferenceCurrency || '0'
        ).minus(
          valueToBigNumber(reserve.formattedPriceInMarketReferenceCurrency).multipliedBy(
            amountToRepayUI
          )
        ),
        currentLiquidationThreshold: user?.currentLiquidationThreshold || '0',
      }).toString()
    : user?.healthFactor;

  // TODO: add here repay with collateral calculations and maybe do a conditional with other????

  // error handling
  useEffect(() => {
    if (repayWithATokens) {
      if (
        valueToBigNumber(underlyingBalance).eq(0) ||
        valueToBigNumber(underlyingBalance).lt(amountToRepayUI) ||
        (amount === '-1' && valueToBigNumber(underlyingBalance).lt(maxAmountToRepay))
      ) {
        setBlockingError(ErrorType.NOT_ENOUGH_ATOKEN_BALANCE);
      } else {
        setBlockingError(undefined);
      }
    } else {
      if (
        valueToBigNumber(walletBalance).eq('0') ||
        valueToBigNumber(walletBalance).lt(amountToRepayUI) ||
        (amount === '-1' && valueToBigNumber(walletBalance).lt(maxAmountToRepay))
      ) {
        setBlockingError(ErrorType.NOT_ENOUGH_BALANCE);
      } else {
        setBlockingError(undefined);
      }
    }
  }, [
    amount,
    amountToRepayUI,
    repayWithATokens,
    underlyingBalance,
    walletBalance,
    maxAmountToRepay,
    tokenToRepayWith,
  ]);

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough balance on your wallet</Trans>;
      case ErrorType.NOT_ENOUGH_ATOKEN_BALANCE:
        return <Trans>Not enough atoken balance on your wallet</Trans>;
      default:
        return null;
    }
  };
  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  const showHealthFactor =
    user?.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

  // calculating input usd value
  const usdValue = valueToBigNumber(amountToRepayUI).multipliedBy(reserve.priceInUSD);

  return (
    <>
      {!repayTxState.txError && !repayTxState.success && (
        <>
          <TxModalTitle title="Repay" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          <Box>
            <Typography>
              <Trans>Repay with</Trans>
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              {/*For now hardcoded to wallet balance setRepayWithCollateral(!repayWithCollateral) */}
              <Button
                disabled={repayWithCollateral}
                variant="contained"
                onClick={() => setRepayWithCollateral(false)}
              >
                {!repayWithCollateral && <CheckIcon />}
                <Typography>
                  <Trans>Wallet balance</Trans>
                </Typography>
              </Button>
              <Button
                disabled={!repayWithCollateral}
                variant="contained"
                onClick={() => setRepayWithCollateral(!repayWithCollateral)}
              >
                {repayWithCollateral && <CheckIcon />}
                <Typography>
                  <Trans>Collateral</Trans>
                </Typography>
              </Button>
            </Box>
          </Box>
          <AssetInput
            value={amountToRepayUI.toString()}
            onChange={setAmount}
            usdValue={usdValue.toString()}
            symbol={tokenToRepayWith.symbol}
            assets={assets}
            onSelect={setTokenToRepayWith}
          />
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}
          <TxModalDetails
            showHf={showHealthFactor}
            healthFactor={user?.healthFactor}
            futureHealthFactor={newHF?.toString()}
            gasLimit={gasLimit}
            symbol={tokenToRepayWith.symbol}
            amountAfterRepay={amountAfterRepay}
            displayAmountAfterRepayInUsd={displayAmountAfterRepayInUsd.toString()}
          />
        </>
      )}

      {repayTxState.txError && <TxErrorView errorMessage={repayTxState.txError} />}
      {repayTxState.success && !repayTxState.txError && (
        <TxSuccessView
          action="repayed"
          amount={amountToRepayUI.toString()}
          symbol={poolReserve.symbol}
        />
      )}
      {repayTxState.gasEstimationError && (
        <GasEstimationError error={repayTxState.gasEstimationError} />
      )}
      <RepayActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setRepayTxState={setRepayTxState}
        amountToRepay={amountToRepay.toString()}
        handleClose={handleClose}
        poolAddress={tokenToRepayWith.address ?? ''}
        isWrongNetwork={isWrongNetwork}
        symbol={tokenToRepayWith.symbol}
        debtType={debtType}
        repayWithATokens={repayWithATokens}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
