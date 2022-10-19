import { Trans } from '@lingui/macro';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';

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
  const { breakpoints } = useTheme();
  const mdUp = useMediaQuery(breakpoints.up('md'));
  const [voteView, setVoteView] = useState<'yaes' | 'nays'>('yaes');
  const borderBaseStyle = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
  };

  if (!proposal || !voters) return null;

  const yesVotesUI = (
    <>
      <VoteBar
        yae
        percent={proposal.yaePercent}
        votes={proposal.yaeVotes}
        sx={{
          ...borderBaseStyle,
          px: 4,
          py: 2,
        }}
      />
      <Box sx={{ ...borderBaseStyle, mt: 3 }}>
        <Row
          sx={{
            px: 4,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Addresses ({voters.yaes.length})</Trans>
          </Typography>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Votes</Trans>
          </Typography>
        </Row>
        <VotersList
          voters={voters.yaes}
          sx={{
            p: 4,
            mb: 0,
            maxHeight: 318,
          }}
        />
      </Box>
    </>
  );

  const noVotesUI = (
    <>
      <VoteBar
        percent={proposal.nayPercent}
        votes={proposal.nayVotes}
        sx={{
          ...borderBaseStyle,
          px: 4,
          py: 2,
        }}
      />
      <Box sx={{ ...borderBaseStyle, mt: 3 }}>
        <Row
          sx={{
            px: 4,
            py: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Addresses ({voters.nays.length})</Trans>
          </Typography>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Votes</Trans>
          </Typography>
        </Row>
        <VotersList
          voters={voters.nays}
          sx={{
            p: 4,
            mb: 0,
            maxHeight: 318,
          }}
        />
      </Box>
    </>
  );

  return (
    <BasicModal open={open} setOpen={close} contentMaxWidth={mdUp ? 800 : 360}>
      <Typography variant="h2">
        <Trans>Votes</Trans>
      </Typography>
      {mdUp ? (
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}>
            {yesVotesUI}
          </Grid>
          <Grid item xs={6}>
            {noVotesUI}
          </Grid>
        </Grid>
      ) : (
        <>
          <StyledToggleButtonGroup
            color="primary"
            value={voteView}
            exclusive
            onChange={(_, value) => setVoteView(value)}
            sx={{ width: '100%', height: '44px', mt: 8, mb: 6 }}
          >
            <StyledToggleButton value="yaes" disabled={voteView === 'yaes'}>
              <Typography variant="subheader1">
                <Trans>Voted YAE</Trans>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton value="nays" disabled={voteView === 'nays'}>
              <Typography variant="subheader1">
                <Trans>Voted NAY</Trans>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
          {voteView === 'yaes' && yesVotesUI}
          {voteView === 'nays' && noVotesUI}
        </>
      )}
    </BasicModal>
  );
};
