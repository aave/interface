import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  Alert,
  Box,
  Divider,
  FormControlLabel,
  Paper,
  Switch,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { AssetsFilterBar } from 'src/components/AssetsFilterBar';
import { NoSearchResults } from 'src/components/NoSearchResults';
import { Link } from 'src/components/primitives/Link';
import { ReserveWithId, useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { usePoolTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { useCoingeckoCategories } from 'src/hooks/useCoinGeckoCategories';
import MarketAssetsList from 'src/modules/markets/MarketAssetsList';
import { useRootStore } from 'src/store/root';
import { GHO_MINTING_MARKETS, GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { GENERAL } from '../../utils/events';
import { isAssetHidden } from '../dashboard/lists/constants';
import { SavingsGhoBanner } from './Gho/GhoBanner';
import { AssetCategory, matchesSelectedCategories } from './utils/assetCategories';

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
  const { data, isLoading, error } = useCoingeckoCategories();

  const { supplyReserves, loading } = useAppDataContext();

  const [trackEvent, account, currentMarket, currentMarketData, currentNetworkConfig] =
    useRootStore(
      useShallow((store) => [
        store.trackEvent,
        store.account,
        store.currentMarket,
        store.currentMarketData,
        store.currentNetworkConfig,
      ])
    );
  const { data: tokenBalances } = usePoolTokensBalance(currentMarketData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<AssetCategory[]>([]);
  const [inWalletOnly, setInWalletOnly] = useState(false);

  const { breakpoints } = useTheme();

  const sm = useMediaQuery(breakpoints.down('sm'));

  const displayGhoBanner = shouldDisplayGhoBanner(currentMarket, searchTerm);

  const [showLowLiquidityToggle, setShowLowLiquidityToggle] = useState(false);

  const heldAddresses = new Set(
    (tokenBalances ?? []).filter((b) => b.amount !== '0').map((b) => b.address)
  );

  // Native-asset reserves hold their balance under the mock ETH address, not their own.
  const heldInWallet = (res: ReserveWithId) =>
    heldAddresses.has(res.underlyingToken.address.toLowerCase()) ||
    (!!res.acceptsNative && heldAddresses.has(API_ETH_MOCK_ADDRESS.toLowerCase()));

  // Keyed off the same condition that renders the toggle, so disconnecting can't strand the filter.
  const inWalletActive = !!account && inWalletOnly;

  const baseFilteredData = supplyReserves
    // Filter out any hidden assets
    .filter((res) => !isAssetHidden(currentMarketData.market, res.underlyingToken.address))
    // filter out any that don't meet search term criteria
    .filter((res) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        res.underlyingToken.symbol.toLowerCase().includes(term) ||
        res.underlyingToken.name.toLowerCase().includes(term) ||
        res.underlyingToken.address.toLowerCase().includes(term)
      );
    })
    // "In Wallet": only assets the user holds
    .filter((res) => !inWalletActive || heldInWallet(res))
    // Category filter (shared with the dashboard / staking asset lists)
    .filter((res) =>
      matchesSelectedCategories(
        res.underlyingToken.symbol,
        selectedCategories,
        data?.stablecoinSymbols,
        data?.ethCorrelatedSymbols
      )
    );

  // If every remaining asset is below the $100k supply threshold, showing the
  // low-liquidity filter would leave the list empty, so show all assets instead.
  const hasHighLiquidityAssets = baseFilteredData.some((res) => Number(res.size.usd) >= 100_000);

  const filteredData = baseFilteredData
    // Filter out low-liquidity assets (<$100k supply) unless toggle is enabled
    // (or unless all assets would otherwise be filtered out)
    .filter(
      (res) => showLowLiquidityToggle || !hasHighLiquidityAssets || Number(res.size.usd) >= 100_000
    )
    // Add initial sorting by total supplied in USD descending
    .sort((a, b) => {
      const aValue = Number(a.size.usd) || 0;
      const bValue = Number(b.size.usd) || 0;
      return bValue - aValue;
    })
    // Transform the object for list to consume it
    .map((reserve) => ({
      ...reserve,
      ...(reserve.acceptsNative
        ? {
            underlyingToken: {
              ...reserve.underlyingToken,
              name: currentNetworkConfig.baseAssetSymbol, // e.g., "Ethereum"
              symbol: currentNetworkConfig.baseAssetSymbol, // e.g., "ETH"
              imageUrl: currentNetworkConfig.baseAssetSymbol.toLowerCase(), // This might need adjustment based on your icon system
            },
          }
        : {}),
    }));

  // const marketFrozen = !reserves.some((reserve) => !reserve.isFrozen);
  // const showFrozenMarketWarning =
  //   marketFrozen && ['Fantom', 'Ethereum AMM'].includes(currentMarketData.marketTitle);
  const unfrozenReserves = filteredData.filter((r) => !r.isFrozen && !r.isPaused);

  const [showFrozenMarketsToggle, setShowFrozenMarketsToggle] = useState(false);

  const handleChange = () => {
    setShowFrozenMarketsToggle((prevState) => !prevState);
  };

  const frozenOrPausedReserves = filteredData.filter((r) => r.isFrozen || r.isPaused);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {displayGhoBanner && <SavingsGhoBanner />}

      <AssetsFilterBar
        searchPlaceholder={sm ? 'Search asset' : 'Search asset name, symbol, or address'}
        onSearchTermChange={setSearchTerm}
        inWallet={account ? { value: inWalletOnly, onChange: setInWalletOnly } : undefined}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        categoriesDisabled={isLoading || !!error}
      />

      <Paper variant="table">
        {/* Unfrozen assets list */}
        <MarketAssetsList reserves={unfrozenReserves} loading={loading} />

        {showFrozenMarketsToggle && frozenOrPausedReserves.length > 0 && (
          <>
            <Box sx={{ mt: 10, px: { xs: 4, xsm: 6 } }}>
              <Alert severity="info" sx={{ mb: 6, width: '100%' }}>
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
              </Alert>
            </Box>
            <MarketAssetsList reserves={frozenOrPausedReserves} loading={loading} />
          </>
        )}

        {/* Show no search results message if nothing hits in either list */}
        {!loading && filteredData.length === 0 && !displayGhoBanner && (
          <NoSearchResults
            searchTerm={searchTerm}
            subtitle={<Trans>We couldn&apos;t find any assets related to your search.</Trans>}
          />
        )}

        <Box
          sx={{
            mt: 6,
            px: { xs: 4, xsm: 6 },
            py: 3,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 1, sm: 3 },
          }}
        >
          {frozenOrPausedReserves.length > 0 && (
            <>
              <FormControlLabel
                sx={{ m: 0 }}
                control={
                  <Switch
                    checked={showFrozenMarketsToggle}
                    onChange={handleChange}
                    inputProps={{ 'aria-label': 'show frozen or paused assets' }}
                  />
                }
                label={<Trans>Show frozen/paused assets</Trans>}
                componentsProps={{ typography: { variant: 'subheader1' } }}
              />
              <Divider
                orientation={sm ? 'horizontal' : 'vertical'}
                flexItem
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              />
            </>
          )}
          <FormControlLabel
            sx={{ m: 0 }}
            control={
              <Switch
                checked={showLowLiquidityToggle || !hasHighLiquidityAssets}
                onChange={() => setShowLowLiquidityToggle((prev) => !prev)}
                inputProps={{ 'aria-label': 'show assets under 100k supply' }}
              />
            }
            label={<Trans>{'Show assets <$100k supply'}</Trans>}
            componentsProps={{ typography: { variant: 'subheader1' } }}
          />
        </Box>
      </Paper>
    </Box>
  );
};
