import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import fetch from 'isomorphic-unfetch';
import { useEffect, useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { CustomProposalType } from 'src/static-build/proposal';
import { useRootStore } from 'src/store/root';
import { AIP } from 'src/utils/mixPanelEvents';

import { formatProposal } from '../utils/formatProposal';
import { VotersList } from './VotersList';
import { VotersListModal } from './VotersListModal';

type VotersListProps = {
  proposal: CustomProposalType;
};

export type GovernanceVoter = {
  address: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  ensName: string | null; //null
  votingPower: number;
  twitterAvatar: string | null;
  support: boolean;
};

type GovernanceProposalTopVotersResponse = [GovernanceVoter[], GovernanceVoter[]];

export type VotersData = {
  yaes: GovernanceVoter[];
  nays: GovernanceVoter[];
  combined: GovernanceVoter[];
};

const sortByVotingPower = (a: GovernanceVoter, b: GovernanceVoter) => {
  return a.votingPower < b.votingPower ? 1 : a.votingPower > b.votingPower ? -1 : 0;
};

export const VotersListContainer = (props: VotersListProps): JSX.Element => {
  const { proposal } = props;
  const { id: proposalId, forVotes, againstVotes } = proposal;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [voters, setVoters] = useState<VotersData>();
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const { breakpoints } = useTheme();
  const mdScreen = useMediaQuery(breakpoints.only('md'));

  const votersUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/proposal-votes`;
  const queryParams = `?proposal=${proposalId}`;
  const trackEvent = useRootStore((store) => store.trackEvent);

  const getVoterInfo = async () => {
    if (error) setError(false);

    try {
      // Get proposal voters data
      const resp = await fetch(votersUrl + queryParams);

      if (resp.ok) {
        const [yaes, nays]: GovernanceProposalTopVotersResponse = await resp.json();
        const votersData: VotersData = {
          yaes: yaes.sort(sortByVotingPower),
          nays: nays.sort(sortByVotingPower),
          combined: yaes.concat(nays).sort(sortByVotingPower),
        };
        setVoters(votersData);
      } else {
        setError(true);
      }
    } catch (e: unknown) {
      console.error(e);
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => {
    getVoterInfo();
  }, [forVotes, againstVotes]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const handleOpenAllVotes = () => {
    trackEvent(AIP.VIEW_ALL_VOTES);
    setVotersModalOpen(true);
  };

  if (loading)
    return (
      <Box sx={{ mt: 8, mb: 12 }}>
        <Row sx={{ mb: 3 }}>
          <Typography sx={{ ml: 'auto' }} variant="subheader2" color="text.secondary">
            <Trans>Votes</Trans>
          </Typography>
        </Row>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={24} sx={{ my: 4 }} />
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ mt: 8, mb: 12 }}>
        <Row sx={{ mb: 3 }}>
          <Typography sx={{ ml: 'auto' }} variant="subheader2" color="text.secondary">
            <Trans>Votes</Trans>
          </Typography>
        </Row>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 8 }}>
          <Typography variant="helperText" color="error.main">
            <Trans>Failed to load proposal voters. Please refresh the page.</Trans>
          </Typography>
        </Box>
      </Box>
    );

  if (!voters || voters.combined.length === 0) return <Box sx={{ mt: 8 }} />;

  return (
    <Box sx={{ my: 8 }}>
      <Row sx={{ mb: 3 }}>
        <Typography variant="subheader2" color="text.secondary">
          {voters.combined.length > 10 ? <Trans>Top 10 addresses</Trans> : <Trans>Addresses</Trans>}
        </Typography>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Votes</Trans>
        </Typography>
      </Row>
      <VotersList
        compact={mdScreen}
        voters={voters.combined.slice(0, 10)}
        sx={{ my: 4, pr: 2.25 }}
      />
      {voters.combined.length > 10 && (
        <Button variant="outlined" fullWidth onClick={handleOpenAllVotes}>
          <Trans>View all votes</Trans>
        </Button>
      )}
      {votersModalOpen && (
        <VotersListModal
          open={votersModalOpen}
          close={() => setVotersModalOpen(false)}
          proposal={formatProposal(proposal)}
          voters={voters}
        />
      )}
    </Box>
  );
};
