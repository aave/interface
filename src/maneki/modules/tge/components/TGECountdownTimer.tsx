import { Box, Typography } from '@mui/material';
import { useCountdown } from 'src/maneki/utils/useCountdown';

const TGECountdownTimer = ({ targetDate, status }: { targetDate: number; status: string }) => {
  const [days, hours, minutes, seconds] = useCountdown(targetDate);

  return (
    <Box>
      <Typography
        variant="h3"
        sx={{
          fontWeight: '400',
          fontSize: '16px',
          lineHeight: '21px',
          mb: '12px',
        }}
      >
        Participation {status}
      </Typography>
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <DatetimeDisplay value={days < 0 ? 0 : days} type={'days'} />
        <Typography sx={{ fontWeight: '500', fontSize: '20px' }}>:</Typography>
        <DatetimeDisplay value={hours < 0 ? 0 : hours} type={'hours'} />
        <Typography sx={{ fontWeight: '500', fontSize: '20px' }}>:</Typography>
        <DatetimeDisplay value={minutes < 0 ? 0 : minutes} type={'min'} />
        <Typography sx={{ fontWeight: '500', fontSize: '20px' }}>:</Typography>
        <DatetimeDisplay value={seconds < 0 ? 0 : seconds} type={'sec'} />
      </Box>
    </Box>
  );
};

interface DatetimeDisplayType {
  value: number;
  type: string;
}

const DatetimeDisplay = ({ value, type }: DatetimeDisplayType) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography sx={{ fontWeight: '500', fontSize: '22px' }}>{value}</Typography>
      <Typography sx={{ color: 'text.custom1' }}>{type}</Typography>
    </Box>
  );
};

export default TGECountdownTimer;
