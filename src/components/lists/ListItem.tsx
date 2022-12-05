import { Box, BoxProps } from '@mui/material';
import { ReactNode } from 'react';

interface ListItemProps extends BoxProps {
  children: ReactNode;
  minHeight?: 71 | 76;
  px?: 4 | 6;
  button?: boolean;
  hideBorder?: boolean;
  ghoBorder?: boolean;
}

export const ListItem = ({
  children,
  minHeight = 71,
  px = 4,
  button,
  hideBorder,
  ghoBorder,
  ...rest
}: ListItemProps) => {
  const ghoBorderBaseStyling = {
    content: '""',
    backgroundColor: '#669AFF',
    position: 'absolute',
    width: 3,
    minHeight: minHeight - 0.75, // accounting for border
    ml: '-17px', // account for padding and border
  };
  const ghoBorderStyling = {
    '&:last-child::before': {
      ...ghoBorderBaseStyling,
      minHeight: minHeight + 1,
      mt: '1px',
      borderRadius: '0 0 0 10px',
    },
    '&:not(:last-child)::before': {
      ...ghoBorderBaseStyling,
    },
  };

  return (
    <Box
      {...rest}
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight,
        px,
        '&:not(:last-child)': !hideBorder
          ? {
              borderBottom: '1px solid',
              borderColor: 'divider',
            }
          : {},
        ...(button ? { '&:hover': { bgcolor: 'action.hover' } } : {}),
        ...(ghoBorder ? ghoBorderStyling : {}),
        ...rest.sx,
      }}
    >
      {children}
    </Box>
  );
};
