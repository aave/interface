import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { Trans } from '@lingui/macro';
import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Warning } from 'src/components/primitives/Warning';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { SAFETY_MODULE } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { StkGhoDepositPanel } from './StkGhoDepositPanel';

export const StkGhoCard = () => {
  const { openSavingsGhoDeposit, openSavingsGhoWithdraw } = useModalContext();
  const [trackEvent, currentMarketData] = useRootStore(
    useShallow((store) => [store.trackEvent, store.currentMarketData])
  );
  const { breakpoints } = useTheme();
  const downToXsm = useMediaQuery(breakpoints.down('xsm'));

  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData);
  const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

  let stkGho: StakeTokenFormatted | undefined;
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [, , stkGho] = stakeGeneralResult;
  }

  let stkGhoUserData: StakeUIUserData | undefined;
  if (stakeUserResult && Array.isArray(stakeUserResult)) {
    [, , stkGhoUserData] = stakeUserResult;
  }

  return (
    <Paper
      sx={{
        pt: 4,
        pb: { xs: 6, md: 20 },
        px: downToXsm ? 4 : 6,
        flex: 1,
        minWidth: 0,
        width: { xs: '100%', mdlg: 'auto' },
      }}
    >
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography variant="h3">
          <Trans>Legacy Savings GHO (stkGHO)</Trans>
        </Typography>
      </Box>

      <Warning severity="warning" sx={{ mb: 4 }}>
        <Trans>Rewards for legacy Savings GHO are ending. Migrate to continue earning.</Trans>
      </Warning>

      <StkGhoDepositPanel
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
        onWithdraw={() => {
          trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
            action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
            asset: 'GHO',
            stakeType: 'Safety Module',
          });
          openSavingsGhoWithdraw();
        }}
      />
    </Paper>
  );
};
