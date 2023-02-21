import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { AvatarSize } from 'src/components/Avatar';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { UserDisplay } from 'src/components/UserDisplay';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export function VotingPowerInfoPanel() {
  const { currentAccount } = useWeb3Context();
  const powers = useVotingPower();
  return (
    <Box sx={{ px: 6, py: 6 }}>
      <Typography
        variant="h3"
        sx={{ height: '36px', display: 'flex', alignItems: 'center', mb: 4 }}
      >
        <Trans>Your info</Trans>
      </Typography>
      <UserDisplay avatarProps={{ size: AvatarSize.LG }} />
      {currentAccount && (
        <Box sx={{ display: 'flex', mt: 6, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <TextWithTooltip text="Voting power" variant="description">
              <>
                <p>
                  <Trans>
                    Total voting power based on your AAVE/stkAAVE balance and received delegations.
                  </Trans>
                </p>
                <p>
                  <Trans>Use it to vote for or against active proposals.</Trans>
                </p>
              </>
            </TextWithTooltip>
            <FormattedNumber value={powers?.votingPower || 0} variant="h2" visibleDecimals={2} />
          </Box>
          <Box>
            <TextWithTooltip text="Proposition power" variant="description">
              <>
                <p>
                  <Trans>
                    Total proposition power based on your AAVE/stkAAVE balance and received
                    delegations.
                  </Trans>
                </p>
                <p>
                  <Trans>You need at least 80.00K power to submit a proposal.</Trans>
                </p>
              </>
            </TextWithTooltip>
            <FormattedNumber
              value={powers?.propositionPower || 0}
              variant="h2"
              visibleDecimals={2}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
