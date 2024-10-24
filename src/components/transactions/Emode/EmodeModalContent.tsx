import { formatUserSummary } from '@aave/math-utils';
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Divider,
  MenuItem,
  Paper,
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
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import {
  ExtendedFormattedUser,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { NewEModeCategory } from 'src/store/poolSelectors';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsHFLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { getEmodeMessage } from './EmodeNaming';
import { EmodeActions } from './EmodeActions';

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

interface EModeCategoryData {
  ltv: string;
  liquidationThreshold: string;
  liquidationBonus: string;
  collateralBitmap: string;
  label: string;
  borrowableBitmap: string;
}

interface FormattedEModeCategory extends EModeCategoryData {
  formattedLtv: string;
  formattedLiquidationThreshold: string;
  formattedLiquidationBonus: string;
}

export interface ReserveEmode {
  id: number;
  collateralEnabled: boolean;
  borrowingEnabled: boolean;
  eMode: FormattedEModeCategory;
}

export const EmodeModalContent = ({
  mode,
  user,
}: EmodeModalContentProps & { user: ExtendedFormattedUser }) => {
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
  const [exitEmode, setExitEmode] = useState(false);

  const [selectedEmode, setSelectedEmode] = useState<NewEModeCategory>(
    user.userEmodeCategoryId === 0 ? eModes[1] : eModes[user.userEmodeCategoryId]
  );
  const networkConfig = getNetworkConfig(currentChainId);

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
    const hasIncompatiblePositions = false; // TODO
    // check if user has open positions different than future emode
    // const hasIncompatiblePositions = user.userReservesData.some(
    //   (userReserve) =>
    //     Number(userReserve.scaledVariableDebt) > 0 &&
    //     userReserve.reserve.eModeCategoryId !== selectedEmode?.id
    // );
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
                To enable E-mode for the {selectedEmode && getEmodeMessage(selectedEmode.label)}{' '}
                category, all borrow positions outside of this category must be closed.
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
    !!selectedEmode &&
    selectedEmode.id === 0 &&
    blockingError === undefined &&
    Number(newSummary.healthFactor).toFixed(3) < Number(user.healthFactor).toFixed(3); // Comparing without rounding causes stuttering, HFs update asyncronously

  // Shown only if the user has a collateral asset which is changing in LTV
  const showMaxLTVRow =
    user.currentLoanToValue !== '0' &&
    Number(newSummary.currentLoanToValue).toFixed(3) != Number(user.currentLoanToValue).toFixed(3); // Comparing without rounding causes stuttering, LTVs update asyncronously

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (emodeTxState.success) return <TxSuccessView action={<Trans>Emode</Trans>} />;

  function selectEMode(id: number) {
    const emode = eModes[id];
    if (!emode) {
      throw new Error(`EMode with id ${id} not found`);
    }

    setSelectedEmode(emode);
  }

  return (
    <>
      <TxModalTitle title={`${mode} E-Mode`} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={currentChainId} />
      )}

      <Typography variant="caption">
        <Trans>
          Enabling E-Mode allows you to maximize your borrowing power, however, borrowing is
          restricted to assets within the selected category. Please visit our{' '}
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
          <Row caption={<Trans>Exit E-Mode</Trans>} captionVariant="description" mb={4}>
            <Switch disableRipple checked={exitEmode} onClick={() => setExitEmode(!exitEmode)} />
          </Row>
        )}
        <Box sx={exitEmode ? { opacity: 0.5, pointerEvents: 'none' } : null}>
          <Row caption={<Trans>Category</Trans>} captionVariant="description" mb={4}>
            <Select
              value={selectedEmode.id}
              onChange={(e) => selectEMode(Number(e.target.value))}
              sx={{ maxWidth: '270px' }}
            >
              {Object.values(eModes)
                .filter((emode) => emode.id !== 0)
                .sort((a, b) => {
                  // TODO: determine if user is able to enter this category
                  // if (a.available !== b.available) {
                  //   return a.available ? -1 : 1;
                  // }

                  return a.id - b.id;
                })
                .map((emode) => (
                  <MenuItem key={emode.id} value={emode.id} sx={{ maxWidth: '270px' }}>
                    <Typography
                      sx={{ opacity: true ? 1 : 0.5 }}
                      fontStyle={true ? 'normal' : 'italic'}
                    >
                      {emode.label} {emode.id === user.userEmodeCategoryId && '(current)'}
                    </Typography>
                  </MenuItem>
                ))}
            </Select>
          </Row>
          {!true && (
            <Typography variant="caption" sx={{ mb: 3 }}>
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
            <FormattedNumber percent value={selectedEmode.ltv} variant="secondary12" />
          </Row>
          <Row
            captionVariant="description"
            mb={2}
            caption={
              <LiquidationThresholdTooltip
                variant="description"
                text={<Trans>Liquidation threshold</Trans>}
              />
            }
          >
            <FormattedNumber
              percent
              value={selectedEmode.liquidationThreshold}
              variant="secondary12"
            />
          </Row>

          <TableContainer component={Paper}>
            <Table size="small">
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
                        <TokenIcon symbol={asset.symbol} sx={{ fontSize: '16px' }} />
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
        <DetailsHFLine
          visibleHfChange={!!selectedEmode}
          healthFactor={user.healthFactor}
          futureHealthFactor={newSummary.healthFactor}
        />

        {showMaxLTVRow && (
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
        eModes={eModes}
      />
    </>
  );
};
