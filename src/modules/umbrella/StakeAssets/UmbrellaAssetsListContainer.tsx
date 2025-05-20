import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { TitleWithSearchBar } from 'src/components/TitleWithSearchBar';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { NoStakeAssets } from '../NoStakeAssets';
import UmbrellaAssetsList from './UmbrellaAssetsList';

export const UmbrellaAssetsListContainer = () => {
  const { loading } = useAppDataContext();

  const [currentMarketData] = useRootStore(useShallow((store) => [store.currentMarketData]));

  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);

  const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const filteredData = stakedDataWithTokenBalances?.stakeData.filter((res) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();

    return res.name.toLowerCase().includes(term) || res.iconSymbol.toLowerCase().includes(term);
  });

  const noStakeAssetsConfigured =
    !isLoadingStakedDataWithTokenBalances && !stakedDataWithTokenBalances;

  return (
    <ListWrapper
      titleComponent={
        <TitleWithSearchBar
          onSearchTermChange={setSearchTerm}
          title={<Trans>Assets to stake</Trans>}
          searchPlaceholder={sm ? 'Search asset' : 'Search asset name or symbol'}
        />
      }
    >
      <UmbrellaAssetsList
        loading={loading}
        isLoadingStakedDataWithTokenBalances={isLoadingStakedDataWithTokenBalances}
        stakedDataWithTokenBalances={filteredData ?? []}
      />

      {noStakeAssetsConfigured ? (
        <NoStakeAssets />
      ) : (
        !loading &&
        !isLoadingStakedDataWithTokenBalances &&
        filteredData?.length === 0 && (
          <NoSearchResults
            searchTerm={searchTerm}
            subtitle={
              <Trans>
                We couldn&apos;t find any assets related to your search. Try again with a different
                asset name, symbol, or address.
              </Trans>
            }
          />
        )
      )}
    </ListWrapper>
  );
};
