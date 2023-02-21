import { Trans } from '@lingui/macro';
import { Grid, Paper, Typography } from '@mui/material';
import { GovDelegationModal } from 'src/components/transactions/GovDelegation/GovDelegationModal';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { AaveTokensBalanceProvider } from 'src/hooks/governance-data-provider/AaveTokensDataProvider';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { MainLayout } from 'src/layouts/MainLayout';
import { DelegatedInfoPanel } from 'src/modules/governance/DelegatedInfoPanel';
import { GovernanceTopPanel } from 'src/modules/governance/GovernanceTopPanel';
import { ProposalsList } from 'src/modules/governance/ProposalsList';
import { VotingPowerInfoPanel } from 'src/modules/governance/VotingPowerInfoPanel';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';
import { useRootStore } from 'src/store/root';

import { ContentContainer } from '../../src/components/ContentContainer';

export const getStaticProps = async () => {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();

  const proposals = [...Array(ProposalFetcher.count()).keys()].map((id) => {
    const ipfs = IpfsFetcher.get(id);
    const proposal = ProposalFetcher.get(id);
    return {
      ipfs: {
        title: ipfs.title,
        id: ipfs.id,
        originalHash: ipfs.originalHash,
        shortDescription: ipfs.shortDescription,
      },
      proposal,
      prerendered: true,
    };
  });

  return { props: { proposals: proposals.slice().reverse() } };
};

export type GovernancePageProps = {
  proposals: {
    ipfs: Pick<IpfsType, 'title' | 'id' | 'originalHash' | 'shortDescription'>;
    proposal: CustomProposalType;
    prerendered: boolean;
  }[];
};

export default function Governance(props: GovernancePageProps) {
  const account = useRootStore((store) => store.account);

  return (
    <>
      <GovernanceTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper>
              <ProposalsList {...props} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            {account ? (
              <>
                <Paper>
                  <VotingPowerInfoPanel />
                </Paper>
                <Paper>
                  <DelegatedInfoPanel />
                </Paper>
              </>
            ) : (
              <Paper sx={{ p: 6 }}>
                <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
                  <Trans>Your info</Trans>
                </Typography>
                <Typography sx={{ mb: 6 }} color="text.secondary">
                  <Trans>Please connect a wallet to view your personal information here.</Trans>
                </Typography>
                <ConnectWalletButton />
              </Paper>
            )}
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}

Governance.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <GovernanceDataProvider />
      <AaveTokensBalanceProvider>
        {page}
        <GovDelegationModal />
      </AaveTokensBalanceProvider>
    </MainLayout>
  );
};
