import { Trans } from '@lingui/macro';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';

import { ReserveWithId } from '../../hooks/app-data-provider/useAppDataProvider';
import { MarketAssetsListItem } from './MarketAssetsListItem';
import { MarketAssetsListItemLoader } from './MarketAssetsListItemLoader';
import { MarketAssetsListMobileItem } from './MarketAssetsListMobileItem';
import { MarketAssetsListMobileItemLoader } from './MarketAssetsListMobileItemLoader';

const listHeaders = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'underlyingToken.symbol',
  },
  {
    title: <Trans>Total supplied</Trans>,
    sortKey: 'size.usd',
  },
  {
    title: <Trans>Supply APY</Trans>,
    sortKey: 'supplyInfo.apy.value',
  },
  {
    title: <Trans>Total borrowed</Trans>,
    sortKey: 'borrowInfo.total.usd',
  },
  {
    title: (
      <VariableAPYTooltip
        text={<Trans>Borrow APY, variable</Trans>}
        key="APY_list_variable_type"
        variant="subheader2"
      />
    ),
    sortKey: 'borrowInfo.apy.value',
  },
];

type MarketAssetsListProps = {
  reserves: ReserveWithId[];
  loading: boolean;
};

export default function MarketAssetsList({ reserves, loading }: MarketAssetsListProps) {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const getValue = (obj: ReserveWithId, path: string): unknown => {
    return path.split('.').reduce((current: unknown, key: string) => {
      return current && typeof current === 'object' && key in current
        ? (current as Record<string, unknown>)[key]
        : undefined;
    }, obj);
  };
  if (sortDesc) {
    if (sortName === 'underlyingToken.symbol') {
      reserves.sort((a, b) =>
        a.underlyingToken.symbol.toUpperCase() < b.underlyingToken.symbol.toUpperCase() ? -1 : 1
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reserves.sort((a, b) => {
        const aValue = Number(getValue(a, sortName)) || 0;
        const bValue = Number(getValue(b, sortName)) || 0;
        return aValue - bValue;
      });
    }
  } else {
    if (sortName === 'underlyingToken.symbol') {
      reserves.sort((a, b) =>
        b.underlyingToken.symbol.toUpperCase() < a.underlyingToken.symbol.toUpperCase() ? -1 : 1
      );
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reserves.sort((a, b) => {
        const aValue = Number(getValue(a, sortName)) || 0;
        const bValue = Number(getValue(b, sortName)) || 0;
        return bValue - aValue;
      });
    }
  }

  // Show loading state when loading
  if (loading) {
    return isTableChangedToCards ? (
      <>
        <MarketAssetsListMobileItemLoader />
        <MarketAssetsListMobileItemLoader />
        <MarketAssetsListMobileItemLoader />
      </>
    ) : (
      <>
        <MarketAssetsListItemLoader />
        <MarketAssetsListItemLoader />
        <MarketAssetsListItemLoader />
        <MarketAssetsListItemLoader />
      </>
    );
  }

  // Hide list when no results, via search term or if a market has all/no frozen/unfrozen assets
  if (reserves.length === 0) return null;

  return (
    <>
      {!isTableChangedToCards && (
        <ListHeaderWrapper px={6}>
          {listHeaders.map((col) => (
            <ListColumn
              isRow={col.sortKey === 'underlyingToken.symbol'}
              maxWidth={col.sortKey === 'underlyingToken.symbol' ? 280 : undefined}
              key={col.sortKey}
            >
              <ListHeaderTitle
                sortName={sortName}
                sortDesc={sortDesc}
                setSortName={setSortName}
                setSortDesc={setSortDesc}
                sortKey={col.sortKey}
                source="Markets Page"
              >
                {col.title}
              </ListHeaderTitle>
            </ListColumn>
          ))}
          <ListColumn maxWidth={95} minWidth={95} />
        </ListHeaderWrapper>
      )}

      {reserves.map((reserve) =>
        isTableChangedToCards ? (
          <MarketAssetsListMobileItem {...reserve} key={reserve.id} />
        ) : (
          <MarketAssetsListItem {...reserve} key={reserve.id} />
        )
      )}
    </>
  );
}
