import { Container, ContainerProps } from '@mui/material';

export const MainContainer = ({ sx, ...rest }: ContainerProps) => {
  return (
    <Container
      {...rest}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        paddingBottom: '39px',
        paddingX: {
          xs: '8px',
          xsm: '20px',
          sm: '48px',
          md: '96px',
          lg: '20px',
          xl: '96px',
          xxl: 0,
        },
        maxWidth: {
          xs: 'unset',
          xxl: '1440px',
        },
        ...sx,
      }}
    />
  );
};
