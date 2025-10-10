import { Trans } from '@lingui/macro';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { mapAaveProtocolIncentives } from 'src/components/incentives/incentives.helper';
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
export type ReserveWithProtocolIncentives = ReserveWithId & {
  supplyProtocolIncentives: ReturnType<typeof mapAaveProtocolIncentives>;
  borrowProtocolIncentives: ReturnType<typeof mapAaveProtocolIncentives>;
};

export default function MarketAssetsList({ reserves, loading }: MarketAssetsListProps) {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const sortedReserves = [...reserves].sort((a, b) => {
    if (!sortName) return 0;

    let aValue: number | string;
    let bValue: number | string;

    switch (sortName) {
      case 'underlyingToken.symbol':
        aValue = a.underlyingToken.symbol.toUpperCase();
        bValue = b.underlyingToken.symbol.toUpperCase();
        if (sortDesc) {
          return aValue < bValue ? -1 : 1;
        }
        return bValue < aValue ? -1 : 1;

      case 'size.usd':
        aValue = Number(a.size.usd) || 0;
        bValue = Number(b.size.usd) || 0;
        break;

      case 'supplyInfo.apy.value':
        aValue = Number(a.supplyInfo.apy.value) || 0;
        bValue = Number(b.supplyInfo.apy.value) || 0;
        break;

      case 'borrowInfo.total.usd':
        aValue = Number(a.borrowInfo?.total.usd) || 0;
        bValue = Number(b.borrowInfo?.total.usd) || 0;
        break;

      case 'borrowInfo.apy.value':
        aValue = Number(a.borrowInfo?.apy.value) || 0;
        bValue = Number(b.borrowInfo?.apy.value) || 0;
        break;

      default:
        return 0;
    }

    return sortDesc
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });
  const reservesWithIncentives: ReserveWithProtocolIncentives[] = sortedReserves.map((reserve) => ({
    ...reserve,
    supplyProtocolIncentives: mapAaveProtocolIncentives(reserve.incentives, 'supply'),
    borrowProtocolIncentives: mapAaveProtocolIncentives(reserve.incentives, 'borrow'),
  }));
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

      {reservesWithIncentives.map((reserve) =>
        isTableChangedToCards ? (
          <MarketAssetsListMobileItem {...reserve} key={reserve.id} />
        ) : (
          <MarketAssetsListItem {...reserve} key={reserve.id} />
        )
      )}
    </>
  );
}
