import { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { useMediaQuery } from '@mui/material';
import { useState } from 'react';
// import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import {
  useStakeData,
  useUserStakeData,
  useMergedStakeData,
  MergedStakeData,
} from '../hooks/useStakeData';

import {
  StakeData,
  // StakeUserData,
  // StakeUserBalances,
  // StakeUserCooldown,
} from '../services/StakeDataProviderService';

import { UmbrellaStakeAssetsListItem } from './UmbrellaStakeAssetsListItem';
import { UmbrellaAssetsListItemLoader } from './UmbrellaAssetsListItemLoader';
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

export default function MarketAssetsList({ reserves, loading }: MarketAssetsListProps) {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);
  const [currentMarketData, user] = useRootStore(
    useShallow((store) => [store.currentMarketData, store.account])
  );
  const currentChainId = useRootStore((store) => store.currentChainId);

  const { data: stakeData } = useStakeData(currentMarketData);
  const { data: userStakeData = [] } = useUserStakeData(currentMarketData, user);
  // const { data: stakedDataWithTokenBalances } = useStakedDataWithTokenBalances(
  //   userStakeData,
  //   currentChainId,
  //   user
  // );

  // const filteredGhoToken = useMemo(() => {

  //  }

  // sum all three for every case for available to stake

  // underlyingTokenBalance
  // :
  // "0"
  // underlyingWaTokenATokenBalance
  // :
  // "0" // underling USDC
  // underlyingWaTokenBalance
  // :
  // "49002102" // underling USDC

  // TODO: Handle GHO Situation
  const filteredGhoToken: StakeData[] = useMemo(() => {
    if (!stakeData) return [];
    return stakeData?.filter(
      (item) => item.waTokenData.waTokenUnderlying !== '0x0000000000000000000000000000000000000000'
    );
  }, [stakeData]);

  const stakedDataWithTokenBalances: MergedStakeData[] = useMergedStakeData(
    filteredGhoToken,
    userStakeData,
    reserves
  );
  console.log('useStakeData --->', stakeData);
  console.log('userStakeData --->', userStakeData);
  console.log('stakedDataWithTokenBalances', stakedDataWithTokenBalances);

  console.log('reserves ---', reserves);

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
        <UmbrellaAssetsListItemLoader />
        <UmbrellaAssetsListItemLoader />
        <UmbrellaAssetsListItemLoader />
        <UmbrellaAssetsListItemLoader />
      </>
    );
  }

  // Hide list when no results, via search term or if a market has all/no frozen/unfrozen assets
  if (stakedDataWithTokenBalances.length === 0) return null;

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

      {stakedDataWithTokenBalances.map((umbrellaStakeAsset) =>
        isTableChangedToCards ? (
          <UmbrellaAssetsListMobileItem
            {...umbrellaStakeAsset}
            key={umbrellaStakeAsset.stakeToken}
          />
        ) : (
          <UmbrellaStakeAssetsListItem
            {...umbrellaStakeAsset}
            key={umbrellaStakeAsset.stakeToken}
          />
        )
      )}
    </>
  );
}
