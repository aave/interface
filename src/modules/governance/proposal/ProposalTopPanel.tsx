import { ArrowLeftIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon } from '@mui/material';
import * as React from 'react';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { AIP } from 'src/utils/mixPanelEvents';

import { TopInfoPanel } from '../../../components/TopInfoPanel/TopInfoPanel';

export const ProposalTopPanel = () => {
  const trackEvent = useRootStore((store) => store.trackEvent);

  return (
    <TopInfoPanel>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '18px' }}>
        <Button
          component={Link}
          href={ROUTES.governance}
          variant="surface"
          size="medium"
          onClick={() => trackEvent(AIP.GO_BACK)}
          color="primary"
          startIcon={
            <SvgIcon fontSize="small">
              <ArrowLeftIcon />
            </SvgIcon>
          }
        >
          <Trans>Go Back</Trans>
        </Button>
      </Box>
    </TopInfoPanel>
  );
};
