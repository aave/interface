import { InterestRate } from '@aave/contract-helpers';
import { CheckIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
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
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { CollateralType, Reward } from 'src/helpers/types';
import { ReserveIncentiveResponse } from 'src/hooks/app-data-provider/useIncentiveData';

import { HealthFactorNumber } from '../../HealthFactorNumber';
import { IncentivesButton } from '../../incentives/IncentivesButton';
import { FormattedNumber, FormattedNumberProps } from '../../primitives/FormattedNumber';
import { Row } from '../../primitives/Row';
import { TokenIcon } from '../../primitives/TokenIcon';
import { RewardsSelect } from '../ClaimRewards/RewardsSelect';
import { GasStation } from '../GasStation/GasStation';
import { APYTypeTooltip } from 'src/components/infoTooltips/APYTypeTooltip';

export interface TxModalDetailsProps {
  apy?: string;
  // supplyRewards: SupplyReward[];
  gasLimit?: string;
  symbol?: string;
  setInterestRateMode?: Dispatch<SetStateAction<InterestRate>>;
  borrowStableRate?: string;
  action?: string;
  rate?: InterestRate;
  allRewards?: Reward[];
  setSelectedReward?: Dispatch<SetStateAction<Reward | undefined>>;
  selectedReward?: Reward;
  stakeAPR?: string;
}

export const TxModalDetails: React.FC<TxModalDetailsProps> = ({
  apy,
  gasLimit,
  symbol,
  borrowStableRate,
  setInterestRateMode,
  action,
  rate,
  allRewards,
  setSelectedReward,
  selectedReward,
  children,
}) => {
  const [selectedRate, setSelectedRate] = React.useState(InterestRate.Variable);

  const handleRateChange = (rate: InterestRate) => {
    setSelectedRate(rate);
    setInterestRateMode && setInterestRateMode(rate);
  };

  return (
    <Box sx={{ pt: children ? 5 : 0 }}>
      {symbol && setInterestRateMode && borrowStableRate && apy && (
        <Row
          caption={
            <APYTypeTooltip
              text={<Trans>Borrow APY rate</Trans>}
              key="APY type_modal"
              variant="description"
            />
          }
          captionVariant="description"
          mb={6}
          flexDirection="column"
          align="flex-start"
          captionColor="text.secondary"
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

      {children && (
        <Typography sx={{ mb: 1 }} color="text.secondary">
          <Trans>Transaction overview</Trans>
        </Typography>
      )}

      {children && (
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
          {children}
        </Box>
      )}

      <GasStation gasLimit={parseUnits(gasLimit || '0', 'wei')} />
    </Box>
  );
};

interface DetailsNumberLineProps extends FormattedNumberProps {
  description: ReactNode;
  value: FormattedNumberProps['value'];
  numberPrefix?: ReactNode;
  iconSymbol?: string;
}

export const DetailsNumberLine = ({
  description,
  value,
  numberPrefix,
  iconSymbol,
  ...rest
}: DetailsNumberLineProps) => {
  return (
    <Row caption={description} captionVariant="description" mb={4}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {iconSymbol && <TokenIcon symbol={iconSymbol} sx={{ mr: 1, fontSize: '16px' }} />}
        {numberPrefix && <Typography sx={{ mr: 1 }}>{numberPrefix}</Typography>}
        <FormattedNumber value={value} variant="secondary14" {...rest} />
      </Box>
    </Row>
  );
};

interface DetailsNumberLineWithSubProps {
  description: ReactNode;
  symbol: string;
  amount: string;
  amountUSD: string;
  hideSymbolSuffix?: boolean;
}

export const DetailsNumberLineWithSub = ({
  description,
  symbol,
  amount,
  amountUSD,
  hideSymbolSuffix,
}: DetailsNumberLineWithSubProps) => {
  return (
    <Row caption={description} captionVariant="description" mb={4} align="flex-start">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TokenIcon symbol={symbol} sx={{ mr: 1, fontSize: '16px' }} />
          <FormattedNumber value={amount} variant="secondary14" />
          {!hideSymbolSuffix && (
            <Typography ml={1} variant="secondary14">
              {symbol}
            </Typography>
          )}
        </Box>

        <FormattedNumber value={amountUSD} variant="helperText" compact symbol="USD" />
      </Box>
    </Row>
  );
};

export interface DetailsCollateralLine {
  collateralType: CollateralType;
}

export const DetailsCollateralLine = ({ collateralType }: DetailsCollateralLine) => {
  return (
    <Row caption={<Trans>Collateralization</Trans>} captionVariant="description" mb={4}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {collateralType === CollateralType.ENABLED && (
          <>
            <SvgIcon sx={{ color: 'success.main', fontSize: 16, mr: '2px' }}>
              <CheckIcon />
            </SvgIcon>
            <Typography variant="description" color="success.main">
              <Trans>Enabled</Trans>
            </Typography>
          </>
        )}
        {collateralType === CollateralType.ISOLATED_ENABLED && (
          <>
            <SvgIcon sx={{ color: 'warning.main', fontSize: 16, mr: '2px' }}>
              <CheckIcon />
            </SvgIcon>
            <Typography variant="description" color="warning.main">
              <Trans>Enabled in isolation</Trans>
            </Typography>
          </>
        )}
        {collateralType === CollateralType.DISABLED && (
          <Typography variant="description" color="grey">
            <Trans>Disabled</Trans>
          </Typography>
        )}
        {collateralType === CollateralType.ISOLATED_DISABLED && (
          <Typography variant="description" color="grey">
            <Trans>Disabled</Trans>
          </Typography>
        )}
      </Box>
    </Row>
  );
};

interface DetailsIncentivesLineProps {
  incentives?: ReserveIncentiveResponse[];
  // the token yielding the incentive, not the incentive itself
  symbol: string;
}

export const DetailsIncentivesLine = ({ incentives, symbol }: DetailsIncentivesLineProps) => {
  if (!incentives || incentives.filter((i) => i.incentiveAPR !== '0').length === 0) return null;
  return (
    <Row caption={<Trans>Rewards APR</Trans>} captionVariant="description" mb={4} minHeight={24}>
      <IncentivesButton incentives={incentives} symbol={symbol} />
    </Row>
  );
};

export interface DetailsHFLineProps {
  healthFactor: string;
  futureHealthFactor: string;
}

export const DetailsHFLine = ({ healthFactor, futureHealthFactor }: DetailsHFLineProps) => {
  return (
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
  );
};

export interface DetailsUnwrapSwitchProps {
  unwrapped: boolean;
  setUnWrapped: (value: boolean) => void;
  symbol: string;
  unwrappedSymbol: string;
}

export const DetailsUnwrapSwitch = ({
  unwrapped,
  setUnWrapped,
  symbol,
  unwrappedSymbol,
}: DetailsUnwrapSwitchProps) => {
  return (
    <Row captionVariant="description" mb={4}>
      <FormControlLabel
        value="darkmode"
        control={
          <Switch disableRipple checked={unwrapped} onClick={() => setUnWrapped(!unwrapped)} />
        }
        labelPlacement="end"
        label={''}
      />
      <Typography>{`Unwrap ${symbol} (to withdraw ${unwrappedSymbol})`}</Typography>
    </Row>
  );
};
