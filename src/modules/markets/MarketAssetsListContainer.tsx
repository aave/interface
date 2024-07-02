import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Switch, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { TitleWithSearchBar } from 'src/components/TitleWithSearchBar';
import { MarketWarning } from 'src/components/transactions/Warnings/MarketWarning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import MarketAssetsList from 'src/modules/markets/MarketAssetsList';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { getGhoReserve, GHO_MINTING_MARKETS, GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { GENERAL } from '../../utils/mixPanelEvents';
import { GhoBanner } from './Gho/GhoBanner';

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

export const MarketAssetsListContainer = () => {
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const trackEvent = useRootStore((store) => store.trackEvent);

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
  const marketFrozen = !reserves.some((reserve) => !reserve.isFrozen);
  const showFrozenMarketWarning =
    marketFrozen && ['Harmony', 'Fantom', 'Ethereum AMM'].includes(currentMarketData.marketTitle);
  const unfrozenReserves = filteredData.filter((r) => !r.isFrozen && !r.isPaused);
  const [showFrozenMarketsToggle, setShowFrozenMarketsToggle] = useState(false);

  const handleChange = () => {
    setShowFrozenMarketsToggle((prevState) => !prevState);
  };

  const frozenOrPausedReserves = filteredData.filter((r) => r.isFrozen || r.isPaused);

  return (
    <ListWrapper
      titleComponent={
        <TitleWithSearchBar
          onSearchTermChange={setSearchTerm}
          title={
            <>
              {currentMarketData.marketTitle} <Trans>assets</Trans>
            </>
          }
          searchPlaceholder={sm ? 'Search asset' : 'Search asset name, symbol, or address'}
        />
      }
    >
      {showFrozenMarketWarning && (
        <Box mx={6}>
          <MarketWarning marketName={currentMarketData.marketTitle} forum />
        </Box>
      )}

      {displayGhoBanner && (
        <Box mb={4}>
          <GhoBanner reserve={ghoReserve} />
        </Box>
      )}

      {/* Unfrozen assets list */}
      <MarketAssetsList reserves={unfrozenReserves} loading={loading} />

      {/* Frozen or paused assets list */}
      {frozenOrPausedReserves.length > 0 && (
        <Box sx={{ mt: 10, px: { xs: 4, xsm: 6 } }}>
          <Typography variant="h4" mb={4}>
            <Trans>Show Frozen or paused assets</Trans>

            <Switch
              checked={showFrozenMarketsToggle}
              onChange={handleChange}
              inputProps={{ 'aria-label': 'controlled' }}
            />
          </Typography>
          {showFrozenMarketsToggle && (
            <Warning severity="info">
              <Trans>
                These assets are temporarily frozen or paused by Aave community decisions, meaning
                that further supply / borrow, or rate swap of these assets are unavailable.
                Withdrawals and debt repayments are allowed. Follow the{' '}
                <Link
                  onClick={() => {
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      link: 'Frozen Market Markets Page',
                      frozenMarket: currentNetworkConfig.name,
                    });
                  }}
                  href="https://governance.aave.com"
                  underline="always"
                >
                  Aave governance forum
                </Link>{' '}
                for further updates.
              </Trans>
            </Warning>
          )}
        </Box>
      )}
      {showFrozenMarketsToggle && (
        <MarketAssetsList reserves={frozenOrPausedReserves} loading={loading} />
      )}

      {/* Show no search results message if nothing hits in either list */}
      {!loading && filteredData.length === 0 && !displayGhoBanner && (
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
