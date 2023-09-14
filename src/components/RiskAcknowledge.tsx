import { Trans } from '@lingui/macro';
import { Box, Checkbox, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { Warning } from './primitives/Warning';

interface RiskAcknowledgeProps {
  title: ReactNode;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export const RiskAcknowledge = ({ title, checked, onChange }: RiskAcknowledgeProps) => {
  return (
    <>
      <Warning severity="error" sx={{ my: 6 }}>
        {title}
      </Warning>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          mx: '24px',
          mb: '12px',
        }}
      >
        <Checkbox
          checked={checked}
          onChange={(_event, checked) => onChange(checked)}
          size="small"
          data-cy={`risk-checkbox`}
        />
        <Typography variant="description">
          <Trans>I acknowledge the risks involved.</Trans>
        </Typography>
      </Box>
    </>
  );
};
