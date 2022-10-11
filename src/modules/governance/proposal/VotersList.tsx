import { Box, CircularProgress, Typography } from '@mui/material';
import fetch from 'isomorphic-unfetch';
import { Fragment, useEffect, useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { CustomProposalType } from 'src/static-build/proposal';

import { VotersListItem } from './VotersListItem';

type VotersListProps = {
  proposal: CustomProposalType;
};

// Possibly omit unnecessary values with lodash: proposalHistory, lastUpdateTimestamp, stkAave fields, votingHistory
export type GovernanceVoter = {
  aaveBalance: number; //2.6209877046554566
  aavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  aaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  address: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  avatar?: string; //null
  handle?: string; //null
  isVerified: boolean; //false
  lastUpdateTimestamp: number; //1601928545
  name?: string; //null
  proposalHistory: unknown[]; //[]
  propositionPower: number; //2.6209877046554566
  propositionWeight: number; //1.6381173154096605e-7
  stkAaveBalance: number; //0
  stkAavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  stkAaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  votingHistory: unknown[]; //(2) [{…}, {…}]
  votingPower: number; //2.6209877046554566
  votingWeight: number; //1.6381173154096605e-7
  _id: string; //mongodb objectid
};

type VotersData = { yays: GovernanceVoter[]; nays: GovernanceVoter[] } | undefined;

export const VotersList = (props: VotersListProps): JSX.Element => {
  const { proposal } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [voters, setVoters] = useState<VotersData>();

  const votersUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/proposal-top-voters`;
  const queryParams = `?proposal=${proposal.id}`;

  useEffect(() => {
    const getVoterInfo = async () => {
      if (error) setError(null);

      try {
        const resp = await fetch(votersUrl + queryParams);
        if (resp.ok) {
          const data = await resp.json();
          const votersData = {
            yays: data[0],
            nays: data[1],
          };
          setVoters(votersData);
        } else {
          setError('Failed to get proposal top voters');
        }
      } catch (e: unknown) {
        console.error(e);
        setError('Failed to get proposal top voters');
      }
      setLoading(false);
    };
    getVoterInfo();
  }, [proposal]); /* eslint-disable-line react-hooks/exhaustive-deps */

  console.log({ voters });

  return (
    <Box sx={{ mt: 8, mb: 3 }}>
      <Row>
        <Typography>Top 10 addresses</Typography>
        <Typography>Votes</Typography>
      </Row>
      <Box>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress size={30} sx={{ my: 4 }} />
          </Box>
        )}
        {error && (
          <Typography variant="subheader1" color="error.main">
            {error}
          </Typography>
        )}
        {voters && (
          <>
            <Typography>YAYS</Typography>
            {voters.yays.map((voter) => (
              <Fragment key={voter._id}>
                <VotersListItem voter={voter} />
              </Fragment>
            ))}
            <Typography>NAYS</Typography>
            {voters.nays.map((voter) => (
              <Fragment key={voter._id}>
                <VotersListItem voter={voter} />
              </Fragment>
            ))}
          </>
        )}
      </Box>
    </Box>
  );
};
