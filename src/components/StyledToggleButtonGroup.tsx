import { styled, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';

const CustomToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>({
  backgroundColor: '#383D51',
  border: '1px solid rgba(235, 235, 237, 0.12)',
  padding: '4px',
}) as typeof ToggleButtonGroup;

export default function StyledToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomToggleGroup {...props} />;
}
