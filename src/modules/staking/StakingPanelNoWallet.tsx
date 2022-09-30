import { Trans } from '@lingui/macro';
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { useStakeData } from 'src/hooks/stake-data-provider/StakeDataProvider';

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
  const { breakpoints } = useTheme();
  const xsm = useMediaQuery(breakpoints.up('xsm'));
  const data = useStakeData();
  let stakingAPY = '';

  if (stakedToken == 'AAVE')
    stakingAPY = data.stakeGeneralResult?.stakeGeneralUIData.aave.stakeApy || '0';
  if (stakedToken == 'ABPT')
    stakingAPY = data.stakeGeneralResult?.stakeGeneralUIData.bpt.stakeApy || '0';
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        mt: 5,
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', xsm: 'center' },
        flexDirection: { xs: 'column', xsm: 'row' },
        gap: { xs: 0, xsm: 2 },
        borderRadius: { xs: 0, xsm: '6px' },
        border: { xs: 'unset', xsm: `1px solid ${theme.palette.divider}` },
        p: { xs: 0, xsm: 4 },
        background: {
          xs: 'unset',
          xsm: theme.palette.background.paper,
        },
        width: '30%',
        margin: '0 auto',
        position: 'relative',
        '&:after': {
          content: "''",
          position: 'absolute',
          bottom: 0,
          left: '0px',
          width: 'calc(100% + 32px)',
          height: '1px',
          bgcolor: { xs: 'divider', xsm: 'transparent' },
        },
      })}
    >
      <Box
        sx={{
          display: 'flex',
          width: { xs: '100%', xsm: 'unset' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, xsm: 0 },
        }}
      >
        <TokenIcon symbol={icon} sx={{ fontSize: { xs: '40px', xsm: '32px' } }} />
        <Typography variant={xsm ? 'subheader1' : 'h4'} ml={2}>
          {stakedToken}
        </Typography>
      </Box>
      <Box
        sx={{
          display: { xs: 'flex', xsm: 'block' },
          width: { xs: '100%', xsm: 'unset' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: { xs: 3, xsm: 0 },
        }}
      >
        <Typography
          variant={xsm ? 'subheader2' : 'description'}
          color={xsm ? 'text.secondary' : 'text.primary'}
        >
          <Trans>Staking APR</Trans>
        </Typography>

        <FormattedNumber
          value={parseFloat(stakingAPY || '0') / 10000}
          percent
          variant="secondary14"
        />
      </Box>
    </Box>
  );
};
