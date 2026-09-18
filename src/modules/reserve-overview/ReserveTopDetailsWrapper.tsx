import { Trans } from '@lingui/macro';
import { Box, Skeleton, Typography } from '@mui/material';
import { BackButton } from 'src/components/BackButton';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { ROUTES } from 'src/components/primitives/Link';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';
import { useShallow } from 'zustand/shallow';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { AddTokenDropdown } from './AddTokenDropdown';
import { GhoReserveTopDetails } from './Gho/GhoReserveTopDetails';
import { ReserveTopDetails } from './ReserveTopDetails';
import { TokenLinkDropdown } from './TokenLinkDropdown';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetailsWrapper = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const { supplyReserves, loading } = useAppDataContext();
  const [currentMarket, currentChainId] = useRootStore(
    useShallow((state) => [state.currentMarket, state.currentChainId])
  );
  const {
    addERC20Token,
    switchNetwork,
    chainId: connectedChainId,
    currentAccount,
  } = useWeb3Context();

  const { market, logo } = getMarketInfoById(currentMarket);

  const poolReserve = supplyReserves.find(
    (reserve) => reserve.underlyingToken.address.toLowerCase() === underlyingAsset?.toLowerCase()
  );
  if (!poolReserve) {
    return null;
  }
  const { iconSymbol } = fetchIconSymbolAndName({
    underlyingAsset: poolReserve!.underlyingToken.address,
    symbol: poolReserve!.underlyingToken.symbol,
    name: poolReserve!.underlyingToken.name,
  });

  const displayIconSymbol =
    iconSymbol?.toLowerCase() !== poolReserve!.underlyingToken.symbol.toLowerCase()
      ? iconSymbol
      : poolReserve!.underlyingToken.symbol;

  const reserveIcon = (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {loading ? (
        <Skeleton variant="circular" width={56} height={56} />
      ) : (
        <img
          src={`/icons/tokens/${displayIconSymbol.toLowerCase()}.svg`}
          style={{ width: '3.5rem', height: '3.5rem' }}
          alt=""
        />
      )}
    </Box>
  );

  const reserveName = loading ? (
    <Skeleton width={120} height={36} />
  ) : (
    <Box sx={{ minWidth: 0, maxWidth: '24rem', overflow: 'hidden' }}>
      <DarkTooltip title={<Typography>{poolReserve.underlyingToken.name}</Typography>}>
        <Typography variant="h2" noWrap sx={{ fontSize: '1.875rem', color: 'fg-1' }}>
          {poolReserve.underlyingToken.name}
        </Typography>
      </DarkTooltip>
    </Box>
  );

  const isGho = displayGhoForMintableMarket({
    symbol: poolReserve.underlyingToken.symbol,
    currentMarket,
  });

  return (
    <TopInfoPanel titleComponent={<BackButton fallbackHref={ROUTES.markets} />}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          // Stacked on mobile, so this is the gap under the title block rather than between two
          // columns; it needs more room there than the 1rem that separates them side by side.
          gap: { xs: '1.5rem', md: '1rem' },
          width: '100%',
        }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0, maxWidth: '100%' }}
        >
          {reserveIcon}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: { xs: '0.25rem', sm: '0.5rem' },
                  minWidth: 0,
                }}
              >
                {reserveName}
                {!loading && (
                  <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                    <DarkTooltip
                      title={<Typography>{poolReserve.underlyingToken.symbol}</Typography>}
                    >
                      <Typography variant="h2" noWrap sx={{ fontSize: '1.875rem', color: 'fg-3' }}>
                        {poolReserve.underlyingToken.symbol}
                      </Typography>
                    </DarkTooltip>
                  </Box>
                )}
              </Box>
              {!loading && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <TokenLinkDropdown
                    poolReserve={poolReserve}
                    iconSymbol={displayIconSymbol}
                    hideAToken={isGho}
                  />
                  {currentAccount && (
                    <AddTokenDropdown
                      poolReserve={poolReserve}
                      iconSymbol={displayIconSymbol}
                      switchNetwork={switchNetwork}
                      addERC20Token={addERC20Token}
                      currentChainId={currentChainId}
                      connectedChainId={connectedChainId}
                      hideAToken={isGho}
                    />
                  )}
                </Box>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Typography
                variant="description"
                sx={{ color: 'fg-3', lineHeight: '0.875rem', letterSpacing: 0 }}
              >
                <Trans>on</Trans>
              </Typography>
              <MarketLogo size={16} logo={logo} sx={{ mr: 0 }} />
              <Typography
                variant="description"
                sx={{ color: 'fg-1', lineHeight: '0.875rem', letterSpacing: 0 }}
              >
                {market.marketTitle}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            columnGap: '2.5rem',
            rowGap: '1rem',
            flexWrap: { xs: 'wrap', md: 'nowrap' },
            flexShrink: 0,
          }}
        >
          {isGho ? (
            <GhoReserveTopDetails reserve={poolReserve} />
          ) : (
            <ReserveTopDetails underlyingAsset={underlyingAsset} />
          )}
        </Box>
      </Box>
    </TopInfoPanel>
  );
};
