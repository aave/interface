import { Trans } from '@lingui/macro';
import { Box, Grid, Typography } from '@mui/material';
import React from 'react';

import { FormInfo } from '../FormItems/FormInfo';
import { FormRow } from '../FormItems/FormRow';
import { FormValue } from '../FormItems/FormValue';
import { Percentage } from '../Percentage';
// import { TokenIcon } from '../../components/TokenIcon';

export interface SupplyReward {
  tokenIcon: string;
  apy: string;
  tokenName: string;
}
export interface SupplyDetailsProps {
  supplyApy: string;
  // supplyRewards: SupplyReward[];
  healthFactor: string;
}

// export const SupplyRewards: React.FC<{ supplyRewards: SupplyReward[] }> = ({ supplyRewards }) => (
//   <>
//     {supplyRewards.map((x) => (
//       <Box key={x.tokenIcon} sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
//         <TokenIcon symbol={x.tokenIcon} sx={{ width: 16, height: 16 }} />
//         <Percentage value={x.apy} />
//         <Typography> {` ${x.tokenName}`}</Typography>
//       </Box>
//     ))}
//   </>
// );

export const SupplyDetails: React.FC<SupplyDetailsProps> = ({
  supplyApy,
  // supplyRewards,
  healthFactor,
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
            <Percentage value={supplyApy} />
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
      <FormRow>
        <FormInfo>
          <Typography variant="description">
            <Trans>Health factor</Trans>
          </Typography>
        </FormInfo>
        <FormValue>
          <Typography variant="secondary14">{healthFactor === -1 ? healthFactor : '-'}</Typography>
          <Typography variant="helperText">
            <Trans>Liquidation at</Trans>
            {' <1.0'}
          </Typography>
        </FormValue>
      </FormRow>
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
