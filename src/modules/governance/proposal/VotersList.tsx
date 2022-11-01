import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Fragment } from 'react';

import { GovernanceVoter } from './VotersListContainer';
import { VotersListItem } from './VotersListItem';

type VotersListProps = {
  compact?: boolean;
  voters: GovernanceVoter[];
  sx?: SxProps<Theme>;
};

export const VotersList = ({ compact = false, voters, sx }: VotersListProps): JSX.Element => {
  return (
    <Box sx={{ maxHeight: 205, overflow: 'hidden', overflowY: 'scroll', ...sx }}>
      {voters.length === 0 ? (
        <Box sx={{ color: 'text.secondary' }}>—</Box>
      ) : (
        voters.map((voter) => (
          <Fragment key={voter._id}>
            <VotersListItem voter={voter} compact={compact} />
          </Fragment>
        ))
      )}
    </Box>
  );
};
