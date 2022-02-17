import { normalize, UserIncentiveData, valueToBigNumber } from '@aave/math-utils';
import { QuestionMarkCircleIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, useMediaQuery, useTheme } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { MultiTokenIcon } from 'src/components/primitives/TokenIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { HealthFactorNumber } from '../../components/HealthFactorNumber';
import { HFInfoContent } from '../../components/infoModalContents/HFInfoContent';
import { FormattedNumber } from '../../components/primitives/FormattedNumber';
import { NoData } from '../../components/primitives/NoData';
import { TextWithModal } from '../../components/TextWithModal';
import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { LiquidationRiskParametresInfoModal } from './LiquidationRiskParametresModal/LiquidationRiskParametresModal';

export const DashboardTopPanel = () => {
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  const { user, reserves } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const [open, setOpen] = useState(false);
  const { openClaimRewards } = useModalContext();

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const { claimableRewardsUsd, assets } = Object.keys(user.calculatedUserIncentives).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);

      let tokenPrice = 0;
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        reserves.forEach((reserve) => {
          if (reserve.symbol === currentNetworkConfig.wrappedBaseAssetSymbol) {
            tokenPrice = Number(reserve.priceInUSD);
          }
        });
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
        <TopInfoPanelItem title={<Trans>Net worth</Trans>}>
          {currentAccount ? (
            <FormattedNumber
              value={Number(user?.netWorthUSD || 0)}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>

        <TopInfoPanelItem title={<Trans>Net APY</Trans>}>
          {currentAccount ? (
            <FormattedNumber
              value={((user?.earnedAPY || 0) - (user?.debtAPY || 0)) / 100}
              variant={valueTypographyVariant}
              visibleDecimals={2}
              percent
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>

        {currentAccount && user?.healthFactor !== '-1' && (
          <TopInfoPanelItem
            title={
              <TextWithModal
                variant={!downToSM ? 'description' : 'caption'}
                text={<Trans>Health factor</Trans>}
                iconSize={13}
                iconColor="#FFFFFF3B"
                icon={<QuestionMarkCircleIcon />}
                withContentButton
              >
                <HFInfoContent />
              </TextWithModal>
            }
          >
            <HealthFactorNumber
              value={user?.healthFactor || '-1'}
              variant={valueTypographyVariant}
              onInfoClick={() => setOpen(true)}
            />
          </TopInfoPanelItem>
        )}

        <TopInfoPanelItem title={<Trans>Available rewards</Trans>} hideIcon withLine={!downToXSM}>
          {currentAccount && claimableRewardsUsd > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormattedNumber
                value={claimableRewardsUsd}
                variant={valueTypographyVariant}
                visibleDecimals={2}
                compact
                symbol="USD"
              />
              {assets && (
                <MultiTokenIcon
                  symbols={assets}
                  sx={{ ml: 1, fontSize: { xs: '16px', xsm: '20px' } }}
                />
              )}
              <Button
                variant="surface"
                size="small"
                onClick={() => openClaimRewards()}
                sx={{ minWidth: 'unset', ml: 2 }}
              >
                <Trans>Claim</Trans>
              </Button>
            </Box>
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: '0.7' }} />
          )}
        </TopInfoPanelItem>
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
