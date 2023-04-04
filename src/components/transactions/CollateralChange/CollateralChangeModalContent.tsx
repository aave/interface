import { calculateHealthFactorFromBalancesBigUnits, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useAssetCaps } from 'src/hooks/useAssetCaps';
import { useModalContext } from 'src/hooks/useModal';

import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine, DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { zeroLTVBlockingWithdraw } from '../utils';
import { IsolationModeWarning } from '../Warnings/IsolationModeWarning';
import { CollateralChangeActions } from './CollateralChangeActions';

export type CollateralChangeModalContentProps = {
  underlyingAsset: string;
};

export enum ErrorType {
  DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY,
  CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL,
  CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const CollateralChangeModalContent = ({
  poolReserve,
  userReserve,
  isWrongNetwork,
  symbol,
}: ModalWrapperProps) => {
  const { gasLimit, mainTxState: collateralChangeTxState, txError } = useModalContext();
  const { user } = useAppDataContext();
  const { debtCeiling } = useAssetCaps();

  // Health factor calculations
  const usageAsCollateralModeAfterSwitch = !userReserve.usageAsCollateralEnabledOnUser;
  const currenttotalCollateralMarketReferenceCurrency = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency
  );

  // Messages
  const showEnableIsolationModeMsg = !poolReserve.isIsolated && usageAsCollateralModeAfterSwitch;
  const showDisableIsolationModeMsg = !poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch;
  const showEnterIsolationModeMsg = poolReserve.isIsolated && usageAsCollateralModeAfterSwitch;
  const showExitIsolationModeMsg = poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch;

  const totalCollateralAfterSwitchETH = currenttotalCollateralMarketReferenceCurrency[
    usageAsCollateralModeAfterSwitch ? 'plus' : 'minus'
  ](userReserve.underlyingBalanceMarketReferenceCurrency);

  const healthFactorAfterSwitch = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralAfterSwitchETH,
    borrowBalanceMarketReferenceCurrency: user.totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  });

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (assetsBlockingWithdraw.length > 0 && !assetsBlockingWithdraw.includes(poolReserve.symbol)) {
    blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED;
  } else if (valueToBigNumber(userReserve.underlyingBalance).eq(0)) {
    blockingError = ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY;
  } else if (
    (!userReserve.usageAsCollateralEnabledOnUser &&
      poolReserve.reserveLiquidationThreshold === '0') ||
    poolReserve.reserveLiquidationThreshold === '0'
  ) {
    blockingError = ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL;
  } else if (
    userReserve.usageAsCollateralEnabledOnUser &&
    user.totalBorrowsMarketReferenceCurrency !== '0' &&
    healthFactorAfterSwitch.lte('1')
  ) {
    blockingError = ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE;
  }

  // error render handling
  const BlockingError: React.FC = () => {
    switch (blockingError) {
      case ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY:
        return <Trans>You do not have supplies in this currency</Trans>;
      case ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL:
        return <Trans>You can not use this currency as collateral</Trans>;
      case ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE:
        return (
          <Trans>
            You can not switch usage as collateral mode for this currency, because it will cause
            collateral call
          </Trans>
        );
      case ErrorType.ZERO_LTV_WITHDRAW_BLOCKED:
        return (
          <Trans>
            Assets with zero LTV ({assetsBlockingWithdraw}) must be withdrawn or disabled as
            collateral to perform this action
          </Trans>
        );
      default:
        return null;
    }
  };

  if (collateralChangeTxState.success)
    return (
      <TxSuccessView collateral={usageAsCollateralModeAfterSwitch} symbol={poolReserve.symbol} />
    );

  return (
    <>
      {showEnableIsolationModeMsg && (
        <Warning severity="warning" icon={false} sx={{ mb: 3 }}>
          <Trans>
            Enabling this asset as collateral increases your borrowing power and Health Factor.
            However, it can get liquidated if your health factor drops below 1.
          </Trans>
        </Warning>
      )}

      {showDisableIsolationModeMsg && (
        <Warning severity="warning" icon={false} sx={{ mb: 3 }}>
          <Trans>
            Disabling this asset as collateral affects your borrowing power and Health Factor.
          </Trans>
        </Warning>
      )}

      {showEnterIsolationModeMsg && <IsolationModeWarning asset={poolReserve.symbol} />}

      {showExitIsolationModeMsg && (
        <Warning severity="info" icon={false} sx={{ mb: 3 }}>
          <Trans>You will exit isolation mode and other tokens can now be used as collateral</Trans>
        </Warning>
      )}

      {poolReserve.isIsolated && debtCeiling.determineWarningDisplay({ debtCeiling })}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          symbol={poolReserve.symbol}
          iconSymbol={poolReserve.iconSymbol}
          description={<Trans>Supply balance</Trans>}
          value={userReserve.underlyingBalance}
        />
        <DetailsHFLine
          visibleHfChange={true}
          healthFactor={user.healthFactor}
          futureHealthFactor={healthFactorAfterSwitch.toString(10)}
        />
      </TxModalDetails>

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          <BlockingError />
        </Typography>
      )}

      {txError && <GasEstimationError txError={txError} />}

      <CollateralChangeActions
        symbol={symbol}
        poolReserve={poolReserve}
        usageAsCollateral={usageAsCollateralModeAfterSwitch}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
