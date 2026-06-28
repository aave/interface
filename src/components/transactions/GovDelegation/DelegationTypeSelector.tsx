import { DelegationType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import React, { useEffect } from 'react';
import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';

export type DelegationTypeSelectorProps = {
  delegationType: DelegationType;
  setDelegationType: React.Dispatch<React.SetStateAction<DelegationType>>;
};

export const DelegationTypeSelector = ({
  delegationType,
  setDelegationType,
}: DelegationTypeSelectorProps) => {
  useEffect(() => {
    setDelegationType(DelegationType.ALL);
  }, [setDelegationType]);

  return (
    <StyledTxModalToggleGroup
      value={delegationType}
      exclusive
      onChange={(_, value) => setDelegationType(value)}
    >
      <StyledTxModalToggleButton
        value={DelegationType.ALL}
        disabled={delegationType === DelegationType.ALL}
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
        value={DelegationType.PROPOSITION}
        disabled={delegationType === DelegationType.PROPOSITION}
      >
        <Typography variant="buttonM">
          <Trans>Proposition</Trans>
        </Typography>
      </StyledTxModalToggleButton>
    </StyledTxModalToggleGroup>
  );
};
