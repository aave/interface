import { ProposalState } from '@aave/contract-helpers';
import { ChevronDownIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SvgIcon,
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
import { enhanceProposalWithTimes } from './utils/formatProposal';

export function ProposalsList({ proposals: initialProposals }: GovernancePageProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [proposalFilter, setProposalFilter] = useState<string>('all');

  const handleChange = (event: SelectChangeEvent) => {
    setProposalFilter(event.target.value as string);
  };

  async function fetchNewProposals() {
    const count = await governanceContract.getProposalsCount();
    const nextProposals: GovernancePageProps['proposals'] = [];
    console.log(`fetching ${count - proposals.length} new proposals`);
    for (let i = proposals.length; i < count; i++) {
      const { values, ...rest } = await governanceContract.getProposal({ proposalId: i });
      const proposal = await enhanceProposalWithTimes(rest);
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
        const { values, ...rest } = await governanceContract.getProposal({
          proposalId: proposal.id,
        });
        copy[proposal.id].proposal = await enhanceProposalWithTimes(rest);
      }
      setProposals(copy);
    }
  }

  usePolling(fetchNewProposals, 30000, false, []);
  usePolling(updatePendingProposals, 10000, false, []);
  return (
    <div>
      <Box sx={{ px: 6, py: 8, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h3" sx={{ flexGrow: 1 }}>
          <Trans>Proposals</Trans>
        </Typography>
        <Typography sx={{ mx: 4 }}>
          <Trans>Filter</Trans>
        </Typography>
        <Select
          id="filter"
          value={proposalFilter}
          sx={{ minWidth: 140 }}
          onChange={handleChange}
          IconComponent={(props) => (
            <SvgIcon {...props}>
              <ChevronDownIcon />
            </SvgIcon>
          )}
        >
          <MenuItem value="all">
            <Trans>All proposals</Trans>
          </MenuItem>
          {Object.keys(ProposalState).map((key) => (
            <MenuItem key={key} value={key}>
              {key}
            </MenuItem>
          ))}
        </Select>
      </Box>
      {proposals
        .filter(
          (proposal) => proposalFilter === 'all' || proposal.proposal.state === proposalFilter
        )
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
