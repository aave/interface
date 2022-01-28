import { Trans } from '@lingui/macro';
import { Box, Grid, Typography } from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React from 'react';
import { GasStation } from 'src/components/GasStation/GasStation';

import { FormInfo } from '../../components/FormItems/FormInfo';
import { FormRow } from '../../components/FormItems/FormRow';
import { FormValue } from '../../components/FormItems/FormValue';
import { Percentage } from '../../components/Percentage';
import { TokenIcon } from '../../components/primitives/TokenIcon';

export interface SupplyReward {
  tokenIcon: string;
  apy: string;
  tokenName: string;
}
export interface SupplyDetailsProps {
  supplyApy: string;
  supplyRewards: SupplyReward[];
  healthFactor: string;
}

export const SupplyRewards: React.FC<{ supplyRewards: SupplyReward[] }> = ({ supplyRewards }) => (
  <>
    {supplyRewards.map((x) => (
      <Box key={x.tokenIcon} sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <TokenIcon symbol={x.tokenIcon} sx={{ width: 16, height: 16 }} />
        <Percentage value={x.apy} />
        <Typography> {` ${x.tokenName}`}</Typography>
      </Box>
    ))}
  </>
);

export const SupplyDetails: React.FC<SupplyDetailsProps> = ({
  supplyApy,
  supplyRewards,
  healthFactor,
}) => {
  return (
    <Grid container direction="row" alignItems="center" rowSpacing={'12px'}>
      <FormRow>
        <FormInfo>
          <Trans component={Typography}>Supply APY</Trans>
        </FormInfo>
        <FormValue>
          <Box>
            <Percentage value={supplyApy} />
          </Box>
        </FormValue>
      </FormRow>
      <FormRow>
        <FormInfo>
          <Trans component={Typography}>Supply reward</Trans>
        </FormInfo>
        <FormValue>
          <SupplyRewards supplyRewards={supplyRewards} />
        </FormValue>
      </FormRow>
      <FormRow>
        <FormInfo>
          <Trans component={Typography}>Health factor</Trans>
        </FormInfo>
        <FormValue>
          <Typography component={Box} sx={{ width: 'max-content' }}>
            {healthFactor}
          </Typography>
          <Typography component={Box}>
            <Trans component={Typography}>Liquidation at</Trans>
            {' <1.0'}
          </Typography>
        </FormValue>
      </FormRow>
      <FormRow>
        <FormInfo>
          <Trans>Estimated Gas Costs</Trans>
        </FormInfo>
        <FormValue>
          <GasStation gasLimit={parseUnits('220000', 'wei')} />
        </FormValue>
      </FormRow>
    </Grid>
  );
};
