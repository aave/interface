import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
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
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { CollateralChangeActions } from './CollateralChangeActions';

export type CollateralChangeModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export enum ErrorType {
  DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY,
  CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL,
  CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE,
}

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
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

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

  // error handling
  useEffect(() => {
    if (valueToBigNumber(userReserve.underlyingBalance).eq(0)) {
      setBlockingError(ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY);
    }
    if (
      (!userReserve.usageAsCollateralEnabledOnUser && !poolReserve.usageAsCollateralEnabled) ||
      !poolReserve.usageAsCollateralEnabled
    ) {
      setBlockingError(ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL);
    }

    if (
      userReserve.usageAsCollateralEnabledOnUser &&
      user.totalBorrowsMarketReferenceCurrency !== '0' &&
      healthFactorAfterSwitch.lte('1')
    ) {
      setBlockingError(ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE);
    }
  }, [
    userReserve.underlyingBalance,
    userReserve.usageAsCollateralEnabledOnUser,
    poolReserve.usageAsCollateralEnabled,
    user.totalBorrowsMarketReferenceCurrency,
    healthFactorAfterSwitch,
  ]);

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY:
        return <Trans>You do not have supplies in this currency</Trans>;
      case ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL:
        return <Trans>YYou can not use this currency as collateral</Trans>;
      case ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE:
        return (
          <Trans>
            You can not switch usage as collateral mode for this currency, because it will cause
            collateral call
          </Trans>
        );
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!collateralChangeTxState.txError && !collateralChangeTxState.success && (
        <>
          <Typography variant="h2" sx={{ mb: '26px' }}>
            {usageAsCollateralModeAfterSwitch ? <Trans>Use</Trans> : <Trans>Disable</Trans>}
            {poolReserve.symbol}
            <Trans> as collateral</Trans>
          </Typography>
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          {<IsolationModeWarning />}
          {usageAsCollateralModeAfterSwitch ? (
            <Typography>
              <Trans>
                Message. Collateral increases your borrowing power and Health Factor. But at the
                same time it can be liquidated.
              </Trans>
            </Typography>
          ) : (
            <Typography>
              <Trans>
                Asset will no longer be used as collateral, can not be seized in liquidation. It
                really affects your borrowing power and Health Factor.
              </Trans>
            </Typography>
          )}
          {poolReserve.isIsolated && usageAsCollateralModeAfterSwitch && (
            <Typography>You will enter isolation mode</Typography>
          )}
          {poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch && (
            <Typography>You will leave isolation mode</Typography>
          )}
          <TxModalDetails
            showHf={true}
            healthFactor={user.healthFactor}
            futureHealthFactor={healthFactorAfterSwitch.toString()}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            walletBalance={walletBalance}
          />
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}
        </>
      )}

      {collateralChangeTxState.txError && (
        <TxErrorView errorMessage={collateralChangeTxState.txError} />
      )}
      {collateralChangeTxState.success && !collateralChangeTxState.txError && (
        <TxSuccessView collateral={usageAsCollateralModeAfterSwitch} symbol={poolReserve.symbol} />
      )}
      {collateralChangeTxState.gasEstimationError && (
        <GasEstimationError error={collateralChangeTxState.gasEstimationError} />
      )}
      <CollateralChangeActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setCollateralChangeTxState={setCollateralChangeTxState}
        handleClose={handleClose}
        usageAsCollateral={usageAsCollateralModeAfterSwitch}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
