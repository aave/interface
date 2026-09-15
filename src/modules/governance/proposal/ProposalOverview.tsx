import { DownloadIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import X from '@mui/icons-material/X';
import {
  Alert,
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
import { Children, ReactNode, useMemo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { textCenterEllipsis } from 'src/helpers/text-center-ellipsis';
import { ProposalDetailDisplay } from 'src/modules/governance/types';
import { useRootStore } from 'src/store/root';
import { ipfsGateway } from 'src/ui-config/governanceConfig';
import { iconButtonSx, startIconSizeSx } from 'src/utils/buttonStyles';
import { cardHeadingSx, cardPaddingSx } from 'src/utils/cardStyles';
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

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

/**
 * Middle-truncates bare EVM addresses in proposal markdown. A 42-character address has no break
 * opportunity, so one of them sets the whole table's min-content width and the cell scrolls
 * sideways on a phone. Only direct text children are rewritten, so surrounding prose is untouched.
 */
const compactAddresses = (children: ReactNode): ReactNode =>
  Children.map(children, (child) => {
    const text = typeof child === 'string' ? child.trim() : '';
    return EVM_ADDRESS.test(text) ? textCenterEllipsis(text, 6, 4) : child;
  });

const REMARK_PLUGINS = [remarkGfm];

// 16px rather than MUI's 20px: the X glyph is solid and fills its box, where the Raw-Ipfs outline
// icon beside it is a thin stroke — so the smaller box reads at a matching weight, not smaller.
const SHARE_ICON_SX = startIconSizeSx('1rem');

interface ProposalOverviewProps {
  error: boolean;
  proposal?: ProposalDetailDisplay;
  loading: boolean;
}

export const ProposalOverview = ({ proposal, loading, error }: ProposalOverviewProps) => {
  const trackEvent = useRootStore((store) => store.trackEvent);
  const { breakpoints } = useTheme();
  const lgUp = useMediaQuery(breakpoints.up('lg'));
  // Proposal tables are two columns of label + value; below `sm` a full address no longer fits
  // beside its label, so addresses are shortened rather than left to scroll.
  const truncateAddresses = useMediaQuery(breakpoints.down('sm'));
  const shareButtonSx = lgUp ? { minWidth: '160px' } : iconButtonSx;

  // ReactMarkdown is not memoised and resolves every element type out of this map, so a fresh
  // object literal remounts the entire rendered proposal body on each render — including the
  // one the breakpoint hook triggers right after hydration.
  const markdownComponents: Components = useMemo(
    () => ({
      table({ node, ...props }) {
        return (
          <TableContainer component={Paper} variant="outlined" sx={{ my: 4 }}>
            <Table {...props} sx={{ wordBreak: 'normal' }} />
          </TableContainer>
        );
      },
      tr({ node, ...props }) {
        return <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }} {...props} />;
      },
      td({ children, style }) {
        return (
          <TableCell style={style}>
            {truncateAddresses ? compactAddresses(children) : children}
          </TableCell>
        );
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
          ? _src.replace(/^\.\.\//, 'https://raw.githubusercontent.com/aave/aip/main/content/')
          : _src;
        return <CenterAlignedImage src={src} alt={alt} />;
      },
      a({ node, children, ...rest }) {
        return (
          <StyledLink {...rest} target="_blank" rel="noopener noreferrer">
            {truncateAddresses ? compactAddresses(children) : children}
          </StyledLink>
        );
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
              borderColor: 'border-2',
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
              bgcolor: 'bg-5',
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
              bgcolor: 'bg-5',
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
            sx={{
              my: 4,
              border: 'none',
              borderTop: '1px solid',
              borderColor: 'border-2',
            }}
          />
        );
      },
    }),
    [truncateAddresses]
  );

  return (
    <Paper variant="card" sx={{ ...cardPaddingSx, pb: 20 }} data-cy="vote-info-body">
      <Typography variant="h3" sx={cardHeadingSx}>
        <Trans>Proposal overview</Trans>
      </Typography>
      {error ? (
        <Box sx={{ px: { md: 18 }, pt: 8 }}>
          <Alert severity="error" sx={{ mb: 6, width: '100%' }}>
            <Trans>An error has occurred fetching the proposal.</Trans>
          </Alert>
        </Box>
      ) : (
        <Box sx={{ px: { md: 18 }, pt: 8, wordBreak: 'break-word' }}>
          {proposal ? (
            <>
              <Typography variant="h2" sx={{ mb: 6 }}>
                {proposal.title || <Skeleton />}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  '& .MuiButton-startIcon': { color: 'fg-3' },
                }}
              >
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
                </Box>
                <Box sx={{ flexGrow: 1 }} />
                <Button
                  component="a"
                  sx={shareButtonSx}
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
                  sx={[shareButtonSx, SHARE_ICON_SX]}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent(GENERAL.EXTERNAL_LINK, {
                      AIP: proposal.id,
                      // Deliberately not renamed with the label: this is an analytics key,
                      // and changing it would split the metric from its history.
                      Link: 'Share on twitter',
                    })
                  }
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(
                    proposal.title
                  )}&url=${typeof window !== 'undefined' ? window.location.href : ''}`}
                  startIcon={<X />}
                >
                  {lgUp && <Trans>Share on X</Trans>}
                </Button>
              </Box>
            </>
          ) : (
            <Typography variant="buttonL">
              <Skeleton />
            </Typography>
          )}
          {proposal?.author && (
            <Box sx={{ mt: 6, mb: 2 }}>
              <Typography variant="subheader1">
                <Trans>Author</Trans>
              </Typography>
              <Typography variant="description">{proposal.author}</Typography>
            </Box>
          )}
          {proposal ? (
            <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={markdownComponents}>
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
