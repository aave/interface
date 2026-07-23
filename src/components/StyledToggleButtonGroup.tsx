import { styled, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

// Segmented control framed like a medium outlined button: a `bg-5` fill with an inset 1px hairline
// (shadow-stroke-2) as the ONLY frame — no border. 36px tall / 0.5rem radius to match the medium
// button; the active pill stays concentric (0.375rem) inside the 2px inset.
const CustomTxModalToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>({
  backgroundColor: figVars['bg-5'],
  borderRadius: '0.5rem',
  boxShadow: `inset 0 0 0 1px ${figVars['shadow-stroke-2']}`,
  padding: '2px',
  height: '36px',
  width: '100%',
  // Strip MUI's per-segment border (its ToggleButton root has a 1px divider border — the stray
  // outline on the active pill), negative margins, and merged first/last corner radii so each
  // segment is an independent borderless pill and the group carries the only ring.
  '& .MuiToggleButtonGroup-grouped': {
    margin: 0,
    border: 0,
    borderRadius: '0.375rem',
    '&:not(:first-of-type)': {
      marginLeft: 0,
      borderLeft: 0,
      borderRadius: '0.375rem',
    },
    '&:not(:last-of-type)': {
      borderRadius: '0.375rem',
    },
  },
}) as typeof ToggleButtonGroup;

export function StyledTxModalToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomTxModalToggleGroup {...props} />;
}
