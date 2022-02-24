import { Select, Trans } from '@lingui/macro';
import { Settings } from '@mui/icons-material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import {
  Box,
  Popper,
  styled,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useTheme,
  ClickAwayListener,
} from '@mui/material';
import sx from '@mui/system/sx';
import { BigNumber } from 'ethers/lib/ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { useState } from 'react';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { useAppDataContext } from '../../../hooks/app-data-provider/useAppDataProvider';
import { GasPriceData } from '../../../hooks/useGetGasPrices';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { GasButton } from './GasButton';
import { GasOption } from './GasStationProvider';

const PopperComponent = styled(Popper)(
  sx({
    '.MuiTooltip-tooltip': {
      backgroundColor: 'background.paper',
      p: 0,
      borderRadius: '6px',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
    },
    '.MuiTooltip-arrow': {
      color: 'background.paper',
      '&:before': {
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  })
);

export interface GasStationProps {
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

export const GasStation: React.FC<GasStationProps> = ({ gasLimit }) => {
  const theme = useTheme();

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
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
      <LocalGasStationIcon color="primary" sx={{ fontSize: '16px', mr: 1.5 }} />

      {totalGasCostsUsd ? (
        <FormattedNumber value={totalGasCostsUsd} symbol="USD" color="text.secondary" />
      ) : (
        '-'
      )}

      <Typography sx={{ mx: 1.5 }} variant="caption" color="divider">
        |
      </Typography>

      <Typography color="text.secondary">
        {state.gasOption === GasOption.Custom ? (
          `${state.customGas} Gwei`
        ) : (
          <Select value={state.gasOption} slow="Slow" normal="Normal" fast="Fast" other="-" />
        )}
      </Typography>

      <ClickAwayListener
        mouseEvent="onMouseDown"
        touchEvent="onTouchStart"
        onClickAway={() => setOpen(false)}
      >
        <div>
          <Tooltip
            onClose={() => setOpen(false)}
            disableFocusListener
            disableHoverListener
            placement="top"
            PopperComponent={PopperComponent}
            title={
              <Box sx={{ py: 4, px: 6, width: '280px' }}>
                <Typography variant="description" color="text.secondary" sx={{ mb: 2 }}>
                  <Trans>Select transaction speed</Trans>
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="helperText" color="text.muted" textTransform="capitalize">
                      <Trans>{GasOption.Slow}</Trans>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="helperText" color="text.muted" textTransform="capitalize">
                      <Trans>{GasOption.Normal}</Trans>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="helperText" color="text.muted" textTransform="capitalize">
                      <Trans>{GasOption.Fast}</Trans>
                    </Typography>
                  </Box>
                </Box>

                <ToggleButtonGroup
                  value={state.gasOption}
                  exclusive
                  onChange={onSetGasPrice}
                  aria-label="Gas price selector"
                  sx={{ width: '100%' }}
                >
                  <GasButton value={GasOption.Slow} gwei={data?.[GasOption.Slow].legacyGasPrice} />
                  <GasButton
                    value={GasOption.Normal}
                    gwei={data?.[GasOption.Normal].legacyGasPrice}
                  />
                  <GasButton value={GasOption.Fast} gwei={data?.[GasOption.Fast].legacyGasPrice} />
                </ToggleButtonGroup>

                <Typography sx={{ mt: 3, mb: 2 }} color="text.secondary">
                  <Trans>or enter custom fee value</Trans>
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {state.gasOption === GasOption.Custom && (
                    <TextField
                      size="small"
                      sx={{ p: 0, borderRadius: '4px !important' }}
                      inputProps={{
                        style: {
                          textAlign: 'center',
                          width: '76.5px',
                          height: '36px',
                          padding: '0',
                          ...theme.typography.subheader1,
                        },
                      }}
                      onClick={onClickCustomGasField}
                      onChange={onSetCustomGasPrice}
                      defaultValue={state.customGas}
                    />
                  )}
                  {state.gasOption !== GasOption.Custom && (
                    <ToggleButtonGroup
                      value={state.gasOption}
                      exclusive
                      onChange={onSetGasPrice}
                      aria-label="Gas price selector"
                    >
                      <ToggleButton
                        value={GasOption.Custom}
                        aria-label="Custom"
                        sx={{
                          width: '76.5px',
                          height: '36px',
                          borderRadius: '4px',
                        }}
                      >
                        <Typography variant="description">
                          <Trans>Custom</Trans>
                        </Typography>
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}

                  <Typography sx={{ ml: 2 }} variant="caption" color="text.secondary">
                    GWEI
                  </Typography>
                </Box>
              </Box>
            }
            open={open}
            arrow
          >
            <Settings
              color="primary"
              onClick={toggleDropdown}
              sx={{
                cursor: 'pointer',
                display: error ? 'none' : 'inline-block',
                fontSize: '16px',
                ml: '2px',
              }}
            />
          </Tooltip>
        </div>
      </ClickAwayListener>
    </Box>
  );
};
