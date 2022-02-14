import React, { useState } from 'react';
import {
  Box,
  BoxProps,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography,
} from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Settings } from '@mui/icons-material';
import { Select, Trans } from '@lingui/macro';
import { GasOption } from './GasStationProvider';
import { BigNumber } from 'ethers/lib/ethers';
import { GasButton } from './GasButton';
import { useAppDataContext } from '../../hooks/app-data-provider/useAppDataProvider';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import { GasPriceData } from '../../hooks/useGetGasPrices';
import { FormattedNumber } from '../primitives/FormattedNumber';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

export interface GasDropdownProps {
  open: boolean;
}
export interface GasStationProps extends BoxProps {
  gasLimit: BigNumber;
}

export const getGasCosts = (
  gasLimit: BigNumber,
  gasOption: GasOption,
  customGas: string,
  gasData: GasPriceData,
  baseCurrencyUsd: string
) => {
  const gasPrice =
    gasOption === GasOption.Custom
      ? parseUnits(customGas, 'gwei').toString()
      : gasData[gasOption].legacyGasPrice;
  return Number(formatUnits(gasLimit.mul(gasPrice), 18)) * parseFloat(baseCurrencyUsd);
};

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.common.white,
    '&:before': {
      boxShadow:
        '-1px -1px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',
    },
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}));

export const GasStation: React.FC<GasStationProps> = ({ gasLimit, ...props }) => {
  const {
    state,
    dispatch,
    gasPriceData: { data, error },
  } = useGasStation();
  const { reserves } = useAppDataContext();
  const {
    currentNetworkConfig: { wrappedBaseAssetSymbol },
  } = useProtocolDataContext();

  const wrappedAsset = reserves.find(
    (token) => token.symbol.toLowerCase() === wrappedBaseAssetSymbol?.toLowerCase()
  );

  const totalGasCostsUsd =
    data && wrappedAsset
      ? getGasCosts(gasLimit, state.gasOption, state.customGas, data, wrappedAsset.priceInUSD)
      : undefined;

  const [open, setOpen] = useState(false);

  const toggleDropdown = () => setOpen(!open);

  const onSetGasPrice = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    gasOption: GasOption
  ) => {
    if (gasOption !== null) {
      dispatch({ type: 'setGasOption', value: gasOption });
    }
  };

  const onSetCustomGasPrice = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    dispatch({ type: 'setCustomGasOption', value: event.target.value });
  };

  const onClickCustomGasField = () => {
    dispatch({ type: 'setCustomGasOption', value: state.customGas });
  };
  return (
    <Box {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <LocalGasStationIcon fontSize="small" color="primary" sx={{ mr: '5px' }} />
        {totalGasCostsUsd ? <FormattedNumber value={totalGasCostsUsd} symbol="USD" /> : '-'}
        <LightTooltip
          onClose={() => setOpen(false)}
          disableFocusListener
          title={
            <Box sx={{ py: 4, px: 6 }}>
              <Typography variant="description">Select transaction speed</Typography>
              <ToggleButtonGroup
                value={state.gasOption}
                sx={{ mt: '24px' }}
                exclusive
                onChange={onSetGasPrice}
                aria-label="Gas price selector"
              >
                <GasButton value={GasOption.Slow} gwei={data?.[GasOption.Slow].legacyGasPrice} />
                <GasButton
                  value={GasOption.Normal}
                  gwei={data?.[GasOption.Normal].legacyGasPrice}
                />
                <GasButton value={GasOption.Fast} gwei={data?.[GasOption.Fast].legacyGasPrice} />
              </ToggleButtonGroup>
              <Typography sx={{ mt: '20px', mb: '8px' }}>or enter custom fee value</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {state.gasOption === GasOption.Custom && (
                  <TextField
                    size="small"
                    sx={{ width: 75, mr: '8px' }}
                    inputProps={{
                      style: { textAlign: 'center' },
                    }}
                    onClick={onClickCustomGasField}
                    onChange={onSetCustomGasPrice}
                    defaultValue={state.customGas}
                  />
                )}
                {state.gasOption !== GasOption.Custom && (
                  <ToggleButtonGroup
                    value={state.gasOption}
                    sx={{ mr: '8px' }}
                    exclusive
                    onChange={onSetGasPrice}
                    aria-label="Gas price selector"
                  >
                    <ToggleButton
                      value={GasOption.Custom}
                      aria-label="Custom"
                      sx={{ fontSize: 'inherit', flexWrap: 'wrap', display: 'flex', width: 75 }}
                    >
                      <Trans>Custom</Trans>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
                GWEI
              </Box>
            </Box>
          }
          open={open}
          arrow
        >
          <Typography sx={{ mx: '4px' }}>
            (
            {state.gasOption === GasOption.Custom ? (
              `${state.customGas} Gwei`
            ) : (
              <Select value={state.gasOption} slow="Slow" normal="Normal" fast="Fast" other="-" />
            )}
            )
          </Typography>
        </LightTooltip>
        <Settings
          fontSize="small"
          color="primary"
          onClick={toggleDropdown}
          sx={{ cursor: 'pointer', display: error ? 'none' : 'inline-block' }}
        />
      </Box>
    </Box>
  );
};
