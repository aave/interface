import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { PanelRow, PanelTitle } from './ReservePanels';

type ReserverEModePanelProps = {
  reserve: ComputedReserveData;
};

export const ReserveEModePanel: React.FC<ReserverEModePanelProps> = ({ reserve }) => {
  return (
    <PanelRow>
      <PanelTitle>E-Mode info</PanelTitle>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <Typography variant="secondary14" color="text.secondary">
            <Trans>E-Mode Category</Trans>
          </Typography>
          <SvgIcon sx={{ fontSize: '14px', mr: 0.5, ml: 2 }}>
            <LightningBoltGradient />
          </SvgIcon>
          <Typography variant="subheader1">{getEmodeMessage(reserve.eModeLabel)}</Typography>
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
              value={reserve.formattedEModeLtv}
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
              value={reserve.formattedEModeLiquidationThreshold}
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
              value={reserve.formattedEModeLiquidationBonus}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>
        </Box>
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
            >
              Dashboard
            </Link>
            . To learn more about E-Mode and applied restrictions in{' '}
            <Link
              href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
            >
              FAQ
            </Link>{' '}
            or{' '}
            <Link
              href="https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf"
              sx={{ textDecoration: 'underline' }}
              variant="caption"
              color="text.secondary"
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
