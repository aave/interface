import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseIcon from '@mui/icons-material/Close';
import { Box, SvgIcon, Typography } from '@mui/material';
import { Fragment } from 'react';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { GENERAL, RESERVE_DETAILS } from 'src/utils/mixPanelEvents';

import LightningBoltGradient from '/public/lightningBoltGradient.svg';

import { PanelRow, PanelTitle } from './ReservePanels';

type ReserverEModePanelProps = {
  reserve: ComputedReserveData;
};

export const ReserveEModePanel: React.FC<ReserverEModePanelProps> = ({ reserve }) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <PanelRow>
      <PanelTitle>E-Mode info</PanelTitle>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
        {reserve.eModes.map((e) => (
          <Fragment key={e.id}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <SvgIcon sx={{ fontSize: '14px', mr: 0.5, ml: 2 }}>
                <LightningBoltGradient />
              </SvgIcon>
              <Typography variant="subheader1">{getEmodeMessage(e.eMode.label)}</Typography>
              <ConfigStatus enabled={e.collateralEnabled} label="Collateral" />
              <ConfigStatus enabled={e.borrowingEnabled} label="Borrowable" />
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
                  value={e.eMode.formattedLtv}
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
                  value={e.eMode.formattedLiquidationThreshold}
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
                  value={e.eMode.formattedLiquidationBonus}
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
            . To learn more about E-Mode and applied restrictionn, see the{' '}
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

const ConfigStatus = ({ enabled, label }: { enabled: boolean; label: string }) => {
  return (
    <>
      {enabled ? (
        <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
      ) : (
        <CloseIcon fontSize="small" color="error" sx={{ ml: 2 }} />
      )}
      <Typography variant="subheader1" sx={{ color: enabled ? '#46BC4B' : '#F24E4E' }}>
        <Trans>{label}</Trans>
      </Typography>
    </>
  );
};
