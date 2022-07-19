import { formatUserSummary } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
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
  const { currentChainId, currentNetworkConfig } = useProtocolDataContext();
  const { chainId: connectedChainId } = useWeb3Context();
  const currentTimestamp = useCurrentTimestamp(1);
  const { gasLimit, mainTxState: emodeTxState, txError } = useModalContext();

  const [selectedEmode, setSelectedEmode] = useState<EmodeCategory>();
  const [emodeCategories, setEmodeCategories] = useState<Record<number, EmodeCategory>>({});

  const networkConfig = getNetworkConfig(currentChainId);

  // get all emodes
  useEffect(() => {
    if (!selectedEmode) {
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
      // Default settings of the modal window, depending on the user's active emode and # of available categories
      const selectedEmodeId =
        emodeCategoriesArray.length > 2
          ? user.userEmodeCategoryId === 0
            ? 1 // If user has emode disabled, default to 1st emode
            : user.userEmodeCategoryId === 1
            ? 2 // Default state is to switch emode
            : 1 // Default state is to switch emode
          : user.userEmodeCategoryId === 0 // If there are only 2 choices, just set the opposite of the users current emode
          ? 1
          : 0;
      const selectedCategory = emodeCategories[selectedEmodeId];
      if (selectedCategory) {
        setSelectedEmode(selectedCategory);
      } else {
        setSelectedEmode(emodeCategories[0]);
      }
      setEmodeCategories(emodeCategories);
    }
  }, [reserves, selectedEmode, user.userEmodeCategoryId]);

  // calculate user summary after emode change
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
  }
  // render error messages
  const Blocked: React.FC = () => {
    switch (blockingError) {
      case ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING:
        return (
          <Warning severity="error" sx={{ mt: 4 }}>
            <Trans>
              Enabling E-Mode requires all borrowed assets to belong to the same category. To enable
              a new E-Mode, all borrow positions outside of this asset category must be closed. See
              our{' '}
              <Link
                href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
                target="_blank"
                rel="noopener"
              >
                FAQ
              </Link>{' '}
              to learn more.
            </Trans>
          </Warning>
        );
      case ErrorType.EMODE_DISABLED_LIQUIDATION:
        return (
          <Trans>
            You can not disable E-Mode as your current collateralization level is above 80%,
            disabling E-Mode can cause liquidation. To exit E-Mode supply or repay borrowed
            positions.
          </Trans>
        );
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (emodeTxState.success) return <TxSuccessView action={<Trans>Emode</Trans>} />;

  return (
    <>
      <TxModalTitle title="Efficiency mode (E-Mode)" />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {user.userEmodeCategoryId === 0 && selectedEmode && (
        <Warning severity="warning">
          <Trans>
            Enabling E-Mode only allows you to borrow assets belonging to the selected category:{' '}
            {getEmodeMessage(selectedEmode.id, currentNetworkConfig.baseAssetSymbol)}. Please visit
            our{' '}
            <Link
              href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
              target="_blank"
              rel="noopener"
            >
              FAQ guide
            </Link>{' '}
            to learn more about how it works and the applied restrictions.
          </Trans>
        </Warning>
      )}

      {Object.keys(emodeCategories).length > 2 && (
        <EmodeSelect
          emodeCategories={emodeCategories}
          selectedEmode={selectedEmode?.id || 0}
          setSelectedEmode={setSelectedEmode}
          baseAssetSymbol={currentNetworkConfig.baseAssetSymbol}
          userEmode={user.userEmodeCategoryId}
        />
      )}

      {blockingError !== undefined && <Blocked />}

      <TxModalDetails gasLimit={gasLimit}>
        <Row caption={<Trans>New E-Mode category</Trans>} captionVariant="description" mb={4}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <SvgIcon sx={{ fontSize: '12px', mr: 0.5 }}>
              <LightningBoltGradient />
            </SvgIcon>
            <Typography variant="subheader1">
              {selectedEmode && selectedEmode.id !== 0 ? (
                getEmodeMessage(selectedEmode.id, currentNetworkConfig.baseAssetSymbol)
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

      {txError && <GasEstimationError txError={txError} />}

      <EmodeActions
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        selectedEmode={selectedEmode?.id || 0}
        activeEmode={user.userEmodeCategoryId}
      />
    </>
  );
};
