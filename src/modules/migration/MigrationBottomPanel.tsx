import { valueToBigNumber } from '@aave/math-utils';
import { ExclamationIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { ArrowDownward } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { IsolationModeWarning } from 'src/components/transactions/Warnings/IsolationModeWarning';
import { UserSummaryAfterMigration } from 'src/hooks/migration/useUserSummaryAfterMigration';
import { UserSummaryAndIncentives } from 'src/hooks/pool/useUserSummaryAndIncentives';
import { useModalContext } from 'src/hooks/useModal';
import { MarketDataType } from 'src/ui-config/marketsConfig';

import { MigrationMarketCard, SelectableMarkets } from './MigrationMarketCard';

interface MigrationBottomPanelProps {
  disableButton?: boolean;
  loading?: boolean;
  enteringIsolationMode: boolean;
  fromMarketData: MarketDataType;
  toMarketData: MarketDataType;
  userSummaryAfterMigration: UserSummaryAfterMigration;
  userSummaryBeforeMigration: {
    fromUserSummaryBeforeMigration: UserSummaryAndIncentives;
    toUserSummaryBeforeMigration: UserSummaryAndIncentives;
  };
  setFromMarketData: (marketData: MarketDataType) => void;
  selectableMarkets: SelectableMarkets;
}

enum ErrorType {
  NO_SELECTION,
  V2_HF_TOO_LOW,
  V3_HF_TOO_LOW,
  INSUFFICIENT_LTV,
}

export const MigrationBottomPanel = ({
  disableButton,
  enteringIsolationMode,
  fromMarketData,
  toMarketData,
  userSummaryAfterMigration,
  userSummaryBeforeMigration,
  setFromMarketData,
  selectableMarkets,
}: MigrationBottomPanelProps) => {
  const { openV3Migration } = useModalContext();
  const [isChecked, setIsChecked] = useState(false);

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    totalCollateralMarketReferenceCurrency,
    totalBorrowsMarketReferenceCurrency,
    currentLoanToValue,
  } = userSummaryAfterMigration.toUserSummaryAfterMigration;

  const maxBorrowAmount = valueToBigNumber(totalCollateralMarketReferenceCurrency).multipliedBy(
    currentLoanToValue
  );

  const insufficientLtv = valueToBigNumber(totalBorrowsMarketReferenceCurrency).isGreaterThan(
    maxBorrowAmount
  );

  // error types handling
  let blockingError: ErrorType | undefined = undefined;
  if (disableButton && isChecked) {
    blockingError = ErrorType.NO_SELECTION;
  } else if (
    Number(userSummaryAfterMigration.fromUserSummaryAfterMigration.healthFactor) < 1.005 &&
    userSummaryAfterMigration.fromUserSummaryAfterMigration.healthFactor !== '-1'
  ) {
    blockingError = ErrorType.V2_HF_TOO_LOW;
  } else if (
    Number(userSummaryAfterMigration.toUserSummaryAfterMigration.healthFactor) < 1.005 &&
    userSummaryAfterMigration.toUserSummaryAfterMigration.healthFactor !== '-1'
  ) {
    blockingError = ErrorType.V3_HF_TOO_LOW;
  } else if (insufficientLtv) {
    blockingError = ErrorType.INSUFFICIENT_LTV;
  }

  // error render handling
  const Blocked = () => {
    switch (blockingError) {
      case ErrorType.NO_SELECTION:
        return <Trans>No assets selected to migrate.</Trans>;
      case ErrorType.V2_HF_TOO_LOW:
        return (
          <Trans>
            This action will reduce V2 health factor below liquidation threshold. retain collateral
            or migrate borrow position to continue.
          </Trans>
        );
      case ErrorType.V3_HF_TOO_LOW:
        return (
          <>
            <Trans>
              This action will reduce health factor of V3 below liquidation threshold. Increase
              migrated collateral or reduce migrated borrow to continue.
            </Trans>
          </>
        );
      case ErrorType.INSUFFICIENT_LTV:
        return (
          <Trans>
            The loan to value of the migrated positions would cause liquidation. Increase migrated
            collateral or reduce migrated borrow to continue.
          </Trans>
        );
      default:
        return <></>;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: { xs: '100%', lg: '40%' },
      }}
    >
      <Paper
        sx={{
          p: {
            xs: '16px 24px 24px 24px',
          },
          mb: { xs: 6, md: 0 },
        }}
      >
        <Row caption={<Trans>Migrate your assets</Trans>} captionVariant="h3" sx={{ mb: 6 }} />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 2,
            mb: 12,
            position: 'relative',
            alignItems: 'center',
          }}
        >
          <MigrationMarketCard
            marketData={fromMarketData}
            userSummaryBeforeMigration={userSummaryBeforeMigration.fromUserSummaryBeforeMigration}
            userSummaryAfterMigration={userSummaryAfterMigration.fromUserSummaryAfterMigration}
            selectableMarkets={selectableMarkets}
            setFromMarketData={setFromMarketData}
          />
          <Box
            border={1}
            borderColor="divider"
            bgcolor="background.paper"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              borderRadius: '12px',
              width: 36,
              height: 36,
            }}
          >
            <ArrowDownward />
          </Box>
          <MigrationMarketCard
            marketData={toMarketData}
            userSummaryBeforeMigration={userSummaryBeforeMigration.toUserSummaryBeforeMigration}
            userSummaryAfterMigration={userSummaryAfterMigration.toUserSummaryAfterMigration}
          />
        </Box>

        {blockingError !== undefined && (
          <Warning severity="warning">
            <Blocked />
          </Warning>
        )}

        {enteringIsolationMode && <IsolationModeWarning severity="warning" />}

        {blockingError === undefined && (
          <Box
            sx={{
              height: '44px',
              backgroundColor: 'background.surface',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'center',
              mb: 4,
            }}
            data-cy={`migration-risk-checkbox`}
          >
            <FormControlLabel
              sx={{ margin: 0 }}
              control={
                <Checkbox
                  checked={isChecked}
                  onChange={() => setIsChecked(!isChecked)}
                  size="small"
                />
              }
              label={
                <Typography variant="description" sx={{ position: 'relative', top: 1 }}>
                  <Trans>I fully understand the risks of migrating.</Trans>
                </Typography>
              }
            />
          </Box>
        )}

        <Box>
          <Button
            onClick={openV3Migration}
            disabled={!isChecked || blockingError !== undefined}
            sx={{ width: '100%', height: '44px' }}
            variant={!isChecked || blockingError !== undefined ? 'contained' : 'gradient'}
            size="medium"
            data-cy={`migration-button`}
          >
            <Trans>Preview tx and migrate</Trans>
          </Button>
        </Box>
        <Box
          sx={{
            p: downToSM ? '20px 16px' : '20px 30px',
            mt: downToSM ? 4 : 0,
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: { xs: 4, lg: 6 }, display: 'flex', alignItems: 'center' }}
          >
            <SvgIcon sx={{ fontSize: '24px', color: 'warning.main', mr: 2 }}>
              <ExclamationIcon />
            </SvgIcon>
            <Trans>Migration risks</Trans>
          </Typography>
          <Typography sx={{ mb: { xs: 3, lg: 4 } }}>
            <Trans>
              Please always be aware of your <b>Health Factor (HF)</b> when partially migrating a
              position and that your rates will be updated to V3 rates.
            </Trans>
          </Typography>
          <Typography sx={{ mb: { xs: 3, lg: 4 } }}>
            <Trans>
              Migrating multiple collaterals and borrowed assets at the same time can be an
              expensive operation and might fail in certain situations.
              <b>
                Therefore it’s not recommended to migrate positions with more than 5 assets
                (deposited + borrowed) at the same time.
              </b>
            </Trans>
          </Typography>
          <Typography sx={{ mb: { xs: 4, lg: 6 } }}>
            <Trans>Be mindful of the network congestion and gas prices.</Trans>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
