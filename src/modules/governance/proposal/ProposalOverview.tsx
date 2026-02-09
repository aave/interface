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
import { ProposalDetailDisplay } from 'src/modules/governance/types';
import { useRootStore } from 'src/store/root';
import { ipfsGateway } from 'src/ui-config/governanceConfig';
import { GENERAL } from 'src/utils/events';

import { StateBadge } from '../StateBadge';

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
  proposal?: ProposalDetailDisplay;
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
                {proposal.title || <Skeleton />}
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
                  {/* {proposal.author && (
                    <Typography variant="caption" color="text.secondary">
                      by {proposal.author}
                    </Typography>
                  )} */}
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  component="a"
                  sx={{ minWidth: lgUp ? '160px' : '' }}
                  target="_blank"
                  rel="noopener"
                  onClick={() =>
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      AIP: proposal.id,
                      Link: 'Raw Ipfs',
                    })
                  }
                  href={`${ipfsGateway}/${proposal.ipfsHash}`}
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
                      AIP: proposal.id,
                      Link: 'Share on twitter',
                    })
                  }
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    proposal.title
                  )}&url=${typeof window !== 'undefined' ? window.location.href : ''}`}
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
                      AIP: proposal.id,
                      Link: 'Share on lens',
                    })
                  }
                  href={`https://hey.xyz/?url=${
                    typeof window !== 'undefined' ? window.location.href : ''
                  }&text=Check out this proposal on aave governance - ${
                    proposal.title
                  }&hashtags=Aave&preview=true`}
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
                    <TableContainer component={Paper} variant="outlined" sx={{ my: 4 }}>
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
                        /^\.\.\//,
                        'https://raw.githubusercontent.com/aave/aip/main/content/'
                      )
                    : _src;
                  return <CenterAlignedImage src={src} alt={alt} />;
                },
                a({ node, ...rest }) {
                  return <StyledLink {...rest} />;
                },
                h1({ node, ...rest }) {
                  return <Typography variant="h2" sx={{ mt: 8, mb: 2 }} {...rest} />;
                },
                h2({ node, ...rest }) {
                  return <Typography variant="subheader1" sx={{ mt: 6, mb: 2 }} {...rest} />;
                },
                h3({ node, ...rest }) {
                  return <Typography variant="subheader1" sx={{ mt: 4, mb: 2 }} {...rest} />;
                },
                h4({ node, ...rest }) {
                  return <Typography variant="subheader2" sx={{ mt: 4, mb: 2 }} {...rest} />;
                },
                p({ node, ...rest }) {
                  return <Typography variant="description" sx={{ mb: 3 }} {...rest} />;
                },
                ul({ node, ...rest }) {
                  return <Box component="ul" sx={{ pl: 4, mb: 3, '& li': { mb: 1 } }} {...rest} />;
                },
                ol({ node, ...rest }) {
                  return <Box component="ol" sx={{ pl: 4, mb: 3, '& li': { mb: 1 } }} {...rest} />;
                },
                li({ node, ...rest }) {
                  return <Typography component="li" variant="description" {...rest} />;
                },
                blockquote({ node, ...rest }) {
                  return (
                    <Box
                      component="blockquote"
                      sx={{
                        borderLeft: '4px solid',
                        borderColor: 'divider',
                        pl: 4,
                        my: 3,
                        ml: 0,
                      }}
                      {...rest}
                    />
                  );
                },
                code({
                  node,
                  inline,
                  ...rest
                }: { node?: unknown; inline?: boolean } & Record<string, unknown>) {
                  return inline ? (
                    <Box
                      component="code"
                      sx={{
                        bgcolor: 'background.default',
                        px: 1,
                        py: 0.25,
                        borderRadius: 0.5,
                        fontSize: '0.875em',
                      }}
                      {...rest}
                    />
                  ) : (
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'background.default',
                        p: 3,
                        borderRadius: 1,
                        overflow: 'auto',
                        my: 3,
                        '& code': { fontSize: '0.875em' },
                      }}
                    >
                      <code {...rest} />
                    </Box>
                  );
                },
                hr() {
                  return (
                    <Box
                      component="hr"
                      sx={{ my: 4, border: 'none', borderTop: '1px solid', borderColor: 'divider' }}
                    />
                  );
                },
              }}
            >
              {proposal.description}
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
