import { ProposalState } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import {
  Box,
  LinearProgress,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { GovernancePageProps } from 'pages/governance/index.governance';
import { useState } from 'react';
import { usePolling } from 'src/hooks/usePolling';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { ProposalListItem } from './ProposalListItem';
import { enhanceProposalWithTimes } from './utils/formatProposal';

export function ProposalsList({ proposals: initialProposals }: GovernancePageProps) {
  // will only initially be set to true, till the client is hydrated with new proposals
  const [loadingNewProposals, setLoadingNewProposals] = useState(true);
  const [updatingPendingProposals, setUpdatingPendingProposals] = useState(true);
  const [proposals, setProposals] = useState(initialProposals);
  const [proposalFilter, setProposalFilter] = useState<string>('all');

  const handleChange = (event: SelectChangeEvent) => {
    setProposalFilter(event.target.value as string);
  };

  async function fetchNewProposals() {
    try {
      const count = await governanceContract.getProposalsCount();
      const nextProposals: GovernancePageProps['proposals'] = [];
      console.log(`fetching ${count - proposals.length} new proposals`);
      if (count - proposals.length) {
        for (let i = proposals.length; i < count; i++) {
          const { values, ...rest } = await governanceContract.getProposal({ proposalId: i });
          const proposal = await enhanceProposalWithTimes(rest);
          nextProposals.push({
            ipfs: {
              id: i,
              originalHash: proposal.ipfsHash,
              ...(await getProposalMetadata(proposal.ipfsHash, governanceConfig.ipfsGateway)),
            },
            proposal: proposal,
            prerendered: false,
          });
        }
        setProposals((p) => [...p, ...nextProposals]);
      }
      setLoadingNewProposals(false);
    } catch (e) {
      console.log('error fetching new proposals', e);
    }
  }

  async function updatePendingProposals() {
    const pendingProposals = proposals.filter(
      ({ proposal }) => !isProposalStateImmutable(proposal)
    );
    console.log('update pending proposals', pendingProposals.length);

    try {
      if (pendingProposals.length) {
        const updatedProposals = await Promise.all(
          pendingProposals.map(async ({ proposal }) => {
            const { values, ...rest } = await governanceContract.getProposal({
              proposalId: proposal.id,
            });
            return enhanceProposalWithTimes(rest);
          })
        );
        setProposals((proposals) => {
          updatedProposals.map((proposal) => {
            proposals[proposal.id].proposal = proposal;
            proposals[proposal.id].prerendered = false;
          });
          return proposals;
        });
      }
      setUpdatingPendingProposals(false);
    } catch (e) {
      console.log('error updating proposals', e);
    }
  }

  usePolling(fetchNewProposals, 60000, false, [proposals.length]);
  usePolling(updatePendingProposals, 15000, false, [proposals.length]);
  return (
    <div>
      <Box
        sx={{
          px: 6,
          py: 8,
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h3" sx={{ flexGrow: 1 }}>
          <Trans>Proposals</Trans>
        </Typography>
        <Typography sx={{ mx: 4 }}>
          <Trans>Filter</Trans>
        </Typography>
        <Select id="filter" value={proposalFilter} sx={{ minWidth: 140 }} onChange={handleChange}>
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
      {(loadingNewProposals || updatingPendingProposals) && <LinearProgress />}
      {proposals
        .slice()
        .reverse()
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
