import { formatUserSummary } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Button, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { EmodeCategory, TxState } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { EmodeActions } from './EmodeActions';
import { getEmodeMessage } from './EmodeNaming';
import { EmodeSelect } from './EmodeSelect';

export type EmodeModalContentProps = {
  handleClose: () => void;
};

export enum ErrorType {
  EMODE_DISABLED_LIQUIDATION,
  CLOSE_POSITIONS_BEFORE_SWITCHING,
  SAME_EMODE,
}

export const EmodeModalContent = ({ handleClose }: EmodeModalContentProps) => {
  const {
    user,
    reserves,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
    userReserves,
  } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const currentTimestamp = useCurrentTimestamp(1);

  const [gasLimit, setGasLimit] = useState<string | undefined>(undefined);
  const [emodeTxState, setEmodeTxState] = useState<TxState>({ success: false });
  const [blockingError, setBlockingError] = useState<ErrorType | undefined>();

  const [selectedEmode, setSelectedEmode] = useState<EmodeCategory>();
  const [emodeCategories, setEmodeCategories] = useState<Record<number, EmodeCategory>>({});

  const networkConfig = getNetworkConfig(currentChainId);

  // get all emodes
  useEffect(() => {
    const emodeCategoriesArray: EmodeCategory[] = [];
    reserves.forEach((reserve) => {
      const emodeFound = emodeCategoriesArray.find(
        (category) => category.id === reserve.eModeCategoryId
      );
      if (!emodeFound) {
        const emodeParams: EmodeCategory = {
          id: reserve.eModeCategoryId,
          ltv: reserve.eModeLtv,
          liquidationThreshold: reserve.eModeLiquidationThreshold,
          liquidationBonus: reserve.eModeLiquidationBonus,
          priceSource: reserve.eModePriceSource,
          label: reserve.eModeLabel,
          assets: [],
        };

        // get all emode asets
        reserves.forEach((eReserve) => {
          if (eReserve.eModeCategoryId === reserve.eModeCategoryId) {
            emodeParams.assets.push(eReserve.symbol);
          }
        });

        emodeCategoriesArray.push(emodeParams);
      }
    });

    const emodeCategories: Record<number, EmodeCategory> = {};
    emodeCategoriesArray.forEach((category) => {
      emodeCategories[category.id] = category;
    });

    setSelectedEmode(emodeCategories[user.userEmodeCategoryId]);
    setEmodeCategories(emodeCategories);
  }, []);

  // calcs
  const newSummary = formatUserSummary({
    currentTimestamp,
    userReserves: userReserves,
    formattedReserves: reserves,
    userEmodeCategoryId: selectedEmode ? selectedEmode.id : 0,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
  });

  // error handling
  useEffect(() => {
    // if user is disabling eMode
    if (user.isInEmode && selectedEmode?.id === 0) {
      if (Number(newSummary.healthFactor) < 1.01 && newSummary.healthFactor !== '-1') {
        setBlockingError(ErrorType.EMODE_DISABLED_LIQUIDATION); // intl.formatMessage(messages.eModeDisabledLiquidation);
      } else {
        setBlockingError(undefined);
      }
    } else if (user.userEmodeCategoryId !== selectedEmode?.id) {
      // check if user has open positions different than future emode
      const hasIncompatiblePositions = user.userReservesData.some(
        (userReserve) =>
          (Number(userReserve.scaledVariableDebt) > 0 ||
            Number(userReserve.principalStableDebt) > 0) &&
          userReserve.reserve.eModeCategoryId !== selectedEmode?.id
      );

      if (hasIncompatiblePositions) {
        setBlockingError(ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING);
      } else {
        setBlockingError(undefined);
      }
    } else if (selectedEmode.id === user.userEmodeCategoryId) {
      setBlockingError(ErrorType.SAME_EMODE);
    } else {
      setBlockingError(undefined);
    }
  }, [selectedEmode, user.isInEmode, newSummary, user, user.userEmodeCategoryId]);
  // render error messages
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING:
        return (
          <>
            <Trans>In order to change E-Mode from asset category </Trans>
            {getEmodeMessage(user.userEmodeCategoryId)}
            <Trans> you will need to close your position in your current category. See our </Trans>
            <Button
              variant="text"
              component={Link}
              href="https://docs.aave.com/faq/"
              target="_blank"
            >
              FAQ
            </Button>
            <Trans> to learn more.</Trans>
          </>
        );
      case ErrorType.EMODE_DISABLED_LIQUIDATION:
        return (
          <Trans>
            You can not disable E-Mode as your current collateralization level is above 80%,
            disabling E-Mode can cause liquidation. To exit E-Mode supply or repay borrowed
            positions.
          </Trans>
        );
      case ErrorType.SAME_EMODE:
        return <Trans>You need to change E-Mode to continue.</Trans>;
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  return (
    <>
      {!emodeTxState.txError && !emodeTxState.success && (
        <>
          <TxModalTitle title="Efficiency mode (E-Mode)" />
          {isWrongNetwork && (
            <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
          )}
          {selectedEmode && selectedEmode.id !== 0 ? (
            <Typography>
              <Trans>
                E-Mode increases your borrowing power for a selected category of assets up to 99%.
                Learn more
              </Trans>
            </Typography>
          ) : (
            <Typography>
              <Trans>Warning here about geting out of emode</Trans>
            </Typography>
          )}
          <Typography variant="description">
            <Trans>Asset category</Trans>
          </Typography>
          <EmodeSelect
            emodeCategories={emodeCategories}
            selectedEmode={selectedEmode?.id || 0}
            setSelectedEmode={setSelectedEmode}
          />
          {blockingError !== undefined && (
            <Typography variant="helperText" color="red">
              {handleBlocked()}
            </Typography>
          )}

          <TxModalDetails
            showHf={true}
            healthFactor={user.healthFactor}
            futureHealthFactor={newSummary.healthFactor}
            gasLimit={gasLimit}
            emodeAssets={selectedEmode?.assets}
          />

          {selectedEmode && selectedEmode.id !== 0 && (
            <Typography>
              <Trans>
                Enabling E-Mode only allows you to borrow assets belonging to the selected category
                Stablecoins. Please visit out FAQ guide to learn more about how it works and the
                applied restrictions.
              </Trans>
            </Typography>
          )}
        </>
      )}

      {emodeTxState.txError && <TxErrorView errorMessage={emodeTxState.txError} />}
      {emodeTxState.success && !emodeTxState.txError && <TxSuccessView action="Emode" />}
      {emodeTxState.gasEstimationError && (
        <GasEstimationError error={emodeTxState.gasEstimationError} />
      )}

      <EmodeActions
        setGasLimit={setGasLimit}
        setEmodeTxState={setEmodeTxState}
        handleClose={handleClose}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        selectedEmode={selectedEmode?.id || 0}
      />
    </>
  );
};
