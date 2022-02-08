import { ProposalState } from '@aave/contract-helpers';

export const isProposalStateImmutable = (proposal: { state: ProposalState }) =>
  ![
    ProposalState.Active,
    ProposalState.Pending,
    ProposalState.Queued,
    ProposalState.Succeeded,
  ].includes(proposal.state);
