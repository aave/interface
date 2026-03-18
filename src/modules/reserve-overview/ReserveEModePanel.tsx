import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, SvgIcon, Tooltip, Typography } from '@mui/material';
import { Fragment } from 'react';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { GENERAL, RESERVE_DETAILS } from 'src/utils/events';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { PanelRow, PanelTitle } from './ReservePanels';

type ReserverEModePanelProps = {
  reserve: ReserveWithId;
};

export const ReserveEModePanel: React.FC<ReserverEModePanelProps> = ({ reserve }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <PanelRow>
      <PanelTitle>E-Mode info</PanelTitle>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
        {reserve.eModeInfo?.map((e) => (
          <Fragment key={e.label}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <SvgIcon sx={{ fontSize: '14px', mr: 0.5, ml: 2 }}>
                <LightningBoltGradient />
              </SvgIcon>
              <Typography variant="subheader1">{e.label}</Typography>
              <ConfigStatus
                enabled={e.canBeCollateral}
                label="Collateral"
                warning={e.canBeCollateral && e.hasLtvZero}
              />
              <ConfigStatus enabled={e.canBeBorrowed} label="Borrowable" />
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                pt: '12px',
              }}
            >
              <ReserveOverviewBox
                title={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
              >
                <FormattedNumber
                  value={e.hasLtvZero ? 0 : e.maxLTV.value}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>
              <ReserveOverviewBox
                title={
                  <LiquidationThresholdTooltip
                    variant="description"
                    text={<Trans>Liquidation threshold</Trans>}
                  />
                }
              >
                <FormattedNumber
                  value={e.liquidationThreshold.value}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>
              <ReserveOverviewBox
                title={
                  <LiquidationPenaltyTooltip
                    variant="description"
                    text={<Trans>Liquidation penalty</Trans>}
                  />
                }
              >
                <FormattedNumber
                  value={e.liquidationPenalty.value}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>
            </Box>
          </Fragment>
        ))}

        <Typography variant="caption" color="text.secondary" paddingTop="24px">
          <Trans>
            E-Mode increases your LTV for a selected category of assets, meaning that when E-mode is
            enabled, you will have higher borrowing power over assets of the same E-mode category
            which are defined by Aave Governance. You can enter E-Mode from your{' '}
            <Link
              href={ROUTES.dashboard}
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
              onClick={() => {
                trackEvent(RESERVE_DETAILS.GO_DASHBOARD_EMODE);
              }}
            >
              Dashboard
            </Link>
            . To learn more about E-Mode and applied restrictions, see the{' '}
            <Link
              href="https://aave.com/help/borrowing/e-mode"
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
              onClick={() => {
                trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'E-mode FAQ' });
              }}
            >
              help guide
            </Link>{' '}
            or the{' '}
            <Link
              href="https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf"
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
              onClick={() => {
                trackEvent(GENERAL.EXTERNAL_LINK, { Link: 'V3 Tech Paper' });
              }}
            >
              Aave V3 Technical Paper
            </Link>
            .
          </Trans>
        </Typography>
      </Box>
    </PanelRow>
  );
};

export const ConfigStatus = ({
  enabled,
  label,
  warning,
  warningTooltip,
}: {
  enabled: boolean;
  label?: string;
  warning?: boolean;
  warningTooltip?: React.ReactNode;
}) => {
  const defaultWarningTooltip = (
    <Trans>
      This asset has 0% LTV, meaning it does not contribute to borrowing power. Existing positions
      with this asset as collateral still count toward the liquidation threshold and protect your
      health factor. New positions cannot enable this asset as collateral.
    </Trans>
  );

  return (
    <>
      {warning ? (
        <Tooltip title={warningTooltip || defaultWarningTooltip} arrow placement="top">
          <WarningAmberIcon fontSize="small" color="warning" sx={{ ml: 2, cursor: 'help' }} />
        </Tooltip>
      ) : enabled ? (
        <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
      ) : (
        <CloseIcon fontSize="small" color="error" sx={{ ml: 2 }} />
      )}
      {label && (
        <Typography
          variant="subheader1"
          sx={{ color: warning ? '#E8A838' : enabled ? '#46BC4B' : '#F24E4E' }}
        >
          <Trans>{label}</Trans>
        </Typography>
      )}
    </>
  );
};
