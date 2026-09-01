import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { marketContainerProps } from 'pages/markets.page';

import { MarketSwitcher } from '../../components/MarketSwitcher';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { PageHeaderStat } from '../../components/PageHeader/PageHeaderStat';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';

export const MarketsTopPanel = () => {
  const { market, totalBorrows, loading } = useAppDataContext();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const valueTypographyVariant = downToSM ? 'h4' : 'h2';

  return (
    <PageHeader
      disableTitleTypography
      title={<MarketSwitcher />}
      containerProps={marketContainerProps}
    >
      <PageHeaderStat label={<Trans>Total market size</Trans>} loading={loading}>
        <FormattedNumber
          value={Number(market?.totalMarketSize)}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
        />
      </PageHeaderStat>
      <PageHeaderStat label={<Trans>Total available</Trans>} loading={loading}>
        <FormattedNumber
          value={Number(market?.totalAvailableLiquidity)}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
        />
      </PageHeaderStat>
      <PageHeaderStat label={<Trans>Total borrows</Trans>} loading={loading}>
        <FormattedNumber
          value={Number(totalBorrows)}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
        />
      </PageHeaderStat>
    </PageHeader>
  );
};
