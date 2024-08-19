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
import { useState } from 'react';
import * as React from 'react';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

import { PageTitle } from '../../components/TopInfoPanel/PageTitle';
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
  const { currentNetworkConfig, currentChainId, currentMarket } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);
  const { addERC20Token, switchNetwork, chainId: connectedChainId, connected } = useWeb3Context();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const [tokenSymbol, setTokenSymbol] = useState(poolReserve.iconSymbol.toLowerCase());

  const valueTypographyVariant = downToSM ? 'main16' : 'body6';

  const ReserveIcon = () => {
    return (
      <Box mr={3} sx={{ mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Skeleton variant="circular" width={32} height={32} />
        ) : (
          <img
            src={poolReserve.image ? poolReserve.image : `/icons/tokens/${tokenSymbol}.svg`}
            onError={() => setTokenSymbol('default')}
            width="32px"
            height="32px"
            alt=""
          />
        )}
      </Box>
    );
  };

  const ReserveName = () => {
    return loading ? (
      <Skeleton width={60} height={28} />
    ) : (
      <Typography variant={valueTypographyVariant} color="text.primary">
        {poolReserve.name}
      </Typography>
    );
  };

  const isGho = displayGhoForMintableMarket({ symbol: poolReserve.symbol, currentMarket });

  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              alignSelf: downToSM ? 'flex-start' : 'center',
              minHeight: '40px',
              flexDirection: 'column',
            }}
          >
            <Button
              variant="text"
              size="small"
              startIcon={
                <SvgIcon height={24} width={24}>
                  <ArrowBackRoundedIcon />
                </SvgIcon>
              }
              onClick={() => {
                // https://github.com/vercel/next.js/discussions/34980
                if (history.state.idx !== 0) router.back();
                else router.push('/markets');
              }}
              sx={{ mb: downToSM ? '24px' : 15, p: 3 }}
            >
              <Trans>Go Back</Trans>
            </Button>
            <PageTitle
              pageTitle={<Trans>Reserve History</Trans>}
              withMarketSwitcher={true}
              bridge={currentNetworkConfig.bridge}
            />
            {/*<Box sx={{ display: 'flex', alignItems: 'center' }}>*/}
            {/*  <MarketLogo size={20} logo={network.networkLogoPath} />*/}
            {/*  <Typography variant="subheader1" sx={{ color: 'common.white' }}>*/}
            {/*    {market.marketTitle} <Trans>Market</Trans>*/}
            {/*  </Typography>*/}
            {/*  {market.v3 && (*/}
            {/*    <Box*/}
            {/*      sx={{*/}
            {/*        color: '#fff',*/}
            {/*        px: 2,*/}
            {/*        mx: 2,*/}
            {/*        borderRadius: '12px',*/}
            {/*        background: (theme) => theme.palette.gradients.aaveGradient,*/}
            {/*      }}*/}
            {/*    >*/}
            {/*      <Typography variant="subheader2">Version 3</Typography>*/}
            {/*    </Box>*/}
            {/*  )}*/}
            {/*</Box>*/}
          </Box>

          {downToSM && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
              <ReserveIcon />
              <Box>
                {!loading && (
                  <Typography color="text.primary" variant="body6">
                    {poolReserve.symbol}
                  </Typography>
                )}
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ReserveName />
                  {loading ? (
                    <Skeleton width={160} height={16} sx={{ ml: 1 }} />
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
            title={
              <Box sx={{ display: 'inline-flex', alignItems: 'center', minWidth: 170 }}>
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
            }
            withoutIconWrapper
            icon={<ReserveIcon />}
            loading={loading}
          >
            {!loading && (
              <Typography variant="detail2" color="text.mainTitle">
                <Trans>{poolReserve.symbol}</Trans>
              </Typography>
            )}
          </TopInfoPanelItem>
        </>
      )}
      {isGho ? (
        <GhoReserveTopDetails reserve={poolReserve} />
      ) : (
        <ReserveTopDetails underlyingAsset={underlyingAsset} />
      )}
    </TopInfoPanel>
  );
};
