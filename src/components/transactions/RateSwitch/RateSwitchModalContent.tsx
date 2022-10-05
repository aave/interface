import { InterestRate } from '@aave/contract-helpers';
import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Warning } from 'src/components/primitives/Warning';
import { useModalContext } from 'src/hooks/useModal';

import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { TxSuccessView } from '../FlowCommons/Success';
import {
  DetailsIncentivesLine,
  DetailsNumberLine,
  TxModalDetails,
} from '../FlowCommons/TxModalDetails';
import { RateSwitchActions } from './RateSwitchActions';

export type RateSwitchModalContentProps = {
  underlyingAsset: string;
  currentRateMode: InterestRate;
};

export enum ErrorType {
  NO_BORROWS_YET_USING_THIS_CURRENCY,
  YOU_CANT_BORROW_STABLE_NOW,
  STABLE_INTEREST_TYPE_IS_DISABLED,
}

export const RateSwitchModalContent = ({
  currentRateMode,
  isWrongNetwork,
  poolReserve,
  userReserve,
}: ModalWrapperProps & { currentRateMode: InterestRate }) => {
  const { mainTxState: rateSwitchTxState, gasLimit, txError } = useModalContext();

  const rateModeAfterSwitch =
    InterestRate.Variable === currentRateMode ? InterestRate.Stable : InterestRate.Variable;

  const apyAfterSwitch =
    currentRateMode === InterestRate.Stable
      ? poolReserve.variableBorrowAPY
      : poolReserve.stableBorrowAPY;

  const currentBorrows = valueToBigNumber(
    currentRateMode === InterestRate.Stable
      ? userReserve.stableBorrows
      : userReserve.variableBorrows
  );

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (currentBorrows.eq(0)) {
    blockingError = ErrorType.NO_BORROWS_YET_USING_THIS_CURRENCY;
  } else if (
    currentRateMode === InterestRate.Variable &&
    userReserve.usageAsCollateralEnabledOnUser &&
    poolReserve.usageAsCollateralEnabled &&
    valueToBigNumber(userReserve.totalBorrows).lt(userReserve.underlyingBalance)
  ) {
    blockingError = ErrorType.YOU_CANT_BORROW_STABLE_NOW;
  } else if (InterestRate.Variable === currentRateMode && !poolReserve.stableBorrowRateEnabled) {
    blockingError = ErrorType.STABLE_INTEREST_TYPE_IS_DISABLED;
  }

  // error render handling
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NO_BORROWS_YET_USING_THIS_CURRENCY:
        return <Trans>You have not borrow yet using this currency</Trans>;
      case ErrorType.STABLE_INTEREST_TYPE_IS_DISABLED:
        return <Trans>Stable Interest Type is disabled for this currency</Trans>;
      case ErrorType.YOU_CANT_BORROW_STABLE_NOW:
        return (
          <Trans>
            You can not change Interest Type to stable as your borrowings are higher than your
            collateral
          </Trans>
        );
      default:
        return null;
    }
  };

  if (rateSwitchTxState.success) return <TxSuccessView rate={rateModeAfterSwitch} />;

  return (
    <>
      {blockingError !== undefined && (
        <Warning severity="error" sx={{ mb: 0 }}>
          {handleBlocked()}
        </Warning>
      )}
      <TxModalDetails gasLimit={gasLimit}>
        <DetailsNumberLine
          description={<Trans>New APY</Trans>}
          value={apyAfterSwitch}
          numberPrefix={
            rateModeAfterSwitch === InterestRate.Stable ? (
              <Trans>Stable</Trans>
            ) : (
              <Trans>Variable</Trans>
            )
          }
          percent
        />
        <DetailsIncentivesLine
          incentives={
            rateModeAfterSwitch === InterestRate.Variable
              ? poolReserve.vIncentivesData
              : poolReserve.sIncentivesData
          }
          symbol={poolReserve.symbol}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <RateSwitchActions
        poolReserve={poolReserve}
        isWrongNetwork={isWrongNetwork}
        currentRateMode={currentRateMode}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
