import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import fetch from 'isomorphic-unfetch';
import { Fragment, useEffect, useState } from 'react';
import { Row } from 'src/components/primitives/Row';
import { CustomProposalType } from 'src/static-build/proposal';

import { formatProposal } from '../utils/formatProposal';
import { VotersListItem } from './VotersListItem';
import { VotersListModal } from './VotersListModal';

type VotersListProps = {
  proposal: CustomProposalType;
};

// Possibly omit unnecessary values with lodash: proposalHistory, lastUpdateTimestamp, stkAave fields, votingHistory
export type GovernanceVoter = {
  aaveBalance: number; //2.6209877046554566
  aavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  aaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  address: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  avatar: string | null; //null
  handle: string | null; //null
  isVerified: boolean; //false
  lastUpdateTimestamp: number; //1601928545
  name: string | null; //null
  proposalHistory: unknown[]; //[]
  propositionPower: number; //2.6209877046554566
  propositionWeight: number; //1.6381173154096605e-7
  stkAaveBalance: number; //0
  stkAavePropositionDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  stkAaveVotingDelegate: string; //"0x8298a996a00835eedcc75763038b731fe617fd0d"
  vote: 0 | 1; // 0 for nay, 1 for yae
  votingHistory: unknown[]; //(2) [{…}, {…}]
  votingPower: number; // the amount of voting power the user has - 2.6209877046554566
  votingWeight: number; // the % that a single user contributes to the total - 1.6381173154096605e-7
  _id: string; //mongodb objectid
};

export type VotersData =
  | { yaes: GovernanceVoter[]; nays: GovernanceVoter[]; combined: GovernanceVoter[] }
  | undefined;

/**
 * MOCK DATA
 */
// const mockVoter = (id: number): GovernanceVoter => ({
//   _id: id.toString(),
//   address: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500',
//   aaveBalance: 0,
//   aavePropositionDelegate: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500',
//   aaveVotingDelegate: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500',
//   avatar: null,
//   handle: null,
//   isVerified: false,
//   lastUpdateTimestamp: 1661177618,
//   name: null,
//   proposalHistory: [],
//   propositionPower: 0.100085,
//   propositionWeight: 6.2553125e-9,
//   stkAaveBalance: 0.100085,
//   stkAavePropositionDelegate: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500',
//   stkAaveVotingDelegate: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500',
//   votingHistory: [
//     {
//       proposal: {
//         id: '103',
//         title: 'Ethereum v2 Reserve Factor - aFEI Holding Update',
//         ipfsHash: 'QmQvuQ2Z4Go9AKEWtuokyD682poSqpg4WWNJGbRHzHBTvY',
//       },
//       id: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500:103',
//       support: true,
//       votingPower: 100085000000000000,
//       timestamp: 1664643287,
//     },
//     {
//       proposal: {
//         id: '106',
//         title: 'Adjust Aave Governance Level 2 requirements',
//         ipfsHash: 'QmTSjXL3Ynh8D7NP2mhLULGAbdSvYX74GtTWwmS1qmwx4s',
//       },
//       id: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500:106',
//       support: true,
//       votingPower: 100085000000000000,
//       timestamp: 1665237935,
//     },
//     {
//       proposal: {
//         id: '107',
//         title:
//           'Use AAVE Ecosystem Reserve to vote YES on proposal to adjust Level 2 Governance requirements',
//         ipfsHash: 'QmYrcwDvzYmWTJjsxJ8zLyYS2YYK4ByQBs28gcs9Am4xFK',
//       },
//       id: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500:107',
//       support: true,
//       votingPower: 100085000000000000,
//       timestamp: 1665237971,
//     },
//     {
//       proposal: {
//         id: '99',
//         title: 'Add stMATIC to Aave v3 pool on Polygon',
//         ipfsHash: 'QmRrpBPvmhdmpCBRLhGcUZ56e82Ad8F7syVCMJXM6kP5kS',
//       },
//       id: '0x6addaa208ea7c6e413f0c514dc1ba7510390c500:99',
//       support: true,
//       votingPower: 100085000000000000,
//       timestamp: 1662722604,
//     },
//   ],
//   votingPower: 0.100085,
//   votingWeight: 6.2553125e-9,
//   vote: 1,
// });
// /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// // @ts-ignore
// const mockYesVoters: GovernanceVoter[] = Array.from(Array(25), (x, i) => mockVoter(i)).map(
//   (v: GovernanceVoter) => ({
//     ...v,
//     vote: 1,
//   })
// );
// /* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// // @ts-ignore
// const mockNoVoters: GovernanceVoter[] = Array.from(Array(25), (x, i) => mockVoter(i + 25)).map(
//   (v: GovernanceVoter) => ({
//     ...v,
//     vote: 0,
//   })
// );
// const mockVoters: VotersData = {
//   yaes: mockYesVoters,
//   nays: mockNoVoters,
//   combined: mockYesVoters.concat(mockNoVoters).sort((a: GovernanceVoter, b: GovernanceVoter) => {
//     return a.votingPower < b.votingPower ? 1 : a.votingPower > b.votingPower ? -1 : 0;
//   }),
// };

export const VotersListContainer = (props: VotersListProps): JSX.Element => {
  const { proposal } = props;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);
  const [voters, setVoters] = useState<VotersData>();
  const [votersModalOpen, setVotersModalOpen] = useState(false);
  const isMobile = false;

  const votersUrl = `${process.env.NEXT_PUBLIC_API_BASEURL}/data/proposal-top-voters`;
  const queryParams = `?proposal=${proposal.id}`;

  const sortByVotingPower = (a: GovernanceVoter, b: GovernanceVoter) => {
    return a.votingPower < b.votingPower ? 1 : a.votingPower > b.votingPower ? -1 : 0;
  };

  useEffect(() => {
    const getVoterInfo = async () => {
      if (error) setError(null);

      try {
        const resp = await fetch(votersUrl + queryParams);
        if (resp.ok) {
          const [yaes, nays] = await resp.json();
          const yesVoters = yaes.map((v: GovernanceVoter) => ({ ...v, vote: 1 }));
          const noVoters = nays.map((v: GovernanceVoter) => ({ ...v, vote: 0 }));
          const votersData = {
            yaes: yesVoters.sort(sortByVotingPower),
            nays: noVoters.sort(sortByVotingPower),
            combined: yesVoters.concat(noVoters).sort(sortByVotingPower),
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

  const handleOpenAllVotes = () => {
    setVotersModalOpen(true);
  };

  return (
    <Box sx={{ mt: 8, mb: 12 }}>
      <Row sx={{ mb: 3 }}>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Top 10 addresses</Trans>
        </Typography>
        <Typography variant="subheader2" color="text.secondary">
          <Trans>Votes</Trans>
        </Typography>
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
            <Box sx={{ mb: 4, maxHeight: 230, overflow: 'hidden', overflowY: 'scroll' }}>
              {!isMobile &&
                voters.combined.slice(0, 10).map((voter) => (
                  <Fragment key={voter._id}>
                    <VotersListItem voter={voter} />
                  </Fragment>
                ))}
              {isMobile &&
                voters.yaes.map((voter) => (
                  <Fragment key={voter._id}>
                    <VotersListItem voter={voter} />
                  </Fragment>
                ))}
              {isMobile &&
                voters.nays.map((voter) => (
                  <Fragment key={voter._id}>
                    <VotersListItem voter={voter} />
                  </Fragment>
                ))}
            </Box>
            <Button variant="outlined" fullWidth onClick={handleOpenAllVotes}>
              <Trans>View all votes</Trans>
            </Button>
          </>
        )}
      </Box>
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
