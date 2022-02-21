import { Trans } from '@lingui/macro';
import { Button, Divider, Skeleton } from '@mui/material';

import { Row } from '../../components/primitives/Row';
import { ListMobileItemWrapper } from '../dashboard/lists/ListMobileItemWrapper';

export const AssetsListMobileItemLoader = () => {
  return (
    <ListMobileItemWrapper loading>
      <Row caption={<Trans>Total supplied</Trans>} captionVariant="description" mb={3}>
        <Skeleton width={45} height={20} />
      </Row>
      <Row
        caption={<Trans>Supply APY</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>

      <Divider sx={{ mb: 3 }} />

      <Row caption={<Trans>Total borrowed</Trans>} captionVariant="description" mb={3}>
        <Skeleton width={45} height={20} />
      </Row>
      <Row
        caption={<Trans>Borrow APY, variable</Trans>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>
      <Row
        caption={<Trans>Borrow APY, stable</Trans>}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Skeleton width={45} height={20} />
      </Row>

      <Button variant="outlined" fullWidth>
        <Trans>View details</Trans>
      </Button>
    </ListMobileItemWrapper>
  );
};
