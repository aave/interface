import { Stack, Typography } from '@mui/material';

import { Paper } from './styles';

export default function InfoCard({ title, extra }: { title: string; extra?: string }) {
  return (
    <Paper>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="h6">{title}</Typography>
        {extra && <Typography color="text.secondary">{extra}</Typography>}
      </Stack>

      <Typography mt={4} color="#E0E0E0">
        Nothing supplied yet
      </Typography>
    </Paper>
  );
}
