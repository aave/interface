import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';

import PieIcon from '../../../public/icons/markets/pie-icon.svg';
import TotalBorrowIcon from '../../../public/icons/markets/total-borrow-indicator.svg';
import TotalSupplyIcon from '../../../public/icons/markets/total-supply-indicator.svg';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';

export const MarketsTopPanel = () => {
  const { reserves, loading } = useAppDataContext();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
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

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <TopInfoPanel pageTitle={<Trans>Markets</Trans>} withMarketSwitcher>
      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Total market size</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={aggregatedStats.totalLiquidity.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor={theme.palette.text.secondary}
          symbolsVariant={symbolsVariant}
          isTopPanel
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem
        icon={<TotalSupplyIcon />}
        title={<Trans>Total available</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={aggregatedStats.totalLiquidity.minus(aggregatedStats.totalDebt).toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor={theme.palette.text.secondary}
          symbolsVariant={symbolsVariant}
          isTopPanel
        />
      </TopInfoPanelItem>
      <TopInfoPanelItem
        icon={<TotalBorrowIcon />}
        title={<Trans>Total borrows</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={aggregatedStats.totalDebt.toString()}
          symbol="USD"
          variant={valueTypographyVariant}
          visibleDecimals={2}
          compact
          symbolsColor={theme.palette.text.secondary}
          symbolsVariant={symbolsVariant}
          isTopPanel
        />
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
