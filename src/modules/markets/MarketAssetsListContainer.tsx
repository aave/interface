import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
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

import { MARKETS } from '../../utils/mixPanelEvents';

export const MarketAssetsListContainer = () => {
  const { reserves, loading } = useAppDataContext();
  const { currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const [searchTerm, setSearchTerm] = useState('');
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const trackEvent = useRootStore((store) => store.trackEvent);

  const filteredData = reserves
    .filter((res) => res.isActive)
    .filter((res) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        res.symbol.toLowerCase().includes(term) ||
        res.name.toLowerCase().includes(term) ||
        res.underlyingAsset.toLowerCase().includes(term)
      );
    })
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
    marketFrozen && ['Harmony', 'Fantom'].includes(currentNetworkConfig.name);
  const unfrozenReserves = filteredData.filter((r) => !r.isFrozen);
  const frozenReserves = filteredData.filter((r) => r.isFrozen);

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
          <MarketWarning marketName={currentNetworkConfig.name} forum />
        </Box>
      )}

      {/* Unfrozen assets list */}
      <MarketAssetsList reserves={unfrozenReserves} loading={loading} />

      {/* Frozen assets list */}
      {frozenReserves.length > 0 && (
        <Box sx={{ mt: 10, px: { xs: 4, xsm: 6 } }}>
          <Typography variant="h4" mb={4}>
            <Trans>Frozen assets</Trans>
          </Typography>
          <Warning severity="info">
            <Trans>
              These assets are temporarily frozen by Aave community decisions, meaning that further
              supply / borrow, or rate swap of these assets are unavailable. Withdrawals and debt
              repayments are allowed. Follow the{' '}
              <Link
                onClick={() => {
                  trackEvent(MARKETS.VIEW_FROZEN_GOV_POST_MARKET, {
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
        </Box>
      )}
      <MarketAssetsList reserves={frozenReserves} loading={loading} />

      {/* Show no search results message if nothing hits in either list */}
      {!loading && filteredData.length === 0 && (
        <NoSearchResults
          searchTerm={searchTerm}
          subtitle="We couldn't find any assets related to your search. Try again with a different asset
          name, symbol, or address."
        />
      )}
    </ListWrapper>
  );
};
