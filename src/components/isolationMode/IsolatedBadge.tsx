import { InformationCircleIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useState } from 'react';

import { IsolatedAssetModal } from './IsolatedAssetModal';

export const IsolatedBadge = () => {
  const [open, setOpen] = useState(false);

  const iconSize = 14;

  return (
    <>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          p: '2px',
          mt: '2px',
          '&:hover': { opacity: 0.6 },
        }}
        onClick={() => setOpen(true)}
      >
        <Typography variant="secondary12" color="text.secondary">
          <Trans>Isolated</Trans>
        </Typography>
        <SvgIcon sx={{ ml: '3px', color: 'divider', fontSize: `${iconSize}px` }}>
          <InformationCircleIcon />
        </SvgIcon>
      </Box>

      {open && <IsolatedAssetModal open={open} setOpen={setOpen} />}
    </>
  );
};
