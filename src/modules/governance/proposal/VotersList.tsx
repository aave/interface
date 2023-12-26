import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Fragment } from 'react';
import { ProposalVote } from 'src/hooks/governance/useProposalVotes';

import { VotersListItem } from './VotersListItem';

type VotersListProps = {
  compact?: boolean;
  voters: ProposalVote[];
  sx?: SxProps<Theme>;
};

export const VotersList = ({ compact = false, voters, sx }: VotersListProps): JSX.Element => {
  return (
    <Box sx={{ maxHeight: 205, overflow: 'hidden', overflowY: 'scroll', ...sx }}>
      {voters.length === 0 ? (
        <Box sx={{ color: 'text.secondary' }}>—</Box>
      ) : (
        voters
          .sort((a, b) => Number(b.votingPower) - Number(a.votingPower))
          .map((voter) => (
            <Fragment key={voter.voter}>
              <VotersListItem voter={voter} compact={compact} />
            </Fragment>
          ))
      )}
    </Box>
  );
};
