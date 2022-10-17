import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
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

export type GovernanceVoter = {
  _id: string; //mongodb objectid
  aaveBalance: number; //2.6209877046554566
  aavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  aaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  address: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  ensAvatar: string | null; //null
  ensName: string | null; //null
  isSybilVerified: boolean;
  lastUpdateTimestamp: number; //1601928545
  proposalHistory: unknown[]; //[]
  propositionPower: number; //2.6209877046554566
  propositionWeight: number; //1.6381173154096605e-7
  stkAaveBalance: number; //0
  stkAavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  stkAaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  twitterAvatar: string | null;
  twitterHandle: string | null;
  twitterName: string | null;
  vote: 0 | 1; // 0 for nay, 1 for yae
  votingHistory: unknown[]; //(2) [{…}, {…}]
  votingPower: number; // the amount of voting power the user has - 2.6209877046554566
  votingWeight: number; // the % that a single user contributes to the total - 1.6381173154096605e-7
};

export type VotersData =
  | { yaes: GovernanceVoter[]; nays: GovernanceVoter[]; combined: GovernanceVoter[] }
  | undefined;

const sortByVotingPower = (a: GovernanceVoter, b: GovernanceVoter) => {
  return a.votingPower < b.votingPower ? 1 : a.votingPower > b.votingPower ? -1 : 0;
};

export const VotersListContainer = (props: VotersListProps): JSX.Element => {
  const { proposal } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);
  const [voters, setVoters] = useState<VotersData>();
  const [votersModalOpen, setVotersModalOpen] = useState(false);

  const votersUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/proposal-top-voters`;
  const queryParams = `?proposal=${proposal.id}`;

  useEffect(() => {
    const getVoterInfo = async () => {
      if (error) setError(false);

      try {
        // Get proposal voters data
        const resp = await fetch(votersUrl + queryParams);

        if (resp.ok) {
          const [yaes, nays] = await resp.json();
          // Transform data for UI, sort by highest voting power
          const yesVoters = yaes.map((v: GovernanceVoter) => ({ ...v, vote: 1 }));
          const noVoters = nays.map((v: GovernanceVoter) => ({ ...v, vote: 0 }));
          const votersData = {
            yaes: yesVoters.sort(sortByVotingPower),
            nays: noVoters.sort(sortByVotingPower),
            combined: yesVoters.concat(noVoters).sort(sortByVotingPower),
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
    getVoterInfo();
  }, [proposal]); /* eslint-disable-line react-hooks/exhaustive-deps */

  console.log({ voters });

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
    <Box sx={{ mt: 8, mb: 12 }}>
      {listHeaderComponent}
      <VotersList voters={voters.combined.slice(0, 10)} />
      {voters.combined.length > 10 && (
        <Button variant="outlined" fullWidth onClick={handleOpenAllVotes} sx={{ mt: 4 }}>
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
