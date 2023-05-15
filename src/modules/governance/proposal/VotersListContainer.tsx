import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import fetch from 'isomorphic-unfetch';
import { useEffect, useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { CustomProposalType } from 'src/static-build/proposal';

import { formatProposal } from '../utils/formatProposal';
import { VotersList } from './VotersList';
import { VotersListModal } from './VotersListModal';

type VotersListProps = {
  proposal: CustomProposalType;
};

type VoterVoteHistoryProposalItem = {
  id: string;
  ipfsHash: string;
  title: string;
};

type VoterVoteHistoryItem = {
  id: string;
  proposal: VoterVoteHistoryProposalItem;
  support: boolean;
  timestamp: number;
  votingPower: number;
};

export type GovernanceVoter = {
  // _id: string; //mongodb objectid
  // aaveBalance: number; //2.6209877046554566
  // aavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  // aaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  address: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  // ensAvatar: string | null; //null
  ensName: string | null; //null
  // isSybilVerified: boolean;
  // lastUpdateTimestamp: number; //1601928545
  // proposalHistory: unknown[]; //[]
  votingPower: string;
  // propositionPower: number; //2.6209877046554566
  // propositionWeight: number; //1.6381173154096605e-7
  // stkAaveBalance: number; //0
  // stkAavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  // stkAaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  twitterAvatar: string | null;
  // twitterHandle: string | null;
  // twitterName: string | null;
  vote: 0 | 1; // 0 for nay, 1 for yae
  votingHistory: VoterVoteHistoryItem[]; //(2) [{…}, {…}]
  // votingPower: number; // the amount of voting power the user has - 2.6209877046554566
  // votingWeight: number; // the % that a single user contributes to the total - 1.6381173154096605e-7
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

  const votersUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/proposal-top-voters`;
  const queryParams = `?proposal=${proposalId}`;

  const getVoterInfo = async () => {
    if (error) setError(false);

    try {
      // Get proposal voters data
      const resp = await fetch(votersUrl + queryParams);

      if (resp.ok) {
        const [yaes, nays]: GovernanceProposalTopVotersResponse = await resp.json();
        // Transform data for UI, sort by highest voting power
        const yesVoters: GovernanceVoter[] = yaes.map((v: GovernanceVoter) => {
          // const proposalVote = v.votingHistory.find((h) => h.proposal.id === proposalId.toString());
          return {
            ...v,
            vote: 1,
            proposalVotingPower: v?.votingPower ?? 0,
          };
        });
        const noVoters: GovernanceVoter[] = nays.map((v: GovernanceVoter) => {
          // const proposalVote = v.votingHistory.find((h) => h.proposal.id === proposalId.toString());
          return {
            ...v,
            vote: 0,
            proposalVotingPower: v?.votingPower ?? 0,
          };
        });
        const votersData: VotersData = {
          yaes: yesVoters.sort(sortByVotingPower),
          nays: noVoters.sort(sortByVotingPower),
          combined: yesVoters.concat(noVoters).sort(sortByVotingPower),
        };
        console.log('votersData', votersData);
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
    setVotersModalOpen(true);
  };

  const listHeaderComponent = (
    <Row sx={{ mb: 3 }}>
      <Typography variant="subheader2" color="text.secondary">
        <Trans>Top 10 addresses</Trans>
      </Typography>
      <Typography variant="subheader2" color="text.secondary">
        <Trans>Votes</Trans>
      </Typography>
    </Row>
  );

  if (loading)
    return (
      <Box sx={{ mt: 8, mb: 12 }}>
        {listHeaderComponent}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={24} sx={{ my: 4 }} />
        </Box>
      </Box>
    );

  if (error)
    return (
      <Box sx={{ mt: 8, mb: 12 }}>
        {listHeaderComponent}
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
      {listHeaderComponent}
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
