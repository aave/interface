import { Trans } from '@lingui/macro';
import { Divider, Typography } from '@mui/material';
import { ReserveFactorTooltip } from 'src/components/infoTooltips/ReserveFactorTooltip';
import { tooltipLabelProps } from 'src/components/infoTooltips/tooltipLabelProps';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { ReserveCard } from '../ReserveCard';
import { ReserveStat } from '../ReserveStat';
import { ReserveStatWithLink } from '../ReserveStatWithLink';

interface ReserveCollectorInfoProps {
  reserve: ReserveWithId;
  variant: 'card' | 'section';
}

export const ReserveCollectorInfo = ({ reserve, variant }: ReserveCollectorInfoProps) => {
  const [currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [store.currentNetworkConfig, store.currentMarketData])
  );

  const collector = currentMarketData.addresses.COLLECTOR;
  if (!collector || !reserve.borrowInfo) return null;

  const collectorLink = currentNetworkConfig.explorerLinkBuilder({ address: collector });
  const isCard = variant === 'card';

  const stats = (
    <ReserveStatWithLink
      reserve={reserve}
      href={collectorLink}
      linkName={'Collector Contract ' + reserve.underlyingToken.name}
      linkLabel={<Trans>Collector contract</Trans>}
      sx={isCard ? { mt: '1.375rem' } : undefined}
    >
      <ReserveStat
        label={
          <ReserveFactorTooltip
            {...tooltipLabelProps}
            text={<Trans>Reserve factor</Trans>}
            collectorLink={collectorLink}
            event={{
              eventName: GENERAL.TOOL_TIP,
              eventParams: {
                tooltip: 'Reserve factor',
                asset: reserve.underlyingToken.address,
                assetName: reserve.underlyingToken.name,
              },
            }}
          />
        }
      >
        <FormattedNumber
          value={reserve.borrowInfo.reserveFactor.value}
          percent
          variant="h2"
          visibleDecimals={2}
        />
      </ReserveStat>
    </ReserveStatWithLink>
  );

  if (isCard) {
    return <ReserveCard title={<Trans>Collector Info</Trans>}>{stats}</ReserveCard>;
  }

  return (
    <>
      <Divider sx={{ mt: '2.5rem' }} />
      <Typography variant="secondary16" component="h3" sx={{ mt: '2.375rem', mb: '1rem' }}>
        <Trans>Collector Info</Trans>
      </Typography>
      {stats}
    </>
  );
};
