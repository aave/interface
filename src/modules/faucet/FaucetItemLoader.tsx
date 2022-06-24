import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton } from '@mui/material';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';

export const FaucetItemLoader = () => {
  return (
    <ListItem px={6} minHeight={76}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Skeleton width={75} height={24} />
        </Box>
      </ListColumn>

      <ListColumn>
        <Skeleton width={70} height={24} />
      </ListColumn>

      <ListColumn maxWidth={280} align="right">
        <Button variant="contained">
          <Trans>Faucet</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
