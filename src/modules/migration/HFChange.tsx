import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Skeleton, SvgIcon, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { Row } from 'src/components/primitives/Row';

interface HFChangeProps {
  caption: ReactNode;
  hfCurrent: string;
  hfAfter: string;
  loading?: boolean;
}

export const HFChange = ({ caption, hfCurrent, hfAfter, loading }: HFChangeProps) => {
  return (
    <Row
      caption={caption}
      sx={{ mb: { xs: 3, lg: 4 }, '&:last-of-type': { mb: 0 } }}
      captionVariant={'description'}
    >
      <Box sx={{ textAlign: 'right' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {!loading ? <HealthFactorNumber value={hfCurrent} /> : <Skeleton width={50} />}
          <SvgIcon sx={{ fontSize: '16px', color: 'text.primary', mx: 1 }}>
            <ArrowNarrowRightIcon />
          </SvgIcon>
          {!loading ? <HealthFactorNumber value={hfAfter} /> : <Skeleton width={50} />}
        </Box>
        <Typography variant="helperText" color="text.secondary">
          <Trans>Liquidation at</Trans>
          {' <1.0'}
        </Typography>
      </Box>
    </Row>
  );
};
