import { formatUserSummary } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box, Button, Link, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { EmodeCategory } from 'src/helpers/types';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { EmodeActions } from './EmodeActions';
import { getEmodeMessage } from './EmodeNaming';
import { EmodeSelect } from './EmodeSelect';
import LightningBoltGradient from '/public/lightningBoltGradient.svg';

export enum ErrorType {
  EMODE_DISABLED_LIQUIDATION,
  CLOSE_POSITIONS_BEFORE_SWITCHING,
  SAME_EMODE,
}

// TODO: need add Current Loan to Value
export const EmodeModalContent = () => {
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
  const { gasLimit, mainTxState: emodeTxState } = useModalContext();

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

    const selectedEmode =
      Object.keys(emodeCategories).length > 2 && user.userEmodeCategoryId !== 0
        ? emodeCategories[user.userEmodeCategoryId]
        : user.userEmodeCategoryId === 0
        ? emodeCategories[1]
        : emodeCategories[0];

    setSelectedEmode(selectedEmode);
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
  let blockingError: ErrorType | undefined = undefined;
  // if user is disabling eMode
  if (user.isInEmode && selectedEmode?.id === 0) {
    if (Number(newSummary.healthFactor) < 1.01 && newSummary.healthFactor !== '-1') {
      blockingError = ErrorType.EMODE_DISABLED_LIQUIDATION; // intl.formatMessage(messages.eModeDisabledLiquidation);
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
      blockingError = ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING;
    }
  } else if (selectedEmode.id === user.userEmodeCategoryId) {
    blockingError = ErrorType.SAME_EMODE;
  }

  // render error messages
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING:
        return (
          <Trans>
            In order to change E-Mode from asset category
            {getEmodeMessage(user.userEmodeCategoryId)}
            you will need to close your position in your current category. See our{' '}
            <Button
              variant="text"
              component={Link}
              href="https://docs.aave.com/faq/"
              target="_blank"
            >
              FAQ
            </Button>{' '}
            to learn more.
          </Trans>
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

  if (emodeTxState.txError) return <TxErrorView errorMessage={emodeTxState.txError} />;
  if (emodeTxState.success) return <TxSuccessView action="Emode" />;

  return (
    <>
      <TxModalTitle title="Efficiency mode (E-Mode)" />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {selectedEmode && selectedEmode.id !== 0 && (
        <Alert severity="warning" sx={{ mb: 6 }}>
          <Trans>
            Enabling E-Mode only allows you to borrow assets belonging to the selected category
            Stablecoins. Please visit our{' '}
            <Link href="https://docs.aave.com/faq/" target="_blank">
              FAQ guide
            </Link>{' '}
            to learn more about how it works and the applied restrictions.
          </Trans>
        </Alert>
      )}

      {Object.keys(emodeCategories).length > 2 && user.userEmodeCategoryId === 0 && (
        <EmodeSelect
          emodeCategories={emodeCategories}
          selectedEmode={selectedEmode?.id || 0}
          setSelectedEmode={setSelectedEmode}
        />
      )}

      {blockingError !== undefined && <Alert severity="error">{handleBlocked()}</Alert>}

      <TxModalDetails gasLimit={gasLimit}>
        <Row caption={<Trans>Asset category</Trans>} captionVariant="description" mb={4}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <SvgIcon sx={{ fontSize: '12px', mr: 0.5 }}>
              <LightningBoltGradient />
            </SvgIcon>
            <Typography variant="subheader1">
              {selectedEmode && selectedEmode.id !== 0 ? (
                getEmodeMessage(selectedEmode.id)
              ) : (
                <Trans>None</Trans>
              )}
            </Typography>
          </Box>
        </Row>
        <Row caption={<Trans>Available assets</Trans>} captionVariant="description" mb={4}>
          {selectedEmode && selectedEmode.id !== 0 ? (
            <Typography>{selectedEmode.assets.join(', ')}</Typography>
          ) : (
            <Typography>
              <Trans>All</Trans>
            </Typography>
          )}
        </Row>
        <DetailsHFLine
          visibleHfChange={!!selectedEmode}
          healthFactor={user.healthFactor}
          futureHealthFactor={newSummary.healthFactor}
        />
      </TxModalDetails>

      {emodeTxState.gasEstimationError && (
        <GasEstimationError error={emodeTxState.gasEstimationError} />
      )}

      <EmodeActions
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        selectedEmode={selectedEmode?.id || 0}
      />
    </>
  );
};
