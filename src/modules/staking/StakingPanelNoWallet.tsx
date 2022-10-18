import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useRootStore } from 'src/store/root';

export interface StakingPanelNoWalletProps {
  description?: React.ReactNode;
  headerAction?: React.ReactNode;
  stakedToken: string;
  icon: string;
}

export const StakingPanelNoWallet: React.FC<StakingPanelNoWalletProps> = ({
  stakedToken,
  icon,
}) => {
  const stakeGeneralResult = useRootStore((state) => state.stakeGeneralResult);
  let stakingAPY = '';

  if (stakedToken == 'AAVE') stakingAPY = stakeGeneralResult?.aave.stakeApy || '0';
  if (stakedToken == 'ABPT') stakingAPY = stakeGeneralResult?.bpt.stakeApy || '0';
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: '6px',
        border: `1px solid ${theme.palette.divider}`,
        p: 4,
        background: theme.palette.background.paper,
        width: '263px',
        height: '68px',
        margin: '0 auto',
        position: 'relative',
        '&:after': {
          content: "''",
          position: 'absolute',
          bottom: 0,
          left: '0px',
          width: 'calc(100% + 32px)',
          height: '1px',
          bgcolor: 'transparent',
        },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TokenIcon symbol={icon} />
        <Typography variant="subheader1" color="text.primary" ml={2}>
          {stakedToken}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'block',
          width: { xs: '100%', xsm: 'unset' },
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Staking APR</Trans>
        </Typography>

        <FormattedNumber
          value={parseFloat(stakingAPY || '0') / 10000}
          percent
          variant="secondary14"
          color="text.primary"
        />
      </Box>
    </Box>
  );
};
