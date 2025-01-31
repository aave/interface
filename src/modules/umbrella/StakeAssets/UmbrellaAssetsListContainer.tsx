import { Trans } from '@lingui/macro';
import { useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { NoSearchResults } from 'src/components/NoSearchResults';
// import { Link } from 'src/components/primitives/Link';
// import { Warning } from 'src/components/primitives/Warning';
import { TitleWithSearchBar } from 'src/components/TitleWithSearchBar';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

// import { GENERAL } from '../../../utils/mixPanelEvents';
// import { useStakeData } from '../hooks/useStakeData';
import UmbrellaAssetsList from './UmbrellaAssetsList';

export const UmbrellaAssetsListContainer = () => {
  const { loading } = useAppDataContext();

  const [currentMarketData] = useRootStore(useShallow((store) => [store.currentMarketData]));

  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);

  const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const filteredData = stakedDataWithTokenBalances?.filter((res) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase().trim();

    return res.symbol.toLowerCase().includes(term) || res.iconSymbol.toLowerCase().includes(term);
  });

  return (
    <ListWrapper
      titleComponent={
        <TitleWithSearchBar
          onSearchTermChange={setSearchTerm}
          title={
            <>
              <Trans>Assets to stake</Trans>
            </>
          }
          searchPlaceholder={sm ? 'Search asset' : 'Search asset name, symbol, or address'}
        />
      }
    >
      <UmbrellaAssetsList
        loading={loading}
        isLoadingStakedDataWithTokenBalances={isLoadingStakedDataWithTokenBalances}
        stakedDataWithTokenBalances={filteredData ?? []}
      />

      {!loading && !isLoadingStakedDataWithTokenBalances && !filteredData && (
        <NoSearchResults
          searchTerm={searchTerm}
          subtitle={
            <Trans>
              We couldn&apos;t find any assets related to your search. Try again with a different
              asset name, symbol, or address.
            </Trans>
          }
        />
      )}
    </ListWrapper>
  );
};
