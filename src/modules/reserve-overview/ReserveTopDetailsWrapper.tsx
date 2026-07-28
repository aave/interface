import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { useRootStore } from 'src/store/root';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { GhoReserveTopDetails } from './Gho/GhoReserveTopDetails';
import { ReserveTopDetails } from './ReserveTopDetails';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetailsWrapper = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const router = useRouter();
  const { supplyReserves, loading } = useAppDataContext();
  const currentMarket = useRootStore((state) => state.currentMarket);

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

  const ReserveIcon = () => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
  };

  const ReserveName = () => {
    return loading ? (
      <Skeleton width={120} height={36} />
    ) : (
      <Typography variant="h2" sx={{ fontSize: '1.875rem', color: 'fg-1' }}>
        {poolReserve.underlyingToken.name}
      </Typography>
    );
  };

  const isGho = displayGhoForMintableMarket({
    symbol: poolReserve.underlyingToken.symbol,
    currentMarket,
  });

  return (
    <TopInfoPanel
      titleComponent={
        <Box
          onClick={() => {
            // https://github.com/vercel/next.js/discussions/34980
            if (!!history.state.idx) router.back();
            else router.push('/markets');
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            width: 'fit-content',
            mb: '1rem',
            cursor: 'pointer',
            color: 'fg-3',
            '&:hover': { color: 'fg-1' },
          }}
        >
          <SvgIcon sx={{ fontSize: '1rem' }} viewBox="0 0 16 16">
            <path
              d="M12.8 8.03271L3.20005 8.03271M7.24215 4.03271L3.20005 8.03271L7.24215 12.0327"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </SvgIcon>
          <Typography
            variant="description"
            sx={{ color: 'inherit', lineHeight: '0.875rem', letterSpacing: 0 }}
          >
            <Trans>Back</Trans>
          </Typography>
        </Box>
      }
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          gap: 4,
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ReserveIcon />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ReserveName />
              {!loading && (
                <Typography variant="h2" sx={{ fontSize: '1.875rem', color: 'fg-3' }}>
                  {poolReserve.underlyingToken.symbol}
                </Typography>
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
            gap: '2.5rem',
            flexWrap: 'wrap',
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
