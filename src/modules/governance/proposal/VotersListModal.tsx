import { Trans } from '@lingui/macro';
import { Grid, Typography } from '@mui/material';
import React from 'react';

import { BasicModal } from '../../../components/primitives/BasicModal';
import { FormattedProposal } from '../utils/formatProposal';
import { VoteBar } from '../VoteBar';
import { VotersList } from './VotersList';
import { VotersData } from './VotersListContainer';

type VotersListModalProps = {
  open: boolean;
  close: () => void;
  proposal: FormattedProposal;
  voters: VotersData;
};

export const VotersListModal = ({
  open,
  close,
  proposal,
  voters,
}: VotersListModalProps): JSX.Element | null => {
  if (!proposal || !voters) return null;

  return (
    <BasicModal open={open} setOpen={close} contentMaxWidth={800}>
      <Typography variant="h2">
        <Trans>Votes</Trans>
      </Typography>
      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={6}>
          <VoteBar
            yae
            percent={proposal.yaePercent}
            votes={proposal.yaeVotes}
            sx={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 4,
              py: 2,
            }}
          />
          <VotersList
            voters={voters.yaes}
            sx={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 4,
              mt: 3,
            }}
          />
        </Grid>
        <Grid item xs={6}>
          <VoteBar
            percent={proposal.nayPercent}
            votes={proposal.nayVotes}
            sx={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'divider',
              borderRadius: 1,
              px: 4,
              py: 2,
            }}
          />
          <VotersList
            voters={voters.nays}
            sx={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'divider',
              borderRadius: 1,
              p: 4,
              mt: 3,
            }}
          />
        </Grid>
      </Grid>
    </BasicModal>
  );
};
