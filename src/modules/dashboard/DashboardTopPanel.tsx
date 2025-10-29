import { ChainId } from '@aave/contract-helpers';
import { normalize, UserIncentiveData, valueToBigNumber } from '@aave/math-utils';
import { chainId, evmAddress, useUserMeritRewards } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import * as React from 'react';
import { useState } from 'react';
import { NetAPYTooltip } from 'src/components/infoTooltips/NetAPYTooltip';
import { getMarketInfoById } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { ROUTES } from 'src/components/primitives/Link';
import { PageTitle } from 'src/components/TopInfoPanel/PageTitle';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';
import { selectIsMigrationAvailable } from 'src/store/v3MigrationSelectors';
import { DASHBOARD, GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { HealthFactorNumber } from '../../components/HealthFactorNumber';
import { NoData } from '../../components/primitives/NoData';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { useEnhancedUserYield } from '../../hooks/useEnhancedUserYield';
import { LiquidationRiskParametresInfoModal } from './LiquidationRiskParametresModal/LiquidationRiskParametresModal';

interface MeritReward {
  amount: {
    usd: string;
    amount: {
      value: string;
    };
  };
  currency: {
    symbol: string;
    address: string;
  };
}

export const DashboardTopPanel = () => {
  const { user, loading, userState, supplyReserves } = useAppDataContext();

  console.log('UserLegacy:', user);
  console.log('UserState:', userState);
  console.log('SupplyReserves:', supplyReserves);

  const { currentAccount } = useWeb3Context();
  const { netAPY: enhancedNetAPY, hasEnhancedData } = useEnhancedUserYield();
  const [open, setOpen] = useState(false);
  const { openClaimRewards } = useModalContext();
  const [
    trackEvent,
    currentNetworkConfig,
    currentMarketData,
    currentMarket,
    isMigrateToV3Available,
  ] = useRootStore(
    useShallow((store) => [
      store.trackEvent,
      store.currentNetworkConfig,
      store.currentMarketData,
      store.currentMarket,
      selectIsMigrationAvailable(store),
    ])
  );
  const { market } = getMarketInfoById(currentMarket);
  const showMigrateButton = userState
    ? isMigrateToV3Available && currentAccount !== '' && Number(userState.totalCollateralBase) > 0
    : false;
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: meritClaimRewards } = useUserMeritRewards({
    // Note: currentAccount is not always defined, so we need to check if it is and if not, use a fallback address
    user: currentAccount ? evmAddress(currentAccount) : evmAddress(ZERO_ADDRESS),
    chainId: chainId(currentMarketData.chainId),
  });

  // Calculate merit rewards USD value
  const meritRewardsUsd =
    meritClaimRewards?.claimable?.reduce((total: number, reward: MeritReward) => {
      return total + Number(reward.amount.usd || 0);
    }, 0) || 0;

  const { claimableRewardsUsd: baseClaimableRewardsUsd, assets } = user
    ? Object.keys(user.calculatedUserIncentives).reduce(
        (acc, rewardTokenAddress) => {
          const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
          const rewardBalance = normalize(
            incentive.claimableRewards,
            incentive.rewardTokenDecimals
          );

          let tokenPrice = 0;
          // getting price from reserves for the native rewards for v2 markets
          if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
            if (currentMarketData.chainId === ChainId.mainnet) {
              const aave = supplyReserves.find(
                (reserve) => reserve.underlyingToken.symbol === 'AAVE'
              );
              tokenPrice = aave ? Number(aave.usdExchangeRate) : 0;
            } else {
              supplyReserves.forEach((reserve) => {
                if (
                  reserve.underlyingToken.symbol === currentNetworkConfig.wrappedBaseAssetSymbol
                ) {
                  tokenPrice = Number(reserve.usdExchangeRate);
                }
              });
            }
          } else {
            tokenPrice = Number(incentive.rewardPriceFeed);
          }

          const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

          if (rewardBalanceUsd > 0) {
            if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
              acc.assets.push(incentive.rewardTokenSymbol);
            }

            acc.claimableRewardsUsd += Number(rewardBalanceUsd);
          }

          return acc;
        },
        { claimableRewardsUsd: 0, assets: [] } as { claimableRewardsUsd: number; assets: string[] }
      )
    : { claimableRewardsUsd: 0, assets: [] };

  // Add merit rewards to existing assets if they exist
  if (meritClaimRewards?.claimable) {
    meritClaimRewards.claimable.forEach((reward: MeritReward) => {
      if (Number(reward.amount.usd) > 0 && assets.indexOf(reward.currency.symbol) === -1) {
        assets.push(reward.currency.symbol);
      }
    });
  }

  // Aggregate total claimable rewards (base + merit)
  const claimableRewardsUsd = baseClaimableRewardsUsd + meritRewardsUsd;
  const loanToValue =
    userState?.totalCollateralBase === '0'
      ? '0'
      : valueToBigNumber(userState?.totalDebtBase || '0')
          .dividedBy(userState?.totalCollateralBase || '1')
          .toFixed();

  const currentLoanToValue = userState ? userState.ltv.value.toString() : '0';

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const noDataTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <>
      {showMigrateButton && downToSM && (
        <Box sx={{ width: '100%' }}>
          <Link href={ROUTES.migrationTool}>
            <Button
              variant="gradient"
              sx={{
                height: '40px',
                width: '100%',
              }}
            >
              <Typography variant="buttonM">
                <Trans>Migrate to {market.marketTitle} v3 Market</Trans>
              </Typography>
            </Button>
          </Link>
        </Box>
      )}
      <TopInfoPanel
        titleComponent={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PageTitle
              pageTitle={<Trans>Dashboard</Trans>}
              withMarketSwitcher={true}
              bridge={currentNetworkConfig.bridge}
            />
            {showMigrateButton && !downToSM && (
              <Box sx={{ alignSelf: 'center', mb: 4, width: '100%' }}>
                <Link href={ROUTES.marketMigrationTool(currentMarket)}>
                  <Button variant="gradient" sx={{ height: '20px' }}>
                    <Typography variant="buttonS" data-cy={`migration-button`}>
                      <Trans>Migrate to v3</Trans>
                    </Typography>
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        }
      >
        <TopInfoPanelItem title={<Trans>Net worth</Trans>} loading={loading} hideIcon>
          {currentAccount ? (
            <FormattedNumber
              value={Number(userState?.netWorth || 0)}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              symbolsColor="#A5A8B6"
              symbolsVariant={noDataTypographyVariant}
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>

        <TopInfoPanelItem
          title={
            <div style={{ display: 'flex' }}>
              <Trans>Net APY</Trans>
              <NetAPYTooltip
                event={{
                  eventName: GENERAL.TOOL_TIP,
                  eventParams: { tooltip: 'NET APY: Dashboard Banner' },
                }}
              />
            </div>
          }
          loading={loading}
          hideIcon
        >
          {currentAccount && userState && Number(userState.netWorth) > 0 ? (
            <FormattedNumber
              value={
                hasEnhancedData ? enhancedNetAPY : userState ? Number(userState.netAPY.value) : 0
              }
              variant={valueTypographyVariant}
              visibleDecimals={2}
              percent
              symbolsColor="#A5A8B6"
              symbolsVariant={noDataTypographyVariant}
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>

        {currentAccount && userState?.healthFactor !== '-1' && (
          <TopInfoPanelItem
            title={
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Trans>Health factor</Trans>
              </Box>
            }
            loading={loading}
            hideIcon
          >
            <HealthFactorNumber
              value={userState?.healthFactor || '-1'}
              variant={valueTypographyVariant}
              onInfoClick={() => {
                trackEvent(DASHBOARD.VIEW_RISK_DETAILS);
                setOpen(true);
              }}
            />
          </TopInfoPanelItem>
        )}

        {currentAccount && claimableRewardsUsd > 0 && (
          <TopInfoPanelItem title={<Trans>Available rewards</Trans>} loading={loading} hideIcon>
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', xsm: 'center' },
                flexDirection: { xs: 'column', xsm: 'row' },
              }}
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }} data-cy={'Claim_Box'}>
                <FormattedNumber
                  value={claimableRewardsUsd}
                  variant={valueTypographyVariant}
                  visibleDecimals={2}
                  compact
                  symbol="USD"
                  symbolsColor="#A5A8B6"
                  symbolsVariant={noDataTypographyVariant}
                  data-cy={'Claim_Value'}
                />
              </Box>

              <Button
                variant="gradient"
                size="small"
                onClick={() => openClaimRewards()}
                sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
                data-cy={'Dashboard_Claim_Button'}
              >
                <Trans>Claim</Trans>
              </Button>
            </Box>
          </TopInfoPanelItem>
        )}
      </TopInfoPanel>
      <LiquidationRiskParametresInfoModal
        open={open}
        setOpen={setOpen}
        healthFactor={userState?.healthFactor || '-1'}
        loanToValue={loanToValue}
        currentLoanToValue={currentLoanToValue}
        currentLiquidationThreshold={userState?.currentLiquidationThreshold.value || '0'}
      />
    </>
  );
};
