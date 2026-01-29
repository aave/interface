import { Trans } from '@lingui/macro';
import { Box, Grid, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { ProposalVote } from 'src/hooks/governance/useProposalVotes';

import { BasicModal } from '../../../components/primitives/BasicModal';
import { VoteBar } from '../VoteBar';
import { VotersList } from './VotersList';

type VotersListCacheModalProps = {
  open: boolean;
  close: () => void;
  yaeVotes: ProposalVote[];
  nayVotes: ProposalVote[];
  forVotes: number;
  againstVotes: number;
};

export const VotersListCacheModal = ({
  open,
  close,
  yaeVotes,
  nayVotes,
  forVotes,
  againstVotes,
}: VotersListCacheModalProps): JSX.Element | null => {
  const { breakpoints } = useTheme();
  const mdUp = useMediaQuery(breakpoints.up('md'));
  const [voteView, setVoteView] = useState<'yaes' | 'nays'>('yaes');
  const borderBaseStyle = {
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
  };

  const total = forVotes + againstVotes;
  const forPercent = total > 0 ? (forVotes / total) * 100 : 0;
  const againstPercent = total > 0 ? (againstVotes / total) * 100 : 0;

  const yesVotesUI = (
    <>
      <VoteBar
        yae
        percent={forPercent}
        votes={forVotes}
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
            <Trans>Addresses ({yaeVotes.length})</Trans>
          </Typography>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Votes</Trans>
          </Typography>
        </Row>
        <VotersList
          voters={yaeVotes}
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
        percent={againstPercent}
        votes={againstVotes}
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
            <Trans>Addresses ({nayVotes.length})</Trans>
          </Typography>
          <Typography variant="subheader2" color="text.secondary">
            <Trans>Votes</Trans>
          </Typography>
        </Row>
        <VotersList
          voters={nayVotes}
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
