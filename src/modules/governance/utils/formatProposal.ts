import { ChainId, Proposal, ProposalState } from '@aave/contract-helpers';
import { normalizeBN } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { CustomProposalType } from 'src/static-build/proposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

export type FormattedProposal = {
  id?: string;
  totalVotes: number;
  yaePercent: number;
  yaeVotes: number;
  nayPercent: number;
  nayVotes: number;
  minQuorumVotes: number;
  quorumReached: boolean;
  diff: number;
  requiredDiff: number;
  diffReached: boolean;
};

// The implementation replicates the validation in https://github.com/aave/governance-v2/blob/master/contracts/governance/ProposalValidator.sol#L17
// 10000 in % calculations corresponds to 100 with 2 decimals precision
export function formatProposal(proposal: Omit<Proposal, 'values'>): FormattedProposal {
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

const averageBlockTime = 12;

export async function enhanceProposalWithTimes(proposal: Omit<Proposal, 'values'>) {
  const provider = getProvider(ChainId.mainnet);
  if (proposal.state === ProposalState.Pending) {
    const { timestamp: creationTimestamp } = await provider.getBlock(proposal.proposalCreated);
    const currentBlock = await provider.getBlock('latest');
    return {
      ...proposal,
      creationTimestamp,
      startTimestamp:
        currentBlock.timestamp + (proposal.startBlock - currentBlock.number) * averageBlockTime,
      expirationTimestamp:
        currentBlock.timestamp + (proposal.endBlock - currentBlock.number) * averageBlockTime,
    };
  }
  const [{ timestamp: startTimestamp }, { timestamp: creationTimestamp }] = await Promise.all([
    provider.getBlock(proposal.startBlock),
    provider.getBlock(proposal.proposalCreated),
  ]);
  if (proposal.state === ProposalState.Active) {
    const currentBlock = await provider.getBlock('latest');
    return {
      ...proposal,
      startTimestamp,
      creationTimestamp,
      expirationTimestamp:
        currentBlock.timestamp + (proposal.endBlock - currentBlock.number) * averageBlockTime,
    };
  }
  const expirationTimestamp =
    startTimestamp + (proposal.endBlock - proposal.startBlock) * averageBlockTime;
  return { ...proposal, startTimestamp, creationTimestamp, expirationTimestamp };
}

export const proposalHasCrossChainBridge = (proposal: CustomProposalType) => {
  const delayedBridgeExecutors = [
    governanceConfig.addresses.AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_ARBITRUM,
    governanceConfig.addresses.AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_OPTIMISM,
    governanceConfig.addresses.AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_POLYGON,
    governanceConfig.addresses.AAVE_GOVERNANCE_V2_CROSSCHAIN_FORWARDER_METIS,
  ];
  const lowercaseExecutors = delayedBridgeExecutors.map((str) => str.toLowerCase());
  let proposalCrosschainBridge = false;

  if (proposal && proposal.targets && proposal.targets.length > 0) {
    const hasDelayedExecutor = proposal.targets.filter((address) =>
      lowercaseExecutors.includes(address.toLowerCase())
    );
    if (hasDelayedExecutor.length > 0) {
      proposalCrosschainBridge = true;
    }
  }

  return proposalCrosschainBridge;
};

export const shouldDisplayL2Badge = (
  proposal: CustomProposalType,
  executorChain: string,
  executedL2: boolean,
  pendingL2Execution: boolean
) => {
  return (
    !!proposal &&
    executorChain === 'L2' &&
    proposal.state !== 'Failed' &&
    proposal.state !== 'Canceled' &&
    proposal.state !== 'Pending' &&
    proposal.state !== 'Active' &&
    (executedL2 || pendingL2Execution)
  );
};

export const hasExecutedL2 = (proposal: CustomProposalType) => {
  const twoDayDelay = 172800; // 2 days 4 hours (small buffer)

  return proposal.executionTime === 0
    ? false
    : Math.floor(Date.now() / 1000) > proposal.executionTime + twoDayDelay;
};
