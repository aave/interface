import { Trans } from '@lingui/macro';
import { Box, Paper, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useCoingeckoCategories } from 'src/hooks/useCoinGeckoCategories';
import {
  AssetCategory,
  matchesSelectedCategories,
} from 'src/modules/markets/utils/assetCategories';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

import { NoStakeAssets } from '../NoStakeAssets';
import { StakeAssetsFilters } from './StakeAssetsFilters';
import UmbrellaAssetsList from './UmbrellaAssetsList';

export const UmbrellaAssetsListContainer = () => {
  const { loading } = useAppDataContext();

  const [currentMarketData] = useRootStore(useShallow((store) => [store.currentMarketData]));

  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);
  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    error: categoriesError,
  } = useCoingeckoCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [inWalletOnly, setInWalletOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([]);
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const filteredData = stakedDataWithTokenBalances?.stakeData
    // Search by asset name or symbol
    .filter((res) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      return res.name.toLowerCase().includes(term) || res.iconSymbol.toLowerCase().includes(term);
    })
    // "In Wallet": only assets the user holds in their wallet (raw underlying token balance)
    .filter((res) => !inWalletOnly || Number(res.formattedBalances.underlyingTokenBalance) > 0)
    // Category filter (shares the markets page's dynamic CoinGecko categorization)
    .filter((res) =>
      matchesSelectedCategories(
        res.symbol,
        selectedCategories,
        categoryData?.stablecoinSymbols,
        categoryData?.ethCorrelatedSymbols
      )
    );

  const noStakeAssetsConfigured =
    !isLoadingStakedDataWithTokenBalances && !stakedDataWithTokenBalances;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <StakeAssetsFilters
        searchPlaceholder={sm ? 'Search asset' : 'Search asset name or symbol'}
        onSearchTermChange={setSearchTerm}
        inWallet={{ value: inWalletOnly, onChange: setInWalletOnly }}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        categoriesDisabled={isLoadingCategories || !!categoriesError}
      />

      <Paper variant="card">
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
                  We couldn&apos;t find any assets related to your search. Try again with a
                  different asset name, symbol, or address.
                </Trans>
              }
            />
          )
        )}
      </Paper>
    </Box>
  );
};
