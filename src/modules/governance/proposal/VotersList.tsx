import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Fragment } from 'react';

import { GovernanceVoter } from './VotersListContainer';
import { VotersListItem } from './VotersListItem';

type VotersListProps = {
  voters: GovernanceVoter[];
  sx?: SxProps<Theme>;
};

export const VotersList = ({ voters, sx }: VotersListProps): JSX.Element => {
  const isMobile = false;

  return (
    <Box sx={{ mb: 4, maxHeight: 230, overflow: 'hidden', overflowY: 'scroll', ...sx }}>
      {!isMobile &&
        voters.map((voter) => (
          <Fragment key={voter._id}>
            <VotersListItem voter={voter} />
          </Fragment>
        ))}
      {isMobile &&
        voters.map((voter) => (
          <Fragment key={voter._id}>
            <VotersListItem voter={voter} />
          </Fragment>
        ))}
      {isMobile &&
        voters.map((voter) => (
          <Fragment key={voter._id}>
            <VotersListItem voter={voter} />
          </Fragment>
        ))}
    </Box>
  );
};
