import { Box, Theme } from '@mui/material';
import { SxProps } from '@mui/system';
import { Fragment } from 'react';
import { VoteDisplay } from 'src/modules/governance/types';

import { VotersListItem } from './VotersListItem';

type VotersListProps = {
  compact?: boolean;
  voters: VoteDisplay[];
  sx?: SxProps<Theme>;
};

const VISIBLE_HEIGHT = 205;
const GUTTER = 16;
const FADE = '0.75rem';
const SCROLL_FADE = `linear-gradient(to bottom, transparent, #000 ${FADE}, #000 calc(100% - ${FADE}), transparent)`;

export const VotersList = ({ compact = false, voters, sx }: VotersListProps): JSX.Element => {
  return (
    <Box
      sx={{
        maxHeight: VISIBLE_HEIGHT + GUTTER * 2,
        overflow: 'hidden',
        overflowY: 'scroll',
        py: `${GUTTER}px`,
        maskImage: SCROLL_FADE,
        WebkitMaskImage: SCROLL_FADE,
        ...sx,
      }}
    >
      {voters.length === 0 ? (
        <Box sx={{ color: 'fg-2' }}>—</Box>
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
