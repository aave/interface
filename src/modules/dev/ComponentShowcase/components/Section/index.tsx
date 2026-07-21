import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const Section = ({ title, description, children }: SectionProps) => (
  <Box component="section">
    <Box
      sx={{
        pb: 4,
        mb: 8,
        borderBottom: `1px solid ${figVars['border-2']}`,
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant="description"
          color="fg-2"
          sx={{ display: 'block', maxWidth: 640, mt: 1 }}
        >
          {description}
        </Typography>
      )}
    </Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{children}</Box>
  </Box>
);
