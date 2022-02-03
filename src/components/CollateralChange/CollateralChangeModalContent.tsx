import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  valueToBigNumber,
} from '@aave/math-utils';
import { useState } from 'react';
import { TxState } from 'src/helpers/types';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { CollateralChangeActions } from './CollateralChangeActions';

export type CollateralChangeModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export const CollateralChangeModalContent = ({
  underlyingAsset,
  handleClose,
}: CollateralChangeModalContentProps) => {
  const { reserves, user } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const { walletBalances } = useWalletBalances();

  const networkConfig = getNetworkConfig(currentChainId);

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [collateralChangeTxState, setCollateralChangeTxState] = useState<TxState>({
    success: false,
  });

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  if (!user) {
    return null;
  }

  const userReserve = user.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  const walletBalance = walletBalances[underlyingAsset]?.amount;

  // health factor Calcs
  const usageAsCollateralModeAfterSwitch = !userReserve.usageAsCollateralEnabledOnUser;
  const currenttotalCollateralMarketReferenceCurrency = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );

  const totalCollateralAfterSwitchETH = currenttotalCollateralMarketReferenceCurrency[
    usageAsCollateralModeAfterSwitch ? 'plus' : 'minus'
  ](userReserve.underlyingBalanceMarketReferenceCurrency);

  const healthFactorAfterSwitch = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralAfterSwitchETH,
    borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });

  // blocking checks
  let blockingError = '';
  if (valueToBigNumber(userReserve.underlyingBalance).eq(0)) {
    blockingError = ''; //intl.formatMessage(messages.errorDoNotHaveDepositsInThisCurrency);
  }
  if (
    (!userReserve.usageAsCollateralEnabledOnUser && !poolReserve.usageAsCollateralEnabled) ||
    !poolReserve.usageAsCollateralEnabled
  ) {
    blockingError = ''; //intl.formatMessage(messages.errorCanNotUseThisCurrencyAsCollateral);
  }

  if (
    userReserve.usageAsCollateralEnabledOnUser &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    healthFactorAfterSwitch.lte('1')
  ) {
    blockingError = ''; //intl.formatMessage(messages.errorCanNotSwitchUsageAsCollateralMode);
  }

  console.log('TODO do something with block error: ', blockingError);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!collateralChangeTxState.error && !collateralChangeTxState.success && (
        <>
          <TxModalTitle title="Borrow" symbol={poolReserve.symbol} />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          <TxModalDetails
            showHf={true}
            healthFactor={user.healthFactor}
            futureHealthFactor={healthFactorAfterSwitch.toString()}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            walletBalance={walletBalance}
          />
        </>
      )}

      {collateralChangeTxState.error && (
        <TxErrorView errorMessage={collateralChangeTxState.error} />
      )}
      {collateralChangeTxState.success && !collateralChangeTxState.error && (
        <TxSuccessView collateral={usageAsCollateralModeAfterSwitch} symbol={poolReserve.symbol} />
      )}
      <CollateralChangeActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setCollateralChangeTxState={setCollateralChangeTxState}
        handleClose={handleClose}
        usageAsCollateral={usageAsCollateralModeAfterSwitch}
        isWrongNetwork={isWrongNetwork}
      />
    </>
  );
};
