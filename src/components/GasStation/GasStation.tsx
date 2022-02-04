import React, { useState } from 'react';
import {
  Box,
  BoxProps,
  Skeleton,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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

const GasDropdown = styled('div')<GasDropdownProps>(({ open }) => ({
  maxHeight: open ? '100px' : 0,
  transition: open ? 'max-height 0.25s ease-in;' : 'max-height 0.15s ease-out',
  overflow: 'hidden',
  marginTop: '8px',
}));

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
        {totalGasCostsUsd ? (
          <FormattedNumber value={totalGasCostsUsd} symbol="USD" />
        ) : (
          <Skeleton variant="text" sx={{ width: '40px' }} />
        )}
        <Typography sx={{ mx: '4px' }}>
          (
          {state.gasOption === GasOption.Custom ? (
            `${state.customGas} Gwei`
          ) : (
            <Select value={state.gasOption} slow="Slow" normal="Normal" fast="Fast" other="-" />
          )}
          )
        </Typography>
        <Settings
          fontSize="small"
          color="primary"
          onClick={toggleDropdown}
          sx={{ cursor: 'pointer', display: error ? 'none' : 'inline-block' }}
        />
      </Box>

      <GasDropdown open={open}>
        <ToggleButtonGroup
          value={state.gasOption}
          exclusive
          onChange={onSetGasPrice}
          aria-label="Gas price selector"
          size="medium"
          sx={{
            fontSize: '12px',
            mr: '4px',
          }}
          color="primary"
        >
          <GasButton value={GasOption.Slow} gwei={data?.[GasOption.Slow].legacyGasPrice} />
          <GasButton value={GasOption.Normal} gwei={data?.[GasOption.Normal].legacyGasPrice} />
          <GasButton value={GasOption.Fast} gwei={data?.[GasOption.Fast].legacyGasPrice} />
          <ToggleButton
            value={GasOption.Custom}
            aria-label="Custom"
            sx={{ fontSize: 'inherit', flexWrap: 'wrap', display: 'flex' }}
          >
            <TextField
              size="small"
              sx={{ width: 60, mb: '4px' }}
              inputProps={{
                style: { fontSize: '12px', padding: '2.5px 7px', textAlign: 'center' },
              }}
              onClick={onClickCustomGasField}
              onChange={onSetCustomGasPrice}
              defaultValue={state.customGas}
            />
            <Trans>Custom</Trans>
          </ToggleButton>
        </ToggleButtonGroup>
      </GasDropdown>
    </Box>
  );
};
