import { Trans } from '@lingui/macro';
import { Box, Button, Skeleton } from '@mui/material';

import { ListColumn } from '../../components/lists/ListColumn';
import { ListItem } from '../../components/lists/ListItem';

export const FaucetItemLoader = ({ compact }: { compact?: boolean }) => {
  return (
    <ListItem px={compact ? 4 : 5} minHeight={76}>
      <ListColumn isRow maxWidth={280}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ pl: 3.5, overflow: 'hidden' }}>
          <Skeleton width={75} height={24} />
        </Box>
      </ListColumn>

      {!compact && (
        <ListColumn>
          <Skeleton width={70} height={24} />
        </ListColumn>
      )}

      <ListColumn align="right" maxWidth={280}>
        <Button variant="contained">
          <Trans>Faucet</Trans>
        </Button>
      </ListColumn>
    </ListItem>
  );
};
