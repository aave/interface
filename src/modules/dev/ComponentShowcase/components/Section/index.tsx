import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const Section = ({ title, description, children }: SectionProps) => (
  <Box component="section">
    <Box
      sx={(theme) => ({
        pb: 4,
        mb: 8,
        borderBottom: `1px solid ${theme.palette.divider}`,
      })}
    >
      <Typography variant="h2" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="description"
          color="text.secondary"
          sx={{ display: 'block', maxWidth: 640, mt: 1 }}
        >
          {description}
        </Typography>
      )}
    </Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</Box>
  </Box>
);
