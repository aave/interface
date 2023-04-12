import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { MarketWarning } from 'src/components/transactions/Warnings/MarketWarning';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { MarketAssetListTitle } from 'src/modules/markets/MarketAssetListTitle';
import MarketAssetsList from 'src/modules/markets/MarketAssetsList';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { getGhoReserve, GHO_SUPPORTED_MARKETS, GHO_SYMBOL } from 'src/utils/ghoUtilities';

import { GhoMarketAssetsListItem } from './Gho/GhoMarketAssetsListItem';
import { GhoMarketAssetsListMobileItem } from './Gho/GhoMarketAssetsListMobileItem';

export const MarketAssetsListContainer = () => {
  const isTableChangedToCards = useMediaQuery('(max-width:1125px)');
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, currentMarketData, currentNetworkConfig } = useProtocolDataContext();
  const { breakpoints } = useTheme();
  const sm = useMediaQuery(breakpoints.down('sm'));
  const [searchTerm, setSearchTerm] = useState('');

  const ghoReserve = getGhoReserve(reserves);
  const filteredData = reserves
    // Filter out any non-active reserves
    .filter((res) => res.isActive)
    // Filter out all GHO, as we deliberately display it on supported markets
    .filter((res) => res !== ghoReserve)
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

  // Determine frozen reserves
  const marketFrozen = !reserves.some((reserve) => !reserve.isFrozen);
  const showFrozenMarketWarning =
    marketFrozen && ['Harmony', 'Fantom'].includes(currentNetworkConfig.name);
  const unfrozenReserves = filteredData.filter((r) => !r.isFrozen);
  const frozenReserves = filteredData.filter((r) => r.isFrozen);

  // Determine if to show GHO market list item
  const shouldDisplayGho = (marketTitle: string, searchTerm: string): boolean => {
    if (!GHO_SUPPORTED_MARKETS.concat('proto_sepolia_gho_v3').includes(marketTitle)) {
      // TODO add to utilities
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    return (
      normalizedSearchTerm.length <= 3 && GHO_SYMBOL.toLowerCase().includes(normalizedSearchTerm)
    );
  };
  const displayGho: boolean = shouldDisplayGho(currentMarket, searchTerm);

  return (
    <ListWrapper
      titleComponent={
        <MarketAssetListTitle
          onSearchTermChange={setSearchTerm}
          marketTitle={currentMarketData.marketTitle}
        />
      }
    >
      {showFrozenMarketWarning && (
        <Box mx={6}>
          <MarketWarning marketName={currentNetworkConfig.name} forum />
        </Box>
      )}

      {displayGho && (
        <Box mb={4}>
          {isTableChangedToCards ? (
            <GhoMarketAssetsListMobileItem reserve={ghoReserve} />
          ) : (
            <GhoMarketAssetsListItem reserve={ghoReserve} />
          )}
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
              <Link href="https://governance.aave.com" underline="always">
                Aave governance forum
              </Link>{' '}
              for further updates.
            </Trans>
          </Warning>
        </Box>
      )}
      <MarketAssetsList reserves={frozenReserves} loading={loading} />

      {/* Show no search results message if nothing hits in either list */}
      {!loading && filteredData.length === 0 && !displayGho && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            pt: 15,
            pb: 32,
            px: 4,
          }}
        >
          {sm ? (
            <Box sx={{ textAlign: 'center', maxWidth: '300px' }}>
              <Typography variant="h2">
                <Trans>No search results for</Trans>
              </Typography>
              <Typography sx={{ overflowWrap: 'anywhere' }} variant="h2">
                &apos;{searchTerm}&apos;
              </Typography>
            </Box>
          ) : (
            <Typography
              sx={{ textAlign: 'center', maxWidth: '480px', overflowWrap: 'anywhere' }}
              variant="h2"
            >
              <Trans>No search results for</Trans> &apos;{searchTerm}&apos;
            </Typography>
          )}
          <Typography
            sx={{ width: '280px', textAlign: 'center' }}
            variant="description"
            color="text.secondary"
          >
            <Trans>
              We couldn&apos;t find any assets related to your search. Try again with a different
              asset name, symbol, or address.
            </Trans>
          </Typography>
        </Box>
      )}
    </ListWrapper>
  );
};
