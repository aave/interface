import { Alert, Box, LinearProgress, Skeleton } from '@mui/material';
import {
  StatusCancelledIcon,
  StatusExpiredIcon,
  StatusFilledIcon,
  StatusInProgressIcon,
} from 'src/components/icons/StatusIcons';
import { CheckBadge } from 'src/components/primitives/CheckBadge';
import { NoData } from 'src/components/primitives/NoData';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const SEVERITIES = ['error', 'warning', 'info', 'success'] as const;

// Badges label a state in a word or two — they sit inline in a table row, not in a banner. Their
// severities carry the CoW order states rather than the banner's semantics (see the
// `variant: 'badge'` entries in theme.tsx), and each pairs with its own status glyph. Listed in
// order of an order's life, which is why this is a list and not keyed off SEVERITIES.
const BADGE_STATES = [
  { severity: 'warning', label: 'In Progress', icon: <StatusInProgressIcon /> },
  { severity: 'success', label: 'Filled', icon: <StatusFilledIcon /> },
  { severity: 'error', label: 'Cancelled', icon: <StatusCancelledIcon /> },
  { severity: 'info', label: 'Expired', icon: <StatusExpiredIcon /> },
] as const;

export const FeedbackSection = () => (
  <Section title="Feedback">
    <Specimen label="Alert (MuiAlert severities)" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {SEVERITIES.map((severity) => (
          <Alert key={severity} severity={severity}>
            This is a {severity} alert. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
          </Alert>
        ))}
      </Box>
    </Specimen>

    <Specimen label="Alert — small (data-size)" fullWidth>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {SEVERITIES.map((severity) => (
          <Alert key={severity} severity={severity} data-size="small">
            This is a {severity} alert. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
            do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.
          </Alert>
        ))}
      </Box>
    </Specimen>

    <Specimen label="Alert — badge (status chip)">
      {BADGE_STATES.map(({ severity, label, icon }) => (
        <Alert key={severity} variant="badge" severity={severity} icon={icon}>
          {label}
        </Alert>
      ))}
    </Specimen>

    <Specimen label="Alert — badge, icon only">
      {BADGE_STATES.map(({ severity, icon }) => (
        <Alert key={severity} variant="badge" severity={severity} icon={icon} />
      ))}
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
