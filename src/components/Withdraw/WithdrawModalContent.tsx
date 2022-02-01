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

export type WithdrawModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export const WithdrawModalContent = ({
  underlyingAsset,
  handleClose,
}: WithdrawModalContentProps) => {
  const { marketReferencePriceInUsd, reserves, user, userEmodeCategoryId } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId, switchNetwork, currentAccount } = useWeb3Context();

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [amount, setAmount] = useState('0');

  const networkConfig = getNetworkConfig(currentChainId);

  // TODO: is this correct or should we return somethign else?
  // eitherway this should not happen when we enter the modal
  if (!user) {
    return null;
  }

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;
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

  let amountToWithdraw = valueToBigNumber(amount);
  let displayAmountToWithdraw = valueToBigNumber(amount);

  // TODO: !!!!!!!!!!!! how to handle -1 / max button on inupt !!!!!! dont forget!!!!!!!

  if (amountToWithdraw.eq('-1')) {
    if (user.totalBorrowsMarketReferenceCurrency !== '0') {
      if (!maxAmountToWithdraw.eq(underlyingBalance)) {
        amountToWithdraw = maxAmountToWithdraw;
      }
    }
    displayAmountToWithdraw = maxAmountToWithdraw;
  }

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
      blockingError = 'TODO: some message here'; //intl.formatMessage(messages.errorCanNotWithdrawThisAmount);
    }
  }

  // hf
  const showHealthFactor =
    user.totalBorrowsMarketReferenceCurrency !== '0' && poolReserve.usageAsCollateralEnabled;

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      <TxModalTitle title="Withdraw" symbol={poolReserve.symbol} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      <AssetInput
        value={amountToWithdraw.toString()}
        onChange={setAmount}
        // usdValue={amountInUsd.toString()}
        balance={maxAmountToWithdraw.toString()}
        symbol={poolReserve.symbol}
      />
      <TxModalDetails
        showHf={showHealthFactor}
        healthFactor={user.healthFactor}
        futureHealthFactor={healthFactorAfterWithdraw.toString()}
        gasLimit={gasLimit}
      />
    </>
  );
};
