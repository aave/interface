import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import StyledToggleButton from 'src/components/StyledToggleButton';
import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
import { DelegationType } from 'src/helpers/types';

export type DelegationTypeSelectorProps = {
  delegationType: DelegationType;
  setDelegationType: React.Dispatch<React.SetStateAction<DelegationType>>;
};

export const DelegationTypeSelector = ({
  delegationType,
  setDelegationType,
}: DelegationTypeSelectorProps) => {
  useEffect(() => {
    setDelegationType(DelegationType.BOTH);
  }, [setDelegationType]);

  return (
    <StyledToggleButtonGroup
      color="primary"
      value={delegationType}
      exclusive
      onChange={(_, value) => setDelegationType(value)}
      sx={{ width: '100%', height: '36px', p: '2px' }}
    >
      <StyledToggleButton
        value={DelegationType.BOTH}
        disabled={delegationType === DelegationType.BOTH}
      >
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          <Trans>Both</Trans>
        </Typography>
      </StyledToggleButton>

      <StyledToggleButton
        value={DelegationType.VOTING}
        disabled={delegationType === DelegationType.VOTING}
      >
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          <Trans>Voting</Trans>
        </Typography>
      </StyledToggleButton>

      <StyledToggleButton
        value={DelegationType.PROPOSITION_POWER}
        disabled={delegationType === DelegationType.PROPOSITION_POWER}
      >
        <Typography variant="subheader1" sx={{ mr: 1 }}>
          <Trans>Proposition</Trans>
        </Typography>
      </StyledToggleButton>
    </StyledToggleButtonGroup>
  );
};
