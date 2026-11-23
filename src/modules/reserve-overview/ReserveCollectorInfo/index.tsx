import { Trans } from '@lingui/macro';
import { Box, SxProps, Theme } from '@mui/material';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { ReserveFactorTooltip } from 'src/components/infoTooltips/ReserveFactorTooltip';
import { flushPercentSx, FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { figVars } from 'src/utils/figmaColors';
import { useShallow } from 'zustand/shallow';

import { ReserveCard } from '../ReserveCard';

interface ReserveCollectorInfoProps {
  reserve: ReserveWithId;
  variant: 'card' | 'row';
  sx?: SxProps<Theme>;
}

export const ReserveCollectorInfo = ({ reserve, variant, sx }: ReserveCollectorInfoProps) => {
  const [trackEvent, currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentNetworkConfig, store.currentMarketData])
  );

  const collector = currentMarketData.addresses.COLLECTOR;
  if (!collector || !reserve.borrowInfo) return null;

  const collectorLink = currentNetworkConfig.explorerLinkBuilder({ address: collector });
  const { address, name } = reserve.underlyingToken;

  const row = (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          columnGap: '1.5rem',
          rowGap: '0.375rem',
        },
        variant === 'card' && { mt: '1.375rem' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ReserveFactorTooltip
          text={<Trans>Reserve factor</Trans>}
          variant="base"
          textColor="fg-3"
          iconSize={16}
          iconMargin={1}
          collectorLink={collectorLink}
          event={{
            eventName: GENERAL.TOOL_TIP,
            eventParams: { tooltip: 'Reserve factor', asset: address, assetName: name },
          }}
        />
        <FormattedNumber
          value={reserve.borrowInfo.reserveFactor.value}
          percent
          variant="h5"
          color="fg-1"
          visibleDecimals={2}
          sx={flushPercentSx}
        />
      </Box>
      <Link
        href={collectorLink}
        variant="h5"
        onClick={() =>
          trackEvent(GENERAL.EXTERNAL_LINK, {
            asset: address,
            Link: 'Collector Contract ' + name,
            assetName: name,
          })
        }
        sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'fg-1' }}
      >
        <Box
          component="span"
          sx={{
            backgroundImage: `radial-gradient(circle, ${figVars['fg-4']} 0.6px, transparent 0.75px)`,
            backgroundSize: '3px 1.5px',
            backgroundRepeat: 'space no-repeat',
            backgroundPosition: 'left bottom',
          }}
        >
          <Trans>Collector Contract</Trans>
        </Box>
        <ArrowUpRightIcon sx={{ fontSize: '1rem', color: 'fg-4' }} />
      </Link>
    </Box>
  );

  return variant === 'card' ? (
    <ReserveCard title={<Trans>Collector Info</Trans>}>{row}</ReserveCard>
  ) : (
    row
  );
};
