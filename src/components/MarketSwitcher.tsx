import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { t, Trans } from '@lingui/macro';
import {
  Box,
  BoxProps,
  Drawer,
  FormControlLabel,
  IconButton,
  InputBase,
  Popover,
  SvgIcon,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import React, { useMemo, useRef, useState } from 'react';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { FAVOURITE_STAR_COLOR, StarIcon } from 'src/components/icons/StarIcon';
import { useRootStore } from 'src/store/root';
import { BaseNetworkConfig } from 'src/ui-config/networksConfig';
import { DASHBOARD } from 'src/utils/events';
import { figVars, onAccent } from 'src/utils/figmaColors';
import { insetHighlightActive, insetHighlightBase } from 'src/utils/insetHighlight';
import { useShallow } from 'zustand/shallow';

import {
  availableMarkets,
  CustomMarket,
  MarketDataType,
  marketsData,
  networkConfigs,
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
              color: onAccent,
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

type MarketCategory = 'ethereum' | 'l2' | 'other' | 'legacy';

const MARKET_CATEGORY: Record<string, MarketCategory> = {
  // Ethereum mainnet instances
  Core: 'ethereum',
  Prime: 'ethereum',
  'Aave Horizon': 'ethereum',
  // L2 networks
  Base: 'l2',
  Arbitrum: 'l2',
  OP: 'l2',
  Mantle: 'l2',
  Linea: 'l2',
  Polygon: 'l2',
  Ink: 'l2',
  'X Layer': 'l2',
  Celo: 'l2',
  MegaETH: 'l2',
  // Other L1 chains
  Plasma: 'other',
  Avalanche: 'other',
  'BNB Chain': 'other',
  Gnosis: 'other',
  Sonic: 'other',
  Aptos: 'other',
  // Legacy markets
  EtherFi: 'legacy',
  ZKsync: 'legacy',
  Soneium: 'legacy',
  Metis: 'legacy',
  Scroll: 'legacy',
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

const AAVE_PRO_URL = 'https://pro.aave.com/';
const AAVE_PRO_LOGO = '/icons/markets/aave-pro.png';

interface MarketSwitcherProps {
  /**
   * Hide the page-title-only chrome (the "Instance"/"Market" suffix and the market
   * description blurb) when the switcher sits next to an existing page title, e.g. the
   * Staking header. Default false = full title treatment (homepage).
   */
  hideTitleChrome?: boolean;
  /**
   * Optional label rendered inside the trigger, before the market logo and at the same
   * size as the market name, so it reads and clicks as one unit (e.g. "Staking" on the
   * Staking header). Prefer this over a sibling <Typography> next to <MarketSwitcher />,
   * which would leave the label outside the clickable/hoverable trigger.
   */
  titlePrefix?: React.ReactNode;
}

export const MarketSwitcher = ({ hideTitleChrome = false, titlePrefix }: MarketSwitcherProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLegacy, setShowLegacy] = useState(false);
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
    proto_ink_v3: (
      <Trans>
        This Ink instance is operated by Tydro and governed by the Ink Foundation, independent from
        Aave DAO operated markets.
      </Trans>
    ),
    proto_mainnet_v3: (
      <Trans>Main Ethereum market with the largest selection of assets and yield options</Trans>
    ),
    proto_lido_v3: (
      <Trans>Optimized for efficiency and risk by supporting blue-chip collateral assets</Trans>
    ),
  };

  // Filter to V3 markets only
  const v3Markets = useMemo(() => availableMarkets.filter((id) => marketsData[id].v3), []);

  const { pinned, ethereum, l2, other, legacy } = useMemo(() => {
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
      legacy: unpinned.filter((id) => getMarketCategory(id) === 'legacy'),
    };
  }, [v3Markets, searchQuery, favoriteMarkets, isFavoriteMarket]);

  // --- Render helpers ---

  const renderRowLogo = (src: string) => (
    <Box sx={{ width: '1.5rem', height: '1.5rem', mr: '0.75rem', flexShrink: 0 }}>
      <img
        src={src}
        alt=""
        width="100%"
        height="100%"
        style={{ display: 'block', objectFit: 'contain' }}
      />
    </Box>
  );

  const renderGridItem = (marketId: CustomMarket, isMobile?: boolean, width = '33.33%') => {
    const { market, logo } = getMarketInfoById(marketId);
    const marketNaming = getMarketHelpData(market.marketTitle);
    const isFavorite = isFavoriteMarket(marketId);
    const isSelected = marketId === currentMarket;
    return (
      <Box
        key={marketId}
        role="button"
        tabIndex={0}
        data-cy={`marketSelector_${marketId}`}
        onClick={() => handleSelectMarket(marketId)}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectMarket(marketId);
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '2.5rem',
          py: '0.5rem',
          px: '0.75rem',
          width: isMobile ? '50%' : width,
          boxSizing: 'border-box',
          borderRadius: '8px',
          cursor: 'pointer',
          // Hover/selected highlight on an inset pseudo-element so adjacent options keep a gap
          // (shared recipe with the dropdown menu items — see insetHighlight.ts). The current
          // market gets a persistent fill via restFill; others fill in on hover.
          ...insetHighlightBase({
            theme,
            radius: '8px',
            inset: '1px',
            restFill: isSelected ? figVars['selected'] : undefined,
          }),
          ...(isSelected
            ? {}
            : {
                // Row highlight on hover AND on keyboard focus — of the row itself or its star
                // button (`:focus-within`) — so tabbing through always shows where you are.
                '&:hover::before, &:focus-within::before': insetHighlightActive(
                  figVars['button-hover']
                ),
              }),
          // Star: always visible on mobile, hover-reveal on desktop; also reveal it whenever the
          // row or the star button is focused, so keyboard users can see the favourite toggle.
          '& .grid-fav-btn': {
            opacity: isMobile || isFavorite ? 1 : 0,
            transition: 'opacity 0.15s',
          },
          '&:hover .grid-fav-btn, &:focus-within .grid-fav-btn': {
            opacity: 1,
          },
          // Keyboard focus lands on the star itself: ring it with an outline so it reads as focused
          // (global ripple is disabled — add our own affordance).
          '& .grid-fav-btn:focus-visible': {
            opacity: 1,
            // Same focus ring the buttons use (MuiButton root in theme.tsx).
            outline: `2px solid ${figVars['fg-1']}`,
            outlineOffset: '2px',
          },
          // The empty (non-favourited) star fills a step stronger (fg-4 → fg-3) on hover / focus.
          ...(isFavorite
            ? {}
            : {
                '&:hover .grid-fav-btn .MuiSvgIcon-root, & .grid-fav-btn:focus-visible .MuiSvgIcon-root':
                  {
                    color: figVars['fg-3'],
                  },
              }),
        }}
      >
        {renderRowLogo(logo)}
        <Typography
          noWrap
          variant="h5"
          color="fg-1"
          sx={{
            flex: '1 1 0',
            minWidth: 0,
          }}
        >
          {marketNaming.name} {market.isFork ? 'Fork' : ''}
        </Typography>
        {market.externalUrl && (
          <SvgIcon sx={{ fontSize: '14px', color: 'fg-3', ml: 0.5, flexShrink: 0 }}>
            <ExternalLinkIcon />
          </SvgIcon>
        )}
        <IconButton
          className="grid-fav-btn"
          size="small"
          onClick={(e) => handleStarClick(e, marketId)}
          sx={{ padding: '1px', ml: 0.5, flexShrink: 0 }}
        >
          <StarIcon
            sx={{
              fontSize: '16px',
              color: isFavorite ? FAVOURITE_STAR_COLOR : 'fg-4',
            }}
          />
        </IconButton>
      </Box>
    );
  };

  const renderLinkRow = (
    {
      logo,
      label,
      href,
      badge,
    }: { logo: string; label: React.ReactNode; href: string; badge?: React.ReactNode },
    isMobile?: boolean,
    width = '33.33%'
  ) => (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => window.open(href, '_blank')}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(href, '_blank');
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '2.5rem',
        py: '0.5rem',
        px: '0.75rem',
        width: isMobile ? '50%' : width,
        boxSizing: 'border-box',
        borderRadius: '8px',
        cursor: 'pointer',
        // Hover highlight on an inset pseudo-element, matching the market rows (insetHighlight.ts).
        ...insetHighlightBase({ theme, radius: '8px', inset: '1px' }),
        '&:hover::before': insetHighlightActive(figVars['button-hover']),
      }}
    >
      {renderRowLogo(logo)}
      {badge ? (
        <Box sx={{ flex: '1 1 0', minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Typography noWrap variant="h5" color="fg-1" sx={{ minWidth: 0 }}>
            {label}
          </Typography>
          {badge}
        </Box>
      ) : (
        <Typography noWrap variant="h5" color="fg-1" sx={{ flex: '1 1 0', minWidth: 0 }}>
          {label}
        </Typography>
      )}
      <SvgIcon sx={{ fontSize: '14px', color: 'fg-3', ml: 0.5, flexShrink: 0 }}>
        <ExternalLinkIcon />
      </SvgIcon>
    </Box>
  );

  const sectionHeader = (label: React.ReactNode) => (
    <Typography
      sx={{
        color: 'fg-3',
        fontSize: '0.6875rem',
        fontWeight: 600,
        lineHeight: '120%',
        letterSpacing: '0.00063rem',
        textTransform: 'uppercase',
        fontFeatureSettings: "'cv11' on",
      }}
    >
      {label}
    </Typography>
  );

  const renderSection = (title: React.ReactNode, children: React.ReactNode) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {sectionHeader(title)}
      <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>{children}</Box>
    </Box>
  );

  const noResults =
    pinned.length === 0 && ethereum.length === 0 && l2.length === 0 && other.length === 0;

  const renderSelectorContent = (mobile: boolean) => (
    <>
      {/* Mobile-only close button */}
      {mobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, pt: 1 }}>
          <IconButton size="small" onClick={handleClose} sx={{ p: 0.5 }}>
            <SvgIcon sx={{ fontSize: '18px' }}>
              <XIcon />
            </SvgIcon>
          </IconButton>
        </Box>
      )}

      {/* Search — flush to the top edge; keeps the 1px ring border, no soft shadow */}
      <Box
        sx={{
          height: '3.23rem',
          px: '1rem',
          bgcolor: 'bgp-2',
          boxShadow: `0 0 0 1px ${figVars['border-1']}`,
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <InputBase
          inputRef={searchRef}
          placeholder={t`Search markets...`}
          inputProps={{ 'aria-label': t`Search markets` }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startAdornment={
            <SvgIcon sx={{ fontSize: 18, color: 'fg-4', mr: '0.5rem' }}>
              <SearchIcon />
            </SvgIcon>
          }
          sx={{
            flex: 1,
            color: 'fg-1',
            fontSize: '0.875rem',
            fontWeight: 400,
            lineHeight: 1,
            '& input::placeholder': {
              color: 'fg-4',
              opacity: 1,
            },
          }}
        />
      </Box>

      {/* Contents box — 1rem padding all sides, 1.5rem between sections */}
      <Box
        sx={{
          p: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          ...(mobile && { overflowY: 'auto', flex: 1 }),
        }}
      >
        {/* Favourites */}
        {pinned.length > 0 &&
          renderSection(
            <Trans>Favourites</Trans>,
            pinned.map((id) => renderGridItem(id, mobile))
          )}

        {/* Ethereum + Aave Pro link */}
        {ethereum.length > 0 &&
          renderSection(
            <Trans>Ethereum</Trans>,
            <>
              {ethereum.map((id) => renderGridItem(id, mobile))}
              {renderLinkRow(
                {
                  logo: AAVE_PRO_LOGO,
                  href: AAVE_PRO_URL,
                  label: <Trans>Aave Pro</Trans>,
                  badge: (
                    <Box
                      component="span"
                      sx={{
                        width: 26,
                        height: 16,
                        borderRadius: '50px',
                        bgcolor: 'rgba(151, 142, 255, 0.1)',
                        color: '#978eff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '10px',
                        fontWeight: 700,
                        lineHeight: 1,
                        letterSpacing: 0,
                      }}
                    >
                      V4
                    </Box>
                  ),
                },
                mobile
              )}
            </>
          )}

        {/* L1 Networks */}
        {other.length > 0 &&
          renderSection(
            <Trans>L1 Networks</Trans>,
            other.map((id) => renderGridItem(id, mobile))
          )}

        {/* L2 Networks */}
        {l2.length > 0 &&
          renderSection(
            <Trans>L2 Networks</Trans>,
            l2.map((id) => renderGridItem(id, mobile))
          )}

        {/* Legacy + V2 markets link */}
        {showLegacy &&
          renderSection(
            <Trans>Legacy</Trans>,
            <>
              {legacy.map((id) => renderGridItem(id, mobile))}
              {renderLinkRow(
                {
                  logo: '/favicon.ico',
                  href: 'https://v2-market.aave.com/',
                  label: <Trans>V2 Markets</Trans>,
                },
                mobile
              )}
            </>
          )}

        {/* No results */}
        {noResults && (
          <Box sx={{ px: 4, py: 3, textAlign: 'center' }}>
            <Typography variant="description" color="fg-2">
              <Trans>No markets found</Trans>
            </Typography>
          </Box>
        )}

        {/* Show legacy markets — label + switch as a single control */}
        <FormControlLabel
          labelPlacement="start"
          control={
            <Switch
              checked={showLegacy}
              onChange={(e) => setShowLegacy(e.target.checked)}
              inputProps={{ 'aria-label': t`Show legacy markets` }}
            />
          }
          label={<Trans>Show legacy markets</Trans>}
          sx={{
            m: 0,
            alignSelf: 'flex-start',
            gap: '1rem',
            '& .MuiFormControlLabel-label': {
              color: 'fg-2',
              fontSize: '0.875rem',
              fontWeight: 400,
              lineHeight: '100%',
            },
          }}
        />
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
        role="button"
        tabIndex={0}
        onClick={handleOpen}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpen(e as unknown as React.MouseEvent<HTMLElement>);
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t`Select market`}
        data-cy="marketSelector"
        sx={{
          mr: 2,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {titlePrefix && (
            <Typography
              variant={upToLG ? 'display1' : 'h1'}
              sx={{ fontSize: downToXSM ? '1.55rem' : undefined, color: 'fg-1', mr: 3 }}
            >
              {titlePrefix}
            </Typography>
          )}
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
                color: 'fg-1',
                mr: 1,
              }}
            >
              {currentMarketNaming.name} {currentMarketData.isFork ? 'Fork' : ''}
              {!hideTitleChrome &&
                (upToLG &&
                (currentMarket === 'proto_mainnet_v3' || currentMarket === 'proto_lido_v3')
                  ? 'Instance'
                  : ' Market')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {currentMarketData.v3 ? (
                <Box
                  sx={{
                    color: '#fff',
                    px: 2,
                    borderRadius: '12px',
                    bgcolor: 'purple-1',
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
              <ChevronUpDownIcon sx={{ ml: 1, color: 'fg-3' }} />
            </Box>
          </Box>
        </Box>

        {!hideTitleChrome && marketBlurbs[currentMarket] && (
          <Typography
            sx={{
              color: 'fg-2',
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
                bgcolor: 'border-2',
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
              variant: 'modal',
              elevation: 0,
              sx: {
                width: '32.5rem',
                bgcolor: 'bgp-2',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                mt: 1,
                // Offset the panel 1rem to the left of the trigger's left edge.
                ml: '-1rem',
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
