import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
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
    <StyledTxModalToggleGroup
      value={delegationType}
      exclusive
      onChange={(_, value) => setDelegationType(value)}
    >
      <StyledTxModalToggleButton
        value={DelegationType.BOTH}
        disabled={delegationType === DelegationType.BOTH}
      >
        <Typography variant="buttonM">
          <Trans>Both</Trans>
        </Typography>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton
        value={DelegationType.VOTING}
        disabled={delegationType === DelegationType.VOTING}
      >
        <Typography variant="buttonM">
          <Trans>Voting</Trans>
        </Typography>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton
        value={DelegationType.PROPOSITION_POWER}
        disabled={delegationType === DelegationType.PROPOSITION_POWER}
      >
        <Typography variant="buttonM">
          <Trans>Proposition</Trans>
        </Typography>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  );
};
