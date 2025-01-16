import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Switch, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { TitleWithSearchBar } from 'src/components/TitleWithSearchBar';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { useShallow } from 'zustand/shallow';

import { GENERAL } from '../../../utils/mixPanelEvents';
import UmbrellaAssetsList from './UmbrellaAssetsList';
import { useStakeData } from '../hooks/useStakeData';

export const UmbrellaAssetsListContainer = () => {
  const { reserves, loading } = useAppDataContext();
  const [trackEvent, currentMarket, currentMarketData, currentNetworkConfig] = useRootStore(
    useShallow((store) => [
      store.trackEvent,
      store.currentMarket,
      store.currentMarketData,
      store.currentNetworkConfig,
    ])
  );
  const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const { data } = useStakeData(currentMarketData);

  const filteredData = reserves
    // Filter out any non-active reserves
    .filter((res) => res.isActive)
    // filter out any that don't meet search term criteria
    .filter((res) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        res.symbol.toLowerCase().includes(term) ||
        res.name.toLowerCase().includes(term) ||
        res.underlyingAsset.toLowerCase().includes(term)
      );
    })
    // Transform the object for list to consume it
    .map((reserve) => ({
      ...reserve,
      ...(reserve.isWrappedBaseAsset
        ? fetchIconSymbolAndName({
            symbol: currentNetworkConfig.baseAssetSymbol,
            underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
          })
        : {}),
    }));

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
      {/* Unfrozen assets list */}
      <UmbrellaAssetsList reserves={filteredData} loading={loading} />

      {/* Show no search results message if nothing hits in either list */}
      {!loading && filteredData.length === 0 && (
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
