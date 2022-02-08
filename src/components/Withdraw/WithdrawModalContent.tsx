import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  valueToBigNumber,
} from '@aave/math-utils';
import { useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { AssetInput } from '../AssetInput';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import BigNumber from 'bignumber.js';
import { WithdrawActions } from './WithdrawActions';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxState } from 'src/helpers/types';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';

export type WithdrawModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export const WithdrawModalContent = ({
  underlyingAsset,
  handleClose,
}: WithdrawModalContentProps) => {
  const { reserves, user, userEmodeCategoryId } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState('');
  const [withdrawTxState, setWithdrawTxState] = useState<TxState>({ success: false });

  const networkConfig = getNetworkConfig(currentChainId);

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const [withdrawUnWrapped, setWithdrawUnWrapped] = useState(true);

  if (!user) {
    return null;
  }

  const userReserve = user.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  // calculations
  const underlyingBalance = valueToBigNumber(userReserve.underlyingBalance);
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity);
  let maxAmountToWithdraw = BigNumber.min(underlyingBalance, unborrowedLiquidity);
  let maxCollateralToWithdrawInETH = valueToBigNumber('0');
  const reserveLiquidationThreshold =
    userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold;
  if (
    userReserve.usageAsCollateralEnabledOnUser &&
    poolReserve.usageAsCollateralEnabled &&
    user.totalBorrowsMarketReferenceCurrency !== '0'
  ) {
    // if we have any borrowings we should check how much we can withdraw without liquidation
    // with 0.5% gap to avoid reverting of tx
    const excessHF = valueToBigNumber(user.healthFactor).minus('1');
    if (excessHF.gt('0')) {
      maxCollateralToWithdrawInETH = excessHF
        .multipliedBy(user.totalBorrowsMarketReferenceCurrency)
        // because of the rounding issue on the contracts side this value still can be incorrect
        .div(Number(reserveLiquidationThreshold) + 0.01)
        .multipliedBy('0.99');
    }
    maxAmountToWithdraw = BigNumber.min(
      maxAmountToWithdraw,
      maxCollateralToWithdrawInETH.dividedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    );
  }

  let amountToWithdraw = valueToBigNumber(amount || 0);
  let displayAmountToWithdraw = amountToWithdraw;

  // TODO: !!!!!!!!!!!! how to handle -1 / max button on inupt !!!!!! dont forget!!!!!!!

  if (amountToWithdraw.eq('-1')) {
    if (user.totalBorrowsMarketReferenceCurrency !== '0') {
      if (!maxAmountToWithdraw.eq(underlyingBalance)) {
        amountToWithdraw = maxAmountToWithdraw;
      }
    }
    displayAmountToWithdraw = maxAmountToWithdraw;
  }

  // TODO: use blockingError to not permit to continue flow
  let blockingError = '';
  let totalCollateralInETHAfterWithdraw = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );
  let liquidationThresholdAfterWithdraw = user.currentLiquidationThreshold;
  let healthFactorAfterWithdraw = valueToBigNumber(user.healthFactor);

  if (userReserve.usageAsCollateralEnabledOnUser && poolReserve.usageAsCollateralEnabled) {
    const amountToWithdrawInEth = displayAmountToWithdraw.multipliedBy(
      poolReserve.formattedPriceInMarketReferenceCurrency
    );
    totalCollateralInETHAfterWithdraw =
      totalCollateralInETHAfterWithdraw.minus(amountToWithdrawInEth);

    liquidationThresholdAfterWithdraw = valueToBigNumber(
      user.totalCollateralMarketReferenceCurrency
    )
      .multipliedBy(user.currentLiquidationThreshold)
      .minus(valueToBigNumber(amountToWithdrawInEth).multipliedBy(reserveLiquidationThreshold))
      .div(totalCollateralInETHAfterWithdraw)
      .toFixed(4, BigNumber.ROUND_DOWN);

    healthFactorAfterWithdraw = calculateHealthFactorFromBalancesBigUnits({
      collateralBalanceMarketReferenceCurrency: totalCollateralInETHAfterWithdraw,
      borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
      currentLiquidationThreshold: liquidationThresholdAfterWithdraw,
    });

    if (healthFactorAfterWithdraw.lt('1') && user.totalBorrowsMarketReferenceCurrency !== '0') {
      blockingError = 'errorCanNotWithdrawThisAmount'; //intl.formatMessage(messages.errorCanNotWithdrawThisAmount);
    }
  }

  console.log('amount: ', amount);
  console.log('Not forget blockingError: ', blockingError);
  const blocked = blockingError !== '';
  console.log('blocked: ', blocked);

  // hf
  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(userReserve.reserve.priceInUSD);

  return (
    <>
      {!withdrawTxState.error && !withdrawTxState.success && (
        <>
          <TxModalTitle title="Withdraw" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}

          <AssetInput
            value={displayAmountToWithdraw.toString()}
            onChange={setAmount}
            // usdValue={amountInUsd.toString()}
            symbol={
              withdrawUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                ? networkConfig.baseAssetSymbol
                : poolReserve.symbol
            }
            assets={[
              {
                balance: maxAmountToWithdraw.toString(),
                symbol:
                  withdrawUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                    ? networkConfig.baseAssetSymbol
                    : poolReserve.symbol,
              },
            ]}
            usdValue={usdValue.toString()}
          />
          <TxModalDetails
            showHf={showHealthFactor}
            healthFactor={user.healthFactor}
            futureHealthFactor={healthFactorAfterWithdraw.toString()}
            gasLimit={gasLimit}
            setActionUnWrapped={
              poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
                ? setWithdrawUnWrapped
                : undefined
            }
            unWrappedSymbol={networkConfig.baseAssetSymbol}
            actionUnWrapped={withdrawUnWrapped}
            symbol={poolReserve.symbol}
          />
        </>
      )}

      {withdrawTxState.error && <TxErrorView errorMessage={withdrawTxState.error} />}
      {withdrawTxState.success && !withdrawTxState.error && (
        <TxSuccessView
          action="Withdrawed"
          amount={amountToWithdraw.toString()}
          symbol={poolReserve.symbol}
        />
      )}
      <WithdrawActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setWithdrawTxState={setWithdrawTxState}
        amountToWithdraw={amountToWithdraw.toString()}
        handleClose={handleClose}
        poolAddress={
          withdrawUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
        isWrongNetwork={isWrongNetwork}
        symbol={
          withdrawUnWrapped && poolReserve.symbol === networkConfig.wrappedBaseAssetSymbol
            ? networkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        blocked={blocked}
      />
    </>
  );
};
