import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import React from 'react';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import CustomNumberInput from 'src/maneki/components/CustomNumberInput';

interface ManageQuickContentWrapperProps {
  svgIcon?: ReactNode;
  title: string;
  aprValue: string;
  descriptions: ReactNode[];
  balancePAW: string;
  amountTo: string;
  setAmountTo: React.Dispatch<React.SetStateAction<string>>;
  handleClick: () => void;
  buttonText: string;
  inputLabel?: string;
}

export default function ManageQuickContentWrapper({
  svgIcon,
  title,
  aprValue,
  descriptions,
  balancePAW,
  amountTo,
  setAmountTo,
  handleClick,
  buttonText,
  inputLabel,
}: ManageQuickContentWrapperProps) {
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        boxShadow: `0px 10px 30px 10px ${theme.palette.shadow.dashboard}`,
        borderRadius: '14px',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', gap: '12px' }}>
          {svgIcon}
          <Typography variant="h3" fontWeight={'700'}>
            {title}
          </Typography>
        </Box>
        <Box
          sx={(theme) => ({
            display: 'flex',
            gap: '8px',
            padding: '12px',
            border: '1px solid rgb(68, 73, 92)',
            borderRadius: '12px',
            bgcolor: theme.palette.mode === 'light' ? 'rgba(247, 147, 26, 0.1)' : 'transparent',
          })}
        >
          <Typography fontWeight={600} fontSize={12}>
            APR
          </Typography>
          <FormattedNumber value={aprValue} percent sx={{ fontWeight: 800, fontSize: 16 }} />
        </Box>
      </Box>
      {descriptions.map((description, i) => (
        <Typography key={i} fontWeight={500} fontSize={'14px'}>
          {description}
        </Typography>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontSize={16} fontWeight={500}>
          <Trans>Wallet Balance</Trans> :
        </Typography>
        <FormattedNumber value={balancePAW} sx={{ fontWeight: 500, fontSize: 16 }} symbol="PAW" />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: downToSM ? 'column' : 'row',
          gap: downToSM ? '8px' : 'auto',
        }}
      >
        <CustomNumberInput
          amountTo={amountTo}
          setAmountTo={setAmountTo}
          tokenBalance={balancePAW}
          inputLabel={inputLabel}
          sx={{
            '& .MuiOutlinedInput-root.Mui-focused': {
              '& > fieldset': {
                borderColor: 'orange',
              },
            },
          }}
        />
        <Button
          onClick={handleClick}
          variant="contained"
          sx={{ padding: downToSM ? '8px 24px' : '0px 24px', color: 'background.default' }}
        >
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );
}
