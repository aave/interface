import { Trans } from '@lingui/macro';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListHeaderTitle } from '../../components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from '../../components/lists/ListHeaderWrapper';
import { ListWrapper } from '../../components/lists/ListWrapper';
import { useProtocolDataContext } from '../../hooks/useProtocolDataContext';
import { AssetsListItem } from './AssetsListItem';
import { AssetsListItemLoader } from './AssetsListItemLoader';
import { AssetsListMobileItem } from './AssetsListMobileItem';
import { AssetsListMobileItemLoader } from './AssetsListMobileItemLoader';

export default function AssetsList() {
  const { reserves, loading } = useAppDataContext();
  const { currentMarketData } = useProtocolDataContext();

  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');

  const filteredData = reserves.filter((res) => res.isActive && !res.isFrozen);

  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  if (sortDesc) {
    if (sortName === 'symbol') {
      filteredData.sort((a, b) => (b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 0));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filteredData.sort((a, b) => a[sortName] - b[sortName]);
    }
  } else {
    if (sortName === 'symbol') {
      filteredData.sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 0));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      filteredData.sort((a, b) => b[sortName] - a[sortName]);
    }
  }

  const header = [
    {
      title: <Trans>Asset</Trans>,
      sortKey: 'symbol',
    },
    {
      title: <Trans>Total supplied</Trans>,
      sortKey: 'totalLiquidityUSD',
    },
    {
      title: <Trans>Supply APY</Trans>,
      sortKey: 'supplyAPY',
    },
    {
      title: <Trans>Total borrowed</Trans>,
      sortKey: 'totalDebtUSD',
    },
    {
      title: <Trans>Borrow APY, variable</Trans>,
      sortKey: 'variableBorrowAPY',
    },
    {
      title: <Trans>Borrow APY, stable</Trans>,
      sortKey: 'stableBorrowAPY',
    },
  ];

  return (
    <ListWrapper
      title={
        <>
          {currentMarketData.marketTitle} <Trans>assets</Trans>
        </>
      }
      captionSize="h2"
    >
      {!isTableChangedToCards && (
        <ListHeaderWrapper px={6}>
          {header.map((col) => (
            <ListColumn
              isRow={col.sortKey === 'symbol'}
              maxWidth={col.sortKey === 'symbol' ? 280 : undefined}
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
          <ListColumn maxWidth={95} minWidth={95} />
        </ListHeaderWrapper>
      )}

      {loading ? (
        isTableChangedToCards ? (
          <>
            <AssetsListMobileItemLoader />
            <AssetsListMobileItemLoader />
            <AssetsListMobileItemLoader />
          </>
        ) : (
          <>
            <AssetsListItemLoader />
            <AssetsListItemLoader />
            <AssetsListItemLoader />
            <AssetsListItemLoader />
            <AssetsListItemLoader />
          </>
        )
      ) : (
        filteredData.map((reserve) =>
          isTableChangedToCards ? (
            <AssetsListMobileItem {...reserve} key={reserve.id} />
          ) : (
            <AssetsListItem {...reserve} key={reserve.id} />
          )
        )
      )}
    </ListWrapper>
  );
}
