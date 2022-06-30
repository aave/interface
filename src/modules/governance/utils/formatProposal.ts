import { ChainId, Proposal, ProposalState } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export function formatProposal(proposal: Omit<Proposal, 'values'>) {
  const allVotes = new BigNumber(proposal.forVotes).plus(proposal.againstVotes);
  const yaePercent = allVotes.gt(0)
    ? new BigNumber(proposal.forVotes).dividedBy(allVotes).toNumber()
    : 0;
  const yaeVotes = normalizeBN(proposal.forVotes, 18).toNumber();
  const nayPercent = allVotes.gt(0)
    ? new BigNumber(proposal.againstVotes).dividedBy(allVotes).toNumber()
    : 0;
  const nayVotes = normalizeBN(proposal.againstVotes, 18).toNumber();

  const minQuorumVotes = new BigNumber(proposal.totalVotingSupply).multipliedBy(
    new BigNumber(proposal.minimumQuorum).div(10000)
  );
  let quorumReached = false;
  if (new BigNumber(proposal.forVotes).gte(minQuorumVotes)) {
    quorumReached = true;
  }

  const diff = new BigNumber(proposal.forVotes).minus(proposal.againstVotes);
  const voteSum = new BigNumber(proposal.forVotes).plus(proposal.againstVotes);

  const requiredDiff = new BigNumber(proposal.totalVotingSupply)
    .multipliedBy(proposal.minimumDiff)
    .dividedBy(10000);

  // Differential reached if difference between yea and nay votes exceeds min threshold, and proposal has at least one voter
  const diffReached = requiredDiff.lte(diff) && !voteSum.eq(0);

  return {
    totalVotes: normalizeBN(allVotes, 18).toNumber(),
    yaePercent,
    yaeVotes,
    nayPercent,
    nayVotes,
    minQuorumVotes: normalizeBN(minQuorumVotes, 18).toNumber(),
    quorumReached,
    diff: normalizeBN(diff, 18).toNumber(),
    requiredDiff: normalizeBN(requiredDiff, 18).toNumber(),
    diffReached,
  };
}

const averageBlockTime = 14;

export async function enhanceProposalWithTimes(proposal: Omit<Proposal, 'values'>) {
  const provider = getProvider(ChainId.mainnet);
  const { timestamp: startTimestamp } = await provider.getBlock(proposal.startBlock);
  const { timestamp: creationTimestamp } = await provider.getBlock(proposal.proposalCreated);
  if (proposal.state === ProposalState.Active) {
    const currentBlockNumber = await provider.getBlockNumber();
    const currentBlock = await provider.getBlock(currentBlockNumber);
    return {
      ...proposal,
      startTimestamp,
      creationTimestamp,
      expirationTimestamp:
        currentBlock.timestamp + (proposal.endBlock - currentBlockNumber) * averageBlockTime,
    };
  }
  const expirationTimestamp =
    startTimestamp + (proposal.endBlock - proposal.startBlock) * averageBlockTime;
  return { ...proposal, startTimestamp, creationTimestamp, expirationTimestamp };
}
