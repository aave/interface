import { ExternalLinkIcon } from '@heroicons/react/outline';
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
import { CircleIcon } from 'src/components/CircleIcon';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';
import { AddTokenDropdown } from './AddTokenDropdown';
import { TokenLinkDropdown } from './TokenLinkDropdown';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetails = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const router = useRouter();
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, currentNetworkConfig, currentChainId } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);
  const { addERC20Token, switchNetwork, chainId: connectedChainId, connected } = useWeb3Context();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  const ReserveIcon = () => {
    return (
      <Box
        mr={3}
        sx={{
          mr: '3px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {loading ? (
          <Skeleton variant="circular" width={32} height={32} sx={{ background: '#383D51' }} />
        ) : (
          <img
            src={`/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
            width="32px"
            height="32px"
            alt=""
          />
        )}
      </Box>
    );
  };

  const iconStyling = {
    display: 'inline-flex',
    alignItems: 'center',
    color: 'action.active',
    '&:hover': { color: 'info.main' },
    cursor: 'pointer',
  };

  const ReserveName = () => {
    return loading ? (
      <Skeleton width={60} height={28} sx={{ background: '#383D51' }} />
    ) : (
      <Typography sx={{ fontSize: '16px' }} variant={valueTypographyVariant}>
        {poolReserve.name}
      </Typography>
    );
  };

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
              variant="outlined"
              size="medium"
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
              sx={{
                mr: 3,
                mb: downToSM ? '24px' : '0',
                background: 'background.default',
                color: 'text.primary',
              }}
            >
              <Trans>Go Back</Trans>
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketLogo size={20} logo={network.networkLogoPath} />
              <Typography variant="subheader1" sx={{ color: 'text.primary' }}>
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
                    <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
                  ) : (
                    <Box sx={{ display: 'flex' }}>
                      <TokenLinkDropdown poolReserve={poolReserve} downToSM={downToSM} />
                      {connected && (
                        <AddTokenDropdown
                          poolReserve={poolReserve}
                          downToSM={downToSM}
                          switchNetwork={switchNetwork}
                          addERC20Token={addERC20Token}
                          currentChainId={currentChainId}
                          connectedChainId={connectedChainId}
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
            <Box sx={{ display: 'inline-flex', alignItems: 'center', mt: '12px' }}>
              <ReserveName />
              {loading ? (
                <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
              ) : (
                <Box sx={{ display: 'flex' }}>
                  <TokenLinkDropdown poolReserve={poolReserve} downToSM={downToSM} />
                  {connected && (
                    <AddTokenDropdown
                      poolReserve={poolReserve}
                      downToSM={downToSM}
                      switchNetwork={switchNetwork}
                      addERC20Token={addERC20Token}
                      currentChainId={currentChainId}
                      connectedChainId={connectedChainId}
                    />
                  )}
                </Box>
              )}
            </Box>
          </TopInfoPanelItem>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ my: 1, borderColor: 'rgba(235, 235, 239, 0.08)' }}
          />
        </>
      )}
      <TopInfoPanelItem title={<Trans>Reserve Size</Trans>} loading={loading} hideIcon>
        <FormattedNumber
          value={Math.max(Number(poolReserve?.totalLiquidityUSD), 0)}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor={theme.palette.text.secondary}
          isTopPanel
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem title={<Trans>Available liquidity</Trans>} loading={loading} hideIcon>
        <FormattedNumber
          value={Math.max(Number(poolReserve?.availableLiquidityUSD), 0)}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor={theme.palette.text.secondary}
          isTopPanel
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem title={<Trans>Utilization Rate</Trans>} loading={loading} hideIcon>
        <FormattedNumber
          value={poolReserve?.borrowUsageRatio}
          percent
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor={theme.palette.text.secondary}
          isTopPanel
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem title={<Trans>Oracle price</Trans>} loading={loading} hideIcon>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <FormattedNumber
            value={poolReserve?.priceInUSD}
            symbol="USD"
            variant={valueTypographyVariant}
            symbolsVariant={symbolsTypographyVariant}
            symbolsColor={theme.palette.text.secondary}
            isTopPanel
          />
          {loading ? (
            <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
          ) : (
            <CircleIcon tooltipText="View oracle contract" downToSM={downToSM}>
              <Link
                href={currentNetworkConfig.explorerLinkBuilder({
                  address: poolReserve?.priceOracle,
                })}
                sx={iconStyling}
              >
                <SvgIcon
                  sx={{
                    fontSize: downToSM ? '12px' : '14px',
                  }}
                >
                  <ExternalLinkIcon />
                </SvgIcon>
              </Link>
            </CircleIcon>
          )}
        </Box>
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
