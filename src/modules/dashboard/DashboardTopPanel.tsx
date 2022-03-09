import { normalize, UserIncentiveData, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { MultiTokenIcon } from 'src/components/primitives/TokenIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

// TODO: need change icon
// import HfEmpty from '/public/icons/healthFactor/hfEmpty.svg';
// import HfFull from '/public/icons/healthFactor/hfFull.svg';
// import HfLow from '/public/icons/healthFactor/hfLow.svg';
// import HfMiddle from '/public/icons/healthFactor/hfMiddle.svg';
import HALTooltip from '../../components/HALTooltip';
import { HealthFactorNumber } from '../../components/HealthFactorNumber';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { NoData } from '../../components/primitives/NoData';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { LiquidationRiskParametresInfoModal } from './LiquidationRiskParametresModal/LiquidationRiskParametresModal';

import WalletIcon from '../../../public/icons/markets/wallet-icon.svg';
import NetAPYIcon from '../../../public/icons/markets/net-apy-icon.svg';
import EmptyHeartIcon from '../../../public/icons/markets/empty-heart-icon.svg';
import ClaimGiftIcon from '../../../public/icons/markets/claim-gift-icon.svg';

export const DashboardTopPanel = () => {
  const { currentNetworkConfig, currentMarketData, currentMarket } = useProtocolDataContext();
  const { user, reserves, loading } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const [open, setOpen] = useState(false);
  const { openClaimRewards } = useModalContext();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const { claimableRewardsUsd, assets } = Object.keys(user.calculatedUserIncentives).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarket === 'proto_mainnet') {
          const aave = reserves.find((reserve) => reserve.symbol === 'AAVE');
          tokenPrice = aave ? Number(aave.priceInUSD) : 0;
        } else {
          reserves.forEach((reserve) => {
            if (reserve.symbol === currentNetworkConfig.wrappedBaseAssetSymbol) {
              tokenPrice = Number(reserve.priceInUSD);
            }
          });
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed);
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice;

      if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
        acc.assets.push(incentive.rewardTokenSymbol);
      }

      acc.claimableRewardsUsd += Number(rewardBalanceUsd);
      return acc;
    },
    { claimableRewardsUsd: 0, assets: [] } as { claimableRewardsUsd: number; assets: string[] }
  );

  console.log(claimableRewardsUsd, assets);

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === '0'
      ? '0'
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || '1')
          .toFixed();

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const noDataTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  return (
    <>
      <TopInfoPanel
        pageTitle={<Trans>Dashboard</Trans>}
        withMarketSwitcher
        bridge={currentNetworkConfig.bridge}
      >
        <TopInfoPanelItem icon={<WalletIcon />} title={<Trans>Net worth</Trans>} loading={loading}>
          {currentAccount ? (
            <FormattedNumber
              value={Number(user?.netWorthUSD || 0)}
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

        <TopInfoPanelItem icon={<NetAPYIcon />} title={<Trans>Net APY</Trans>} loading={loading}>
          {currentAccount ? (
            <FormattedNumber
              value={(user?.earnedAPY || 0) - (user?.debtAPY || 0)}
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

        {currentAccount && user?.healthFactor !== '-1' && (
          <TopInfoPanelItem
            icon={<EmptyHeartIcon />}
            title={
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Trans>Health factor</Trans>
                <HALTooltip />
              </Box>
            }
            // TODO: need change icon
            // icon={
            //   <SvgIcon sx={{ fontSize: '24px' }}>
            //     {+user.healthFactor >= 10 && <HfFull />}
            //     {+user.healthFactor < 10 && +user.healthFactor >= 3 && <HfMiddle />}
            //     {+user.healthFactor < 3 && +user.healthFactor >= 1 && <HfLow />}
            //     {+user.healthFactor < 1 && <HfEmpty />}
            //   </SvgIcon>
            // }
            loading={loading}
          >
            <HealthFactorNumber
              value={user?.healthFactor || '-1'}
              variant={valueTypographyVariant}
              onInfoClick={() => setOpen(true)}
            />
          </TopInfoPanelItem>
        )}

        {currentAccount && claimableRewardsUsd > 0 && (
          <TopInfoPanelItem
            title={<Trans>Available rewards</Trans>}
            icon={<ClaimGiftIcon />}
            loading={loading}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: { xs: 'flex-start', xsm: 'center' },
                flexDirection: { xs: 'column', xsm: 'row' },
              }}
            >
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <FormattedNumber
                  value={claimableRewardsUsd}
                  variant={valueTypographyVariant}
                  visibleDecimals={2}
                  compact
                  symbol="USD"
                  symbolsColor="#A5A8B6"
                  symbolsVariant={noDataTypographyVariant}
                />
                {assets && (
                  <MultiTokenIcon symbols={assets} sx={{ fontSize: { xs: '16px', xsm: '20px' } }} />
                )}
              </Box>

              <Button
                variant="gradient"
                size="small"
                onClick={() => openClaimRewards()}
                sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
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
        healthFactor={user?.healthFactor || '-1'}
        loanToValue={loanToValue}
        currentLoanToValue={user?.currentLoanToValue || '0'}
        currentLiquidationThreshold={user?.currentLiquidationThreshold || '0'}
      />
    </>
  );
};
