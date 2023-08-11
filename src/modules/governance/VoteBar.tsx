import { Trans } from '@lingui/macro';
import { Box, BoxProps, experimental_sx, Skeleton, styled, Typography } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';

const OuterBar = styled('div')(
  experimental_sx({
    position: 'relative',
    width: '100%',
    height: '8px',
    bgcolor: 'divider',
    display: 'block',
    borderRadius: '6px',
  })
);

const InnerBar = styled('span', {
  shouldForwardProp: (prop) => prop !== 'yae' && prop !== 'percent',
})<{ percent: number; yae?: boolean }>(({ percent, yae }) =>
  experimental_sx({
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${percent * 100}%`,
    maxWidth: '100%',
    height: '8px',
    bgcolor: yae ? 'success.main' : 'error.light',
    display: 'block',
    borderRadius: '6px',
  })
);

interface VoteBarProps extends BoxProps {
  votes: number;
  percent: number;
  yae?: boolean;
  loading?: boolean;
}

export function VoteBar({ percent, yae, votes, loading, ...rest }: VoteBarProps) {
  return (
    <Box {...rest}>
      <Box sx={{ display: 'flex' }}>
        <Typography variant="description" sx={{ mr: 2 }}>
          {yae ? <Trans>YAE</Trans> : <Trans>NAY</Trans>}
        </Typography>
        {loading ? (
          <Typography variant="secondary14" sx={{ flexGrow: 1, lineHeight: '1rem' }}>
            <Skeleton width={40} />
          </Typography>
        ) : (
          <Box component="span" sx={{ flexGrow: 1 }}>
            <FormattedNumber
              value={votes}
              visibleDecimals={0}
              sx={{ mr: 1 }}
              variant="secondary14"
              roundDown
              compact={false}
            />
            <Typography variant="description" component="span" color="text.secondary">
              MCAKE
            </Typography>
          </Box>
        )}
        {loading ? (
          <Typography variant="caption">
            <Skeleton width={40} />
          </Typography>
        ) : (
          <FormattedNumber value={percent} percent variant="caption" color="text.secondary" />
        )}
      </Box>
      {loading ? (
        <Skeleton variant="rectangular" height={8} sx={{ borderRadius: '6px' }} />
      ) : (
        <OuterBar>
          <InnerBar percent={percent} yae={yae} />
        </OuterBar>
      )}
    </Box>
  );
}
