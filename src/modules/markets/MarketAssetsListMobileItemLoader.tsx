import { Divider, Skeleton } from '@mui/material';

import { Row } from '../../components/primitives/Row';
import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';

export const MarketAssetsListMobileItemLoader = () => {
  return (
    <ListMobileItemWrapper loading>
      <Row caption={<Skeleton width={100} height={20} />} captionVariant="description" mb={3}>
        <Skeleton width={45} height={20} />
      </Row>
      <Row
        caption={<Skeleton width={100} height={20} />}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>

      <Divider sx={{ mb: 3 }} />

      <Row caption={<Skeleton width={100} height={20} />} captionVariant="description" mb={3}>
        <Skeleton width={45} height={20} />
      </Row>
      <Row
        caption={<Skeleton width={100} height={20} />}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>
      <Row
        caption={<Skeleton width={100} height={20} />}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>

      <Skeleton width="100%" height={38} />
    </ListMobileItemWrapper>
  );
};
