import { Trans } from '@lingui/macro';
import { Box, Button, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { ProposalVoteDisplayInfo, VotersSplitDisplay } from 'src/modules/governance/types';
import { useRootStore } from 'src/store/root';
import { AIP } from 'src/utils/events';

import { VotersList } from './VotersList';
import { VotersListModal } from './VotersListModal';

type VotersListProps = {
  voteInfo: ProposalVoteDisplayInfo;
  voters: VotersSplitDisplay;
};

export const VotersListContainer = ({ voteInfo, voters }: VotersListProps): JSX.Element => {
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const { breakpoints } = useTheme();
  const mdScreen = useMediaQuery(breakpoints.only('md'));
  const trackEvent = useRootStore((store) => store.trackEvent);

  const handleOpenAllVotes = () => {
    trackEvent(AIP.VIEW_ALL_VOTES);
    setVotersModalOpen(true);
  };

  if (!voters || voters.combinedVotes.length === 0) return <Box sx={{ mt: 8 }} />;

  return (
    <Box sx={{ my: 8 }}>
      <Row sx={{ mb: 3 }}>
        <Typography variant="subheader2" color="text.secondary">
          {voters.combinedVotes.length > 10 ? (
            <Trans>Top 10 addresses</Trans>
          ) : (
            <Trans>Addresses</Trans>
          )}
        </Typography>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Votes</Trans>
        </Typography>
      </Row>
      <VotersList
        compact={mdScreen}
        voters={voters.combinedVotes.slice(0, 10)}
        sx={{ my: 4, pr: 2.25 }}
      />
      {voters.combinedVotes.length > 10 && (
        <Button variant="outlined" fullWidth onClick={handleOpenAllVotes}>
          <Trans>View all votes</Trans>
        </Button>
      )}
      {votersModalOpen && (
        <VotersListModal
          open={votersModalOpen}
          close={() => setVotersModalOpen(false)}
          voteInfo={voteInfo}
          voters={voters}
        />
      )}
    </Box>
  );
};
