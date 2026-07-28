import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { PageHeader } from 'src/components/PageHeader/PageHeader';
import { PageHeaderStat } from 'src/components/PageHeader/PageHeaderStat';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

interface StakingHeaderProps {
  tvl: {
    [key: string]: number;
  };
  stkEmission: string;
  loading: boolean;
}

export const StakingHeader: React.FC<StakingHeaderProps> = ({ tvl, stkEmission, loading }) => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const valueVariant = downToSM ? 'h4' : 'h2';

  const total = Object.values(tvl || {}).reduce((acc, item) => acc + item, 0);

  return (
    <PageHeader
      title="Safety Module"
      description={
        <Trans>
          The Safety Module has been upgraded to Umbrella, a new system that introduces automated
          slashing, aToken staking, and improved incentives design.
        </Trans>
      }
      columns={2}
    >
      <PageHeaderStat label={<Trans>Funds in the Safety Module</Trans>} loading={loading}>
        <FormattedNumber
          value={total}
          symbol="USD"
          variant={valueVariant}
          visibleDecimals={2}
          compact
        />
      </PageHeaderStat>

      <PageHeaderStat label={<Trans>Total emission per day</Trans>} loading={loading}>
        <FormattedNumber
          value={stkEmission || 0}
          symbol="AAVE"
          variant={valueVariant}
          visibleDecimals={2}
        />
      </PageHeaderStat>
    </PageHeader>
  );
};
