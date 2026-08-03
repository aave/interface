import { styled, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { figSurfaceShadow, figVars } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

// Segmented-control shell: a bg-5 (light) / bg-2 (dark) fill. Light is frameless with a tight
// 0.06rem inset; dark adds the shared surface shadow (shadow-low drop + 1px ring) and a 0.13rem
// inset. 0.5625rem radius; the pill radius tracks the inset so the corners stay concentric.
const CustomTxModalToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>({
  backgroundColor: figVars['bg-5'],
  boxShadow: 'none',
  padding: '0.06rem',
  ...darkScheme({
    backgroundColor: figVars['bg-2'],
    boxShadow: figSurfaceShadow(),
    padding: '0.13rem',
  }),
  borderRadius: '0.5625rem',
  height: '36px',
  width: '100%',
  // Strip MUI's per-segment border + overlap margins so each segment is an independent borderless
  // pill (the group carries the only frame). Pill radius = shell radius − inset gap, per mode:
  // 0.5025rem (0.5625 − 0.06) in light, 0.4325rem (0.5625 − 0.13) in dark.
  '& .MuiToggleButtonGroup-grouped': {
    '--toggle-pill-radius': '0.5025rem',
    ...darkScheme({ '--toggle-pill-radius': '0.4325rem' }),
    margin: 0,
    border: 0,
    borderRadius: 'var(--toggle-pill-radius)',
    '&:not(:first-of-type)': {
      marginLeft: 0,
      borderLeft: 0,
      borderRadius: 'var(--toggle-pill-radius)',
    },
    '&:not(:last-of-type)': {
      borderRadius: 'var(--toggle-pill-radius)',
    },
  },
}) as typeof ToggleButtonGroup;

export function StyledTxModalToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomTxModalToggleGroup {...props} />;
}
