import { InterestRate } from '@aave/contract-helpers';
import { ComputedUserReserve, valueToBigNumber } from '@aave/math-utils';
import { useState } from 'react';
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

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  if (!user) {
    return null;
  }

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

  let blockingError = '';
  const currentBorrows = valueToBigNumber(
    currentRateMode === InterestRate.Stable
      ? userReserve.stableBorrows
      : userReserve.variableBorrows
  );
  if (currentBorrows.eq(0)) {
    blockingError = ''; //intl.formatMessage(messages.errorNotBorrowYetUsingThisCurrency);
  }
  if (
    currentRateMode === InterestRate.Variable &&
    userReserve.usageAsCollateralEnabledOnUser &&
    poolReserve.usageAsCollateralEnabled &&
    valueToBigNumber(userReserve.totalBorrows).lt(userReserve.underlyingBalance)
  ) {
    blockingError = ''; // intl.formatMessage(messages.errorYouCantBorrowStableNow);
  }

  if (InterestRate.Variable === currentRateMode && !poolReserve.stableBorrowRateEnabled) {
    blockingError = ''; // intl.formatMessage(messages.errorStableInterestTypeIsDisabled);
  }

  console.log('TODO: do semething with blocking errors: ', blockingError);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!rateSwitchTxState.error && !rateSwitchTxState.success && (
        <>
          <TxModalTitle title="Switch APY rate type for" symbol={poolReserve.symbol} />
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
          />
        </>
      )}

      {rateSwitchTxState.error && <TxErrorView errorMessage={rateSwitchTxState.error} />}
      {rateSwitchTxState.success && !rateSwitchTxState.error && (
        <TxSuccessView rate={rateModeAfterSwitch} />
      )}
      <RateSwitchActions
        poolReserve={poolReserve}
        setGasLimit={setGasLimit}
        setRateSwitchTxState={setRateSwitchTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        currentRateMode={currentRateMode}
      />
    </>
  );
};
