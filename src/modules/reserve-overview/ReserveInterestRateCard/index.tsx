import { Trans } from '@lingui/macro';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ReserveWithId } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';

import { InterestRateModelGraphContainer } from '../graphs/InterestRateModelGraphContainer';
import { ReserveCard } from '../ReserveCard';
import { ReserveStat } from '../ReserveStat';
import { ReserveStatWithLink } from '../ReserveStatWithLink';

interface ReserveInterestRateCardProps {
  reserve: ReserveWithId;
}

export const ReserveInterestRateCard = ({ reserve }: ReserveInterestRateCardProps) => {
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);

  if (!reserve.borrowInfo) return null;

  return (
    <ReserveCard title={<Trans>Interest rate model</Trans>}>
      <ReserveStatWithLink
        reserve={reserve}
        href={currentNetworkConfig.explorerLinkBuilder({
          address: reserve.interestRateStrategyAddress,
        })}
        linkName="Interest Rate Strategy"
        linkLabel={<Trans>Interest rate strategy</Trans>}
        sx={{ mt: '1.375rem' }}
      >
        <ReserveStat label={<Trans>Utilization Rate</Trans>}>
          <FormattedNumber
            value={reserve.borrowInfo.utilizationRate.value}
            percent
            variant="h2"
            compact
          />
        </ReserveStat>
      </ReserveStatWithLink>

      <InterestRateModelGraphContainer reserve={reserve} />
    </ReserveCard>
  );
};
