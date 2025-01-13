import { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';

import {
  useStakeData,
  useUserStakeData,
  useStakedDataWithTokenBalances,
} from '../hooks/useStakeData';
import { UmbrellaUserStakeAssetsListItem } from './UmbrellaUserStakeAssetsListItem';
// import { UmbrellaStakeAssetsListItem } from './UmbrellaStakeAssetsListItem';
import { UmbrellaUserAssetsListItemLoader } from './UmbrellaUserAssetsListItemLoader';
import { UmbrellaAssetsListMobileItem } from './UmbrellaAssetsListMobileItem';
import { UmbrellaAssetsListMobileItemLoader } from './UmbrellaAssetsListMobileItemLoader';
import { ChainId } from '@aave/contract-helpers';

const listHeaders = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: <Trans>APY</Trans>,
    sortKey: 'totalLiquidityUSD',
  },
  //   {
  //     title: <Trans>Max Slashing</Trans>,
  //     sortKey: 'supplyAPY',
  //   },
  {
    title: <Trans>Wallet Balance</Trans>,
    sortKey: 'totalUnderlyingBalance',
  },
  //   {
  //     title: (
  //       <VariableAPYTooltip
  //         text={<Trans>Borrow APY, variable</Trans>}
  //         key="APY_list_variable_type"
  //         variant="subheader2"
  //       />
  //     ),
  //     sortKey: 'variableBorrowAPY',
  //   },
];

type MarketAssetsListProps = {
  reserves: ComputedReserveData[];
  loading: boolean;
};

// cast call 0x508b0d26b00bcfa1b1e9783d1194d4a5efe9d19e "rewardsController()("address")" --rpc-url https://virtual.base.rpc.tenderly.co/acca7349-4377-43ab-ba85-84530976e4e0

export default function MarketAssetsList({ reserves, loading }: MarketAssetsListProps) {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [currentMarketData, user] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.account])
  );
  const currentChainId = useRootStore((store) => store.currentChainId);

  const { data: stakeData } = useStakeData(currentMarketData);
  const { data: userStakeData } = useUserStakeData(currentMarketData, user);
  const { data: stakedDataWithTokenBalances } = useStakedDataWithTokenBalances(
    stakeData,
    currentChainId,
    user
  );
  console.log('useStakeData --->', stakeData);
  console.log('userStakeData --->', userStakeData);
  console.log('stakedDataWithTokenBalances', stakedDataWithTokenBalances);

  //   const underlyingStakedAssets = useMemo(() => {
  //     return userStakeData?.map((stakeData) => stakeData.stakeTokenUnderlying);
  //   }, [userStakeData]);

  //   console.log('underlyingStakedAssets', underlyingStakedAssets);
  if (sortDesc) {
    if (sortName === 'symbol') {
      reserves.sort((a, b) => (a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 1));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reserves.sort((a, b) => a[sortName] - b[sortName]);
    }
  } else {
    if (sortName === 'symbol') {
      reserves.sort((a, b) => (b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 1));
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reserves.sort((a, b) => b[sortName] - a[sortName]);
    }
  }

  // Show loading state when loading
  if (loading) {
    return isTableChangedToCards ? (
      <>
        <UmbrellaAssetsListMobileItemLoader />
        <UmbrellaAssetsListMobileItemLoader />
        <UmbrellaAssetsListMobileItemLoader />
      </>
    ) : (
      <>
        <UmbrellaUserAssetsListItemLoader />
        <UmbrellaUserAssetsListItemLoader />
        <UmbrellaUserAssetsListItemLoader />
        <UmbrellaUserAssetsListItemLoader />
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
          <UmbrellaAssetsListMobileItem {...reserve} key={reserve.id} />
        ) : (
          <UmbrellaUserStakeAssetsListItem {...reserve} key={reserve.id} />
        )
      )}
    </>
  );
}
