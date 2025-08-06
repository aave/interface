import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { useRootStore } from 'src/store/root';
import { SAFETY_MODULE } from 'src/utils/events';

import { PanelRow, PanelTitle } from '../ReservePanels';
import { SGhoDepositInfo } from './SGhoDepositInfo';
import { SGhoSavingsRate } from './SGhoSavingsRate';

export const SGhoConfiguration: React.FC = () => {
  const { openSavingsGhoDeposit, openSavingsGhoWithdraw } = useModalContext();
  const trackEvent = useRootStore((store) => store.trackEvent);
  const currentMarketData = useRootStore((store) => store.currentMarketData);

  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);
  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData);
  const { data: stakeAPR } = useStakeTokenAPR();

  let stkGho: StakeTokenFormatted | undefined;
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [, , stkGho] = stakeGeneralResult;
  }

  let stkGhoUserData: StakeUIUserData | undefined;
  if (stakeUserResult && Array.isArray(stakeUserResult)) {
    [, , stkGhoUserData] = stakeUserResult;
  }

  return (
    <>
      <PanelRow>
        <PanelTitle>
          <Trans>Deposit GHO</Trans>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <Typography gutterBottom sx={{ mb: 5 }}>
            <Trans>
              Deposit GHO into savings GHO (sGHO) and earn{' '}
              <Box component="span" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                {(stakeAPR?.aprPercentage || 0).toFixed(2)}%
              </Box>{' '}
              APR on your GHO holdings. Your funds are safe with no risk of slashing, and you can
              withdraw anytime instantly without penalties or delays. Simply deposit GHO, receive
              sGHO tokens representing your balance, and watch your savings earning claimable
              rewards from merit.
            </Trans>
          </Typography>
          <SGhoDepositInfo
            stakedToken="GHO"
            stakeData={stkGho}
            stakeUserData={stkGhoUserData}
            onStakeAction={() => {
              trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                action: SAFETY_MODULE.OPEN_STAKE_MODAL,
                asset: 'GHO',
                stakeType: 'Safety Module',
              });
              openSavingsGhoDeposit();
            }}
            onCooldownAction={() => {
              trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                asset: 'GHO',
                stakeType: 'Safety Module',
              });
              openSavingsGhoWithdraw();
            }}
            onUnstakeAction={() => {
              trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                asset: 'GHO',
                stakeType: 'Safety Module',
              });
              openSavingsGhoWithdraw();
            }}
          />
        </Box>
      </PanelRow>

      <Divider sx={{ my: { xs: 6, sm: 10 } }} />

      <PanelRow>
        <PanelTitle>
          <Trans>Savings Rate</Trans>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <SGhoSavingsRate stakeData={stkGho} />
        </Box>
      </PanelRow>
    </>
  );
};
