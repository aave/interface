import { ChevronDownIcon, SearchIcon, XIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon, StarIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  Popover,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useMemo, useRef, useState } from 'react';
import { useRootStore } from 'src/store/root';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import { DASHBOARD } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import {
  availableMarkets,
  CustomMarket,
  ENABLE_TESTNET,
  MarketDataType,
  marketsData,
  networkConfigs,
  STAGING_ENV,
} from '../utils/marketsAndNetworksConfig';

export const getMarketInfoById = (marketId: CustomMarket) => {
  const market: MarketDataType = marketsData[marketId as CustomMarket];
  const network: BaseNetworkConfig = networkConfigs[market.chainId];
  const logo = market.logo || network.networkLogoPath;

  return { market, logo };
};

export const getMarketHelpData = (marketName: string) => {
  const testChains = [
    'Görli',
    'Ropsten',
    'Mumbai',
    'Sepolia',
    'Fuji',
    'Testnet',
    'Kovan',
    'Rinkeby',
  ];
  const arrayName = marketName.split(' ');
  const testChainName = arrayName.filter((el) => testChains.indexOf(el) > -1);
  const marketTitle = arrayName.filter((el) => !testChainName.includes(el)).join(' ');

  return {
    name: marketTitle,
    testChainName: testChainName[0],
  };
};

export type Market = {
  marketTitle: string;
  networkName: string;
  networkLogo: string;
  selected?: boolean;
};

type MarketLogoProps = {
  size: number;
  logo: string;
  testChainName?: string;
  sx?: BoxProps;
};

export const MarketLogo = ({ size, logo, testChainName, sx }: MarketLogoProps) => {
  return (
    <Box sx={{ mr: 2, width: size, height: size, position: 'relative', ...sx }}>
      <img
        src={logo}
        alt=""
        width="100%"
        height="100%"
        style={{ display: 'block', objectFit: 'contain', objectPosition: 'center center' }}
      />

      {testChainName && (
        <Tooltip title={testChainName} arrow>
          <Box
            sx={{
              bgcolor: '#29B6F6',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              color: 'common.white',
              fontSize: '12px',
              lineHeight: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'absolute',
              right: '-2px',
              bottom: '-2px',
            }}
          >
            {testChainName.split('')[0]}
          </Box>
        </Tooltip>
      )}
    </Box>
  );
};

type MarketCategory = 'ethereum' | 'l2' | 'other';

const MARKET_CATEGORY: Record<string, MarketCategory> = {
  // Ethereum mainnet instances
  Core: 'ethereum',
  Prime: 'ethereum',
  Plasma: 'ethereum',
  EtherFi: 'ethereum',
  'Aave Horizon': 'ethereum',
  // L2 networks
  Base: 'l2',
  Arbitrum: 'l2',
  OP: 'l2',
  Mantle: 'l2',
  Linea: 'l2',
  Scroll: 'l2',
  ZKsync: 'l2',
  Polygon: 'l2',
  Ink: 'l2',
  'X Layer': 'l2',
  Celo: 'l2',
  Soneium: 'l2',
  MegaETH: 'l2',
  Metis: 'l2',
  // Other L1 chains
  Avalanche: 'other',
  'BNB Chain': 'other',
  Gnosis: 'other',
  Sonic: 'other',
  Aptos: 'other',
};

const getMarketCategory = (marketId: CustomMarket): MarketCategory => {
  const { market } = getMarketInfoById(marketId);
  return MARKET_CATEGORY[market.marketTitle] ?? 'other';
};

// Custom market order requested by BD - TODO: move logic to the backend based on TVL
const MARKET_ORDER_BY_TITLE: { [title: string]: number } = {
  Core: 0,
  Prime: 1,
  Plasma: 2,
  Base: 3,
  Arbitrum: 4,
  Mantle: 5,
  Ink: 6,
  Avalanche: 7,
  'Aave Horizon': 8,
  'BNB Chain': 9,
  'X Layer': 10,
  Polygon: 11,
  Gnosis: 12,
  Aptos: 13,
  Linea: 14,
  OP: 15,
  MegaETH: 16,
  Sonic: 17,
  Celo: 18,
  Scroll: 19,
  ZKsync: 20,
  Soneium: 21,
  Metis: 22,
  EtherFi: 23,
};

const getMarketOrder = (marketId: CustomMarket): number => {
  const { market } = getMarketInfoById(marketId);
  return MARKET_ORDER_BY_TITLE[market.marketTitle] ?? 999;
};

export const MarketSwitcher = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const open = Boolean(anchorEl);

  const theme = useTheme();
  const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [trackEvent, currentMarket, setCurrentMarket] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarket, store.setCurrentMarket])
  );
  const isFavoriteMarket = useRootStore((store) => store.isFavoriteMarket);
  const toggleFavoriteMarket = useRootStore((store) => store.toggleFavoriteMarket);
  const favoriteMarkets = useRootStore((store) => store.favoriteMarkets);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setSearchQuery('');
  };

  const handleSelectMarket = (marketId: CustomMarket) => {
    const market = marketsData[marketId];
    trackEvent(DASHBOARD.CHANGE_MARKET, { market: marketId });

    if (market.externalUrl) {
      window.open(market.externalUrl, '_blank');
      return;
    }

    setCurrentMarket(marketId);
    handleClose();
  };

  const handleStarClick = (e: React.MouseEvent, marketId: CustomMarket) => {
    e.stopPropagation();
    toggleFavoriteMarket(marketId);
  };

  const marketBlurbs: { [key: string]: JSX.Element } = {
    proto_ink_v3: <Trans>The Ink instance is governed by the Ink Foundation</Trans>,
    proto_mainnet_v3: (
      <Trans>Main Ethereum market with the largest selection of assets and yield options</Trans>
    ),
    proto_lido_v3: (
      <Trans>Optimized for efficiency and risk by supporting blue-chip collateral assets</Trans>
    ),
  };

  // Filter to V3 markets only
  const v3Markets = useMemo(() => availableMarkets.filter((id) => marketsData[id].v3), []);

  const { pinned, ethereum, l2, other } = useMemo(() => {
    const query = searchQuery.toLowerCase();
    const filtered = v3Markets.filter((id) => {
      const { market } = getMarketInfoById(id);
      return market.marketTitle.toLowerCase().includes(query);
    });

    const sorted = filtered.slice().sort((a, b) => getMarketOrder(a) - getMarketOrder(b));
    const pinned = sorted.filter((id) => isFavoriteMarket(id));
    const pinnedSet = new Set(pinned);
    const unpinned = sorted.filter((id) => !pinnedSet.has(id));

    return {
      pinned,
      ethereum: unpinned.filter((id) => getMarketCategory(id) === 'ethereum'),
      l2: unpinned.filter((id) => getMarketCategory(id) === 'l2'),
      other: unpinned.filter((id) => getMarketCategory(id) === 'other'),
    };
  }, [v3Markets, searchQuery, favoriteMarkets, isFavoriteMarket]);

  // --- Render helpers ---

  const renderPinnedChip = (marketId: CustomMarket) => {
    const { market, logo } = getMarketInfoById(marketId);
    const marketNaming = getMarketHelpData(market.marketTitle);
    const isSelected = marketId === currentMarket;
    return (
      <Box
        key={marketId}
        onClick={() => handleSelectMarket(marketId)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          height: 36,
          pl: '6px',
          pr: '10px',
          py: 1,
          borderRadius: '48px',
          border: '1px solid',
          borderColor: isSelected ? 'primary.main' : 'rgba(0,0,0,0.1)',
          bgcolor: isSelected ? 'action.selected' : 'transparent',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ width: 24, height: 24, flexShrink: 0 }}>
            <img
              src={logo}
              alt=""
              width="100%"
              height="100%"
              style={{ display: 'block', objectFit: 'contain' }}
            />
          </Box>
          <Typography
            noWrap
            sx={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.15px', lineHeight: '20px' }}
          >
            {marketNaming.name} {market.isFork ? 'Fork' : ''}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={(e) => handleStarClick(e, marketId)}
          sx={{
            padding: 0,
            flexShrink: 0,
          }}
        >
          <SvgIcon sx={{ fontSize: '20px', color: 'text.secondary' }}>
            <XIcon />
          </SvgIcon>
        </IconButton>
      </Box>
    );
  };

  const renderGridItem = (marketId: CustomMarket, isMobile?: boolean) => {
    const { market, logo } = getMarketInfoById(marketId);
    const marketNaming = getMarketHelpData(market.marketTitle);
    const isFavorite = isFavoriteMarket(marketId);
    const isSelected = marketId === currentMarket;
    return (
      <Box
        key={marketId}
        data-cy={`marketSelector_${marketId}`}
        onClick={() => handleSelectMarket(marketId)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          px: '10px',
          width: isMobile ? '50%' : '33.33%',
          boxSizing: 'border-box',
          borderRadius: '8px',
          cursor: 'pointer',
          position: 'relative',
          bgcolor: isSelected ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: isSelected ? 'action.selected' : 'action.hover' },
          // Star: always visible on mobile, hover-reveal on desktop
          '& .grid-fav-btn': {
            opacity: isMobile || isFavorite ? 1 : 0,
            transition: 'opacity 0.15s',
          },
          '&:hover .grid-fav-btn': {
            opacity: 1,
          },
        }}
      >
        <Box sx={{ width: 24, height: 24, mr: 1, flexShrink: 0 }}>
          <img
            src={logo}
            alt=""
            width="100%"
            height="100%"
            style={{ display: 'block', objectFit: 'contain' }}
          />
        </Box>
        <Typography
          noWrap
          sx={{
            flex: '1 1 0',
            minWidth: 0,
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.15px',
            lineHeight: '20px',
          }}
        >
          {marketNaming.name} {market.isFork ? 'Fork' : ''}
        </Typography>
        {market.externalUrl && (
          <SvgIcon sx={{ fontSize: '14px', color: 'text.muted', ml: 0.5, flexShrink: 0 }}>
            <ExternalLinkIcon />
          </SvgIcon>
        )}
        <IconButton
          className="grid-fav-btn"
          size="small"
          onClick={(e) => handleStarClick(e, marketId)}
          sx={{ padding: '1px', ml: 0.5, flexShrink: 0 }}
        >
          <SvgIcon
            sx={{
              fontSize: '16px',
              color: isFavorite ? '#FBCC5F' : 'text.disabled',
            }}
          >
            <StarIcon />
          </SvgIcon>
        </IconButton>
      </Box>
    );
  };

  const sectionHeader = (label: React.ReactNode) => (
    <Typography
      variant="secondary12"
      color="text.secondary"
      sx={{
        textTransform: 'uppercase',
        letterSpacing: '0.1px',
        px: 2,
        py: 1,
        lineHeight: '16px',
      }}
    >
      {label}
    </Typography>
  );

  const noResults =
    pinned.length === 0 && ethereum.length === 0 && l2.length === 0 && other.length === 0;

  const renderSelectorContent = (mobile: boolean) => (
    <>
      {/* Fixed header with search */}
      <Box sx={{ px: 1.5, pt: 1.5, pb: '2px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>
              {ENABLE_TESTNET || STAGING_ENV ? 'Select Aave Testnet Market' : 'Select Aave Market'}
            </Trans>
          </Typography>
          {mobile && (
            <IconButton size="small" onClick={handleClose} sx={{ p: 0.5 }}>
              <SvgIcon sx={{ fontSize: '18px' }}>
                <XIcon />
              </SvgIcon>
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ px: 1.5, pb: '10px' }}>
        <TextField
          inputRef={searchRef}
          size="small"
          placeholder="Search Markets"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ mr: '9px' }}>
                <SvgIcon sx={{ fontSize: 16, color: '#A5A8B6' }}>
                  <SearchIcon />
                </SvgIcon>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '6px',
              height: '36px',
              '& fieldset': {
                borderColor: '#EAEBEF',
              },
            },
            '& .MuiOutlinedInput-input': {
              fontSize: '14px',
              letterSpacing: '0.15px',
              '&::placeholder': {
                color: '#A5A8B6',
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Scrollable content */}
      <Box sx={{ overflowY: 'auto', flex: 1, pb: 1 }}>
        {/* Favourites */}
        {pinned.length > 0 && (
          <Box>
            <Typography
              variant="secondary12"
              color="text.secondary"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.1px',
                px: 2,
                py: 1,
                lineHeight: '16px',
              }}
            >
              <Trans>Favourites</Trans>
            </Typography>
            <Box sx={{ display: 'flex', gap: '4px', flexWrap: 'wrap', px: 2, pb: '4px' }}>
              {pinned.map(renderPinnedChip)}
            </Box>
            <Divider sx={{ mt: 1 }} />
          </Box>
        )}

        {/* Ethereum */}
        {ethereum.length > 0 && (
          <Box>
            {sectionHeader(<Trans>Ethereum</Trans>)}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 1.5 }}>
              {ethereum.map((id) => renderGridItem(id, mobile))}
            </Box>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        {/* L2 Networks */}
        {l2.length > 0 && (
          <Box>
            {sectionHeader(<Trans>L2 Networks</Trans>)}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 1.5 }}>
              {l2.map((id) => renderGridItem(id, mobile))}
            </Box>
            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        {/* L1 Networks */}
        {other.length > 0 && (
          <Box>
            {sectionHeader(<Trans>L1 Networks</Trans>)}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', px: 1.5 }}>
              {other.map((id) => renderGridItem(id, mobile))}
            </Box>
          </Box>
        )}

        {/* No results */}
        {noResults && (
          <Box sx={{ px: 4, py: 3, textAlign: 'center' }}>
            <Typography variant="description" color="text.secondary">
              <Trans>No markets found</Trans>
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );

  // --- Current market display (trigger) ---

  const { market: currentMarketData, logo: currentLogo } = getMarketInfoById(currentMarket);
  const currentMarketNaming = getMarketHelpData(currentMarketData.marketTitle);

  return (
    <>
      {/* Trigger */}
      <Box
        onClick={handleOpen}
        data-cy="marketSelector"
        sx={{
          mr: 2,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <MarketLogo
            size={upToLG ? 32 : 28}
            logo={currentLogo}
            testChainName={currentMarketNaming.testChainName}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant={upToLG ? 'display1' : 'h1'}
              sx={{
                fontSize: downToXSM ? '1.55rem' : undefined,
                color: 'common.white',
                mr: 1,
              }}
            >
              {currentMarketNaming.name} {currentMarketData.isFork ? 'Fork' : ''}
              {upToLG && (currentMarket === 'proto_mainnet_v3' || currentMarket === 'proto_lido_v3')
                ? 'Instance'
                : ' Market'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {currentMarketData.v3 ? (
                <Box
                  sx={{
                    color: '#fff',
                    px: 2,
                    borderRadius: '12px',
                    background: (theme) => theme.palette.gradients.aaveGradient,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subheader2">V3</Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    color: '#A5A8B6',
                    px: 2,
                    borderRadius: '12px',
                    backgroundColor: '#383D51',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subheader2">V2</Typography>
                </Box>
              )}
              <SvgIcon
                fontSize="medium"
                sx={{
                  ml: 1,
                  color: '#F1F1F3',
                  transform: open ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s',
                }}
              >
                <ChevronDownIcon />
              </SvgIcon>
            </Box>
          </Box>
        </Box>

        {marketBlurbs[currentMarket] && (
          <Typography
            sx={{
              color: 'common.white',
              mt: 0.5,
              fontSize: '0.85rem',
              wordWrap: 'break-word',
              whiteSpace: 'normal',
              lineHeight: 1.3,
              maxWidth: '100%',
            }}
          >
            {marketBlurbs[currentMarket]}
          </Typography>
        )}
      </Box>

      {/* Market selector content (shared between Popover and Drawer) */}
      {isMobile ? (
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          PaperProps={{
            sx: {
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            },
          }}
        >
          {/* Drag handle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, pb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 4,
                borderRadius: '2px',
                bgcolor: 'divider',
              }}
            />
          </Box>
          {renderSelectorContent(true)}
        </Drawer>
      ) : (
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          TransitionProps={{
            onEntered: () => searchRef.current?.focus(),
          }}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                width: 535,
                maxHeight: 520,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                mt: 1,
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.04)',
                boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.1), 0px 4px 20px 0px rgba(0,0,0,0.15)',
              },
            },
          }}
        >
          {renderSelectorContent(false)}
        </Popover>
      )}
    </>
  );
};
