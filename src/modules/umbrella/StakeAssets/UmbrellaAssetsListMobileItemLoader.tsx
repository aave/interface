import { Box, Skeleton, Stack } from '@mui/material';
import { ListColumn } from 'src/components/lists/ListColumn';

import { Row } from '../../../components/primitives/Row';
import { ListMobileItemWrapper } from '../../dashboard/lists/ListMobileItemWrapper';

export const UmbrellaAssetsListMobileItemLoader = () => {
  return (
    <ListMobileItemWrapper>
      <ListColumn isRow>
        <Stack direction="row" alignItems="center" height={40}>
          <Skeleton variant="circular" width={32} height={32} />
          <Box sx={{ pl: 2, overflow: 'hidden' }}>
            <Skeleton width={150} height={28} />
          </Box>
        </Stack>
      </ListColumn>
      <Row
        caption={<Skeleton width={80} height={20} />}
        captionVariant="description"
        mt={3}
        mb={3}
        align="flex-start"
      >
        <Skeleton width={100} height={20} />
      </Row>

      <Row caption={<Skeleton width={135} height={20} />} mb={6}>
        <Skeleton width={55} height={38} />
      </Row>
      <Row
        caption={<Skeleton width={120} height={20} />}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Skeleton width={110} height={20} />
      </Row>
      <Row
        caption={<Skeleton width={120} height={20} />}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Skeleton width={75} height={20} />
      </Row>

      <Skeleton width="100%" height={38} />
    </ListMobileItemWrapper>
  );
};
