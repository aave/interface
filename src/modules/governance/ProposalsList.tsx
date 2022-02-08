import { ProposalState } from '@aave/contract-helpers';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { GovernancePageProps } from 'pages/governance';
import { useState } from 'react';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { usePolling } from 'src/hooks/usePolling';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';

export function ProposalsList({ proposals: initialProposals }: GovernancePageProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [proposalFilter, setProposalFilter] = useState<string>('');

  const handleChange = (event: SelectChangeEvent) => {
    setProposalFilter(event.target.value as string);
  };

  async function fetchNewProposals() {
    const count = await governanceContract.getProposalsCount();
    const nextProposals: GovernancePageProps['proposals'] = [];
    console.log(`fetching ${count - proposals.length} new proposals`);
    for (let i = proposals.length; i < count; i++) {
      const proposal = await governanceContract.getProposal({ proposalId: i });
      nextProposals.push({
        ipfs: {
          id: i,
          originalHash: proposal.ipfsHash,
          ...(await getProposalMetadata(proposal.ipfsHash, process.env.NEXT_PUBLIC_IPFS_GATEWAY)),
        },
        proposal: proposal,
        prerendered: false,
      });
    }
    setProposals((p) => [...nextProposals.reverse(), ...p]);
  }

  async function updatePendingProposals() {
    const pendingProposals = proposals.filter(
      ({ proposal }) => !isProposalStateImmutable(proposal)
    );

    if (pendingProposals.length) {
      const copy = [...proposals];
      for (const { proposal } of pendingProposals) {
        copy[proposal.id].proposal = await governanceContract.getProposal({
          proposalId: proposal.id,
        });
      }
      setProposals(copy);
    }
  }

  usePolling(fetchNewProposals, 30000, false, []);
  usePolling(updatePendingProposals, 10000, false, []);
  return (
    <div>
      <Typography>Proposal</Typography>
      <FormControl fullWidth>
        <InputLabel id="filter-label">Filter</InputLabel>
        <Select
          labelId="filter-label"
          id="filter"
          value={proposalFilter}
          label="Filter"
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {Object.keys(ProposalState).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {proposals
        .filter((proposal) => !proposalFilter || proposal.proposal.state === proposalFilter)
        .map(({ proposal, prerendered, ipfs }) => (
          <div key={proposal.id}>
            <Link
              href={
                prerendered
                  ? ROUTES.prerenderedProposal(proposal.id)
                  : ROUTES.dynamicRenderedProposal(proposal.id)
              }
            >
              {ipfs.title}
            </Link>
          </div>
        ))}
    </div>
  );
}
