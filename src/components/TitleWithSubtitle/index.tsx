import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { DotIcon } from 'src/components/icons/DotIcon';

export const TitleWithSubtitle = ({
  title,
  subtitle,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
}) => (
  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
    <Typography component="span" variant="h5" color="fg-1" noWrap>
      {title}
    </Typography>
    {subtitle ? (
      <>
        <DotIcon sx={{ color: 'fg-4' }} />
        <Typography component="span" variant="base" color="fg-3" noWrap>
          {subtitle}
        </Typography>
      </>
    ) : null}
  </Box>
);
