import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { Trans } from '@lingui/macro';
import { Box, Button, Stack, Typography } from '@mui/material';
import { formatEther } from 'ethers/lib/utils';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useModalContext } from 'src/hooks/useModal';
import { StakeActionBox } from 'src/modules/staking/StakeActionBox';

interface SavingsGhoActionBoxProps {
  stakeUserData: GetUserStakeUIDataHumanized['stakeUserData'][0];
  stakedUSD: string;
  isCooldownActive: boolean;
  isUnstakeWindowActive: boolean;
}

export const SavingsGhoActionBox = ({
  stakeUserData,
  stakedUSD,
  isCooldownActive,
  isUnstakeWindowActive,
}: SavingsGhoActionBoxProps) => {
  const { openSavingsGhoDeposit, openSavingsGhoWithdraw } = useModalContext();

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      <StakeActionBox
        dataCy="savingsGhoBox"
        title={
          <>
            <Trans>sGHO</Trans>
          </>
        }
        value={formatEther(stakeUserData.stakeTokenRedeemableAmount)}
        valueUSD={stakedUSD}
        bottomLineTitle={
          <TextWithTooltip variant="caption" text={<Trans>Cooldown period</Trans>}>
            <Trans>
              After the cooldown is initiated, you will be able to withdraw your assets immediately.
            </Trans>
          </TextWithTooltip>
        }
        bottomLineComponent={
          <Typography variant="secondary12">
            <Trans>Instant</Trans>
          </Typography>
        }
        cooldownAmount={
          isCooldownActive || isUnstakeWindowActive ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'space-between',
                pt: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                <Trans>Amount in cooldown</Trans>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon symbol="GHO" sx={{ mr: 1, width: 14, height: 14 }} />
                <FormattedNumber
                  value={formatEther(stakeUserData.userCooldownAmount)}
                  variant="secondary14"
                  color="text.primary"
                />
              </Box>
            </Box>
          ) : (
            <></>
          )
        }
        gradientBorder={isUnstakeWindowActive}
      >
        <Stack direction="row" gap={1} sx={{ width: '100%' }}>
          {stakeUserData.underlyingTokenUserBalance !== '0' && (
            <Button fullWidth variant="contained" onClick={() => openSavingsGhoDeposit()}>
              <Trans>Deposit</Trans>
            </Button>
          )}
          {stakeUserData.stakeTokenUserBalance !== '0' && (
            <Button fullWidth variant="outlined" onClick={() => openSavingsGhoWithdraw()}>
              <Trans>Withdraw</Trans>
            </Button>
          )}
        </Stack>
      </StakeActionBox>
    </Box>
  );
};
