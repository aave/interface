import { Trans } from '@lingui/macro';
import { Grid, SvgIcon, Typography } from '@mui/material';
import React from 'react';

import { FormInfo } from '../FormItems/FormInfo';
import { FormRow } from '../FormItems/FormRow';
import { FormValue } from '../FormItems/FormValue';
import { Percentage } from '../Percentage';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { HealthFactorNumber } from '../HealthFactorNumber';
import { GasStation } from '../GasStation/GasStation';
import { parseUnits } from 'ethers/lib/utils';
import { IncentivesButton } from '../incentives/IncentivesButton';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';
import { CheckIcon } from '@heroicons/react/outline';

export interface TxModalDetailsProps {
  apy?: string;
  // supplyRewards: SupplyReward[];
  showHf?: boolean;
  healthFactor?: string;
  futureHealthFactor?: string;
  gasLimit?: string;
  incentives?: ReserveIncentiveResponse[];
  symbol?: string;
  usedAsCollateral?: boolean;
}

export const TxModalDetails: React.FC<TxModalDetailsProps> = ({
  apy,
  showHf,
  healthFactor,
  futureHealthFactor,
  gasLimit,
  incentives,
  symbol,
  usedAsCollateral,
}) => {
  return (
    <Grid container direction="row" alignItems="center" rowSpacing={'12px'} sx={{ mb: '24px' }}>
      {apy && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Supply APY</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <Typography variant="description">
              <Percentage value={Number(apy).toFixed(2)} />
            </Typography>
          </FormValue>
        </FormRow>
      )}
      {incentives && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>RewardsAPR</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <IncentivesButton incentives={incentives} symbol={symbol} />
          </FormValue>
        </FormRow>
      )}
      {usedAsCollateral && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Used as collateral</Trans>
            </Typography>
          </FormInfo>
          <FormValue sx={{ display: 'flex', flexDirection: 'row' }}>
            <SvgIcon sx={{ color: 'green' }}>
              <CheckIcon />
            </SvgIcon>
            <Typography variant="description" color={usedAsCollateral ? '#46BC4B' : '#00244D'}>
              <Trans>{usedAsCollateral ? 'Yes' : 'No'}</Trans>
            </Typography>
          </FormValue>
        </FormRow>
      )}
      {showHf && healthFactor && futureHealthFactor && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Health factor</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <Typography variant="secondary14">
              <HealthFactorNumber value={healthFactor} variant="secondary14" />
              <ArrowForwardIcon />
              <HealthFactorNumber
                value={Number(futureHealthFactor) ? futureHealthFactor : healthFactor}
                variant="secondary14"
              />
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
        {gasLimit && (
          <FormValue>
            <GasStation gasLimit={parseUnits(gasLimit, 'wei')} />
          </FormValue>
        )}
      </FormRow>
    </Grid>
  );
};
