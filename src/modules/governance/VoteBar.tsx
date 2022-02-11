import { Trans } from '@lingui/macro';
import { Box, BoxProps, experimental_sx, styled, Typography } from '@mui/material';
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
}
export function VoteBar({ percent = 30, yae, votes, ...rest }: VoteBarProps) {
  return (
    <Box {...rest}>
      <Box sx={{ display: 'flex' }}>
        <Typography variant="description" sx={{ mr: 2 }}>
          {yae ? <Trans>YAE</Trans> : <Trans>NEY</Trans>}
        </Typography>
        <FormattedNumber
          value={votes}
          sx={{ flexGrow: 1 }}
          minimumDecimals={2}
          maximumDecimals={2}
          variant="secondary14"
        />
        <FormattedNumber
          value={percent}
          percent
          minimumDecimals={2}
          maximumDecimals={2}
          variant="caption"
          color="text.secondary"
        />
      </Box>
      <OuterBar>
        <InnerBar percent={percent} yae={yae} />
      </OuterBar>
    </Box>
  );
}
