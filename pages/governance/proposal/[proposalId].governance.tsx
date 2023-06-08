// import { ProposalState } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { DownloadIcon, ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Twitter } from '@mui/icons-material';
import {
  Box,
  Button,
  Grid,
  Paper,
  Skeleton,
  styled,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Meta } from 'src/components/Meta';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { GovVoteModal } from 'src/components/transactions/GovVote/GovVoteModal';
import { usePolling } from 'src/hooks/usePolling';
import { MainLayout } from 'src/layouts/MainLayout';
import { FormattedProposalTime } from 'src/modules/governance/FormattedProposalTime';
import { ProposalTopPanel } from 'src/modules/governance/proposal/ProposalTopPanel';
import { VoteInfo } from 'src/modules/governance/proposal/VoteInfo';
import { VotersListContainer } from 'src/modules/governance/proposal/VotersListContainer';
import { StateBadge } from 'src/modules/governance/StateBadge';
import {
  enhanceProposalWithTimes,
  formatProposal,
  hasExecutedL2,
  proposalHasCrossChainBridge,
  shouldDisplayL2Badge,
} from 'src/modules/governance/utils/formatProposal';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { VoteBar } from 'src/modules/governance/VoteBar';
import { Ipfs, IpfsType } from 'src/static-build/ipfs';
import { CustomProposalType, Proposal } from 'src/static-build/proposal';
import { governanceConfig } from 'src/ui-config/governanceConfig';

import { ContentContainer } from '../../../src/components/ContentContainer';
import { LensIcon } from '../../../src/components/icons/LensIcon';

export async function getStaticPaths() {
  const ProposalFetcher = new Proposal();
  const paths = [...Array(ProposalFetcher.count()).keys()].map((id) => ({
    params: { proposalId: id.toString() },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { proposalId: string } }) {
  const IpfsFetcher = new Ipfs();
  const ProposalFetcher = new Proposal();
  // const VoteFetcher = new Vote();

  const proposal = ProposalFetcher.get(Number(params.proposalId));
  return {
    props: {
      proposal,
      ipfs: IpfsFetcher.get(Number(params.proposalId)),
      prerendered: true,
      // votes: await VoteFetcher.get(
      //   Number(params.proposalId),
      //   proposal.startBlock,
      //   proposal.endBlock
      // ),
    },
  };
}

interface ProposalPageProps {
  ipfs?: IpfsType;
  proposal?: CustomProposalType;
  prerendered?: boolean;
  metadataError?: boolean;
}

const CenterAlignedImage = styled('img')({
  display: 'block',
  margin: '0 auto',
  maxWidth: '100%',
});

const formatTime = (timestamp: number): string =>
  dayjs.unix(timestamp).format('D MMM YYYY, HH:mm UTC Z');

const StyledLink = styled('a')({
  color: 'inherit',
});

export default function ProposalPage({
  proposal: initialProposal,
  ipfs,
  prerendered,
  metadataError = false,
}: ProposalPageProps) {
  const [url, setUrl] = useState('');
  const [proposal, setProposal] = useState(initialProposal);
  const [loading, setLoading] = useState(!proposal || !isProposalStateImmutable(proposal));
  const { breakpoints, palette } = useTheme();
  const lgUp = useMediaQuery(breakpoints.up('lg'));
  const mightBeStale = !proposal || !isProposalStateImmutable(proposal);

  const executedL2 = proposal ? hasExecutedL2(proposal) : false;
  const proposalCrosschainBridge = proposal ? proposalHasCrossChainBridge(proposal) : false;
  const executorChain = proposalCrosschainBridge ? 'L2' : 'L1';
  const pendingL2Execution = proposalCrosschainBridge && !executedL2;
  const displayL2StateBadge = proposal
    ? shouldDisplayL2Badge(proposal, executorChain, executedL2, pendingL2Execution)
    : false;

  async function updateProposal() {
    if (!proposal) return;
    const { values, ...rest } = await governanceContract.getProposal({ proposalId: proposal.id });
    setProposal(await enhanceProposalWithTimes(rest));
    setLoading(false);
  }

  usePolling(updateProposal, loading ? 5000 : 30000, !mightBeStale, []);

  // seed when no ssg
  useEffect(() => {
    if (!proposal && initialProposal) setProposal(initialProposal);
    setLoading(false);
  }, [initialProposal]);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const {
    yaeVotes,
    yaePercent,
    nayPercent,
    nayVotes,
    diffReached,
    quorumReached,
    requiredDiff,
    minQuorumVotes,
    diff,
  } = proposal
    ? formatProposal(proposal)
    : {
        yaeVotes: 0,
        yaePercent: 0,
        nayPercent: 0,
        nayVotes: 0,
        diffReached: false,
        quorumReached: false,
        minQuorumVotes: 0,
        requiredDiff: 0,
        diff: 0,
      };

  const proposalHasExpired: boolean = proposal
    ? dayjs() > dayjs.unix(proposal.expirationTimestamp)
    : false;

  return (
    <>
      {ipfs && (
        <Meta
          imageUrl="https://app.aave.com/aaveMetaLogo-min.jpg"
          title={ipfs.title}
          description={ipfs.shortDescription}
        />
      )}
      <ProposalTopPanel />

      <ContentContainer>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ px: 6, pt: 4, pb: 12 }} data-cy="vote-info-body">
              <Box display={'flex'} justifyContent="space-between">
                <Box>
                  <Typography variant="h3">
                    <Trans>Proposal overview</Trans>
                  </Typography>
                </Box>

                {ipfs && (
                  <Box>
                    <Button
                      component="a"
                      sx={{ minWidth: lgUp ? '160px' : '' }}
                      target="_blank"
                      rel="noopener"
                      href={`${governanceConfig.ipfsGateway}/${ipfs.ipfsHash}`}
                      startIcon={
                        <SvgIcon sx={{ '& path': { strokeWidth: '1' } }}>
                          <DownloadIcon />
                        </SvgIcon>
                      }
                    >
                      {lgUp && <Trans>Raw-Ipfs</Trans>}
                    </Button>
                    <Button
                      component="a"
                      sx={{ minWidth: lgUp ? '160px' : '' }}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        ipfs.title
                      )}&url=${url}`}
                      startIcon={<Twitter />}
                    >
                      {lgUp && <Trans>Share on twitter</Trans>}
                    </Button>
                    <Button
                      sx={{ minWidth: lgUp ? '160px' : '' }}
                      component="a"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`https://lenster.xyz/?url=${url}&text=Check out this proposal on aave governance 👻👻 - ${ipfs.title}&hashtags=Aave&preview=true`}
                      startIcon={
                        <LensIcon
                          color={
                            palette.mode === 'dark' ? palette.primary.light : palette.text.primary
                          }
                        />
                      }
                    >
                      {lgUp && <Trans>Share on Lens</Trans>}
                    </Button>
                  </Box>
                )}
              </Box>

              {metadataError ? (
                <Box sx={{ px: { md: 18 }, pt: 8 }}>
                  <Warning severity="error">
                    <Trans>An error has occurred fetching the proposal metadata from IPFS.</Trans>
                  </Warning>
                </Box>
              ) : (
                <Box sx={{ px: { md: 18 }, pt: 8, wordBreak: 'break-word' }}>
                  <Typography variant="h2" sx={{ mb: 6 }}>
                    {ipfs?.title || <Skeleton />}
                  </Typography>
                  {proposal && ipfs ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box display="flex" sx={{ mr: '24px', mb: { xs: 2, md: 2, lg: 0 } }}>
                          <Box display="flex" alignItems={'center'}>
                            <StateBadge
                              crossChainBridge={'L1'}
                              sx={{ mr: 2 }}
                              state={proposal.state}
                              loading={loading}
                            />
                            {!loading && (
                              <FormattedProposalTime
                                state={proposal.state}
                                executionTime={proposal.executionTime}
                                startTimestamp={proposal.startTimestamp}
                                executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                                expirationTimestamp={proposal.expirationTimestamp}
                                l2Execution={false}
                              />
                            )}
                          </Box>
                        </Box>

                        {displayL2StateBadge && (
                          <Box mt={2} display={'flex'}>
                            <StateBadge
                              sx={{ marginRight: 2 }}
                              crossChainBridge={executorChain}
                              state={proposal.state}
                              loading={mightBeStale}
                              pendingL2Execution={pendingL2Execution}
                            />
                            <FormattedProposalTime
                              state={proposal.state}
                              startTimestamp={proposal.startTimestamp}
                              executionTime={proposal.executionTime}
                              expirationTimestamp={proposal.expirationTimestamp}
                              executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                              l2Execution={displayL2StateBadge}
                            />
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ flexGrow: 1 }} />
                    </Box>
                  ) : (
                    <Typography variant="buttonL">
                      <Skeleton />
                    </Typography>
                  )}
                  {ipfs ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table({ node, ...props }) {
                          return (
                            <TableContainer component={Paper} variant="outlined">
                              <Table {...props} sx={{ wordBreak: 'normal' }} />
                            </TableContainer>
                          );
                        },
                        tr({ node, ...props }) {
                          return (
                            <TableRow
                              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              {...props}
                            />
                          );
                        },
                        td({ children, style }) {
                          return <TableCell style={style}>{children}</TableCell>;
                        },
                        th({ children, style }) {
                          return <TableCell style={style}>{children}</TableCell>;
                        },
                        tbody({ children }) {
                          return <TableBody>{children}</TableBody>;
                        },
                        thead({ node, ...props }) {
                          return <TableHead {...props} />;
                        },
                        img({ src: _src, alt }) {
                          if (!_src) return null;
                          const src = /^\.\.\//.test(_src)
                            ? _src.replace(
                                '../',
                                'https://raw.githubusercontent.com/aave/aip/main/content/'
                              )
                            : _src;
                          return <CenterAlignedImage src={src} alt={alt} />;
                        },
                        a({ node, ...rest }) {
                          return <StyledLink {...rest} />;
                        },
                        h2({ node, ...rest }) {
                          return (
                            <Typography
                              variant="subheader1"
                              sx={{ mt: 6 }}
                              gutterBottom
                              {...rest}
                            />
                          );
                        },
                        p({ node, ...rest }) {
                          return <Typography variant="description" {...rest} />;
                        },
                      }}
                    >
                      {ipfs.description}
                    </ReactMarkdown>
                  ) : (
                    <>
                      <Skeleton variant="text" sx={{ my: 4 }} />
                      <Skeleton variant="rectangular" height={200} sx={{ my: 4 }} />
                      <Skeleton variant="text" sx={{ my: 4 }} />
                      <Skeleton variant="rectangular" height={400} sx={{ my: 4 }} />
                    </>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>{proposal && <VoteInfo {...proposal} />}</Paper>
            <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
              <Typography variant="h3">
                <Trans>Voting results</Trans>
              </Typography>
              {proposal ? (
                <>
                  <VoteBar
                    yae
                    percent={yaePercent}
                    votes={yaeVotes}
                    sx={{ mt: 8 }}
                    loading={loading}
                  />
                  <VoteBar percent={nayPercent} votes={nayVotes} sx={{ mt: 3 }} loading={loading} />
                  <VotersListContainer proposal={proposal} />
                  <Row
                    caption={
                      <>
                        <Box>
                          <Trans>State</Trans>
                        </Box>
                        <Box>
                          <FormattedProposalTime
                            state={proposal.state}
                            startTimestamp={proposal.startTimestamp}
                            executionTime={proposal.executionTime}
                            expirationTimestamp={proposal.expirationTimestamp}
                            executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                            l2Execution={false}
                          />
                        </Box>
                        {displayL2StateBadge ? (
                          <Box
                            display="flex"
                            justifyContent={'space-between'}
                            alignItems="flex-start"
                          >
                            <FormattedProposalTime
                              state={proposal.state}
                              startTimestamp={proposal.startTimestamp}
                              executionTime={proposal.executionTime}
                              expirationTimestamp={proposal.expirationTimestamp}
                              executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                              l2Execution={displayL2StateBadge}
                            />
                            <StateBadge
                              sx={{ marginRight: 2 }}
                              crossChainBridge={executorChain}
                              state={proposal.state}
                              loading={mightBeStale}
                              pendingL2Execution={pendingL2Execution}
                            />
                          </Box>
                        ) : null}
                      </>
                    }
                    sx={{
                      // height: displayL2StateBadge ? 96 : 48,
                      alignItems: 'flex-start',
                    }}
                    captionVariant="description"
                  >
                    <Box />
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                      }}
                    >
                      <StateBadge
                        state={proposal.state}
                        crossChainBridge={'L1'}
                        loading={loading}
                      />
                    </Box>
                  </Row>

                  {/* {displayL2StateBadge ? (
                    <Row
                      caption={
                        <Trans>
                          {' '}
                          <FormattedProposalTime
                            state={proposal.state}
                            startTimestamp={proposal.startTimestamp}
                            executionTime={proposal.executionTime}
                            expirationTimestamp={proposal.expirationTimestamp}
                            executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                            l2Execution={displayL2StateBadge}
                          />
                        </Trans>
                      }
                      sx={{ height: 48 }}
                      captionVariant="description"
                    >
                      <StateBadge
                        sx={{ marginRight: 2 }}
                        crossChainBridge={executorChain}
                        state={proposal.state}
                        loading={mightBeStale}
                        pendingL2Execution={pendingL2Execution}
                      />
                    </Row>
                  ) : null} */}

                  <Row
                    caption={<Trans>Quorum</Trans>}
                    sx={{ height: 48 }}
                    captionVariant="description"
                  >
                    <CheckBadge
                      loading={loading}
                      text={quorumReached ? <Trans>Reached</Trans> : <Trans>Not reached</Trans>}
                      checked={quorumReached}
                      sx={{ height: 48 }}
                      variant="description"
                    />
                  </Row>
                  <Row
                    caption={
                      <>
                        <Trans>Current votes</Trans>
                        <Typography variant="caption" color="text.muted">
                          Required
                        </Typography>
                      </>
                    }
                    sx={{ height: 48 }}
                    captionVariant="description"
                  >
                    <Box sx={{ textAlign: 'right' }}>
                      <FormattedNumber
                        value={yaeVotes}
                        visibleDecimals={2}
                        roundDown
                        sx={{ display: 'block' }}
                      />
                      <FormattedNumber
                        variant="caption"
                        value={minQuorumVotes}
                        visibleDecimals={2}
                        roundDown
                        color="text.muted"
                      />
                    </Box>
                  </Row>
                  <Row
                    caption={<Trans>Differential</Trans>}
                    sx={{ height: 48 }}
                    captionVariant="description"
                  >
                    <CheckBadge
                      loading={loading}
                      text={diffReached ? <Trans>Reached</Trans> : <Trans>Not reached</Trans>}
                      checked={diffReached}
                      sx={{ height: 48 }}
                      variant="description"
                    />
                  </Row>
                  <Row
                    caption={
                      <>
                        <Trans>Current differential</Trans>
                        <Typography variant="caption" color="text.muted">
                          Required
                        </Typography>
                      </>
                    }
                    sx={{ height: 48 }}
                    captionVariant="description"
                  >
                    <Box sx={{ textAlign: 'right' }}>
                      <FormattedNumber
                        value={diff}
                        visibleDecimals={2}
                        roundDown
                        sx={{ display: 'block' }}
                      />
                      <FormattedNumber
                        variant="caption"
                        value={requiredDiff}
                        visibleDecimals={2}
                        roundDown
                        color="text.muted"
                      />
                    </Box>
                  </Row>
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
                </>
              ) : (
                <>
                  <Skeleton height={28} sx={{ mt: 8 }} />
                  <Skeleton height={28} sx={{ mt: 8 }} />
                </>
              )}
            </Paper>
            <Paper sx={{ px: 6, py: 4 }}>
              <Typography variant="h3" sx={{ mb: '22px' }}>
                <Trans>Proposal details</Trans>
              </Typography>
              {proposal ? (
                <>
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
                      <Typography>{formatTime(proposal.creationTimestamp)}</Typography>
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
                      <Typography>{formatTime(proposal.startTimestamp)}</Typography>
                      <Typography variant="caption" color="text.muted">
                        {proposal.startBlock}
                      </Typography>
                    </Box>
                  </Row>
                  {proposalHasExpired ? (
                    <Row
                      caption={
                        <>
                          <Trans>Ended</Trans>
                          <Typography variant="caption" color="text.muted">
                            Block
                          </Typography>
                        </>
                      }
                      sx={{ height: 48 }}
                      captionVariant="description"
                    >
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography>{formatTime(proposal.expirationTimestamp)}</Typography>
                        <Typography variant="caption" color="text.muted">
                          {proposal.endBlock}
                        </Typography>
                      </Box>
                    </Row>
                  ) : (
                    <Row
                      caption={
                        <>
                          <Trans>Ends</Trans>
                          <Typography variant="caption" color="text.muted">
                            Block
                          </Typography>
                        </>
                      }
                      sx={{ height: 48 }}
                      captionVariant="description"
                    >
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography>{formatTime(proposal.expirationTimestamp)}</Typography>
                        <Typography variant="caption" color="text.muted">
                          {proposal.endBlock}
                        </Typography>
                      </Box>
                    </Row>
                  )}
                  {proposal.executed && (
                    <Row
                      caption={<Trans>Executed</Trans>}
                      sx={{ height: 48 }}
                      captionVariant="description"
                    >
                      <Typography>{formatTime(proposal.executionTime)}</Typography>
                    </Row>
                  )}
                  {ipfs?.author && (
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
                  <Box sx={{ mt: 10, mb: 2, display: 'flex', gap: 2 }}>
                    {ipfs?.discussions && (
                      <Button
                        component={Link}
                        target="_blank"
                        rel="noopener"
                        href={ipfs.discussions}
                        variant="outlined"
                        endIcon={
                          <SvgIcon>
                            <ExternalLinkIcon />
                          </SvgIcon>
                        }
                      >
                        <Trans>Forum discussion</Trans>
                      </Button>
                    )}
                    {prerendered && ( // only render the button for prerendered proposals as fro them we can be sure ci already ran
                      <Button
                        component={Link}
                        target="_blank"
                        rel="noopener"
                        href={`https://github.com/bgd-labs/seatbelt-for-ghosts/tree/master/reports/Aave/0xEC568fffba86c094cf06b22134B23074DFE2252c/${String(
                          proposal.id
                        ).padStart(3, '0')}.md`}
                        variant="outlined"
                        endIcon={
                          <SvgIcon>
                            <ExternalLinkIcon />
                          </SvgIcon>
                        }
                      >
                        <Trans>Seatbelt report</Trans>
                      </Button>
                    )}
                  </Box>
                </>
              ) : (
                <>
                  <Skeleton variant="rectangular" height={600} />
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      </ContentContainer>
    </>
  );
}

ProposalPage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MainLayout>
      {page}
      <GovVoteModal />
    </MainLayout>
  );
};
