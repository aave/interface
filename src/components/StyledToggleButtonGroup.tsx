import { styled, ToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material';

const CustomToggleGroup = styled(ToggleButtonGroup)<ToggleButtonGroupProps>(({ theme }) => ({
  backgroundColor: theme.palette.background.surface,
  border: '1px solid rgba(235, 235, 237, 0.12)',
  padding: '4px',
  boxShadow: `0px 10px 30px 10px ${theme.palette.shadow.dashboard}`,
})) as typeof ToggleButtonGroup;

export default function StyledToggleGroup(props: ToggleButtonGroupProps) {
  return <CustomToggleGroup {...props} />;
}
