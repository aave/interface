import { formatUserSummary, valueToBigNumber } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Plural, Trans } from '@lingui/macro';
import {
  Box,
  Collapse,
  Divider,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { EmodeCategory } from 'src/helpers/types';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { replaceUnderscoresWithSpaces } from 'src/utils/utils';
import { useShallow } from 'zustand/shallow';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { EmodeActions } from './EmodeActions';
import { EmodeAssetTable } from './EmodeAssetTable';

export enum ErrorType {
  EMODE_DISABLED_LIQUIDATION,
  CLOSE_POSITIONS_BEFORE_SWITCHING,
  ZERO_LTV_COLLATERAL_BLOCKING,
}

export type EModeCategoryDisplay = EmodeCategory & {
  available: boolean;
  blockReason: EModeCategoryBlockReason;
};

export type EModeCategoryBlockReason = {
  incompatibleBorrows: string[];
  zeroLtvCollateral: string[];
};

// Checks why an E-Mode category is unavailable for the user
function getEModeCategoryBlockReason(
  user: ExtendedFormattedUser,
  eMode: EmodeCategory,
  reservesByAddress: Map<string, ComputedReserveData>
): EModeCategoryBlockReason {
  const incompatibleBorrows: string[] = [];
  const zeroLtvCollateral: string[] = [];

  // Check 1: Incompatible borrows
  const borrowableReserves = new Set(
    eMode.assets.filter((asset) => asset.borrowable).map((asset) => asset.underlyingAsset)
  );

  for (const userReserve of user.userReservesData) {
    if (
      valueToBigNumber(userReserve.scaledVariableDebt).gt(0) &&
      !borrowableReserves.has(userReserve.reserve.underlyingAsset)
    ) {
      incompatibleBorrows.push(userReserve.reserve.symbol);
    }
  }

  // Check 2: Collateral with 0 LTV in target category
  for (const userReserve of user.userReservesData) {
    if (!userReserve.usageAsCollateralEnabledOnUser) continue;

    const reserve = reservesByAddress.get(userReserve.reserve.underlyingAsset);
    if (!reserve) continue;

    const reserveTargetEmode = reserve.eModes.find((e) => e.id === eMode.id);

    if (
      reserveTargetEmode &&
      reserveTargetEmode.collateralEnabled &&
      reserveTargetEmode.ltvzeroEnabled
    ) {
      zeroLtvCollateral.push(reserve.symbol);
    } else if (!reserveTargetEmode || !reserveTargetEmode.collateralEnabled) {
      if (Number(reserve.baseLTVasCollateral) === 0) {
        zeroLtvCollateral.push(reserve.symbol);
      }
    }
  }

  return { incompatibleBorrows, zeroLtvCollateral };
}

function isEModeCategoryAvailable(blockReason: EModeCategoryBlockReason): boolean {
  return blockReason.incompatibleBorrows.length === 0 && blockReason.zeroLtvCollateral.length === 0;
}

export const EmodeModalContent = ({ user }: { user: ExtendedFormattedUser }) => {
  const {
    reserves,
    eModes,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
    userReserves,
  } = useAppDataContext();
  const [currentChainId, currentMarket] = useRootStore(
    useShallow((store) => [store.currentChainId, store.currentMarket])
  );
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const currentTimestamp = useCurrentTimestamp(1);
  const { gasLimit, mainTxState: emodeTxState, txError } = useModalContext();
  const [disableEmode, setDisableEmode] = useState(false);

  const reservesByAddress = new Map(reserves.map((r) => [r.underlyingAsset, r]));

  const eModeCategories: Record<number, EModeCategoryDisplay> = Object.fromEntries(
    Object.entries(eModes).map(([key, value]) => {
      const blockReason = getEModeCategoryBlockReason(user, value, reservesByAddress);
      return [
        key,
        {
          ...value,
          available: isEModeCategoryAvailable(blockReason),
          blockReason,
        },
      ];
    })
  );

  // For Horizon markets, use the next available category after [1]
  // For all other markets, use eModeCategories[1] (eth correlanted) as default when user has no eMode enabled (userEmodeCategoryId === 0)
  const getDefaultEModeCategory = () => {
    if (user.userEmodeCategoryId !== 0) {
      return eModeCategories[user.userEmodeCategoryId];
    }

    const isHorizonMarket =
      currentMarket.includes('proto_horizon_v3') ||
      currentMarket.includes('fork_proto_horizon_v3') ||
      currentMarket.includes('proto_sepolia_horizon_v3');

    if (isHorizonMarket) {
      // Find the next available category after [1], excluding USYC GHO
      // TODO: Add USYC when its available
      const availableCategories = Object.values(eModeCategories)
        .filter((emode) => emode.id !== 0 && emode.id !== 1 && emode.label !== 'USYC GHO')
        .sort((a, b) => a.id - b.id);

      return availableCategories.length > 0 ? availableCategories[0] : eModeCategories[1];
    }

    return eModeCategories[1];
  };

  const [selectedEmode, setSelectedEmode] = useState<EModeCategoryDisplay>(
    getDefaultEModeCategory()
  );
  const networkConfig = getNetworkConfig(currentChainId);

  // calcs
  const newSummary = formatUserSummary({
    currentTimestamp,
    userReserves: userReserves,
    formattedReserves: reserves,
    userEmodeCategoryId: disableEmode ? 0 : selectedEmode.id,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
  });

  // Check for collateral assets with LTV=0 outside of e-mode that would block exit.
  // The contract checks getUserReserveLtv with target category=0, which always returns base LTV.
  // So any collateral with baseLTVasCollateral=0 will cause the exit tx to revert.
  const zeroLtvCollateralSymbols = user.userReservesData
    .filter(
      (userReserve) =>
        valueToBigNumber(userReserve.scaledATokenBalance).gt(0) &&
        userReserve.reserve.baseLTVasCollateral === '0' &&
        userReserve.usageAsCollateralEnabledOnUser
    )
    .map((r) => r.reserve.symbol);

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  if (user.isInEmode && disableEmode) {
    if (zeroLtvCollateralSymbols.length > 0) {
      blockingError = ErrorType.ZERO_LTV_COLLATERAL_BLOCKING;
    } else if (Number(newSummary.healthFactor) < 1.01 && newSummary.healthFactor !== '-1') {
      blockingError = ErrorType.EMODE_DISABLED_LIQUIDATION;
    }
  } else if (!disableEmode && !selectedEmode.available) {
    blockingError = ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING;
  }

  const Blocked: React.FC = () => {
    switch (blockingError) {
      case ErrorType.ZERO_LTV_COLLATERAL_BLOCKING:
        return (
          <Warning severity="info" sx={{ mt: 6, alignItems: 'center' }}>
            <Typography variant="subheader1">
              <Trans>Cannot disable E-Mode</Trans>
            </Typography>
            <Typography variant="caption">
              <Trans>
                You must disable {zeroLtvCollateralSymbols.join(', ')} as collateral before exiting
                E-Mode. These assets have 0 LTV outside of E-Mode and cannot be used as collateral.
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
                You can not disable E-Mode because that could cause liquidation. To exit E-Mode
                supply or repay borrowed positions.
              </Trans>
            </Typography>
          </Warning>
        );
      case ErrorType.CLOSE_POSITIONS_BEFORE_SWITCHING: {
        const { incompatibleBorrows, zeroLtvCollateral } = selectedEmode.blockReason;
        return (
          <Warning severity="info" sx={{ mt: 6, alignItems: 'center' }}>
            <Typography variant="subheader1">
              <Trans>Cannot switch to this category</Trans>
            </Typography>
            {incompatibleBorrows.length > 0 && (
              <Typography variant="caption">
                <Trans>
                  Repay your {incompatibleBorrows.join(', ')}{' '}
                  <Plural value={incompatibleBorrows.length} one="borrow" other="borrows" /> to use
                  this category.
                </Trans>
              </Typography>
            )}
            {zeroLtvCollateral.length > 0 && (
              <Typography variant="caption">
                <Trans>
                  Disable {zeroLtvCollateral.join(', ')} as collateral to use this category. These
                  assets would have 0% LTV.
                </Trans>
              </Typography>
            )}
          </Warning>
        );
      }
      default:
        return null;
    }
  };

  // is Network mismatched
  const isWrongNetwork: boolean = currentChainId !== connectedChainId;

  const ArrowRight: React.FC = () => (
    <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
      <ArrowNarrowRightIcon />
    </SvgIcon>
  );

  // Shown only if the user is disabling eMode, is not blocked from disabling, and has a health factor that is decreasing
  // HF will never decrease on enable or switch because all borrow positions must initially be in the eMode category
  const showLiquidationRiskWarning: boolean =
    user.userEmodeCategoryId !== 0 &&
    disableEmode &&
    blockingError === undefined &&
    Number(newSummary.healthFactor).toFixed(3) < Number(user.healthFactor).toFixed(3); // Comparing without rounding causes stuttering, HFs update asyncronously

  // Shown only if the user has a collateral asset which is changing in LTV
  const showLTVChange =
    user.currentLoanToValue !== '0' &&
    Number(newSummary.currentLoanToValue).toFixed(3) !== Number(user.currentLoanToValue).toFixed(3); // Comparing without rounding causes stuttering, LTVs update asyncronously

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (emodeTxState.success) return <TxSuccessView action={<Trans>Emode</Trans>} />;

  function selectEMode(id: number) {
    const emode = eModeCategories[id];
    if (!emode) {
      throw new Error(`EMode with id ${id} not found`);
    }

    setSelectedEmode(emode);
  }

  return (
    <>
      <TxModalTitle title={<Trans>Manage E-Mode</Trans>} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={networkConfig.name}
          chainId={currentChainId}
        />
      )}

      <Typography variant="caption">
        <Trans>
          Enabling E-Mode allows you to maximize your borrowing power, however, borrowing is
          restricted to assets within the selected category.{' '}
          <Link
            sx={{ textDecoration: 'underline' }}
            variant="caption"
            href="https://aave.com/help/borrowing/e-mode"
            target="_blank"
            rel="noopener"
          >
            Learn more
          </Link>{' '}
          about how it works and the applied restrictions.
        </Trans>
      </Typography>

      {blockingError !== undefined && <Blocked />}
      {showLiquidationRiskWarning && (
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
        {user.userEmodeCategoryId !== 0 && (
          <Row caption={<Trans>Disable E-Mode</Trans>} captionVariant="description" mb={4}>
            <Switch
              disableRipple
              checked={disableEmode}
              onClick={() => setDisableEmode(!disableEmode)}
            />
          </Row>
        )}
        <Collapse in={disableEmode}>
          <Row
            captionVariant="description"
            my={2}
            caption={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
          >
            <Stack direction="row">
              {showLTVChange && (
                <>
                  <FormattedNumber
                    percent
                    visibleDecimals={2}
                    value={user.currentLoanToValue}
                    variant="secondary12"
                  />
                  <ArrowRight />
                </>
              )}
              <FormattedNumber
                percent
                visibleDecimals={2}
                value={newSummary.currentLoanToValue}
                variant="secondary12"
              />
            </Stack>
          </Row>
          <DetailsHFLine
            visibleHfChange={!!selectedEmode}
            healthFactor={user.healthFactor}
            futureHealthFactor={newSummary.healthFactor}
          />
        </Collapse>

        <Collapse in={!disableEmode}>
          <Box>
            <Stack direction="column">
              <Typography mb={1} variant="caption" color="text.secondary">
                <Trans>Asset category</Trans>
              </Typography>
              <Select
                sx={{
                  mb: 3,
                  width: '100%',
                  height: '44px',
                  borderRadius: '6px',
                  borderColor: 'divider',
                  outline: 'none !important',
                  color: 'text.primary',
                  '.MuiOutlinedInput-input': {
                    backgroundColor: 'transparent',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline, .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                    outline: 'none !important',
                    borderWidth: '1px',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider',
                    borderWidth: '1px',
                  },
                  '.MuiSelect-icon': { color: 'text.primary' },
                }}
                value={selectedEmode.id}
                onChange={(e) => selectEMode(Number(e.target.value))}
              >
                {Object.values(eModeCategories)
                  .filter((emode) => emode.id !== 0 && emode.label !== 'USYC GHO')
                  .sort((a, b) => {
                    if (a.available !== b.available) {
                      return a.available ? -1 : 1;
                    }

                    return a.id - b.id;
                  })
                  .map((emode) => (
                    <MenuItem key={emode.id} value={emode.id}>
                      <Stack sx={{ width: '100%' }} direction="row" justifyContent="space-between">
                        <Typography
                          sx={{ opacity: emode.available ? 1 : 0.5 }}
                          fontStyle={emode.available ? 'normal' : 'italic'}
                        >
                          {replaceUnderscoresWithSpaces(emode.label)}
                        </Typography>
                        {emode.id === user.userEmodeCategoryId && (
                          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                bgcolor: 'success.main',
                                boxShadow:
                                  '0px 2px 1px rgba(0, 0, 0, 0.05), 0px 0px 1px rgba(0, 0, 0, 0.25)',
                                mr: '5px',
                              }}
                            />
                            <Typography variant="subheader2" color="success.main">
                              <Trans>Enabled</Trans>
                            </Typography>
                          </Box>
                        )}
                        {!emode.available && (
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            <Trans>Unavailable</Trans>
                          </Typography>
                        )}
                      </Stack>
                    </MenuItem>
                  ))}
              </Select>
            </Stack>
            <Divider />
            <Row
              captionVariant="description"
              my={2}
              caption={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
            >
              <Stack direction="row">
                {showLTVChange && (
                  <>
                    <FormattedNumber
                      percent
                      visibleDecimals={2}
                      value={user.currentLoanToValue}
                      variant="secondary12"
                    />
                    <ArrowRight />
                  </>
                )}
                <FormattedNumber
                  percent
                  visibleDecimals={2}
                  value={Number(selectedEmode.ltv) / 10000}
                  variant="secondary12"
                />
              </Stack>
            </Row>

            <DetailsHFLine
              visibleHfChange={selectedEmode.id !== user.userEmodeCategoryId}
              healthFactor={user.healthFactor}
              futureHealthFactor={newSummary.healthFactor}
            />

            <EmodeAssetTable assets={selectedEmode.assets} />
          </Box>
        </Collapse>
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {disableEmode ? (
        <EmodeActions
          isWrongNetwork={isWrongNetwork}
          blocked={blockingError !== undefined}
          selectedEmode={0}
          activeEmode={user.userEmodeCategoryId}
          eModes={eModeCategories}
        />
      ) : (
        <EmodeActions
          isWrongNetwork={isWrongNetwork}
          blocked={
            blockingError !== undefined ||
            !selectedEmode.available ||
            selectedEmode.id === user.userEmodeCategoryId
          }
          selectedEmode={disableEmode ? 0 : selectedEmode.id}
          activeEmode={user.userEmodeCategoryId}
          eModes={eModeCategories}
        />
      )}
    </>
  );
};
