import { InterestRate } from '@aave/contract-helpers';
import { CheckIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon, LightningBoltIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import {
  Box,
  FormControlLabel,
  SvgIcon,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { parseUnits } from 'ethers/lib/utils';
import React, { Dispatch, SetStateAction } from 'react';
import { Reward } from 'src/helpers/types';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';

import { HealthFactorNumber } from '../../HealthFactorNumber';
import { IncentivesButton } from '../../incentives/IncentivesButton';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { NoData } from '../../primitives/NoData';
import { Row } from '../../primitives/Row';
import { TokenIcon } from '../../primitives/TokenIcon';
import { RewardsSelect } from '../ClaimRewards/RewardsSelect';
import { GasStation } from '../GasStation/GasStation';

export interface TxModalDetailsProps {
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
  faucetAmount?: string;
  selectedEmode?: number;
  selectedEmodeLabel?: string;
  emodeAssets?: string[];
  votingPower?: string;
  stakeAPR?: string;
  stakeRewards?: string;
  stakeRewardsInUsd?: string;
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
  faucetAmount,
  selectedEmode,
  selectedEmodeLabel,
  emodeAssets,
  votingPower,
  stakeAPR,
  stakeRewardsInUsd,
  stakeRewards,
}) => {
  const [selectedRate, setSelectedRate] = React.useState(InterestRate.Variable);

  const handleRateChange = (rate: InterestRate) => {
    setSelectedRate(rate);
    setInterestRateMode && setInterestRateMode(rate);
  };

  return (
    <Box sx={{ pt: 5 }}>
      {setSelectedReward && selectedReward && allRewards && allRewards.length > 1 && (
        <RewardsSelect
          rewards={allRewards}
          selectedReward={selectedReward}
          setSelectedReward={setSelectedReward}
        />
      )}

      <Typography sx={{ mb: 1 }} color="text.secondary">
        <Trans>Transaction overview</Trans>
      </Typography>

      <Box
        sx={(theme) => ({
          p: 3,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
          '.MuiBox-root:last-of-type': {
            mb: 0,
          },
        })}
      >
        {votingPower && (
          <Row caption={<Trans>Voting power</Trans>} captionVariant="description" mb={4}>
            <FormattedNumber value={Number(votingPower)} variant="secondary14" />
          </Row>
        )}
        {amountAfterRepay && displayAmountAfterRepayInUsd && symbol && (
          <Row
            caption={<Trans>Remaining debt</Trans>}
            captionVariant="description"
            mb={4}
            align="flex-start"
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TokenIcon symbol={symbol} sx={{ mr: 1, fontSize: '16px' }} />
                <FormattedNumber value={Number(amountAfterRepay)} variant="secondary14" />
                <Typography ml={1} variant="secondary14">
                  {symbol}
                </Typography>
              </Box>

              <FormattedNumber
                value={Number(displayAmountAfterRepayInUsd)}
                variant="helperText"
                compact
                symbol="USD"
              />
            </Box>
          </Row>
        )}

        {symbol && setInterestRateMode && borrowStableRate && apy && (
          <Row
            caption={<Trans>Borrow APY rate</Trans>}
            captionVariant="description"
            mb={6}
            flexDirection="column"
            align="flex-start"
          >
            <ToggleButtonGroup
              color="primary"
              value={selectedRate}
              exclusive
              onChange={(_, value) => handleRateChange(value)}
              sx={{ width: '100%', mt: 0.5 }}
            >
              <ToggleButton
                value={InterestRate.Variable}
                disabled={selectedRate === InterestRate.Variable}
              >
                {selectedRate === InterestRate.Variable && (
                  <SvgIcon sx={{ fontSize: '20px', mr: '2.5px' }}>
                    <CheckIcon />
                  </SvgIcon>
                )}
                <Typography variant="subheader1" sx={{ mr: 1 }}>
                  <Trans>Variable</Trans>
                </Typography>
                <FormattedNumber value={Number(apy)} percent variant="secondary14" />
              </ToggleButton>
              <ToggleButton
                value={InterestRate.Stable}
                disabled={selectedRate === InterestRate.Stable}
              >
                {selectedRate === InterestRate.Stable && (
                  <SvgIcon sx={{ fontSize: '20px', mr: '2.5px' }}>
                    <CheckIcon />
                  </SvgIcon>
                )}
                <Typography variant="subheader1" sx={{ mr: 1 }}>
                  <Trans>Stable</Trans>
                </Typography>
                <FormattedNumber value={Number(borrowStableRate)} percent variant="secondary14" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Row>
        )}

        {!borrowStableRate && apy && !rate && action !== 'Supply' && (
          <Row caption={<Trans>Borrow APY, variable</Trans>} captionVariant="description" mb={4}>
            <FormattedNumber value={Number(apy)} percent variant="secondary14" />
          </Row>
        )}

        {setActionUnWrapped && symbol && unWrappedSymbol && (
          <Row captionVariant="description" mb={4}>
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
          </Row>
        )}

        {apy && action && action !== 'Borrow' && (
          <Row caption={<Trans>{action} APY</Trans>} captionVariant="description" mb={4}>
            <FormattedNumber value={Number(apy)} percent variant="secondary14" />
          </Row>
        )}

        {apy && rate && (
          <Row caption={<Trans>New APY</Trans>} captionVariant="description" mb={4}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ mr: 1 }}>
                {rate === InterestRate.Variable ? <Trans>Variable</Trans> : <Trans>Stable</Trans>}
              </Typography>
              <FormattedNumber value={Number(apy)} percent variant="secondary14" />
            </Box>
          </Row>
        )}

        {!!incentives?.length && symbol && !stableRateIncentives && (
          <Row
            caption={<Trans>Rewards APR</Trans>}
            captionVariant="description"
            mb={4}
            minHeight={24}
          >
            <IncentivesButton incentives={incentives} symbol={symbol} />
          </Row>
        )}

        {!!incentives?.length &&
          stableRateIncentives &&
          symbol &&
          setInterestRateMode &&
          borrowStableRate &&
          apy && (
            <Row
              caption={<Trans>Rewards APR</Trans>}
              captionVariant="description"
              mb={4}
              minHeight={24}
            >
              <>
                {selectedRate === InterestRate.Variable ? (
                  <IncentivesButton incentives={incentives} symbol={symbol} />
                ) : (
                  <IncentivesButton incentives={stableRateIncentives} symbol={symbol} />
                )}
              </>
            </Row>
          )}

        {typeof usedAsCollateral !== 'undefined' && (
          <Row caption={<Trans>Used as collateral</Trans>} captionVariant="description" mb={4}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              {usedAsCollateral && (
                <SvgIcon sx={{ color: 'success.main', fontSize: 16, mr: '2px' }}>
                  <CheckIcon />
                </SvgIcon>
              )}

              <Typography
                variant="description"
                color={usedAsCollateral ? 'success.main' : 'error.main'}
              >
                <Trans>{usedAsCollateral ? 'Yes' : 'No'}</Trans>
              </Typography>
            </Box>
          </Row>
        )}

        {walletBalance && symbol && (
          <Row caption={<Trans>Supply balance</Trans>} captionVariant="description" mb={4}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              <TokenIcon symbol={symbol} sx={{ mr: 1, fontSize: '16px' }} />
              <FormattedNumber value={walletBalance} variant="secondary14" />
            </Box>
          </Row>
        )}

        {!!selectedEmode && selectedEmodeLabel && (
          <Row caption={<Trans>Asset category</Trans>} captionVariant="description" mb={4}>
            <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
              {/* TODO: need to do gradient for icon */}
              <SvgIcon sx={{ fontSize: '12px', mr: 0.5 }}>
                <LightningBoltIcon />
              </SvgIcon>
              <Typography variant="subheader1">{selectedEmodeLabel}</Typography>
            </Box>
          </Row>
        )}

        {emodeAssets && (
          <Row caption={<Trans>Available assets</Trans>} captionVariant="description" mb={4}>
            {!!selectedEmode ? (
              <Typography>{emodeAssets.join(', ')}</Typography>
            ) : (
              <NoData variant="description" />
            )}
          </Row>
        )}

        {showHf && healthFactor && healthFactor !== '-1' && futureHealthFactor && (
          <Row
            caption={<Trans>Health factor</Trans>}
            captionVariant="description"
            mb={4}
            align="flex-start"
          >
            <Box sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                {healthFactor !== '-1' && (
                  <HealthFactorNumber value={healthFactor} variant="secondary14" />
                )}

                <SvgIcon color="primary" sx={{ fontSize: '14px', mx: 1 }}>
                  <ArrowNarrowRightIcon />
                </SvgIcon>

                {futureHealthFactor !== '-1' && (
                  <HealthFactorNumber
                    value={Number(futureHealthFactor) ? futureHealthFactor : healthFactor}
                    variant="secondary14"
                  />
                )}
              </Box>

              <Typography variant="helperText" color="text.secondary">
                <Trans>Liquidation at</Trans>
                {' <1.0'}
              </Typography>
            </Box>
          </Row>
        )}

        {selectedReward && allRewards && (
          <Row
            caption={
              selectedReward.symbol !== 'all' ? (
                <Trans>Rewards balance</Trans>
              ) : (
                <Trans>Balance</Trans>
              )
            }
            captionVariant="description"
            align="flex-start"
            mb={selectedReward.symbol !== 'all' ? 0 : 4}
          >
            <>
              {selectedReward.symbol !== 'all' ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TokenIcon symbol={selectedReward.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                    <FormattedNumber value={Number(selectedReward.balance)} variant="secondary14" />
                    <Typography ml={1} variant="secondary14">
                      {selectedReward.symbol}
                    </Typography>
                  </Box>
                  <FormattedNumber
                    value={Number(selectedReward.balanceUsd)}
                    variant="helperText"
                    compact
                    symbol="USD"
                    color="text.secondary"
                  />
                </Box>
              ) : (
                <>
                  {allRewards
                    .filter((reward) => reward.symbol !== 'all')
                    .map((reward, index) => {
                      return (
                        <Box
                          key={`claim-${index}`}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            mb: 4,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TokenIcon symbol={reward.symbol} sx={{ mr: 1, fontSize: '16px' }} />
                            <FormattedNumber value={Number(reward.balance)} variant="secondary14" />
                            <Typography ml={1} variant="secondary14">
                              {reward.symbol}
                            </Typography>
                          </Box>
                          <FormattedNumber
                            value={Number(reward.balanceUsd)}
                            variant="helperText"
                            compact
                            symbol="USD"
                            color="text.secondary"
                          />
                        </Box>
                      );
                    })}
                </>
              )}
            </>
          </Row>
        )}

        {selectedReward && selectedReward.symbol === 'all' && (
          <Row caption={<Trans>Total worth</Trans>} captionVariant="description">
            <FormattedNumber
              value={Number(selectedReward.balanceUsd)}
              variant="secondary14"
              compact
              symbol="USD"
            />
          </Row>
        )}

        {symbol && faucetAmount && (
          <Row caption={<Trans>Amount</Trans>} captionVariant="description">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TokenIcon symbol={symbol} sx={{ mr: 1, fontSize: '16px' }} />
              <FormattedNumber value={Number(faucetAmount)} variant="secondary14" />
              <Typography ml={1} variant="secondary14">
                {symbol}
              </Typography>
            </Box>
          </Row>
        )}
        {stakeAPR && (
          <Row
            caption={
              <>
                <Trans>Staking</Trans> APR
              </>
            }
            captionVariant="description"
          >
            <FormattedNumber value={Number(stakeAPR) / 10000} percent variant="description" />
          </Row>
        )}
        {stakeRewards && stakeRewardsInUsd && symbol && (
          <Row caption={<Trans>Amount</Trans>} captionVariant="description">
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <TokenIcon symbol={symbol} sx={{ mx: '4px' }} />
                <FormattedNumber value={Number(stakeRewards)} variant="description" />
                <Typography>{symbol}</Typography>
              </Box>
              <FormattedNumber
                value={Number(stakeRewardsInUsd)}
                variant="helperText"
                compact
                symbol="USD"
              />
            </Box>
          </Row>
        )}
      </Box>

      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
    </Box>
  );
};
