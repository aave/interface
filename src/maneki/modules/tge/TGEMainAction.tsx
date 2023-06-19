import { Divider, Paper, useMediaQuery, useTheme } from '@mui/material';

import TGEMainContribution from './components/TGEMainContribution';
import TGEMainParticipation from './components/TGEMainParticipation';

const TGEMainAction = () => {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: downToSM ? 'column' : 'row',
        justifyContent: 'space-around',
        gap: downToSM ? '24px' : '0px',
        alignItems: downToSM ? 'center' : 'normal',
        boxShadow: '0px 10px 30px 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
        p: downToSM ? '24px 0px' : '46px',
      }}
    >
      <TGEMainContribution />
      <Divider
        sx={(theme) => ({
          border: `1px solid ${theme.palette.divider}`,
          m: downToSM ? 'auto' : '24px 0px',
          width: downToSM ? '85%' : '',
        })}
      />

      <TGEMainParticipation />
    </Paper>
  );
};

export default TGEMainAction;
