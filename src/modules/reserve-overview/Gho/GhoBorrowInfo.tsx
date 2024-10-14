import { FormattedGhoReserveData, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { FixedAPYTooltip } from 'src/components/infoTooltips/FixedAPYTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import {
  ComputedReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { getBorrowCapData } from 'src/hooks/useAssetCaps';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { PanelItem } from '../ReservePanels';

export const GhoBorrowInfo = ({ reserve }: { reserve: ComputedReserveData }) => {
  const { ghoReserveData } = useAppDataContext();
  const { breakpoints } = useTheme();
  const desktopScreens = useMediaQuery(breakpoints.up('sm'));

  const totalBorrowed = BigNumber.min(
    valueToBigNumber(reserve.totalDebt),
    valueToBigNumber(reserve.borrowCap)
  ).toNumber();

  const totalBorrowedUSD = BigNumber.min(
    valueToBigNumber(reserve.totalDebtUSD),
    valueToBigNumber(reserve.borrowCapUSD)
  ).toString();

  const maxAvailableToBorrow = BigNumber.max(
    valueToBigNumber(reserve.borrowCap).minus(valueToBigNumber(reserve.totalDebt)),
    0
  ).toNumber();

  const maxAvailableToBorrowUSD = BigNumber.max(
    valueToBigNumber(reserve.borrowCapUSD).minus(valueToBigNumber(reserve.totalDebtUSD)),
    0
  ).toNumber();

  const borrowCapUsage = getBorrowCapData(reserve).borrowCapUsage;

  const props: GhoBorrowInfoProps = {
    reserve,
    ghoReserveData,
    totalBorrowed,
    totalBorrowedUSD,
    maxAvailableToBorrow,
    maxAvailableToBorrowUSD,
    borrowCapUsage,
  };

  if (desktopScreens) {
    return <GhoBorrowInfoDesktop {...props} />;
  } else {
    return <GhoBorrowInfoMobile {...props} />;
  }
};

interface GhoBorrowInfoProps {
  reserve: ComputedReserveData;
  ghoReserveData: FormattedGhoReserveData;
  totalBorrowed: number;
  totalBorrowedUSD: string;
  maxAvailableToBorrow: number;
  maxAvailableToBorrowUSD: number;
  borrowCapUsage: number;
}

const GhoBorrowInfoDesktop = ({
  reserve,
  ghoReserveData,
  totalBorrowed,
  totalBorrowedUSD,
  maxAvailableToBorrow,
  maxAvailableToBorrowUSD,
  borrowCapUsage,
}: GhoBorrowInfoProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <Stack direction="row">
      <CapsCircularStatus
        value={borrowCapUsage}
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
              <FormattedNumber value={maxAvailableToBorrow} variant="secondary12" />{' '}
              {reserve.symbol} (
              <FormattedNumber value={maxAvailableToBorrowUSD} variant="secondary12" symbol="USD" />
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
          <FormattedNumber value={totalBorrowed} variant="main16" compact />
          <Typography
            component="span"
            color="text.primary"
            variant="secondary16"
            sx={{ display: 'inline-block', mx: 1 }}
          >
            <Trans>of</Trans>
          </Typography>
          <FormattedNumber value={reserve.borrowCap} variant="main16" />
        </Box>
        <Box>
          <ReserveSubheader value={totalBorrowedUSD} />
          <Typography
            component="span"
            color="text.secondary"
            variant="secondary12"
            sx={{ display: 'inline-block', mx: 1 }}
          >
            <Trans>of</Trans>
          </Typography>
          <ReserveSubheader value={reserve.borrowCapUSD} />
        </Box>
      </PanelItem>
      <Box mt={{ xs: 6, sm: 0 }}>
        <PanelItem title={<FixedAPYTooltip text={<Trans>APY, borrow rate</Trans>} />}>
          <FormattedNumber value={ghoReserveData.ghoVariableBorrowAPY} percent variant="main16" />
        </PanelItem>
      </Box>
    </Stack>
  );
};

const GhoBorrowInfoMobile = ({
  reserve,
  ghoReserveData,
  totalBorrowed,
  totalBorrowedUSD,
  maxAvailableToBorrow,
  maxAvailableToBorrowUSD,
  borrowCapUsage,
}: GhoBorrowInfoProps) => {
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
            <FormattedNumber value={totalBorrowed} variant="main16" />
            <Typography
              component="span"
              color="text.primary"
              variant="secondary16"
              sx={{ display: 'inline-block', mx: 1 }}
            >
              <Trans>of</Trans>
            </Typography>
            <FormattedNumber value={reserve.borrowCap} variant="main16" />
          </Box>
          <Box>
            <ReserveSubheader value={totalBorrowedUSD} />
            <Typography
              component="span"
              color="text.secondary"
              variant="secondary12"
              sx={{ display: 'inline-block', mx: 1 }}
            >
              <Trans>of</Trans>
            </Typography>
            <ReserveSubheader value={reserve.borrowCapUSD} />
          </Box>
        </PanelItem>
        <Box mt={{ xs: 6, sm: 0 }}>
          <PanelItem title={<FixedAPYTooltip text={<Trans>APY, borrow rate</Trans>} />}>
            <FormattedNumber value={ghoReserveData.ghoVariableBorrowAPY} percent variant="main16" />
          </PanelItem>
        </Box>
      </Stack>
      <Box>
        <CapsCircularStatus
          value={borrowCapUsage}
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
                <FormattedNumber value={maxAvailableToBorrow} variant="secondary12" />{' '}
                {reserve.symbol} (
                <FormattedNumber
                  value={maxAvailableToBorrowUSD}
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
