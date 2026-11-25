import { Skeleton } from '@mui/material';
import { useRouter } from 'next/router';
import { ChainIcon } from 'src/components/ChainIcon';
import { FlowHeader } from 'src/components/FlowHeader';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { MIGRATE_FLOW } from '../utils/copy';
import { parsePositionId } from '../V4MigrationPage/utils/opportunities';

/** The earn migration flow, opened from a row of the migrate page's earn table. */
export const V4MigrationEarnFlow = () => {
  const router = useRouter();
  const positionId = typeof router.query.position === 'string' ? router.query.position : undefined;
  const chainId = positionId ? parsePositionId(positionId)?.chainId : undefined;

  return (
    <FlowHeader
      title={MIGRATE_FLOW.title}
      subheading={
        chainId ? (
          MIGRATE_FLOW.selectHubSubheading(
            <span>
              <ChainIcon chainId={chainId} />
              <strong>{getNetworkConfig(chainId).name}</strong>
            </span>
          )
        ) : (
          <Skeleton variant="rectangular" width={370} height={17} sx={{ borderRadius: '0.5rem' }} />
        )
      }
    />
  );
};
