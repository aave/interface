import { ChevronDoubleRightIcon } from '@heroicons/react/solid';
import { Box, Skeleton, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
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
  const { breakpoints } = useTheme();
  const isDesktop = useMediaQuery(breakpoints.up('lg'));

  return (
    <Row
      caption={caption}
      sx={{ mb: { xs: 3, lg: 4 }, '&:last-of-type': { mb: 0 } }}
      captionVariant={isDesktop ? 'secondary16' : 'description'}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!loading ? <HealthFactorNumber value={hfCurrent} /> : <Skeleton width={50} />}
        <SvgIcon sx={{ fontSize: '16px', color: 'text.primary', mx: 1 }}>
          <ChevronDoubleRightIcon />
        </SvgIcon>
        {!loading ? <HealthFactorNumber value={hfAfter} /> : <Skeleton width={50} />}
      </Box>
    </Row>
  );
};
