import { Alert, Box, LinearProgress, Skeleton } from '@mui/material';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { NoData } from 'src/components/primitives/NoData';
import { Warning } from 'src/components/primitives/Warning';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const SEVERITIES = ['error', 'warning', 'info', 'success'] as const;

export const FeedbackSection = () => (
  <Section title="Feedback">
    <Specimen label="Alert (MuiAlert severities)" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {SEVERITIES.map((severity) => (
          <Alert key={severity} severity={severity}>
            This is a {severity} alert.
          </Alert>
        ))}
      </Box>
    </Specimen>

    <Specimen label="Warning (primitive — Alert wrapper)" fullWidth>
      <Warning severity="info">Warning wraps MUI Alert with default spacing.</Warning>
    </Specimen>

    <Specimen label="Skeleton">
      <Skeleton variant="rectangular" width={120} height={20} />
      <Skeleton variant="text" width={120} />
      <Skeleton variant="circular" width={32} height={32} />
    </Specimen>

    <Specimen label="LinearProgress" fullWidth>
      <Box sx={{ width: 280 }}>
        <LinearProgress />
      </Box>
    </Specimen>

    <Specimen label="CheckBadge">
      <CheckBadge text="Checked" checked />
      <CheckBadge text="Unchecked" checked={false} />
      <CheckBadge text="Loading" loading />
    </Specimen>

    <Specimen label="NoData">
      <NoData />
    </Specimen>
  </Section>
);
