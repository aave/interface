import { Trans } from '@lingui/macro';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { CapType } from 'src/components/caps/helper';
import { AvailableTooltip } from 'src/components/infoTooltips/AvailableTooltip';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { DASHBOARD_LIST_COLUMN_WIDTHS } from 'src/utils/dashboardSortUtils';

import { ListButtonsColumn } from '../ListButtonsColumn';
import { ListLoader } from '../ListLoader';

const head = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: (
      <AvailableTooltip
        capType={CapType.borrowCap}
        text={<Trans>Available</Trans>}
        key="availableBorrows"
        variant="subheader2"
      />
    ),
    sortKey: 'availableBorrows',
  },

  {
    title: (
      <VariableAPYTooltip
        text={<Trans>APY, variable</Trans>}
        key="variableBorrowAPY"
        variant="subheader2"
      />
    ),
    sortKey: 'variableBorrowAPY',
  },
  {
    title: (
      <StableAPYTooltip
        text={<Trans>APY, stable</Trans>}
        key="stableBorrowAPY"
        variant="subheader2"
      />
    ),
    sortKey: 'stableBorrowAPY',
  },
];

export const BorrowAssetsList = () => {
  const { loading } = useAppDataContext();
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const sortedReserves: unknown[] = [];
  const borrowDisabled = !sortedReserves.length;

  const RenderHeader: React.FC = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === 'symbol'}
            maxWidth={col.sortKey === 'symbol' ? DASHBOARD_LIST_COLUMN_WIDTHS.ASSET : undefined}
            key={col.sortKey}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListButtonsColumn isColumnHeader />
      </ListHeaderWrapper>
    );
  };

  if (loading)
    return (
      <ListLoader
        title={<Trans>Assets to borrow</Trans>}
        head={head.map((col) => col.title)}
        withTopMargin
      />
    );

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <Trans>Assets to borrow</Trans>
        </Typography>
      }
      localStorageName="borrowAssetsCreditDelegationTableCollapse"
      withTopMargin
      noData={borrowDisabled}
    >
      <>{!downToXSM && !!sortedReserves.length && <RenderHeader />}</>
    </ListWrapper>
  );
};
