import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  FormControlLabel,
  Grid,
  GridProps,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';

import { FormInfo } from '../FormItems/FormInfo';
import { FormRow } from '../FormItems/FormRow';
import { FormValue } from '../FormItems/FormValue';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { HealthFactorNumber } from '../HealthFactorNumber';
import { GasStation } from '../GasStation/GasStation';
import { parseUnits } from 'ethers/lib/utils';
import { IncentivesButton } from '../incentives/IncentivesButton';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';
import { CheckIcon } from '@heroicons/react/outline';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { InterestRate } from '@aave/contract-helpers';

export interface TxModalDetailsProps extends GridProps {
  apy?: string;
  // supplyRewards: SupplyReward[];
  showHf?: boolean;
  healthFactor?: string;
  futureHealthFactor?: string;
  gasLimit?: string;
  incentives?: ReserveIncentiveResponse[];
  stableRateIncentives?: ReserveIncentiveResponse[];
  symbol?: string;
  usedAsCollateral?: boolean;
  setActionUnWrapped?: Dispatch<SetStateAction<boolean>>;
  setInterestRateMode?: Dispatch<SetStateAction<InterestRate>>;
  borrowStableRate?: string;
  action?: string;
  actionUnWrapped?: boolean;
  walletBalance?: string;
  unWrappedSymbol?: string;
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
  setActionUnWrapped,
  actionUnWrapped,
  borrowStableRate,
  stableRateIncentives,
  setInterestRateMode,
  action,
  walletBalance,
  unWrappedSymbol,
  ...props
}) => {
  const [selectedRate, setSelectedRate] = React.useState(InterestRate.Variable);

  const handleRateChange = (rate: InterestRate) => {
    setSelectedRate(rate);
    setInterestRateMode && setInterestRateMode(rate);
  };

  return (
    <Grid container direction="row" alignItems="center" rowSpacing={'12px'} {...props}>
      {symbol && setInterestRateMode && borrowStableRate && apy && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Borrow APY rate</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <Box>
              {selectedRate === InterestRate.Variable && (
                <SvgIcon>
                  <CheckIcon />
                </SvgIcon>
              )}
              <Button variant="text" onClick={() => handleRateChange(InterestRate.Variable)}>
                Variable <FormattedNumber value={Number(apy)} percent variant="description" />
              </Button>
            </Box>
            <Box>
              {selectedRate === InterestRate.Stable && (
                <SvgIcon>
                  <CheckIcon />
                </SvgIcon>
              )}
              <Button variant="text" onClick={() => handleRateChange(InterestRate.Stable)}>
                Stable{' '}
                <FormattedNumber value={Number(borrowStableRate)} percent variant="description" />
              </Button>
            </Box>
          </FormValue>
        </FormRow>
      )}
      {!borrowStableRate && apy && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Borrow APY rate</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <FormattedNumber value={Number(apy)} percent variant="description" />
          </FormValue>
        </FormRow>
      )}
      {setActionUnWrapped && symbol && unWrappedSymbol && (
        <FormRow>
          <FormControlLabel
            value="darkmode"
            control={
              <Switch
                disableRipple
                checked={actionUnWrapped}
                onClick={() => setActionUnWrapped(!actionUnWrapped)}
              />
            }
            labelPlacement="end"
            label={''}
          />
          <Typography>{`Unwrap ${symbol} (to withdraw ${unWrappedSymbol})`}</Typography>
          <FormInfo />
        </FormRow>
      )}
      {apy && action && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>{action} APY</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <FormattedNumber value={Number(apy)} percent variant="description" />
          </FormValue>
        </FormRow>
      )}
      {incentives && symbol && !stableRateIncentives && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Rewards APR</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <IncentivesButton incentives={incentives} symbol={symbol} />
          </FormValue>
        </FormRow>
      )}
      {incentives &&
        stableRateIncentives &&
        symbol &&
        setInterestRateMode &&
        borrowStableRate &&
        apy && (
          <FormRow>
            <FormInfo>
              <Typography variant="description">
                <Trans>Rewards APR</Trans>
              </Typography>
            </FormInfo>
            <FormValue>
              {selectedRate === InterestRate.Variable ? (
                <IncentivesButton incentives={incentives} symbol={symbol} />
              ) : (
                <IncentivesButton incentives={stableRateIncentives} symbol={symbol} />
              )}
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
      {walletBalance && symbol && (
        <FormRow>
          <FormInfo>
            <Typography>
              <Trans>Supply balance</Trans>
            </Typography>
          </FormInfo>
          <FormValue>{walletBalance}</FormValue>
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
          <FormValue xs={4}>
            <GasStation gasLimit={parseUnits(gasLimit, 'wei')} />
          </FormValue>
        )}
      </FormRow>
    </Grid>
  );
};
