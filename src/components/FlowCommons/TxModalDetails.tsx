import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  FormControlLabel,
  GridProps,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';

import { FormInfo } from '../FormItems/FormInfo';
import { FormRow } from '../FormItems/FormRow';
import { FormValue } from '../FormItems/FormValue';
import { HealthFactorNumber } from '../HealthFactorNumber';
import { GasStation } from '../GasStation/GasStation';
import { parseUnits } from 'ethers/lib/utils';
import { IncentivesButton } from '../incentives/IncentivesButton';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';
import { CheckIcon } from '@heroicons/react/outline';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { InterestRate } from '@aave/contract-helpers';
import { TokenIcon } from '../primitives/TokenIcon';
import { Reward } from 'src/helpers/types';
import { RewardsSelect } from '../ClaimRewards/RewardsSelect';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';

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
  rate?: InterestRate;
  underlyingAsset?: string;
  displayAmountAfterRepayInUsd?: string;
  amountAfterRepay?: string;
  allRewards?: Reward[];
  setSelectedReward?: Dispatch<SetStateAction<Reward | undefined>>;
  selectedReward?: Reward;
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
  rate,
  amountAfterRepay,
  displayAmountAfterRepayInUsd,
  allRewards,
  setSelectedReward,
  selectedReward,
  ...props
}) => {
  const [selectedRate, setSelectedRate] = React.useState(InterestRate.Variable);

  const handleRateChange = (rate: InterestRate) => {
    setSelectedRate(rate);
    setInterestRateMode && setInterestRateMode(rate);
  };

  return (
    <Box {...props}>
      {amountAfterRepay && displayAmountAfterRepayInUsd && symbol && (
        <FormRow>
          <FormInfo>
            <Typography>
              <Trans>Remaining debt</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <TokenIcon symbol={symbol} sx={{ mx: '4px' }} />
              <FormattedNumber value={Number(amountAfterRepay)} variant="description" />
              <Typography>{symbol}</Typography>
            </Box>
            <FormattedNumber
              value={Number(displayAmountAfterRepayInUsd)}
              variant="helperText"
              compact
              symbol="USD"
            />
          </FormValue>
        </FormRow>
      )}
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
      {!borrowStableRate && apy && !rate && (
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
      {apy && rate && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>New APY</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <Box sx={{ display: 'flex', flexDirection: 'row' }}>
              <Typography sx={{ mr: '2px' }}>
                {rate === InterestRate.Variable ? <Trans>Variable</Trans> : <Trans>Stable</Trans>}
              </Typography>
              <FormattedNumber value={Number(apy)} percent variant="description" />
            </Box>
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
          <FormValue>
            <SvgIcon sx={{ color: 'success.main', fontSize: 18 }}>
              <CheckIcon />
            </SvgIcon>
            <Typography
              variant="description"
              color={usedAsCollateral ? 'success.main' : 'error.main'}
            >
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
          <Box sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {healthFactor !== '-1' && (
                <HealthFactorNumber value={healthFactor} variant="secondary14" />
              )}
              <SvgIcon color="primary" sx={{ fontSize: 14, mx: 1 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>
              {futureHealthFactor !== '-1' && (
                <HealthFactorNumber
                  value={Number(futureHealthFactor) ? futureHealthFactor : healthFactor}
                  variant="secondary14"
                />
              )}
            </Box>
            <Typography variant="helperText">
              <Trans>Liquidation at</Trans>
              {' <1.0'}
            </Typography>
          </Box>
        </FormRow>
      )}
      {setSelectedReward && selectedReward && allRewards && allRewards.length > 1 && (
        <RewardsSelect
          rewards={allRewards}
          selectedReward={selectedReward}
          setSelectedReward={setSelectedReward}
        />
      )}
      {selectedReward && allRewards && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Balance</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            {selectedReward.symbol !== 'all' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                  <TokenIcon symbol={selectedReward.symbol} sx={{ mx: '4px' }} />
                  <FormattedNumber value={Number(selectedReward.balance)} variant="description" />
                  <Typography>{selectedReward.symbol}</Typography>
                </Box>
                <FormattedNumber
                  value={Number(selectedReward.balanceUsd)}
                  variant="helperText"
                  compact
                  symbol="USD"
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {allRewards
                  .filter((reward) => reward.symbol !== 'all')
                  .map((reward, index) => {
                    return (
                      <Box key={`claim-${index}`} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                          <TokenIcon symbol={reward.symbol} sx={{ mx: '4px' }} />
                          <FormattedNumber value={Number(reward.balance)} variant="description" />
                          <Typography>{reward.symbol}</Typography>
                        </Box>
                        <FormattedNumber
                          value={Number(reward.balanceUsd)}
                          variant="helperText"
                          compact
                          symbol="USD"
                        />
                      </Box>
                    );
                  })}
              </Box>
            )}
          </FormValue>
        </FormRow>
      )}
      {selectedReward && selectedReward.symbol === 'all' && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Total worth</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <FormattedNumber
              value={Number(selectedReward.balanceUsd)}
              variant="helperText"
              compact
              symbol="USD"
            />
          </FormValue>
        </FormRow>
      )}
      {gasLimit && (
        <FormRow>
          <FormInfo>
            <Typography variant="description">
              <Trans>Estimated Tx cost</Trans>
            </Typography>
          </FormInfo>
          <FormValue>
            <GasStation gasLimit={parseUnits(gasLimit, 'wei')} />
          </FormValue>
        </FormRow>
      )}
    </Box>
  );
};
