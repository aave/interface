import { Box, Typography } from '@mui/material';

interface GraphLegendProps {
  labels: { text: string; color: string }[];
}

export function GraphLegend({
  labels = [
    { text: 'test', color: '#000' },
    { text: 'bla', color: '#ff0' },
  ],
}: GraphLegendProps) {
  return (
    <Box>
      {labels.map((label) => (
        <Box key={label.text} sx={{ display: 'inline-flex', alignItems: 'center', mr: 6 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              backgroundColor: label.color,
              mr: 2,
              borderRadius: '50%',
            }}
          />
          <Typography variant="detail2" color="text.primary">
            {label.text}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
