import { gql, useQuery } from '@apollo/client';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

export type PowerQueryResponseType = {
  __typename?: 'Query';
  votingPowers: {
    __typename?: 'VotingPowers';
    votingPower: string;
    propositionPower: string;
    aaveVotingDelegatee: string;
    aavePropositionDelegatee: string;
    stkAaveVotingDelegatee: string;
    stkAavePropositionDelegatee: string;
  };
};

export const PowerQuery = gql`
  query VotingPowers($userAccount: String) {
    votingPowers(userAccount: $userAccount) {
      votingPower @client
      propositionPower @client
      aaveVotingDelegatee @client
      aavePropositionDelegatee @client
      stkAaveVotingDelegatee @client
      stkAavePropositionDelegatee @client
    }
  }
`;

export const useVotingPower = () => {
  const { currentAccount } = useWeb3Context();
  const { data, loading } = useQuery<PowerQueryResponseType>(PowerQuery, {
    variables: { userAccount: currentAccount },
  });

  return { ...(data?.votingPowers || {}), loading };
};
