import { ChainId, Proposal } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export function formatProposal(proposal: Omit<Proposal, 'values'>) {
  const allVotes = new BigNumber(proposal.forVotes).plus(proposal.againstVotes);
  const yaePercent = new BigNumber(proposal.forVotes).dividedBy(allVotes).toNumber();
  const yaeVotes = normalizeBN(proposal.forVotes, 18).toNumber();
  const nayPercent = new BigNumber(proposal.againstVotes).dividedBy(allVotes).toNumber();
  const nayVotes = normalizeBN(proposal.againstVotes, 18).toNumber();
  const minQuorumNeeded = new BigNumber(proposal.totalVotingSupply)
    .multipliedBy(proposal.minimumQuorum)
    .div(1000000);
  const quorumPercent = new BigNumber(proposal.forVotes).dividedBy(minQuorumNeeded);
  let quorumReached = false;
  if (quorumPercent.gte(100)) {
    quorumReached = true;
  }
  const diff = new BigNumber(proposal.forVotes)
    .minus(proposal.againstVotes)
    .dividedBy(proposal.totalVotingSupply)
    .multipliedBy(100)
    .multipliedBy(4)
    .toNumber();
  const requiredDiff = new BigNumber(proposal.minimumDiff)
    .dividedBy(100)
    .multipliedBy(4)
    .toNumber();
  const diffReached = diff > requiredDiff;

  return {
    yaePercent,
    yaeVotes,
    nayPercent,
    nayVotes,
    minQuorumNeeded,
    quorumPercent,
    quorumReached,
    diff,
    requiredDiff,
    diffReached,
  };
}

const averageBlockTime = 13.5;

export async function enhanceProposalWithTimes(proposal: Omit<Proposal, 'values'>) {
  const provider = getProvider(ChainId.mainnet);
  const { timestamp: startTimestamp } = await provider.getBlock(proposal.startBlock);
  const { timestamp: creationTimestamp } = await provider.getBlock(proposal.proposalCreated);
  const expirationTimestamp =
    startTimestamp + (proposal.endBlock - proposal.startBlock) * averageBlockTime;
  return { ...proposal, startTimestamp, creationTimestamp, expirationTimestamp };
}
