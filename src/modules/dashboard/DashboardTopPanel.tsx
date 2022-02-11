import { normalize, UserIncentiveData, valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
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
  const { currentNetworkConfig } = useProtocolDataContext();
  const { user } = useAppDataContext();
  const { currentAccount } = useWeb3Context();
  const [open, setOpen] = useState(false);
  const { openClaimRewards } = useModalContext();

  const [claimableRewardsUsd, setClaimableRewardsUsd] = useState(0);
  const [rewardSymbol, setRewardSymbol] = useState<string>();
  // get all rewards
  React.useEffect(() => {
    let totalClaimableUsd = claimableRewardsUsd;
    const rewardSymbols: string[] = [];
    Object.keys(user.calculatedUserIncentives).forEach((rewardTokenAddress) => {
      const incentive: UserIncentiveData = user.calculatedUserIncentives[rewardTokenAddress];
      const rewardBalance = normalize(incentive.claimableRewards, incentive.rewardTokenDecimals);
      const rewardBalanceUsd = Number(rewardBalance) * Number(incentive.rewardPriceFeed);

      if (rewardSymbols.indexOf(incentive.rewardTokenSymbol) === -1) {
        rewardSymbols.push(incentive.rewardTokenSymbol);
      }

      totalClaimableUsd = totalClaimableUsd + Number(rewardBalanceUsd);
    });

    if (rewardSymbols.length > 1) {
      // TODO: create here the combined symbol and set it
      setRewardSymbol(rewardSymbols[0]);
    } else {
      setRewardSymbol(rewardSymbols[0]);
    }

    setClaimableRewardsUsd(totalClaimableUsd);
  }, [user.calculatedUserIncentives]);

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === '0'
      ? '0'
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || '0')
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || '1')
          .toFixed();

  return (
    <>
      <TopInfoPanel
        pageTitle={<Trans>Dashboard</Trans>}
        withMarketSwitcher
        bridge={currentNetworkConfig.bridge}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <TopInfoPanelItem title={<Trans>Net worth</Trans>}>
            {currentAccount ? (
              <FormattedNumber
                value={Number(user?.netWorthUSD || 0)}
                symbol="USD"
                variant="main21"
              />
            ) : (
              <NoData variant="secondary21" sx={{ opacity: '0.7' }} />
            )}
          </TopInfoPanelItem>
          <TopInfoPanelItem title={<Trans>Net APY</Trans>}>
            {currentAccount ? (
              <FormattedNumber
                value={((user?.earnedAPY || 0) - (user?.debtAPY || 0)) / 100}
                variant="main21"
                percent
              />
            ) : (
              <NoData variant="secondary21" sx={{ opacity: '0.7' }} />
            )}
          </TopInfoPanelItem>

          {currentAccount && user?.healthFactor !== '-1' && (
            <TopInfoPanelItem
              title={
                <TextWithModal
                  text={<Trans>Health factor</Trans>}
                  iconSize={13}
                  iconColor="#FFFFFF3B"
                  withContentButton
                >
                  <HFInfoContent />
                </TextWithModal>
              }
            >
              <HealthFactorNumber
                value={user?.healthFactor || '-1'}
                variant="main21"
                onInfoClick={() => setOpen(true)}
              />
            </TopInfoPanelItem>
          )}

          {currentAccount && user?.currentLoanToValue !== '0' && (
            <TopInfoPanelItem title={<Trans>Current LTV</Trans>}>
              <FormattedNumber value={loanToValue} variant="main21" percent />
            </TopInfoPanelItem>
          )}
          <TopInfoPanelItem title={<Trans>Available rewards</Trans>}>
            {currentAccount && claimableRewardsUsd > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                {rewardSymbol && <TokenIcon symbol={rewardSymbol} sx={{ mx: '4px' }} />}
                <FormattedNumber
                  value={claimableRewardsUsd}
                  variant="main21"
                  compact
                  symbol="USD"
                />
                <Button variant="contained" onClick={() => openClaimRewards()}>
                  Claim
                </Button>
              </Box>
            ) : (
              <NoData variant="secondary21" sx={{ opacity: '0.7' }} />
            )}
          </TopInfoPanelItem>
        </Box>
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
