import { styled, ToggleButton, ToggleButtonProps } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';
import { darkScheme } from 'src/utils/theme';

// Dimmed inactive label: fg-max at 0.3 opacity in light, full opacity in dark. Shared by the
// resting state and the disabled-not-selected state (which must re-assert it over MUI's default).
const dimmedInactive = {
  color: figVars['fg-max'],
  opacity: 0.3,
  ...darkScheme({ opacity: 1 }),
};

// Active pill: a bg-3 (white) fill with a border-1 ring in light; a bg-5 fill and no ring in dark,
// fg-max label at full opacity. Shared by Mui-selected/focus and disabled-selected (some consumers
// disable the active tab).
const activeFill = {
  opacity: 1,
  color: figVars['fg-max'],
  backgroundColor: figVars['bg-3'],
  boxShadow: `inset 0 0 0 1px ${figVars['border-1']}`,
  ...darkScheme({
    backgroundColor: figVars['bg-5'],
    boxShadow: 'none',
  }),
};

const CustomTxModalToggleButton = styled(ToggleButton)<ToggleButtonProps>({
  border: 0,
  flex: 1,
  height: '100%',
  // Label typography (H5) is owned by each consumer's <Typography variant="h5">.
  ...dimmedInactive,

  // Inactive hover: nudge the opacity up in light; unchanged in dark. Never a background.
  '&:hover': {
    backgroundColor: 'transparent',
    opacity: 0.5,
    ...darkScheme({ opacity: 1 }),
  },

  '&.Mui-selected, &.Mui-focusVisible': activeFill,

  // Active hover: step the fill one shade darker (bg-3 → bg-1 light, bg-5 → bg-6 dark); ring persists.
  '&.Mui-selected:hover': {
    backgroundColor: figVars['bg-1'],
    ...darkScheme({ backgroundColor: figVars['bg-6'] }),
  },

  '&.Mui-disabled:not(.Mui-selected)': dimmedInactive,
  '&.Mui-disabled.Mui-selected': activeFill,
}) as typeof ToggleButton;

export function StyledTxModalToggleButton(props: ToggleButtonProps) {
  return <CustomTxModalToggleButton {...props} />;
}
