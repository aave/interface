import { Typography, Box } from '@mui/material';

interface ChartLegendProps {
  labels: { text: string; color: string }[];
}

export function ChartLegend({
  labels = [
    { text: 'test', color: '#000' },
    { text: 'bla', color: '#ff0' },
  ],
}: ChartLegendProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 20,
        top: 0,
      }}
    >
      {labels.map((label) => (
        <Box key={label.text} sx={{ display: 'inline-flex', alignItems: 'center', ml: '24px' }}>
          <Box
            sx={{ width: 6, height: 6, bgcolor: label.color, mr: '11px', borderRadius: '50%' }}
          />
          <Typography variant="description" color="text.secondary">
            {label.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
