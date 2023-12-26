import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
import { GovernancePowerTypeApp } from 'src/helpers/types';

export type DelegationTypeSelectorProps = {
  delegationType: GovernancePowerTypeApp;
  setDelegationType: React.Dispatch<React.SetStateAction<GovernancePowerTypeApp>>;
};

export const DelegationTypeSelector = ({
  delegationType,
  setDelegationType,
}: DelegationTypeSelectorProps) => {
  useEffect(() => {
    setDelegationType(GovernancePowerTypeApp.ALL);
  }, [setDelegationType]);

  return (
    <StyledTxModalToggleGroup
      value={delegationType}
      exclusive
      onChange={(_, value) => setDelegationType(value)}
    >
      <StyledTxModalToggleButton
        value={GovernancePowerTypeApp.ALL}
        disabled={delegationType === GovernancePowerTypeApp.ALL}
      >
        <Typography variant="buttonM">
          <Trans>Both</Trans>
        </Typography>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton
        value={GovernancePowerTypeApp.VOTING}
        disabled={delegationType === GovernancePowerTypeApp.VOTING}
      >
        <Typography variant="buttonM">
          <Trans>Voting</Trans>
        </Typography>
      </StyledTxModalToggleButton>

      <StyledTxModalToggleButton
        value={GovernancePowerTypeApp.PROPOSITION}
        disabled={delegationType === GovernancePowerTypeApp.PROPOSITION}
      >
        <Typography variant="buttonM">
          <Trans>Proposition</Trans>
        </Typography>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  );
};
