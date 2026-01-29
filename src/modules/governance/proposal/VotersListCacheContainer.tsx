import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { ProposalVote as CacheProposalVote } from 'src/services/GovernanceCacheService';
import { useRootStore } from 'src/store/root';
import { AIP } from 'src/utils/events';

import { VotersList } from './VotersList';
import { VotersListCacheModal } from './VotersListCacheModal';

type VotersListCacheProps = {
  yaeVotes: CacheProposalVote[];
  nayVotes: CacheProposalVote[];
  loading: boolean;
  forVotes: number;
  againstVotes: number;
};

// Convert cache vote format to the format expected by VotersList
function convertVote(vote: CacheProposalVote) {
  return {
    proposalId: '',
    voter: vote.voter,
    support: vote.support,
    // Convert from wei to normalized value
    votingPower: (parseFloat(vote.votingPower) / 1e18).toString(),
  };
}

export const VotersListCacheContainer = ({
  yaeVotes,
  nayVotes,
  loading,
  forVotes,
  againstVotes,
}: VotersListCacheProps): JSX.Element => {
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const { breakpoints } = useTheme();
  const mdScreen = useMediaQuery(breakpoints.only('md'));
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleOpenAllVotes = () => {
    trackEvent(AIP.VIEW_ALL_VOTES);
    setVotersModalOpen(true);
  };

  // Convert all votes to display format
  const convertedYaeVotes = yaeVotes.map(convertVote);
  const convertedNayVotes = nayVotes.map(convertVote);
  const combinedVotes = [...convertedYaeVotes, ...convertedNayVotes].sort(
    (a, b) => Number(b.votingPower) - Number(a.votingPower)
  );

  if (loading) {
    return <Box sx={{ mt: 8 }} />;
  }

  if (combinedVotes.length === 0) {
    return <Box sx={{ mt: 8 }} />;
  }

  return (
    <Box sx={{ my: 8 }}>
      <Row sx={{ mb: 3 }}>
        <Typography variant="subheader2" color="text.secondary">
          {combinedVotes.length > 10 ? <Trans>Top 10 addresses</Trans> : <Trans>Addresses</Trans>}
        </Typography>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Votes</Trans>
        </Typography>
      </Row>
      <VotersList compact={mdScreen} voters={combinedVotes.slice(0, 10)} sx={{ my: 4, pr: 2.25 }} />
      {combinedVotes.length > 10 && (
        <Button variant="outlined" fullWidth onClick={handleOpenAllVotes}>
          <Trans>View all votes</Trans>
        </Button>
      )}
      {votersModalOpen && (
        <VotersListCacheModal
          open={votersModalOpen}
          close={() => setVotersModalOpen(false)}
          yaeVotes={convertedYaeVotes}
          nayVotes={convertedNayVotes}
          forVotes={forVotes}
          againstVotes={againstVotes}
        />
      )}
    </Box>
  );
};
