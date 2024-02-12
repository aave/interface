import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import { Proposal } from 'src/hooks/governance/useProposals';

import { isDifferentialReached, isQuorumReached } from '../helpers';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export type ProposalVoteInfo = {
  forVotes: number;
  againstVotes: number;
  forPercent: number;
  againstPercent: number;
  quorum: string;
  quorumReached: boolean;
  currentDifferential: string;
  requiredDifferential: string;
  differentialReached: boolean;
};

export const getProposalVoteInfo = (proposal: Proposal): ProposalVoteInfo => {
  const votingConfig = proposal.votingConfig;
  const quorum = votingConfig.yesThreshold;
  const quorumReached = isQuorumReached(
    proposal.votes.forVotes,
    quorum,
    proposal.constants.precisionDivider
  );

  const forVotesBN = valueToBigNumber(proposal.votes.forVotes);
  const againstVotesBN = valueToBigNumber(proposal.votes.againstVotes);
  const currentDifferential = normalizeBN(forVotesBN.minus(againstVotesBN), 18).toString();

  const requiredDifferential = votingConfig.yesNoDifferential;
  const differentialReached = isDifferentialReached(
    proposal.votes.forVotes,
    proposal.votes.againstVotes,
    requiredDifferential,
    proposal.constants.precisionDivider
  );

  const allVotes = new BigNumber(proposal.votes.forVotes).plus(proposal.votes.againstVotes);
  const forPercent = allVotes.gt(0)
    ? new BigNumber(proposal.votes.forVotes).dividedBy(allVotes).toNumber()
    : 0;
  const forVotes = normalizeBN(proposal.votes.forVotes, 18).toNumber();

  const againstPercent = allVotes.gt(0)
    ? new BigNumber(proposal.votes.againstVotes).dividedBy(allVotes).toNumber()
    : 0;
  const againstVotes = normalizeBN(proposal.votes.againstVotes, 18).toNumber();

  // getProposalState(proposalData.proposalData, votingMachineData);

  return {
    forVotes,
    againstVotes,
    forPercent,
    againstPercent,
    quorum,
    quorumReached,
    currentDifferential,
    requiredDifferential,
    differentialReached,
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
