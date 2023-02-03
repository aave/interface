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
import { useMemo, useState } from 'react';
import { usePolling } from 'src/hooks/usePolling';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { MarketAssetSearchInput } from '../markets/MarketAssetSearchInput';
import { ProposalListItem } from './ProposalListItem';
import { enhanceProposalWithTimes } from './utils/formatProposal';

export function ProposalsList({ proposals: initialProposals }: GovernancePageProps) {
  // will only initially be set to true, till the client is hydrated with new proposals
  const [loadingNewProposals, setLoadingNewProposals] = useState(true);
  const [updatingPendingProposals, setUpdatingPendingProposals] = useState(true);
  const [proposals, setProposals] = useState(initialProposals);
  const [proposalFilter, setProposalFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('Add');

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
          const proposalMetadata = await getProposalMetadata(
            proposal.ipfsHash,
            governanceConfig.ipfsGateway
          );
          nextProposals.unshift({
            ipfs: {
              id: i,
              originalHash: proposal.ipfsHash,
              ...proposalMetadata,
            },
            proposal: proposal,
            prerendered: false,
          });
        }
        setProposals((p) => [...nextProposals, ...p]);
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
            proposals[proposals.length - 1 - proposal.id].proposal = proposal;
            proposals[proposals.length - 1 - proposal.id].prerendered = false;
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
  usePolling(updatePendingProposals, 30000, false, [proposals.length]);

  const filteredProposals = useMemo(
    () =>
      proposals.filter(
        (proposal) =>
          (proposalFilter === 'all' || proposal.proposal.state === proposalFilter) &&
          (proposal.ipfs.shortDescription.includes(searchQuery) ||
            proposal.ipfs.title.includes(searchQuery))
      ),
    [proposals, proposalFilter, searchQuery]
  );

  console.log('rendering');

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
        <MarketAssetSearchInput onSearchTermChange={(value) => setSearchQuery(value)} />
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
      {filteredProposals.map(({ proposal, prerendered, ipfs }) => (
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
