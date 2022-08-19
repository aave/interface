import { formatUserSummary } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Link, SvgIcon, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
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

export enum EmodeModalType {
  ENABLE = 'Enable',
  DISABLE = 'Disable',
  SWITCH = 'Switch',
}

export interface EmodeModalContentProps {
  mode: EmodeModalType;
}

export const EmodeModalContent = ({ mode }: EmodeModalContentProps) => {
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

  const [selectedEmode, setSelectedEmode] = useState<EmodeCategory | undefined>(undefined);
  const [emodeCategories, setEmodeCategories] = useState<Record<number, EmodeCategory>>({});

  const networkConfig = getNetworkConfig(currentChainId);

  // Create object of available emodes
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

    emodeCategoriesArray.sort((a, b) => a.id - b.id);

    // Default values selected based on mode (enable, switch, disable), currently active eMode, and number of available modes
    const selectedEmode =
      mode === EmodeModalType.ENABLE
        ? emodeCategoriesArray.length >= 3
          ? undefined // Leave select blank
          : emodeCategoriesArray[1] // Only one option to enable
        : mode === EmodeModalType.SWITCH
        ? emodeCategoriesArray.length >= 4
          ? undefined // Leave select blank
          : user.userEmodeCategoryId === 1
          ? emodeCategoriesArray[2] // Only one option to switch to
          : emodeCategoriesArray[1] // Only one option to switch to
        : emodeCategoriesArray[0]; // Disabled

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
  } else if (selectedEmode && user.userEmodeCategoryId !== selectedEmode?.id) {
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
          <Warning severity="info" sx={{ mt: 6, alignItems: 'center' }}>
            <Typography variant="caption">
              <Trans>
                To enable E-mode for the{' '}
                {selectedEmode &&
                  getEmodeMessage(selectedEmode.id, currentNetworkConfig.baseAssetSymbol)}{' '}
                category, all borrow positions outside of this cateogry must be closed.
              </Trans>
            </Typography>
          </Warning>
        );
      case ErrorType.EMODE_DISABLED_LIQUIDATION:
        return (
          <Warning severity="error" sx={{ mt: 6, alignItems: 'center' }}>
            <Typography variant="subheader1" color="#4F1919">
              <Trans>Cannot disable E-Mode</Trans>
            </Typography>
            <Typography variant="caption">
              <Trans>
                You can not disable E-Mode as your current collateralization level is above 80%,
                disabling E-Mode can cause liquidation. To exit E-Mode supply or repay borrowed
                positions.
              </Trans>
            </Typography>
          </Warning>
        );
      default:
        return null;
    }
  };

  // The selector only shows if there are 2 options for the user, which happens when there are 3 emodeCategories (including disable) for mode.enable, and 4 emodeCategories in mode.switch
  const showModal =
    (Object.keys(emodeCategories).length >= 3 && mode === EmodeModalType.ENABLE) ||
    (Object.keys(emodeCategories).length >= 4 && mode === EmodeModalType.SWITCH);

  // is Network mismatched
  const isWrongNetwork = currentChainId !== connectedChainId;

  const ArrowRight: React.FC = () => (
    <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
      <ArrowNarrowRightIcon />
    </SvgIcon>
  );

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (emodeTxState.success) return <TxSuccessView action={<Trans>Emode</Trans>} />;
  return (
    <>
      <TxModalTitle title={`${mode} E-Mode`} />
      {isWrongNetwork && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      {user.userEmodeCategoryId === 0 && (
        <Warning severity="warning">
          <Typography variant="caption">
            <Trans>
              Enabling E-Mode only allows you to borrow assets belonging to the selected category.
              Please visit our{' '}
              <Link
                href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
                target="_blank"
                rel="noopener"
              >
                FAQ guide
              </Link>{' '}
              to learn more about how it works and the applied restrictions.
            </Trans>
          </Typography>
        </Warning>
      )}

      {showModal && (
        <EmodeSelect
          emodeCategories={emodeCategories}
          selectedEmode={selectedEmode?.id}
          setSelectedEmode={setSelectedEmode}
          baseAssetSymbol={currentNetworkConfig.baseAssetSymbol}
          userEmode={user.userEmodeCategoryId}
        />
      )}

      {blockingError === ErrorType.EMODE_DISABLED_LIQUIDATION && <Blocked />}
      {blockingError === undefined && selectedEmode && selectedEmode.id === 0 && (
        <Warning severity="error" sx={{ mt: 6, alignItems: 'center' }}>
          <Typography variant="subheader1" color="#4F1919">
            <Trans>Liquidation risk</Trans>
          </Typography>
          <Typography variant="caption">
            <Trans>
              This action will reduce your health factor. Please be mindful of the increased risk of
              collateral liquidation.{' '}
            </Trans>
          </Typography>
        </Warning>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        {!showModal && (
          <Row caption={<Trans>E-Mode category</Trans>} captionVariant="description" mb={4}>
            <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', mx: 1 }}>
                {user.userEmodeCategoryId !== 0 ? (
                  <>
                    <SvgIcon sx={{ fontSize: '12px' }}>
                      <LightningBoltGradient />
                    </SvgIcon>
                    <Typography variant="subheader1">
                      {getEmodeMessage(
                        user.userEmodeCategoryId,
                        currentNetworkConfig.baseAssetSymbol
                      )}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="subheader1">
                    <Trans>None</Trans>
                  </Typography>
                )}
              </Box>
              {selectedEmode && (
                <>
                  <ArrowRight />
                  <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    {selectedEmode.id !== 0 ? (
                      <>
                        <SvgIcon sx={{ fontSize: '12px', mr: 0.5 }}>
                          <LightningBoltGradient />
                        </SvgIcon>
                        <Typography variant="subheader1">
                          {getEmodeMessage(selectedEmode.id, currentNetworkConfig.baseAssetSymbol)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="subheader1">
                        <Trans>None</Trans>
                      </Typography>
                    )}
                  </Box>
                </>
              )}
            </Box>
          </Row>
        )}

        <Row
          caption={<Trans>Available assets</Trans>}
          captionVariant="description"
          mb={4}
          sx={{ alignContent: 'flex-end' }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'center' }}>
            {emodeCategories[user.userEmodeCategoryId] && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textAlign: 'end',
                }}
              >
                {user.userEmodeCategoryId !== 0 ? (
                  <Typography sx={{ textAlign: 'end' }}>
                    {emodeCategories[user.userEmodeCategoryId].assets.join(', ')}
                  </Typography>
                ) : (
                  <Typography>
                    <Trans>All Assets</Trans>
                  </Typography>
                )}
              </Box>
            )}
            {selectedEmode && (
              <>
                <ArrowRight />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textAlign: 'end',
                  }}
                >
                  {selectedEmode?.id !== 0 ? (
                    <Typography sx={{ textAlign: 'end' }}>
                      {selectedEmode.assets.join(', ')}
                    </Typography>
                  ) : (
                    <Typography>
                      <Trans>All Assets</Trans>
                    </Typography>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Row>
        <DetailsHFLine
          visibleHfChange={!!selectedEmode}
          healthFactor={user.healthFactor}
          futureHealthFactor={newSummary.healthFactor}
        />

        {user.currentLoanToValue !== '0' && (
          <Row
            caption={<Trans>Maximum loan to value</Trans>}
            captionVariant="description"
            mb={4}
            align="flex-start"
          >
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                <FormattedNumber
                  value={user.currentLoanToValue}
                  sx={{ color: 'text.primary' }}
                  visibleDecimals={2}
                  compact
                  percent
                  variant="secondary14"
                />

                {selectedEmode !== undefined && (
                  <>
                    <ArrowRight />
                    <FormattedNumber
                      value={newSummary.currentLoanToValue}
                      sx={{ color: 'text.primary' }}
                      visibleDecimals={2}
                      compact
                      percent
                      variant="secondary14"
                    />
                  </>
                )}
              </Box>
            </Box>
          </Row>
        )}
      </TxModalDetails>

      {blockingError === ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING && <Blocked />}

      {txError && <GasEstimationError txError={txError} />}

      <EmodeActions
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined || !selectedEmode}
        selectedEmode={selectedEmode?.id || 0}
        activeEmode={user.userEmodeCategoryId}
      />
    </>
  );
};
