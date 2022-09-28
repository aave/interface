import { normalizeBN } from '@aave/math-utils';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { governanceContract } from './governanceProvider';

export type VoteType = {
  proposalId: number;
  voter: string;
  support: true;
  votingPower: number;
  transactionHash: string;
  timestamp: number;
  blockNumber: number;
};

export const getVotes = async (
  startBlock: number,
  endBlock: number,
  currentBlock: number
): Promise<{ votes: VoteType[] }> => {
  const latestBlock = currentBlock > endBlock ? endBlock : currentBlock;

  const contract = governanceContract.getContractInstance(
    governanceConfig.addresses.AAVE_GOVERNANCE_V2
  );

  // TODO: properly type
  const votes = await contract.queryFilter(
    contract.filters.VoteEmitted(null, null, null, null),
    startBlock,
    latestBlock
  );

  const formattedVotes: VoteType[] = await Promise.all(
    // eslint-disable-next-line
    votes.map(async (vote: any) => {
      return {
        proposalId: vote.args.id.toNumber(),
        voter: vote.args.voter,
        support: vote.args.support,
        votingPower: normalizeBN(vote.args.votingPower.toString(), 18).toNumber(),
        transactionHash: vote.transactionHash,
        timestamp: (await vote.getBlock()).timestamp,
        blockNumber: vote.blockNumber,
      };
    })
  );
  return { votes: formattedVotes };
};
