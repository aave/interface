import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import * as React from 'react';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';

export const MarketsTopPanel = () => {
  const { reserves } = useAppDataContext();

  const aggregatedStats = reserves.reduce(
    (acc, reserve) => {
      return {
        totalLiquidity: acc.totalLiquidity.plus(reserve.totalLiquidityUSD),
        totalDebt: acc.totalDebt.plus(reserve.totalDebtUSD),
      };
    },
    {
      totalLiquidity: valueToBigNumber(0),
      totalDebt: valueToBigNumber(0),
    }
  );

  return (
    <TopInfoPanel pageTitle={<Trans>Market overview</Trans>} withMarketSwitcher>
      <TopInfoPanelItem title={<Trans>Total market size</Trans>}>
        <FormattedNumber
          value={aggregatedStats.totalLiquidity.toString()}
          symbol="USD"
          variant="main21"
          minimumDecimals={2}
          maximumDecimals={2}
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem title={<Trans>Total available</Trans>}>
        <FormattedNumber
          value={aggregatedStats.totalLiquidity.minus(aggregatedStats.totalDebt).toString()}
          symbol="USD"
          variant="main21"
          minimumDecimals={2}
          maximumDecimals={2}
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem title={<Trans>Total borrows</Trans>}>
        <FormattedNumber
          value={aggregatedStats.totalDebt.toString()}
          symbol="USD"
          variant="main21"
          minimumDecimals={2}
          maximumDecimals={2}
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
