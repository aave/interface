import { Box, Typography } from '@mui/material';
import { EModeIcon } from 'src/components/icons/EModeIcon';

interface ConfigLabelProps {
  label: string;
  isEMode: boolean;
  noWrap?: boolean;
}

export const ConfigLabel = ({ label, isEMode, noWrap = false }: ConfigLabelProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
    <Typography variant="h5" noWrap={noWrap} sx={{ minWidth: 0 }}>
      {label}
    </Typography>
    {isEMode && <EModeIcon />}
  </Box>
);
