import { Trans } from '@lingui/macro';
import { Box, Divider, Typography } from '@mui/material';
import { AvatarSize } from 'src/components/Avatar';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { UserDisplay } from 'src/components/UserDisplay';
import { useVotingPower } from 'src/hooks/governance-data-provider/useVotingPower';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export function VotingPowerInfoPanel() {
  const { currentAccount } = useWeb3Context();
  const powers = useVotingPower();
  return (
    <>
      <Box sx={{ px: 6, py: 6 }}>
        <Typography variant="h3" sx={{ height: '36px', display: 'flex', alignItems: 'center' }}>
          <Trans>Your info</Trans>
        </Typography>
        <UserDisplay avatarProps={{ size: AvatarSize.LG }} />
        {currentAccount && (
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="description">
                <Trans>Voting power</Trans>
              </Typography>
              <FormattedNumber value={powers?.votingPower || 0} variant="h2" visibleDecimals={2} />
            </Box>
            <Box>
              <Typography variant="description">
                <Trans>Proposition power</Trans>
              </Typography>
              <FormattedNumber
                value={powers?.propositionPower || 0}
                variant="h2"
                visibleDecimals={2}
              />
            </Box>
          </Box>
        )}
      </Box>
      <Divider />
      <Box sx={{ px: 6, pt: 4, pb: 6, display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography>Delegate your power</Typography>
        </Box>
      </Box>
    </>
  );
}
