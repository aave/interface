import {
  Payload,
  PayloadState,
  ProposalV3State,
  VotingMachineProposal,
  VotingMachineProposalState,
} from '@aave/contract-helpers';
import { normalizeBN, valueToBigNumber } from '@aave/math-utils';
import BigNumber from 'bignumber.js';
import {
  EnhancedSubgraphProposal,
  Proposal,
  SubgraphProposal,
} from 'src/hooks/governance/useProposals';
import { EnhancedPayload } from 'src/services/GovernanceV3Service';
import invariant from 'tiny-invariant';

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
  isPassing: boolean;
};

export const getProposalVoteInfo = (proposal: EnhancedSubgraphProposal): ProposalVoteInfo => {
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
    isPassing: quorumReached && differentialReached,
  };
};

export const getProposalStateTimestamp = (state: ProposalV3State, proposal: Proposal): number => {
  switch (state) {
    case ProposalV3State.Null:
      invariant(false, 'Timestamp of a null proposal can not be accessed');
    case ProposalV3State.Created:
      return Number(proposal.subgraphProposal.transactions.created.timestamp);
    case ProposalV3State.Active:
      if (proposal.subgraphProposal.transactions.active) {
        return Number(proposal.subgraphProposal.transactions.active.timestamp);
      }
      return (
        Number(proposal.subgraphProposal.transactions.created.timestamp) +
        Number(proposal.subgraphProposal.votingConfig.cooldownBeforeVotingStart)
      );
    case ProposalV3State.Queued:
      if (proposal.subgraphProposal.transactions.queued) {
        return Number(proposal.subgraphProposal.transactions.queued.timestamp);
      }
      // special case in case the proposal vote is already finished on voting chain but the result has not been sent to core.
      if (proposal.subgraphProposal.transactions.active) {
        // case that voting finished and result was sent to core but core has not processed it yet.
        if (proposal.votingMachineData.proposalData.votingClosedAndSentTimestamp) {
          return proposal.votingMachineData.proposalData.votingClosedAndSentTimestamp;
        }
        // case that voting is on going or finished and result was not sent to core yet.
        if (proposal.votingMachineData.proposalData.endTime) {
          return proposal.votingMachineData.proposalData.endTime;
        }
        // case that proposal is active but has not been sent to the voting machine. Special case since proposal.votingDuration gets asigned and locked when proposal is moved to Active.
        return (
          Number(proposal.subgraphProposal.transactions.active.timestamp) +
          Number(proposal.subgraphProposal.votingDuration)
        );
      }
      // we know that the proposal is not going to be active but using the recursive function for consistency.
      return (
        getProposalStateTimestamp(ProposalV3State.Active, proposal) +
        Number(proposal.subgraphProposal.votingConfig.votingDuration)
      );
    case ProposalV3State.Executed:
      if (proposal.subgraphProposal.transactions.executed) {
        return Number(proposal.subgraphProposal.transactions.executed.timestamp);
      }
      return (
        getProposalStateTimestamp(ProposalV3State.Queued, proposal) +
        Number(proposal.subgraphProposal.constants.cooldownPeriod)
      );
    case ProposalV3State.Failed:
      if (proposal.subgraphProposal.transactions.failed) {
        return Number(proposal.subgraphProposal.transactions.failed.timestamp);
      }
      return getProposalStateTimestamp(ProposalV3State.Queued, proposal);
    case ProposalV3State.Cancelled:
      if (!proposal.subgraphProposal.transactions.canceled) {
        // since proposal can be cancelled in almost any state this is only useful in the case we know its canceled since we can't infer the timestamp.
        invariant(
          false,
          'Timestamp of a cancelled proposal can only be accessed if the proposal has been cancelled'
        );
      }
      return Number(proposal.subgraphProposal.transactions.canceled.timestamp);
    case ProposalV3State.Expired:
      return Number(proposal.subgraphProposal.constants.expirationTime);
    default:
      invariant(false, 'Unknown proposal state');
  }
};

export const getPayloadStateTimestamp = (
  payloadState: PayloadState,
  payload: EnhancedPayload,
  proposal: Proposal
): number => {
  switch (payloadState) {
    case PayloadState.None:
      invariant(false, 'Timestamp of a null payload can not be accessed');
    case PayloadState.Created:
      return Number(payload.createdAt);
    case PayloadState.Queued:
      if (payload.queuedAt !== 0) {
        return Number(payload.queuedAt);
      }
      return getProposalStateTimestamp(ProposalV3State.Executed, proposal);
    case PayloadState.Executed:
      if (payload.executedAt) {
        return Number(payload.executedAt);
      }
      return (
        getPayloadStateTimestamp(PayloadState.Queued, payload, proposal) + Number(payload.delay)
      );
    case PayloadState.Cancelled:
      if (payload.cancelledAt) {
        return Number(payload.cancelledAt);
      }
      invariant(
        false,
        'Timestamp of a cancelled payload can only be accessed if the payload has been cancelled'
      );
    case PayloadState.Expired:
      return Number(payload.expirationTime);
    default:
      invariant(false, 'Unknown payload state');
  }
};

export const getVotingMachineProposalStateTimestamp = (
  votingState: VotingMachineProposalState,
  proposal: Proposal
): number => {
  switch (votingState) {
    case VotingMachineProposalState.NotCreated:
      invariant(false, 'Timestamp of a not created voting machine state can not be accessed');
    case VotingMachineProposalState.Active:
      if (proposal.votingMachineData.proposalData.startTime !== 0) {
        return proposal.votingMachineData.proposalData.startTime;
      }
      return getProposalStateTimestamp(ProposalV3State.Active, proposal);
    case VotingMachineProposalState.Finished:
      if (proposal.votingMachineData.proposalData.endTime !== 0) {
        return proposal.votingMachineData.proposalData.endTime;
      }
      return (
        getVotingMachineProposalStateTimestamp(VotingMachineProposalState.Active, proposal) +
        (Number(proposal.subgraphProposal.votingDuration) ||
          Number(proposal.subgraphProposal.votingConfig.votingDuration))
      );
    case VotingMachineProposalState.SentToGovernance:
      if (proposal.votingMachineData.proposalData.votingClosedAndSentTimestamp !== 0) {
        return proposal.votingMachineData.proposalData.votingClosedAndSentTimestamp;
      }
      return getVotingMachineProposalStateTimestamp(VotingMachineProposalState.Finished, proposal);
    default:
      invariant(false, 'Unknown voting machine state');
  }
};

export enum ProposalLifecycleStep {
  Null,
  Created,
  OpenForVoting,
  VotingClosed,
  Executed,
  Cancelled,
  Expired,
}

export const getLifecycleState = (
  proposal: SubgraphProposal,
  votingMachineData: VotingMachineProposal,
  payloads: Payload[]
) => {
  const allPayloadsExecuted = payloads.every((payload) => payload.state === PayloadState.Executed);
  if (proposal.state === ProposalV3State.Cancelled) {
    return ProposalLifecycleStep.Cancelled;
  }
  if (proposal.state === ProposalV3State.Expired) {
    return ProposalLifecycleStep.Expired;
  }
  if (
    proposal.state === ProposalV3State.Created ||
    (proposal.state === ProposalV3State.Active &&
      votingMachineData.state === VotingMachineProposalState.NotCreated)
  ) {
    return ProposalLifecycleStep.Created;
  }
  if (votingMachineData.state === VotingMachineProposalState.Active) {
    return ProposalLifecycleStep.OpenForVoting;
  }
  if (
    votingMachineData.state === VotingMachineProposalState.Finished ||
    (votingMachineData.state === VotingMachineProposalState.SentToGovernance &&
      !allPayloadsExecuted)
  ) {
    return ProposalLifecycleStep.VotingClosed;
  }
  if (allPayloadsExecuted) {
    return ProposalLifecycleStep.Executed;
  }
  invariant(false, 'Could not determine proposal lifecycle state');
};

export const getLifecycleStateTimestamp = (state: ProposalLifecycleStep, proposal: Proposal) => {
  switch (state) {
    case ProposalLifecycleStep.Created:
      return getProposalStateTimestamp(ProposalV3State.Created, proposal);
    case ProposalLifecycleStep.OpenForVoting:
      return getVotingMachineProposalStateTimestamp(VotingMachineProposalState.Active, proposal);
    case ProposalLifecycleStep.VotingClosed:
      return getVotingMachineProposalStateTimestamp(VotingMachineProposalState.Finished, proposal);
    case ProposalLifecycleStep.Executed:
      const maxPayloadExecutionTime = Math.max(
        ...proposal.payloadsData.map((payload) =>
          getPayloadStateTimestamp(PayloadState.Executed, payload, proposal)
        )
      );
      return maxPayloadExecutionTime;
    case ProposalLifecycleStep.Cancelled:
      return getProposalStateTimestamp(ProposalV3State.Cancelled, proposal);
    case ProposalLifecycleStep.Expired:
      return getProposalStateTimestamp(ProposalV3State.Expired, proposal);
    default:
      invariant(false, 'Unknown proposal lifecycle state');
  }
};
