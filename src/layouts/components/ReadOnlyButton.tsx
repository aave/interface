import { Trans } from '@lingui/macro';
import { Box, ListItem, ListItemText, MenuItem } from '@mui/material';
import React from 'react';
import { useWalletModalContext } from 'src/hooks/useWalletModal';

interface ReadOnlyButtonProps {
  component?: typeof MenuItem | typeof ListItem;
}

export const ReadOnlyButton = ({ component = ListItem }: ReadOnlyButtonProps) => {
  const { setWalletModalOpen } = useWalletModalContext();

  const handleClick = () => setWalletModalOpen(true);
  return (
    <Box
      component={component}
      onClick={handleClick}
      sx={{
        color: { xs: '#F1F1F3', md: 'text.primary' },
        py: { xs: 1.5, md: 2 },
      }}
    >
      <ListItemText>
        <Trans>Read only wallet</Trans>
      </ListItemText>
    </Box>
  );
};
