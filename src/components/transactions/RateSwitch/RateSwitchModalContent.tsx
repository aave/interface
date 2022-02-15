import { InterestRate } from '@aave/contract-helpers';
import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { TxState } from 'src/helpers/types';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { RateSwitchActions } from './RateSwitchActions';

export type RateSwitchModalContentProps = {
  underlyingAsset: string;
  handleClose: () => void;
};

export enum ErrorType {
  NO_BORROWS_YET_USING_THIS_CURRENCY,
  YOU_CANT_BORROW_STABLE_NOW,
  STABLE_INTEREST_TYPE_IS_DISABLED,
}

export const RateSwitchModalContent = ({
  underlyingAsset,
  handleClose,
}: RateSwitchModalContentProps) => {
  const { reserves, user } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();

  const networkConfig = getNetworkConfig(currentChainId);

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [rateSwitchTxState, setRateSwitchTxState] = useState<TxState>({
    success: false,
  });
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const userReserve = user.userReservesData.find(
    (userReserve) => underlyingAsset === userReserve.underlyingAsset
  ) as ComputedUserReserve;

  const currentRateMode =
    Number(userReserve.stableBorrows) > Number(userReserve.variableBorrows)
      ? InterestRate.Stable
      : InterestRate.Variable;

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
  useEffect(() => {
    if (currentBorrows.eq(0)) {
      setBlockingError(ErrorType.NO_BORROWS_YET_USING_THIS_CURRENCY);
    } else if (
      currentRateMode === InterestRate.Variable &&
      userReserve.usageAsCollateralEnabledOnUser &&
      poolReserve.usageAsCollateralEnabled &&
      valueToBigNumber(userReserve.totalBorrows).lt(userReserve.underlyingBalance)
    ) {
      setBlockingError(ErrorType.YOU_CANT_BORROW_STABLE_NOW);
    } else if (InterestRate.Variable === currentRateMode && !poolReserve.stableBorrowRateEnabled) {
      setBlockingError(ErrorType.STABLE_INTEREST_TYPE_IS_DISABLED);
    } else {
      setBlockingError(undefined);
    }
  }, [
    currentBorrows,
    currentRateMode,
    userReserve.usageAsCollateralEnabledOnUser,
    poolReserve.usageAsCollateralEnabled,
    userReserve.totalBorrows,
    userReserve.underlyingBalance,
    poolReserve.stableBorrowRateEnabled,
  ]);

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

  console.log('TODO: do semething with blocking errors: ', blockingError);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!rateSwitchTxState.txError && !rateSwitchTxState.success && (
        <>
          <TxModalTitle title="Switch APY type" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          <TxModalDetails
            incentives={
              rateModeAfterSwitch === InterestRate.Variable
                ? poolReserve.vIncentivesData
                : poolReserve.sIncentivesData
            }
            apy={apyAfterSwitch}
            rate={rateModeAfterSwitch}
            gasLimit={gasLimit}
            symbol={poolReserve.symbol}
            underlyingAsset={underlyingAsset}
          />
        </>
      )}

      {rateSwitchTxState.txError && <TxErrorView errorMessage={rateSwitchTxState.txError} />}
      {rateSwitchTxState.success && !rateSwitchTxState.txError && (
        <TxSuccessView rate={rateModeAfterSwitch} />
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <RateSwitchActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setRateSwitchTxState={setRateSwitchTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        currentRateMode={currentRateMode}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
