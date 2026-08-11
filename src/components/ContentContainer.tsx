import { Box, Container, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  // Optional passthrough to the inner MUI Container. Markets uses it for a wider maxWidth that its
  // top panel shares for stat/table column alignment; every other page omits it (default Container).
  containerProps?: ContainerProps;
}

export const ContentContainer = ({ children, containerProps }: ContentContainerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        pt: '2rem',
      }}
    >
      <Container {...containerProps}>{children}</Container>
    </Box>
  );
};
