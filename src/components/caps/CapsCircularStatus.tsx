import CircularProgress, {
  circularProgressClasses,
  CircularProgressProps,
} from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const CapsCircularStatus = (props: CircularProgressProps & { value: number }) => {
  // Protect when dividing by zero
  if (props.value === Infinity) return null;

  const determineColor = (): 'error' | 'warning' | 'success' => {
    if (Math.round(props.value) >= 100) {
      return 'error';
    } else if (props.value >= 80) {
      return 'warning';
    } else {
      return 'success';
    }
  };

  const determineValueDisplay = (): string => {
    if (props.value >= 100) {
      return '100%';
    } else if (props.value === 0) {
      return 'N/A';
    } else if (props.value < 0.01) {
      return '<0.01%';
    } else {
      return `${props.value.toFixed(2)}%`;
    }
  };

  return (
    <Box sx={{ position: 'relative', mr: 4 }}>
      <CircularProgress
        variant="determinate"
        sx={{
          color: (theme) => theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800],
          position: 'absolute',
          left: 1.25,
          top: 1.25,
        }}
        size={77.5}
        thickness={2.5}
        value={100}
      />
      <CircularProgress
        variant="determinate"
        disableShrink
        color={determineColor()}
        sx={{
          [`& .${circularProgressClasses.circle}`]: {
            strokeLinecap: 'round',
          },
        }}
        size={80}
        thickness={4}
        {...props}
        // We show at minium, 2% color to represent small values
        value={props.value <= 2 ? 2 : props.value}
      />
      <Typography
        variant="secondary14"
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {determineValueDisplay()}
      </Typography>
    </Box>
  );
};
