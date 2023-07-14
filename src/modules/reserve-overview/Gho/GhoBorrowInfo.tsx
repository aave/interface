import { FormattedGhoReserveData } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { FixedAPYTooltip } from 'src/components/infoTooltips/FixedAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { PanelItem } from '../ReservePanels';

export const GhoBorrowInfo = ({ reserve }: { reserve: ComputedReserveData }) => {
  const { ghoReserveData } = useAppDataContext();
  const { breakpoints } = useTheme();
  const desktopScreens = useMediaQuery(breakpoints.up('sm'));

  if (desktopScreens) {
    return <GhoBorrowInfoDesktop reserve={reserve} ghoReserveData={ghoReserveData} />;
  } else {
    return <GhoBorrowInfoMobile reserve={reserve} ghoReserveData={ghoReserveData} />;
  }
};

interface GhoBorrowInfoProps {
  reserve: ComputedReserveData;
  ghoReserveData: FormattedGhoReserveData;
}

const GhoBorrowInfoDesktop = ({ reserve, ghoReserveData }: GhoBorrowInfoProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Stack direction="row">
      <CapsCircularStatus
        value={ghoReserveData.aaveFacilitatorMintedPercent * 100}
        onClick={(open) => {
          if (open) {
            trackEvent(GENERAL.TOOL_TIP, {
              tooltip: 'Total GHO borrowed',
            });
          }
        }}
        tooltipContent={
          <>
            <Trans>
              Maximum amount available to borrow is{' '}
              <FormattedNumber
                value={ghoReserveData.aaveFacilitatorRemainingCapacity}
                variant="secondary12"
              />{' '}
              {reserve.symbol} (
              <FormattedNumber
                value={ghoReserveData.aaveFacilitatorRemainingCapacity}
                variant="secondary12"
                symbol="USD"
              />
              ).
            </Trans>
          </>
        }
      />
      <PanelItem
        title={
          <Box display="flex" alignItems="center">
            <Trans>Total borrowed</Trans>
          </Box>
        }
      >
        <Box>
          <FormattedNumber
            value={ghoReserveData.aaveFacilitatorBucketLevel}
            variant="main16"
            compact
          />
          <Typography
            component="span"
            color="text.primary"
            variant="secondary16"
            sx={{ display: 'inline-block', mx: 1 }}
          >
            <Trans>of</Trans>
          </Typography>
          <FormattedNumber
            value={ghoReserveData.aaveFacilitatorBucketMaxCapacity}
            variant="main16"
          />
        </Box>
        <Box>
          <ReserveSubheader value={ghoReserveData.aaveFacilitatorBucketLevel.toString()} />
          <Typography
            component="span"
            color="text.secondary"
            variant="secondary12"
            sx={{ display: 'inline-block', mx: 1 }}
          >
            <Trans>of</Trans>
          </Typography>
          <ReserveSubheader value={ghoReserveData.aaveFacilitatorBucketMaxCapacity.toString()} />
        </Box>
      </PanelItem>
      <Box mt={{ xs: 6, sm: 0 }}>
        <PanelItem title={<FixedAPYTooltip text={<Trans>APY, fixed rate</Trans>} />}>
          <FormattedNumber value={ghoReserveData.ghoVariableBorrowAPY} percent variant="main16" />
        </PanelItem>
      </Box>
    </Stack>
  );
};

const GhoBorrowInfoMobile = ({ reserve, ghoReserveData }: GhoBorrowInfoProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Stack direction="row" gap={3}>
      <Stack>
        <PanelItem
          title={
            <Box display="flex" alignItems="center">
              <Trans>Total borrowed</Trans>
            </Box>
          }
        >
          <Box>
            <FormattedNumber
              value={ghoReserveData.aaveFacilitatorBucketLevel}
              variant="main16"
              compact
            />
            <Typography
              component="span"
              color="text.primary"
              variant="secondary16"
              sx={{ display: 'inline-block', mx: 1 }}
            >
              <Trans>of</Trans>
            </Typography>
            <FormattedNumber
              value={ghoReserveData.aaveFacilitatorBucketMaxCapacity}
              variant="main16"
            />
          </Box>
          <Box>
            <ReserveSubheader value={ghoReserveData.aaveFacilitatorBucketLevel.toString()} />
            <Typography
              component="span"
              color="text.secondary"
              variant="secondary12"
              sx={{ display: 'inline-block', mx: 1 }}
            >
              <Trans>of</Trans>
            </Typography>
            <ReserveSubheader value={ghoReserveData.aaveFacilitatorBucketMaxCapacity.toString()} />
          </Box>
        </PanelItem>
        <Box mt={{ xs: 6, sm: 0 }}>
          <PanelItem title={<FixedAPYTooltip text={<Trans>APY, fixed rate</Trans>} />}>
            <FormattedNumber value={ghoReserveData.ghoVariableBorrowAPY} percent variant="main16" />
          </PanelItem>
        </Box>
      </Stack>
      <Box>
        <CapsCircularStatus
          value={ghoReserveData.aaveFacilitatorMintedPercent * 100}
          onClick={(open) => {
            if (open) {
              trackEvent(GENERAL.TOOL_TIP, {
                tooltip: 'Total GHO borrowed',
              });
            }
          }}
          tooltipContent={
            <>
              <Trans>
                Maximum amount available to borrow is{' '}
                <FormattedNumber
                  value={ghoReserveData.aaveFacilitatorRemainingCapacity}
                  variant="secondary12"
                />{' '}
                {reserve.symbol} (
                <FormattedNumber
                  value={ghoReserveData.aaveFacilitatorRemainingCapacity}
                  variant="secondary12"
                  symbol="USD"
                />
                ).
              </Trans>
            </>
          }
        />
      </Box>
    </Stack>
  );
};
