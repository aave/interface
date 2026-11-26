import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { Fragment, ReactNode } from 'react';
import { ContentWithTooltip } from 'src/components/ContentWithTooltip';
import { dottedUnderlineSx } from 'src/utils/figmaColors';

export interface Curator {
  name: string;
  icon: string;
  tooltip?: ReactNode;
}

const CuratorName = ({ curator }: { curator: Curator }) => {
  const label = (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
      <Box
        component="img"
        src={curator.icon}
        alt=""
        sx={{
          display: 'block',
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: '18.75%',
          objectFit: 'cover',
        }}
      />
      <Typography
        component="span"
        variant="h5"
        color="fg-1"
        sx={curator.tooltip ? dottedUnderlineSx : undefined}
      >
        {curator.name}
      </Typography>
    </Box>
  );

  return curator.tooltip ? (
    <ContentWithTooltip tooltipContent={<>{curator.tooltip}</>}>{label}</ContentWithTooltip>
  ) : (
    label
  );
};

export const CuratorNames = ({ curators }: { curators: Curator[] }) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
    {curators.map((curator, index) => (
      <Fragment key={curator.name}>
        {index > 0 && (
          <Typography component="span" variant="base" color="fg-3" sx={{ whiteSpace: 'pre' }}>
            ,{' '}
          </Typography>
        )}
        <CuratorName curator={curator} />
      </Fragment>
    ))}
  </Box>
);

export const CuratorBy = ({ curators }: { curators: Curator[] }) =>
  curators.length === 0 ? null : (
    <Box
      component="span"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
    >
      <Typography component="span" variant="base" color="fg-3">
        <Trans>by</Trans>
      </Typography>
      <CuratorNames curators={curators} />
    </Box>
  );
