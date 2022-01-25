import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface InfoWrapperProps {
  topContent: ReactNode;
  topText: ReactNode;
  children: ReactNode;
  bottomText: ReactNode;
}

export const InfoWrapper = ({ topContent, topText, children, bottomText }: InfoWrapperProps) => {
  return (
    <Box
      sx={(theme) => ({
        border: `1px solid ${theme.palette.primary.main}`,
        mb: 5,
        borderRadius: '4px',
        p: 5,
      })}
    >
      {topContent}

      <Typography
        variant="secondary12"
        color="text.secondary"
        sx={{ maxWidth: '85%', textAlign: 'left' }}
      >
        {topText}
      </Typography>

      <Box sx={{ my: 5 }}>{children}</Box>

      <Typography variant="secondary12" color="text.secondary" textAlign="left">
        {bottomText}
      </Typography>
    </Box>
  );
};
