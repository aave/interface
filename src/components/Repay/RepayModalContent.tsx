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
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { WithdrawActions } from '../Withdraw/WithdrawActions';
import BigNumber from 'bignumber.js';
import { RepayActions } from './RepayActions';

export type RepayProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

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
  const [amount, setAmount] = useState('');
  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [repayWithCollateral, setRepayWithCollateral] = useState(false);
  const [tokenToRepayWith, setTokenToRepayWith] = useState({
    address: poolReserve.underlyingAsset,
    symbol: poolReserve.symbol,
    balance: walletBalances[poolReserve.underlyingAsset]?.amount,
  });

  if (!user) {
    return null;
  }

  const userReserve = user.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  const networkConfig = getNetworkConfig(currentChainId);

  // set possible repay tokens
  const repayTokens = [];
  if (!repayWithCollateral) {
    // push reserve asset
    repayTokens.push({
      address: poolReserve.underlyingAsset,
      symbol: poolReserve.symbol,
      balance: walletBalances[poolReserve.underlyingAsset]?.amount,
      balanceUSD: walletBalances[poolReserve.underlyingAsset]?.amountUSD,
    });
    // push reserve atoken
    if (currentMarketData.v3) {
      repayTokens.push({
        address: poolReserve.aTokenAddress,
        symbol: `${currentMarketData.aTokenPrefix}${poolReserve.symbol}`,
        balance: walletBalances[poolReserve.aTokenAddress]?.amountUSD,
        balanceUSD: walletBalances[poolReserve.aTokenAddress]?.amountUSD,
      });
    }
    // if wrapped reserve push both wrapped / native
    if (poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol) {
      repayTokens.push({
        address: API_ETH_MOCK_ADDRESS.toLowerCase(),
        symbol: networkConfig.baseAssetSymbol,
        balance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
        balanceUSD: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
      });
    }
  } else {
    // TODO: add collateral tokens
    // go through all collateral tokens and add them
  }

  const walletBalance = walletBalances[underlyingAsset]?.amount;
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
    // TODO: shouldnt we account for the aTokens accrual here?
    maxAmountToRepay = BigNumber.min(new BigNumber(underlyingBalance), debt);
  } else {
    const normalizedWalletBalance = valueToBigNumber(walletBalance).minus(
      userReserve.reserve.symbol.toUpperCase() === networkConfig.baseAssetSymbol ? '0.004' : '0'
    );
    maxAmountToRepay = BigNumber.min(normalizedWalletBalance, debt);
  }

  let amountToRepay = amount;
  let amountToRepayUI = valueToBigNumber(amount);
  if (amountToRepay === '-1') {
    amountToRepayUI = BigNumber.min(
      repayWithATokens ? underlyingBalance : walletBalance,
      maxAmountToRepay
    );

    if (
      (synthetixProxyByChainId[chainId] &&
        reserve.underlyingAsset.toLowerCase() === synthetixProxyByChainId[chainId].toLowerCase()) ||
      !repayWithATokens
    ) {
      amountToRepay = BigNumber.min(walletBalance, safeAmountToRepayAll).toString();
    }
  }

  // amount for display
  const displayAmountToRepay = BigNumber.min(amountToRepayUI, maxAmountToRepay);
  const displayAmountToRepayInUsd = displayAmountToRepay
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS);

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
            ? valueToBigNumber(user.totalCollateralMarketReferenceCurrency).minus(
                valueToBigNumber(reserve.formattedPriceInMarketReferenceCurrency).multipliedBy(
                  amountToRepayUI
                )
              )
            : user.totalCollateralMarketReferenceCurrency,
        borrowBalanceMarketReferenceCurrency: valueToBigNumber(
          user.totalBorrowsMarketReferenceCurrency
        ).minus(
          valueToBigNumber(reserve.formattedPriceInMarketReferenceCurrency).multipliedBy(
            amountToRepayUI
          )
        ),
        currentLiquidationThreshold: user.currentLiquidationThreshold,
      }).toString()
    : user.healthFactor;

  // TODO: add here repay with collateral calculations and maybe do a conditional with other????

  // Warnings And Blocking Errors
  const blockingError = (
    repayWithATokens
      ? valueToBigNumber(underlyingBalance).eq(0)
      : valueToBigNumber(walletBalance).eq('0') || repayWithATokens
      ? valueToBigNumber(underlyingBalance).lt(amount)
      : valueToBigNumber(walletBalance).lt(amount)
  )
    ? 'Some error'
    : // ? intl.formatMessage(messages.error, {
      //     userReserveSymbol: assetDetails.formattedSymbol || assetDetails.symbol,
      //   })
      '';

  const warningMessage =
    amount === '-1' &&
    amountToRepayUI.gte(maxAmountToRepay) &&
    !amountToRepayUI.gte(safeAmountToRepayAll)
      ? 'Warning message'
      : '';
  // ? intl.formatMessage(messages.warningMessage)
  // : '';

  const notEnoughFunds =
    amount === '-1' &&
    (repayWithATokens
      ? valueToBigNumber(underlyingBalance).lt(maxAmountToRepay)
      : valueToBigNumber(walletBalance).lt(maxAmountToRepay));

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

  const blocked = blockingError !== '' || warningMessage !== '' || notEnoughFunds;

  return (
    <>
      {!repayTxState.error && !repayTxState.success && (
        <>
          <TxModalTitle title="Withdraw" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}

          <AssetInput
            value={amount.toString()}
            onChange={setAmount}
            // usdValue={amountInUsd.toString()}
            balance={maxAmountToRepay.toString()} // TOOD: is it correct amount here????
            symbol={tokenToRepayWith.symbol}
          />
          <TxModalDetails
            showHf={showHealthFactor}
            healthFactor={user.healthFactor}
            futureHealthFactor={newHF.toString()}
            gasLimit={gasLimit}
            symbol={tokenToRepayWith.symbol}
          />
        </>
      )}

      {repayTxState.error && <TxErrorView errorMessage={repayTxState.error} />}
      {repayTxState.success && !repayTxState.error && (
        <TxSuccessView
          action="repayed"
          amount={amountToRepay.toString()}
          symbol={poolReserve.symbol}
        />
      )}
      <RepayActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setRepayTxState={setRepayTxState}
        amountToRepay={amountToRepay.toString()}
        handleClose={handleClose}
        poolAddress={tokenToRepayWith.address}
        isWrongNetwork={isWrongNetwork}
        symbol={tokenToRepayWith.symbol}
        debtType={debtType}
        repayWithATokens={repayWithATokens}
        blocked={blocked}
      />
    </>
  );
};
