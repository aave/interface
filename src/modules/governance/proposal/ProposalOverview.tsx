import { DownloadIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Twitter } from '@mui/icons-material';
import {
  Box,
  Button,
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { LensIcon } from 'src/components/icons/LensIcon';
import { Warning } from 'src/components/primitives/Warning';
import { Proposal } from 'src/hooks/governance/useProposals';
// import { FormattedProposalTime } from 'src/modules/governance/FormattedProposalTime';
import { StateBadge } from 'src/modules/governance/StateBadge';
// import { IpfsType } from 'src/static-build/ipfs';
// import { CustomProposalType } from 'src/static-build/proposal';
import { useRootStore } from 'src/store/root';
import { ipfsGateway } from 'src/ui-config/governanceConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

const CenterAlignedImage = styled('img')({
  display: 'block',
  margin: '0 auto',
  maxWidth: '100%',
});

const StyledLink = styled('a')({
  color: 'inherit',
});

interface ProposalOverviewProps {
  error: boolean;
  proposal?: Proposal;
  loading: boolean;
}

export const ProposalOverview = ({ proposal, loading, error }: ProposalOverviewProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { breakpoints, palette } = useTheme();
  const lgUp = useMediaQuery(breakpoints.up('lg'));

  return (
    <Paper sx={{ px: 6, pt: 4, pb: 12 }} data-cy="vote-info-body">
      <Typography variant="h3">
        <Trans>Proposal overview</Trans>
      </Typography>
      {error ? (
        <Box sx={{ px: { md: 18 }, pt: 8 }}>
          <Warning severity="error">
            <Trans>An error has occurred fetching the proposal.</Trans>
          </Warning>
        </Box>
      ) : (
        <Box sx={{ px: { md: 18 }, pt: 8, wordBreak: 'break-word' }}>
          {proposal ? (
            <>
              <Typography variant="h2" sx={{ mb: 6 }}>
                {proposal.subgraphProposal.proposalMetadata.title || <Skeleton />}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ mr: '24px', mb: { xs: '2px', sm: 0 } }}>
                    <StateBadge state={proposal.badgeState} loading={loading} />
                  </Box>

                  {/*
                   !loading && (
                     <FormattedProposalTime
                       state={proposal.state}
                       executionTime={proposal.executionTime}
                       startTimestamp={proposal.startTimestamp}
                       executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                       expirationTimestamp={proposal.expirationTimestamp}
                     />

                     )
                     */}
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  component="a"
                  sx={{ minWidth: lgUp ? '160px' : '' }}
                  target="_blank"
                  rel="noopener"
                  onClick={() =>
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      AIP: proposal.subgraphProposal.id,
                      Link: 'Raw Ipfs',
                    })
                  }
                  href={`${ipfsGateway}/${proposal.subgraphProposal.proposalMetadata.ipfsHash}`}
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
                  onClick={() =>
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      AIP: proposal.subgraphProposal.id,
                      Link: 'Share on twitter',
                    })
                  }
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    proposal.subgraphProposal.proposalMetadata.title
                  )}&url=${window.location.href}`}
                  startIcon={<Twitter />}
                >
                  {lgUp && <Trans>Share on twitter</Trans>}
                </Button>
                <Button
                  sx={{ minWidth: lgUp ? '160px' : '' }}
                  component="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      AIP: proposal.subgraphProposal.id,
                      Link: 'Share on lens',
                    })
                  }
                  href={`https://hey.xyz/?url=${window.location.href}&text=Check out this proposal on aave governance 👻👻 - ${proposal.subgraphProposal.proposalMetadata.title}&hashtags=Aave&preview=true`}
                  startIcon={
                    <LensIcon
                      color={palette.mode === 'dark' ? palette.primary.light : palette.text.primary}
                    />
                  }
                >
                  {lgUp && <Trans>Share on Lens</Trans>}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="buttonL">
              <Skeleton />
            </Typography>
          )}
          {proposal ? (
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
                  return <Typography variant="subheader1" sx={{ mt: 6 }} gutterBottom {...rest} />;
                },
                p({ node, ...rest }) {
                  return <Typography variant="description" {...rest} />;
                },
              }}
            >
              {proposal.subgraphProposal.proposalMetadata.description}
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
  );
};
