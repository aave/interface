import { Box, Button, Container, Grid, Paper, styled, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';
import { Meta } from 'src/components/Meta';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { Trans } from '@lingui/macro';
import { StateBadge } from 'src/modules/governance/StateBadge';
import { VoteBar } from 'src/modules/governance/VoteBar';
import { formatProposal } from 'src/modules/governance/utils/formatProposal';
import { DownloadIcon } from '@heroicons/react/solid';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { VoteInfo } from 'src/modules/governance/proposal/VoteInfo';

export async function getStaticPaths() {
  if (!governanceConfig) return { paths: [] };
  const proposals = await governanceContract.getProposalsCount();
  const paths = [...Array(proposals).keys()].map((id) => ({
    params: { proposalId: id.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { proposalId: string } }) {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();

  const proposal = await ProposalFetcher.get(Number(params.proposalId));
  return {
    props: {
      proposal,
      ipfs: await IpfsFetcher.get(Number(params.proposalId)),
    },
  };
}

interface ProposalPageProps {
  ipfs: IpfsType;
  proposal: CustomProposalType;
}

const CenterAlignedImage = styled('img')({
  display: 'block',
  margin: '0 auto',
  maxWidth: '100%',
});

const StyledLink = styled('a')({
  color: 'inherit',
});

export default function ProposalPage({ proposal: initialProposal, ipfs }: ProposalPageProps) {
  const [proposal, setProposal] = useState(initialProposal);

  async function updateProposal() {
    const updatedProposal = await governanceContract.getProposal({ proposalId: proposal.id });
    setProposal(updatedProposal);
  }

  usePolling(updateProposal, 10000, isProposalStateImmutable(proposal), []);

  if (!governanceConfig) return <div>Governance not enabled</div>;

  const { yaeVotes, yaePercent, nayPercent, nayVotes } = formatProposal(proposal);
  return (
    <Container maxWidth="xl">
      <Meta title={ipfs.title} description={ipfs.shortDescription} />
      <ProposalTopPanel />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={9}>
          <Paper sx={{ px: 6, py: 4, wordBreak: 'break-word' }}>
            <Typography variant="h3">
              <Trans>Proposal overview</Trans>
            </Typography>
            <Box sx={{ px: { md: 18 }, pt: 8 }}>
              <Typography variant="h2" sx={{ mb: 8 }}>
                {ipfs.title}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box>
                  <StateBadge state={proposal.state} />
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  component="a"
                  target="__BLANK"
                  href={`${governanceConfig?.ipfsGateway}/${ipfs.ipfsHash}`}
                  startIcon={
                    <SvgIcon>
                      <DownloadIcon />
                    </SvgIcon>
                  }
                >
                  Raw-Ipfs
                </Button>
              </Box>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  img({ src, alt }) {
                    return <CenterAlignedImage src={src} alt={alt} />;
                  },
                  a({ node, ...rest }) {
                    return <StyledLink {...rest} />;
                  },
                  h2({ node, ...rest }) {
                    return (
                      <Typography variant="subheader1" sx={{ mt: 6 }} gutterBottom {...rest} />
                    );
                  },
                  p({ node, ...rest }) {
                    return <Typography variant="description" {...rest} />;
                  },
                }}
              >
                {ipfs.description}
              </ReactMarkdown>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
            <VoteInfo id={proposal.id} />
          </Paper>
          <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
            <Typography variant="h3">
              <Trans>Voting results</Trans>
              <VoteBar yae percent={yaePercent} votes={yaeVotes} />
              <VoteBar percent={nayPercent} votes={nayVotes} />
            </Typography>
          </Paper>
          <Paper sx={{ px: 6, py: 4 }}>
            <Typography variant="h3">
              <Trans>Proposal details</Trans>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

ProposalPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout headerTopLineHeight={229}>{page}</MainLayout>;
};
