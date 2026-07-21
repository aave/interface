import { styled, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';
import { figVars } from 'src/utils/figmaColors';

const CustomToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>({
  backgroundColor: '#383D51',
  border: '1px solid rgba(235, 235, 237, 0.12)',
  padding: '4px',
}) as typeof ToggleButtonGroup;

const CustomTxModalToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>({
  backgroundColor: figVars['bg-1'],
  padding: '2px',
  height: '36px',
  width: '100%',
}) as typeof ToggleButtonGroup;

export function StyledTxModalToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomTxModalToggleGroup {...props} />;
}

export default function StyledToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomToggleGroup {...props} />;
}
