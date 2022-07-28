import { Box, Container } from '@mui/material';
import { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
}

export const ContentContainer = ({ children }: ContentContainerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        mt: { xs: '-32px', lg: '-46px', xl: '-44px', xxl: '-48px' },
        wordBreak: 'break-word',
      }}
    >
      <Container>{children}</Container>
    </Box>
  );
};
