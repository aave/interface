import { Trans } from '@lingui/macro';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { FormInfo } from '../FormItems/FormInfo';
import { FormRow } from '../FormItems/FormRow';
import { FormValue } from '../FormItems/FormValue';
import { Percentage } from '../Percentage';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export interface SupplyReward {
  tokenIcon: string;
  apy: string;
  tokenName: string;
}
export interface SupplyDetailsProps {
  supplyApy: string;
  // supplyRewards: SupplyReward[];
  showHf: boolean;
  healthFactor: string;
  futureHealthFactor: string;
}

export const SupplyDetails: React.FC<SupplyDetailsProps> = ({
  supplyApy,
  // supplyRewards,
  showHf,
  healthFactor,
  futureHealthFactor,
}) => {
  return (
    <Grid container direction="row" alignItems="center" rowSpacing={'12px'} sx={{ mb: '24px' }}>
      <FormRow>
        <FormInfo>
          <Typography variant="description">
            <Trans>Supply APY</Trans>
          </Typography>
        </FormInfo>
        <FormValue>
          <Typography variant="description">
            <Percentage value={Number(supplyApy).toFixed(2)} />
          </Typography>
        </FormValue>
      </FormRow>
      <FormRow>
        <FormInfo>
          <Typography variant="description">
            <Trans>RewardsAPR</Trans>
          </Typography>
        </FormInfo>
        <FormValue>{/* <SupplyRewards supplyRewards={supplyRewards} /> */}</FormValue>
      </FormRow>
      {showHf && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Health factor</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <Typography variant="secondary14">
              {healthFactor}
              <ArrowForwardIcon />
              {futureHealthFactor}
            </Typography>
            <Typography variant="helperText">
              <Trans>Liquidation at</Trans>
              {' <1.0'}
            </Typography>
          </FormValue>
        </FormRow>
      )}
      <FormRow>
        <FormInfo>
          <Typography variant="description">
            <Trans>Estimated Tx cost</Trans>
          </Typography>
        </FormInfo>
      </FormRow>
    </Grid>
  );
};
