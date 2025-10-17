import { Trans } from '@lingui/macro';
import { Box, useMediaQuery } from '@mui/material';
import { useMemo, useState } from 'react';
import { ListColumn } from 'src/components/lists/ListColumn';
import { ListHeaderTitle } from 'src/components/lists/ListHeaderTitle';
import { ListHeaderWrapper } from 'src/components/lists/ListHeaderWrapper';
import { MergedStakeData } from 'src/hooks/stake/useUmbrellaSummary';

import { ApyTooltip } from '../helpers/ApyTooltip';
import { SharesTooltip } from '../helpers/SharesTooltip';
import { StakedUnderlyingTooltip } from '../helpers/StakedUnderlyingTooltip';
import { UmbrellaAssetsListItemLoader } from './UmbrellaAssetsListItemLoader';
import { UmbrellaAssetsListMobileItem } from './UmbrellaAssetsListMobileItem';
import { UmbrellaAssetsListMobileItemLoader } from './UmbrellaAssetsListMobileItemLoader';
import { UmbrellaStakeAssetsListItem } from './UmbrellaStakeAssetsListItem';

const listHeaders = [
  {
    title: <Trans>Asset</Trans>,
    sortKey: 'symbol',
  },
  {
    title: <ApyTooltip />,
    sortKey: 'totalAPY',
  },
  {
    title: <StakedUnderlyingTooltip />,
    sortKey: 'stakeTokenUnderlyingBalance',
  },
  {
    title: <SharesTooltip />,
    sortKey: 'stakeSharesTokens',
  },
  {
    title: <Trans>Available to Stake</Trans>,
    sortKey: 'totalAvailableToStake',
  },
  {
    title: <Trans>Available to Claim</Trans>,
    sortKey: 'totalAvailableToClaim',
  },
  {
    title: <></>,
  },
];

type UmbrelaAssetsListProps = {
  loading: boolean;
  stakedDataWithTokenBalances: MergedStakeData[];
  isLoadingStakedDataWithTokenBalances: boolean;
};

export default function UmbrellaAssetsList({
  loading,
  stakedDataWithTokenBalances,
  isLoadingStakedDataWithTokenBalances,
}: UmbrelaAssetsListProps) {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const [sortName, setSortName] = useState('');
  const [sortDesc, setSortDesc] = useState(false);

  const sortedData = useMemo(() => {
    if (!stakedDataWithTokenBalances) return [];

    return [...stakedDataWithTokenBalances].sort((a, b) => {
      if (sortName === 'symbol') {
        return sortDesc ? b.symbol.localeCompare(a.symbol) : a.symbol.localeCompare(b.symbol);
      }

      if (sortName === 'totalAPY') {
        const apyA = Number(a.totalRewardApy);
        const apyB = Number(b.totalRewardApy);
        return sortDesc ? apyB - apyA : apyA - apyB;
      }

      if (sortName === 'totalAvailableToClaim') {
        const accruedA =
          a.formattedRewards?.reduce((sum, reward) => sum + Number(reward.accrued || '0'), 0) || 0;
        const accruedB =
          b.formattedRewards?.reduce((sum, reward) => sum + Number(reward.accrued || '0'), 0) || 0;
        return sortDesc ? accruedB - accruedA : accruedA - accruedB;
      }

      if (sortName === 'totalAvailableToStake') {
        const balanceA = Number(a.formattedBalances.totalAvailableToStake);
        const balanceB = Number(b.formattedBalances.totalAvailableToStake);
        return sortDesc ? balanceB - balanceA : balanceA - balanceB;
      }

      if (sortName === 'stakeTokenUnderlyingBalance') {
        const balanceA = Number(a.formattedBalances?.stakeTokenRedeemableAmount || '0');
        const balanceB = Number(b.formattedBalances?.stakeTokenRedeemableAmount || '0');
        return sortDesc ? balanceB - balanceA : balanceA - balanceB;
      }

      if (sortName === 'stakeSharesTokens') {
        const balanceA = Number(a.formattedBalances?.stakeTokenBalance || '0');
        const balanceB = Number(b.formattedBalances?.stakeTokenBalance || '0');
        return sortDesc ? balanceB - balanceA : balanceA - balanceB;
      }

      return 0;
    });
  }, [stakedDataWithTokenBalances, sortName, sortDesc]);

  if (loading || isLoadingStakedDataWithTokenBalances) {
    return isTableChangedToCards ? (
      <>
        <UmbrellaAssetsListMobileItemLoader />
        <UmbrellaAssetsListMobileItemLoader />
        <UmbrellaAssetsListMobileItemLoader />
      </>
    ) : (
      <Box mt={11}>
        <UmbrellaAssetsListItemLoader />
        <UmbrellaAssetsListItemLoader />
        <UmbrellaAssetsListItemLoader />
        <UmbrellaAssetsListItemLoader />
      </Box>
    );
  }
  // Hide list when no results, via search term or if a market has no assets
  if (stakedDataWithTokenBalances == undefined || stakedDataWithTokenBalances.length === 0)
    return null;

  return (
    <>
      {!isTableChangedToCards && (
        <ListHeaderWrapper px={6}>
          {listHeaders.map((col) => (
            <ListColumn
              isRow={col.sortKey === 'symbol'}
              minWidth={col.sortKey === 'symbol' ? 275 : undefined}
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
        </ListHeaderWrapper>
      )}

      {sortedData.map((umbrellaStakeAsset, index) =>
        isTableChangedToCards ? (
          <UmbrellaAssetsListMobileItem {...umbrellaStakeAsset} key={index} />
        ) : (
          <UmbrellaStakeAssetsListItem {...umbrellaStakeAsset} key={index} />
        )
      )}
    </>
  );
}
