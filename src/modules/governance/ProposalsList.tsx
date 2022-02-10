import { ProposalState } from '@aave/contract-helpers';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { GovernancePageProps } from 'pages/governance';
import { useState } from 'react';
import { usePolling } from 'src/hooks/usePolling';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { ProposalListItem } from './ProposalListItem';

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
          ...(await getProposalMetadata(proposal.ipfsHash, governanceConfig?.ipfsGateway)),
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
      <Box sx={{ px: 6, py: 8, display: 'flex' }}>
        <Typography variant="h3" sx={{ flexGrow: 1 }}>
          Proposals
        </Typography>
        <FormControl sx={{ width: 200 }}>
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
      </Box>
      {proposals
        .filter((proposal) => !proposalFilter || proposal.proposal.state === proposalFilter)
        .map(({ proposal, prerendered, ipfs }) => (
          <ProposalListItem
            key={proposal.id}
            proposal={proposal}
            ipfs={ipfs}
            prerendered={prerendered}
          />
        ))}
    </div>
  );
}
