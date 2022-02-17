import { normalize } from '@aave/math-utils';
import { DownloadIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Twitter } from '@mui/icons-material';
import { Box, Button, Grid, Paper, styled, SvgIcon, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Meta } from 'src/components/Meta';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { GovernanceDataProvider } from 'src/hooks/governance-data-provider/GovernanceDataProvider';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { VoteInfo } from 'src/modules/governance/proposal/VoteInfo';
import { StateBadge } from 'src/modules/governance/StateBadge';
import {
  enhanceProposalWithTimes,
  formatProposal,
} from 'src/modules/governance/utils/formatProposal';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { VoteBar } from 'src/modules/governance/VoteBar';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { Link } from 'src/components/primitives/Link';

import { ContentContainer } from '../../../src/components/ContentContainer';
import { GovVoteModal } from 'src/components/transactions/GovVote/GovVoteModal';

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
  const [url, setUrl] = useState('');
  const [proposal, setProposal] = useState(initialProposal);

  async function updateProposal() {
    const { values, ...rest } = await governanceContract.getProposal({ proposalId: proposal.id });
    setProposal(await enhanceProposalWithTimes(rest));
  }

  usePolling(updateProposal, 10000, isProposalStateImmutable(proposal), []);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);
  if (!governanceConfig) return <div>Governance not enabled</div>;

  const {
    yaeVotes,
    yaePercent,
    nayPercent,
    nayVotes,
    diffReached,
    quorumReached,
    requiredDiff,
    diff,
  } = formatProposal(proposal);
  return (
    <>
      <Meta title={ipfs.title} description={ipfs.shortDescription} />
      <ProposalTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ px: 6, py: 4, wordBreak: 'break-word' }}>
              <Typography variant="h3">
                <Trans>Proposal overview</Trans>
              </Typography>
              <Box sx={{ px: { md: 18 }, pt: 8 }}>
                <Typography variant="h2" sx={{ mb: 6 }}>
                  {ipfs.title}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                  <Button
                    component="a"
                    target="__BLANK"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      ipfs.title
                    )}&url=${url}`}
                    startIcon={<Twitter />}
                  >
                    Share on twitter
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
          <Grid item xs={12} md={4}>
            <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
              <VoteInfo {...proposal} />
            </Paper>
            <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
              <Typography variant="h3">
                <Trans>Voting results</Trans>
              </Typography>
              <VoteBar yae percent={yaePercent} votes={yaeVotes} sx={{ mt: 8 }} />
              <VoteBar percent={nayPercent} votes={nayVotes} sx={{ mt: 3 }} />
            </Paper>
            <Paper sx={{ px: 6, py: 4 }}>
              <Typography variant="h3" sx={{ mb: '22px' }}>
                <Trans>Proposal details</Trans>
              </Typography>
              <Row caption={<Trans>State</Trans>} sx={{ height: 48 }} captionVariant="description">
                <StateBadge state={proposal.state} />
              </Row>
              <CheckBadge
                text={<Trans>Quorum</Trans>}
                checked={quorumReached}
                sx={{ flexGrow: 1, justifyContent: 'space-between', height: 48 }}
                variant="description"
              />
              <CheckBadge
                text={<Trans>Differential</Trans>}
                checked={diffReached}
                sx={{ flexGrow: 1, justifyContent: 'space-between', height: 48 }}
                variant="description"
              />
              <Row
                caption={<Trans>Total voting power</Trans>}
                sx={{ height: 48 }}
                captionVariant="description"
              >
                <FormattedNumber
                  value={normalize(proposal.totalVotingSupply, 18)}
                  visibleDecimals={0}
                  compact={false}
                />
              </Row>
              <Row
                caption={<Trans>Vote differential needed</Trans>}
                sx={{ height: 48 }}
                captionVariant="description"
              >
                <FormattedNumber value={requiredDiff} visibleDecimals={2} percent />
              </Row>
              <Row
                caption={<Trans>Current differential</Trans>}
                sx={{ height: 48 }}
                captionVariant="description"
              >
                <FormattedNumber value={diff} visibleDecimals={2} percent />
              </Row>
              <Row
                caption={
                  <>
                    <Trans>Created</Trans>
                    <Typography variant="caption" color="text.muted">
                      Block
                    </Typography>
                  </>
                }
                sx={{ height: 48 }}
                captionVariant="description"
              >
                <Box sx={{ textAlign: 'right' }}>
                  <Typography>
                    ~ {dayjs.unix(proposal.creationTimestamp).format('DD MMM YYYY, hh:mm a')}
                  </Typography>
                  <Typography variant="caption" color="text.muted">
                    {proposal.proposalCreated}
                  </Typography>
                </Box>
              </Row>
              <Row
                caption={
                  <>
                    <Trans>Started</Trans>
                    <Typography variant="caption" color="text.muted">
                      Block
                    </Typography>
                  </>
                }
                sx={{ height: 48 }}
                captionVariant="description"
              >
                <Box sx={{ textAlign: 'right' }}>
                  <Typography>
                    ~ {dayjs.unix(proposal.startTimestamp).format('DD MMM YYYY, hh:mm a')}
                  </Typography>
                  <Typography variant="caption" color="text.muted">
                    {proposal.startBlock}
                  </Typography>
                </Box>
              </Row>
              {proposal.executed && (
                <Row
                  caption={<Trans>Executed</Trans>}
                  sx={{ height: 48 }}
                  captionVariant="description"
                >
                  <Typography>
                    {dayjs.unix(proposal.executionTime).format('DD MMM YYYY, hh:mm a')}
                  </Typography>
                </Row>
              )}
              {ipfs.author && (
                <Row
                  caption={<Trans>Author</Trans>}
                  sx={{ height: 48 }}
                  captionVariant="description"
                >
                  <Typography
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    {ipfs.author}
                  </Typography>
                </Row>
              )}
              {ipfs.discussions && (
                <Row
                  caption={<Trans>Discussion</Trans>}
                  sx={{ height: 48 }}
                  captionVariant="description"
                >
                  <Typography
                    component={Link}
                    target="_blank"
                    href={ipfs.discussions}
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                  >
                    {ipfs.discussions}
                  </Typography>
                </Row>
              )}
            </Paper>
          </Grid>
        </Grid>
      </ContentContainer>
      <GovVoteModal />
    </>
  );
}

ProposalPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      <GovernanceDataProvider>{page}</GovernanceDataProvider>
    </MainLayout>
  );
};
