import { Box, FormControlLabel, Switch } from '@mui/material';
import * as React from 'react';

interface MaxApprovalSwitchProps {
  currentMethod: boolean;
  setMethod: (maxApproval: boolean) => void;
  allowToSwitch: boolean;
}

export const MaxApprovalSwitch = ({
  currentMethod,
  setMethod,
  allowToSwitch,
}: MaxApprovalSwitchProps) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'end', color: 'info.main' }}>
        <FormControlLabel
          sx={{ mr: 0 }}
          value="approveMax"
          control={
            <Switch
              disableRipple
              onClick={() => {
                allowToSwitch && setMethod(!currentMethod);
              }}
              checked={currentMethod}
              sx={{ '.MuiSwitch-track': { bgcolor: { xs: '#FFFFFF1F', md: 'primary.light' } } }}
            />
          }
          label={currentMethod ? 'Yes' : 'No'}
          labelPlacement="start"
        />
      </Box>
    </>
  );
};
