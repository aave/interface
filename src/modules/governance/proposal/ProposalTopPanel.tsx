import { Trans } from '@lingui/macro';
import { Box, Button, SvgIcon } from '@mui/material';
import * as React from 'react';
import { ArrowLeftIcon } from '@heroicons/react/solid';
import { Link, ROUTES } from 'src/components/primitives/Link';

export const ProposalTopPanel = () => {
  return (
    <Box sx={{ mt: 12, mb: 13, color: 'common.white' }}>
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
          <Trans>back</Trans>
        </Button>
      </Box>
    </Box>
  );
};
