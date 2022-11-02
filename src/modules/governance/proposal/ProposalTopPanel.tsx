import { ArrowLeftIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon } from '@mui/material';
import * as React from 'react';
import { Link, ROUTES } from 'src/components/primitives/Link';

import { TopInfoPanel } from '../../../components/TopInfoPanel/TopInfoPanel';

export const ProposalTopPanel = () => {
  return (
    <TopInfoPanel>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: '18px' }}>
        <Button
          component={Link}
          href={ROUTES.governance}
          variant="surface"
          size="medium"
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
