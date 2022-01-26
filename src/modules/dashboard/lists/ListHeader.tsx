import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ListColumn } from './ListColumn';

interface ListHeaderProps {
  head: ReactNode[];
}

export const ListHeader = ({ head }: ListHeaderProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', px: 4, pt: 4, pb: '6px' }}>
      <ListColumn maxWidth={160} isRow>
        <Typography variant="subheader2" color="text.secondary" noWrap>
          <Trans>Assets</Trans>
        </Typography>
      </ListColumn>

      {head.map((title, i) => (
        <ListColumn key={i}>
          <Typography component="div" variant="subheader2" color="text.secondary" noWrap>
            {title}
          </Typography>
        </ListColumn>
      ))}

      <ListColumn maxWidth={85} />
      <ListColumn maxWidth={85} />
    </Box>
  );
};
