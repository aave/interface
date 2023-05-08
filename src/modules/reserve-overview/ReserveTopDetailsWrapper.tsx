import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import {
  Box,
  Button,
  Divider,
  Skeleton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/router';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { isGhoAndSupported } from 'src/utils/ghoUtilities';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { AddTokenDropdown } from './AddTokenDropdown';
import { GhoReserveTopDetails } from './Gho/GhoReserveTopDetails';
import { ReserveTopDetails } from './ReserveTopDetails';
import { TokenLinkDropdown } from './TokenLinkDropdown';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetailsWrapper = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const router = useRouter();
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, currentChainId } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);
  const { addERC20Token, switchNetwork, chainId: connectedChainId, connected } = useWeb3Context();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';

  const ReserveIcon = () => {
    return (
      <Box mr={3} sx={{ mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Skeleton variant="circular" width={40} height={40} sx={{ background: '#383D51' }} />
        ) : (
          <img
            src={`/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
            width="40px"
            height="40px"
            alt=""
          />
        )}
      </Box>
    );
  };

  const ReserveName = () => {
    return loading ? (
      <Skeleton width={60} height={28} sx={{ background: '#383D51' }} />
    ) : (
      <Typography variant={valueTypographyVariant}>{poolReserve.name}</Typography>
    );
  };

  const isGho = isGhoAndSupported({ symbol: poolReserve.symbol, currentMarket });

  console.log('loading', loading);
  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: downToSM ? 'flex-start' : 'center',
              alignSelf: downToSM ? 'flex-start' : 'center',
              mb: 4,
              minHeight: '40px',
              flexDirection: downToSM ? 'column' : 'row',
            }}
          >
            <Button
              variant="surface"
              size="medium"
              color="primary"
              startIcon={
                <SvgIcon sx={{ fontSize: '20px' }}>
                  <ArrowBackRoundedIcon />
                </SvgIcon>
              }
              onClick={() => {
                // https://github.com/vercel/next.js/discussions/34980
                if (history.state.idx !== 0) router.back();
                else router.push('/markets');
              }}
              sx={{ mr: 3, mb: downToSM ? '24px' : '0' }}
            >
              <Trans>Go Back</Trans>
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketLogo size={20} logo={network.networkLogoPath} />
              <Typography variant="subheader1" sx={{ color: 'common.white' }}>
                {market.marketTitle} <Trans>Market</Trans>
              </Typography>
              {market.v3 && (
                <Box
                  sx={{
                    color: '#fff',
                    px: 2,
                    mx: 2,
                    borderRadius: '12px',
                    background: (theme) => theme.palette.gradients.aaveGradient,
                  }}
                >
                  <Typography variant="subheader2">Version 3</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {downToSM && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
              <ReserveIcon />
              <Box>
                {!loading && (
                  <Typography sx={{ color: '#A5A8B6' }} variant="caption">
                    {poolReserve.symbol}
                  </Typography>
                )}
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ReserveName />
                  {loading ? (
                    <Skeleton width={160} height={16} sx={{ ml: 1, background: 'red' }} />
                  ) : (
                    <Box sx={{ display: 'flex' }}>
                      <TokenLinkDropdown
                        poolReserve={poolReserve}
                        downToSM={downToSM}
                        hideAToken={isGho}
                      />
                      {connected && (
                        <AddTokenDropdown
                          poolReserve={poolReserve}
                          downToSM={downToSM}
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
              </Box>
            </Box>
          )}
        </Box>
      }
    >
      {!downToSM && (
        <>
          <TopInfoPanelItem
            title={!loading && <Trans>{poolReserve.symbol}</Trans>}
            withoutIconWrapper
            icon={<ReserveIcon />}
            loading={loading}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <ReserveName />

              <Box sx={{ display: 'flex' }}>
                <TokenLinkDropdown
                  poolReserve={poolReserve}
                  downToSM={downToSM}
                  hideAToken={isGho}
                />
                {connected && (
                  <AddTokenDropdown
                    poolReserve={poolReserve}
                    downToSM={downToSM}
                    switchNetwork={switchNetwork}
                    addERC20Token={addERC20Token}
                    currentChainId={currentChainId}
                    connectedChainId={connectedChainId}
                    hideAToken={isGho}
                  />
                )}
              </Box>
            </Box>
          </TopInfoPanelItem>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ my: 1, borderColor: 'rgba(235, 235, 239, 0.08)' }}
          />
        </>
      )}
      {isGho ? <GhoReserveTopDetails /> : <ReserveTopDetails underlyingAsset={underlyingAsset} />}
    </TopInfoPanel>
  );
};
