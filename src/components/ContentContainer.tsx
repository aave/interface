import { Box, Container, ContainerProps } from '@mui/material';
import { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  // Optional passthrough to the inner MUI Container. Markets uses it for a wider maxWidth that its
  // top panel shares for stat/table column alignment; every other page omits it (default Container).
  containerProps?: ContainerProps;
  disableTopPadding?: boolean;
}

/** Top padding of the page content band; the mobile tab switchers mirror it below themselves. */
export const CONTENT_TOP_PADDING = { xs: '1.5rem', xsm: '2rem' };

export const ContentContainer = ({
  children,
  containerProps,
  disableTopPadding,
}: ContentContainerProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        pt: disableTopPadding ? 0 : CONTENT_TOP_PADDING,
      }}
    >
      <Container {...containerProps}>{children}</Container>
    </Box>
  );
};
