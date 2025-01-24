import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
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
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { getGhoReserve, GHO_MINTING_MARKETS, GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

// import { GENERAL } from '../../../utils/mixPanelEvents';
// import { useStakeData } from '../hooks/useStakeData';
import UmbrellaAssetsList from './UmbrellaAssetsList';

function shouldDisplayGhoBanner(marketTitle: string, searchTerm: string): boolean {
  // GHO banner is only displayed on markets where new GHO is mintable (i.e. Ethereum)
  // If GHO is listed as a reserve, then it will be displayed in the normal market asset list
  if (!GHO_MINTING_MARKETS.includes(marketTitle)) {
    return false;
  }

  if (!searchTerm) {
    return true;
  }

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  return (
    normalizedSearchTerm.length <= 3 && GHO_SYMBOL.toLowerCase().includes(normalizedSearchTerm)
  );
}

export const UmbrellaAssetsListContainer = () => {
  const { reserves, loading } = useAppDataContext();

  const [currentMarket, currentNetworkConfig, currentMarketData] = useRootStore(
    useShallow((store) => [
      store.currentMarket,
      store.currentNetworkConfig,
      store.currentMarketData,
    ])
  );

  const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
    useUmbrellaSummary(currentMarketData);

  const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));

  const ghoReserve = getGhoReserve(reserves);
  const displayGhoBanner = shouldDisplayGhoBanner(currentMarket, searchTerm);

  const filteredData = reserves
    // Filter out any non-active reserves
    .filter((res) => res.isActive)
    // Filter out GHO if the banner is being displayed
    .filter((res) => (displayGhoBanner ? res !== ghoReserve : true))
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
      <UmbrellaAssetsList
        reserves={filteredData}
        loading={loading}
        isLoadingStakedDataWithTokenBalances={isLoadingStakedDataWithTokenBalances}
        stakedDataWithTokenBalances={stakedDataWithTokenBalances ?? []}
      />

      {!loading &&
        !isLoadingStakedDataWithTokenBalances &&
        (filteredData.length === 0 || !stakedDataWithTokenBalances) && (
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
