import { ChainId, Proposal } from '@aave/contract-helpers';
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
  const minQuorumNeeded = new BigNumber(proposal.totalVotingSupply)
    .multipliedBy(proposal.minimumQuorum)
    .div(1000000);
  const quorumPercent = new BigNumber(proposal.forVotes).dividedBy(minQuorumNeeded);
  let quorumReached = false;
  if (quorumPercent.gte(100)) {
    quorumReached = true;
  }

  const diff = new BigNumber(proposal.forVotes).minus(proposal.againstVotes);

  const requiredDiff = new BigNumber(proposal.forVotes)
    .plus(proposal.againstVotes)
    .multipliedBy(new BigNumber(proposal.minimumDiff).dividedBy(100));

  const diffReached = requiredDiff.lte(diff);

  console.log(`
  for: ${proposal.forVotes}
  against: ${proposal.againstVotes}
  min: ${proposal.minimumDiff} 
  diff: ${diff}
  requiredDiff: ${requiredDiff}
  diffReached: ${diffReached}
`);

  return {
    yaePercent,
    yaeVotes,
    nayPercent,
    nayVotes,
    minQuorumNeeded,
    quorumPercent,
    quorumReached,
    diff: normalizeBN(diff, 18).toNumber(),
    requiredDiff: normalizeBN(requiredDiff, 18).toNumber(),
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
