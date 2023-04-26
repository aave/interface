import { Box, Button, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import NumberFormat from 'react-number-format';

import { countDecimals } from '../ManageUtils';

interface CustomNumberFormatType {
  amountTo: string;
  setAmountTo: React.Dispatch<React.SetStateAction<string>>;
  balancePAW: string;
  style?: React.CSSProperties;
}

function CustomNumberFormat({ amountTo, setAmountTo, balancePAW, style }: CustomNumberFormatType) {
  return (
    <NumberFormat
      value={amountTo}
      thousandSeparator
      isNumericString={true}
      allowNegative={false}
      isAllowed={(values) => {
        if (countDecimals(values.value) > 18 || parseFloat(values.value) > parseFloat(balancePAW))
          return false;
        return true;
      }}
      onValueChange={(values) => {
        const countDec = countDecimals(values.value);
        if (countDec > 18) values.value = amountTo;
        setAmountTo(values.value);
      }}
      style={style}
    />
  );
}

interface ManageQuickContentWrapperProps {
  svgIcon?: ReactNode;
  title: string;
  aprValue: string;
  descriptions: string[];
  balancePAW: string;
  amountTo: string;
  setAmountTo: React.Dispatch<React.SetStateAction<string>>;
  handleClick: () => void;
  buttonText: string;
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
}: ManageQuickContentWrapperProps) {
  return (
    <Paper
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        padding: '32px',
        boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 3px 0px',
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
          sx={{
            display: 'flex',
            gap: '8px',
            padding: '12px',
            border: '1px solid rgb(68, 73, 92)',
            borderRadius: '12px',
            bgcolor: 'rgba(247, 147, 26, 0.1)',
          }}
        >
          <Typography fontWeight={600} fontSize={12}>
            APR
          </Typography>
          <Typography fontWeight={800} fontSize={16}>
            {aprValue} %
          </Typography>
        </Box>
      </Box>
      {descriptions.map((description, i) => (
        <Typography key={i} fontWeight={600} fontSize={'14px'}>
          {description}
        </Typography>
      ))}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography fontSize={16} fontWeight={500}>
          Wallet Balance :
        </Typography>
        <Typography fontSize={16} fontWeight={600}>
          {balancePAW} PAW
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <CustomNumberFormat
          amountTo={amountTo}
          setAmountTo={setAmountTo}
          balancePAW={balancePAW}
          style={{
            padding: '12px 16px',
            border: 'solid 1px #dadada',
            fontSize: '16px',
            borderRadius: '8px',
          }}
        />
        <Button onClick={handleClick} variant="contained" sx={{ padding: '0px 24px' }}>
          {buttonText}
        </Button>
      </Box>
    </Paper>
  );
}
