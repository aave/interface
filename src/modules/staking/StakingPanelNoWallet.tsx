import { Trans } from '@lingui/macro';
import { Box, Stack, Typography } from '@mui/material';
import React from 'react';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

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
  const currentMarketData = useRootStore((store) => store.currentMarketData);
  let stakingAPY = '';

  const { data: stakeGeneralResult } = useGeneralStakeUiData(currentMarketData);

  let stkAave: StakeTokenFormatted | undefined;
  let stkBpt: StakeTokenFormatted | undefined;
  let stkGho: StakeTokenFormatted | undefined;
  let stkBptV2: StakeTokenFormatted | undefined;
  if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
    [stkAave, stkBpt, stkGho, stkBptV2] = stakeGeneralResult;
  }

  if (stakedToken == 'AAVE') stakingAPY = stkAave?.stakeApy || '0';
  if (stakedToken == 'ABPT') stakingAPY = stkBpt?.stakeApy || '0';
  if (stakedToken == 'GHO') stakingAPY = stkGho?.stakeApy || '0';
  if (stakedToken == 'ABPT V2') stakingAPY = stkBptV2?.stakeApy || '0';

  const distributionEnded = Date.now() / 1000 > Number(stkGho?.distributionEnd);

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
        width: '250px',
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
        <Stack direction="column" alignItems="start">
          <Typography variant="subheader1" color="text.primary" ml={2}>
            {stakedToken}
          </Typography>
          {stakedToken === 'GHO' && (
            <Box sx={{ mx: 2 }}>
              <MeritIncentivesButton symbol={stakedToken} market={CustomMarket.proto_mainnet_v3} />
            </Box>
          )}
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'block',
          width: { xs: '100%', xsm: 'unset' },
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box display={'flex'} alignItems={'center'}>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Staking APR</Trans>
          </Typography>

          {distributionEnded && stakedToken === 'GHO' && (
            <TextWithTooltip wrapperProps={{ marginBottom: '1px' }} iconColor="warning.main">
              <Trans>
                The current incentives period, decided on by the Aave community, has ended.
                Governance is in the process on renewing, check for updates.{' '}
                <Link
                  href="https://governance.aave.com"
                  sx={{ textDecoration: 'underline' }}
                  variant="caption"
                  color="text.secondary"
                >
                  Learn more
                </Link>
                .
              </Trans>
            </TextWithTooltip>
          )}
        </Box>

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
