import {
  calculateHealthFactorFromBalancesBigUnits,
  ComputedUserReserve,
  valueToBigNumber,
} from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { CollateralChangeActions } from './CollateralChangeActions';

export type CollateralChangeModalContentProps = {
  underlyingAsset: string;
};

export enum ErrorType {
  DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY,
  CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL,
  CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE,
}

export const CollateralChangeModalContent = ({
  underlyingAsset,
}: CollateralChangeModalContentProps) => {
  const { gasLimit, mainTxState: collateralChangeTxState } = useModalContext();
  const { reserves, user } = useAppDataContext();
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const userReserve = user.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

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
    } else if (
      (!userReserve.usageAsCollateralEnabledOnUser && !poolReserve.usageAsCollateralEnabled) ||
      !poolReserve.usageAsCollateralEnabled
    ) {
      setBlockingError(ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL);
    } else if (
      userReserve.usageAsCollateralEnabledOnUser &&
      user.totalBorrowsMarketReferenceCurrency !== '0' &&
      healthFactorAfterSwitch.lte('1')
    ) {
      setBlockingError(ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE);
    } else {
      setBlockingError(undefined);
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

  if (collateralChangeTxState.txError)
    return <TxErrorView errorMessage={collateralChangeTxState.txError} />;
  if (collateralChangeTxState.success)
    return (
      <TxSuccessView collateral={usageAsCollateralModeAfterSwitch} symbol={poolReserve.symbol} />
    );

  return (
    <>
      <Typography variant="h2" sx={{ mb: '24px' }}>
        {usageAsCollateralModeAfterSwitch ? <Trans>Use</Trans> : <Trans>Disable</Trans>}{' '}
        {poolReserve.symbol} <Trans> as collateral</Trans>
      </Typography>

      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={currentNetworkConfig.name} chainId={currentChainId} />
      )}

      {usageAsCollateralModeAfterSwitch ? (
        <Alert severity="warning" icon={false} sx={{ mb: 3 }}>
          <Trans>
            Enabling this asset as collateral increases your borrowing power and Health Factor.
            However, it can get liquidated if your health factor drops below 1.
          </Trans>
        </Alert>
      ) : (
        <Alert severity="warning" icon={false} sx={{ mb: 3 }}>
          <Trans>
            Disabling this asset as collateral affects your borrowing power and Health Factor.
          </Trans>
        </Alert>
      )}

      {poolReserve.isIsolated && usageAsCollateralModeAfterSwitch && <IsolationModeWarning />}
      {poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch && (
        <Alert severity="info" icon={false}>
          <Trans>You will exit isolation mode and other tokens can now be used as collateral</Trans>
        </Alert>
      )}

      <TxModalDetails
        showHf={true}
        healthFactor={user.healthFactor}
        futureHealthFactor={healthFactorAfterSwitch.toString()}
        gasLimit={gasLimit}
        symbol={poolReserve.symbol}
        walletBalance={userReserve.underlyingBalance}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {handleBlocked()}
        </Typography>
      )}

      {collateralChangeTxState.gasEstimationError && (
        <GasEstimationError error={collateralChangeTxState.gasEstimationError} />
      )}

      <CollateralChangeActions
        poolReserve={poolReserve}
        usageAsCollateral={usageAsCollateralModeAfterSwitch}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
