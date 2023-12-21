import {
  AccessLevel,
  ChainId,
  Constants,
  Proposal,
  ProposalData,
  ProposalState,
  ProposalV3State,
  VotingMachineProposal,
} from '@aave/contract-helpers';
import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { SubgraphProposal } from 'src/hooks/governance/useProposals';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { isDifferentialReached, isQuorumReached } from '../helpers';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

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
  const currentBlock = await provider.getBlock('latest');

  if (currentBlock.number < proposal.startBlock) {
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

export type FormattedProposalV3 = {
  id: string;
  title: string;
  shortDescription: string;
  proposalState: ProposalV3State;
  accessLevel: AccessLevel;
  forVotes: number;
  againstVotes: number;
  forPercent: number;
  againstPercent: number;
  quorum: string;
  quorumReached: boolean;
  currentDifferential: string;
  requiredDifferential: string;
  differentialReached: boolean;
  votingChainId: number;
};

export const formatProposalV3 = (
  proposal: SubgraphProposal,
  proposalData: ProposalData,
  constants: Constants,
  votingMachineData: VotingMachineProposal
): FormattedProposalV3 => {
  const quorum = constants.votingConfigs[proposalData.proposalData.accessLevel].config.quorum;
  const quorumReached = isQuorumReached(
    proposalData.proposalData.forVotes,
    quorum,
    constants.precisionDivider
  );

  const forVotesBN = valueToBigNumber(proposalData.proposalData.forVotes);
  const againstVotesBN = valueToBigNumber(proposalData.proposalData.againstVotes);
  const currentDifferential = normalizeBN(forVotesBN.minus(againstVotesBN), 18).toString();

  const requiredDifferential =
    constants.votingConfigs[proposalData.proposalData.accessLevel].config.differential;

  const differentialReached = isDifferentialReached(
    proposalData.proposalData.forVotes,
    proposalData.proposalData.againstVotes,
    requiredDifferential,
    constants.precisionDivider
  );

  const allVotes = new BigNumber(votingMachineData.proposalData.forVotes).plus(
    votingMachineData.proposalData.againstVotes
  );
  const forPercent = allVotes.gt(0)
    ? new BigNumber(votingMachineData.proposalData.forVotes).dividedBy(allVotes).toNumber()
    : 0;
  const forVotes = normalizeBN(votingMachineData.proposalData.forVotes, 18).toNumber();

  const againstPercent = allVotes.gt(0)
    ? new BigNumber(votingMachineData.proposalData.againstVotes).dividedBy(allVotes).toNumber()
    : 0;
  const againstVotes = normalizeBN(votingMachineData.proposalData.againstVotes, 18).toNumber();

  // getProposalState(proposalData.proposalData, votingMachineData);

  return {
    id: proposalData.id,
    title: proposal.title,
    shortDescription: proposal.shortDescription,
    proposalState: proposalData.proposalData.state,
    forVotes,
    againstVotes,
    forPercent,
    againstPercent,
    quorum,
    quorumReached,
    currentDifferential,
    requiredDifferential,
    differentialReached,
    accessLevel: proposalData.proposalData.accessLevel,
    votingChainId: proposalData.votingChainId,
  };
};

export enum ProposalUIState {
  PROPOSAL_CREATED,
  VOTING_STARTED,
  VOTING_FINISHED,
  PAYLOADS_EXECUTED,
}

// const getProposalState = (proposal: ProposalV3, votingMachineData: VotingMachineProposal) => {
//   if (proposal.state === ProposalV3State.Created) {
//     // voting start on ...
//   }
//   if (proposal.state === ProposalV3State.Active) {
//     // voting ends on ...
//   }
//   if (proposal.state === ProposalV3State.Queued) {
//     // can be executed on ...
//   }
//   if (proposal.state === ProposalV3State.Executed) {
//     // executed on ...
//   }
//   if (proposal.state === ProposalV3State.Cancelled) {
//     // canceled on ...
//   }
//   if (proposal.state === ProposalV3State.Failed) {
//     // failed on ...
//   }
//   if (proposal.state === ProposalV3State.Expired) {
//     // expired on ...
//   }
// };
