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
import { useShallow } from 'zustand/shallow';

import { GENERAL } from '../../../utils/mixPanelEvents';
import UmbrellaAssetsList from './UmbrellaAssetsList';
import { useStakeData } from '../hooks/useStakeData';

export const UmbrellaAssetsListContainer = () => {
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

  const { data, isLoading } = useStakeData(currentMarketData);

  const stakeData = data || [];

  const filteredData = stakeData
    // filter out any that don't meet search term criteria
    .filter((res) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      const mainTokenSymbol = res.underlyingIsWaToken ? res.waTokenData.waTokenUnderlyingSymbol : res.stakeTokenSymbol;
      const mainTokenName = res.underlyingIsWaToken ? res.waTokenData.waTokenUnderlyingName : res.stakeTokenName;
      const mainUnderlying = res.underlyingIsWaToken ? res.waTokenData.waTokenUnderlying : res.stakeTokenUnderlying;
      return (
        mainTokenSymbol.includes(term) ||
        mainTokenName.includes(term) ||
        mainUnderlying.toLowerCase().includes(term)
      );
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
      {/* Unfrozen assets list */}
      <UmbrellaAssetsList stakeTokens={filteredData} loading={isLoading} />

      {/* Show no search results message if nothing hits in either list */}
      {!isLoading && filteredData.length === 0 && (
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
