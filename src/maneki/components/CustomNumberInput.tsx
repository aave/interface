import { SxProps, TextField } from '@mui/material';
import { BigNumber } from 'ethers';

import { countDecimals, toWeiString } from '../utils/stringConverter';

interface CustomNumberInputType {
  amountTo: string;
  setAmountTo: React.Dispatch<React.SetStateAction<string>>;
  tokenBalance: string;
  sx?: SxProps;
  inputLabel?: string;
}

function CustomNumberInput({
  amountTo,
  setAmountTo,
  tokenBalance,
  sx,
  inputLabel,
}: CustomNumberInputType) {
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const regex = /^(\d+\.?|\.?)\d*$/g;
    const countDec = countDecimals(event.target.value);
    if (regex.test(event.target.value)) {
      if (
        BigNumber.from(toWeiString(event.target.value)).gt(
          BigNumber.from(toWeiString(tokenBalance))
        )
      ) {
        setAmountTo(tokenBalance);
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

export default CustomNumberInput;
