import { formatUserSummary } from '@aave/math-utils';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Collapse,
  Divider,
  MenuItem,
  Select,
  Stack,
  SvgIcon,
  Switch,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { EmodeCategory } from 'src/helpers/types';
import {
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
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

export enum ErrorType {
  EMODE_DISABLED_LIQUIDATION,
  CLOSE_POSITIONS_BEFORE_SWITCHING,
}

export type EModeCategoryDisplay = EmodeCategory & {
  available: boolean; // indicates if the user can enter this category
};

// An E-Mode category is available if the user has no borrow positions outside of the category
function isEModeCategoryAvailable(user: ExtendedFormattedUser, eMode: EmodeCategory): boolean {
  const borrowableReserves = eMode.assets
    .filter((asset) => asset.borrowable)
    .map((asset) => asset.underlyingAsset);

  const hasIncompatiblePositions = user.userReservesData.some(
    (userReserve) =>
      Number(userReserve.scaledVariableDebt) > 0 &&
      !borrowableReserves.includes(userReserve.reserve.underlyingAsset)
  );

  return !hasIncompatiblePositions;
}

export const EmodeModalContent = ({ user }: { user: ExtendedFormattedUser }) => {
  const {
    reserves,
    eModes,
    marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd,
    userReserves,
  } = useAppDataContext();
  const { currentChainId } = useProtocolDataContext();
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const currentTimestamp = useCurrentTimestamp(1);
  const { gasLimit, mainTxState: emodeTxState, txError } = useModalContext();
  const [disableEmode, setDisableEmode] = useState(false);

  const eModeCategories: Record<number, EModeCategoryDisplay> = Object.fromEntries(
    Object.entries(eModes).map(([key, value]) => [
      key,
      {
        ...value,
        available: isEModeCategoryAvailable(user, value),
      },
    ])
  );

  const [selectedEmode, setSelectedEmode] = useState<EModeCategoryDisplay>(
    user.userEmodeCategoryId === 0 ? eModeCategories[1] : eModeCategories[user.userEmodeCategoryId]
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

  // error handling
  let blockingError: ErrorType | undefined = undefined;
  // if user is disabling eMode
  if (user.isInEmode && disableEmode) {
    if (Number(newSummary.healthFactor) < 1.01 && newSummary.healthFactor !== '-1') {
      blockingError = ErrorType.EMODE_DISABLED_LIQUIDATION; // intl.formatMessage(messages.eModeDisabledLiquidation);
    }
  }

  const Blocked: React.FC = () => {
    switch (blockingError) {
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
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
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

      {blockingError === ErrorType.EMODE_DISABLED_LIQUIDATION && <Blocked />}
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
                  .filter((emode) => emode.id !== 0)
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
                          {emode.label}
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
            {!selectedEmode.available && (
              <Typography variant="caption" color="text.secondary" sx={{ mb: 3 }}>
                <Trans>
                  All borrow positions outside of this category must be closed to enable this
                  category.
                </Trans>
              </Typography>
            )}
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

            <TableContainer sx={{ maxHeight: '270px' }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow
                    sx={{
                      [`& .${tableCellClasses.root}`]: {
                        py: 2,
                        lineHeight: 0,
                      },
                    }}
                  >
                    <TableCell align="center" sx={{ pl: 0, width: '120px' }}>
                      <Typography variant="helperText">
                        <Trans>Asset</Trans>
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="helperText">
                        <Trans>Collateral</Trans>
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="helperText">
                        <Trans>Borrowable</Trans>
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ width: '100%' }}>
                  {selectedEmode.assets.map((asset, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        pt: 8,
                        [`& .${tableCellClasses.root}`]: {
                          borderBottom: 'none',
                          pt: 3,
                          pb: 2,
                        },
                      }}
                    >
                      <TableCell align="center" sx={{ py: 1 }}>
                        <Stack direction="row" gap={1} alignItems="center">
                          <TokenIcon symbol={asset.iconSymbol} sx={{ fontSize: '16px' }} />
                          <Typography variant="secondary12">{asset.symbol}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        {asset.collateral ? (
                          <CheckRoundedIcon fontSize="small" color="success" />
                        ) : (
                          <CloseIcon fontSize="small" color="error" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {asset.borrowable ? (
                          <CheckRoundedIcon fontSize="small" color="success" />
                        ) : (
                          <CloseIcon fontSize="small" color="error" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
