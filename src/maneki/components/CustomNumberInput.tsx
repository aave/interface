import { SxProps, TextField } from '@mui/material';
import { BigNumber } from 'ethers';

import { countDecimals, toWeiString } from '../utils/stringConverter';

interface CustomNumberFormatType {
  amountTo: string;
  setAmountTo: React.Dispatch<React.SetStateAction<string>>;
  balancePAW: string;
  sx?: SxProps;
  inputLabel?: string;
}

function CustomNumberFormat({
  amountTo,
  setAmountTo,
  balancePAW,
  sx,
  inputLabel,
}: CustomNumberFormatType) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const regex = /^(\d+\.?|\.?)\d*$/g;
    const countDec = countDecimals(event.target.value);
    if (regex.test(event.target.value)) {
      if (
        BigNumber.from(toWeiString(event.target.value)).gt(BigNumber.from(toWeiString(balancePAW)))
      ) {
        setAmountTo(balancePAW);
      } else if (countDec > 18) setAmountTo(amountTo);
      else setAmountTo(event.target.value);
    }
  }
  return (
    <TextField
      value={amountTo}
      placeholder="0.00"
      onChange={handleChange}
      variant="outlined"
      label={inputLabel ? inputLabel : ''}
      size="small"
      autoComplete="off"
      sx={{ ...sx }}
    />
  );
}

export default CustomNumberFormat;
