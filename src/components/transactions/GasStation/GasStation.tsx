import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, CircularProgress } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React from 'react';
import { GasTooltip } from 'src/components/infoTooltips/GasTooltip';
import { useGasStation } from 'src/hooks/useGasStation';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { useAppDataContext } from '../../../hooks/app-data-provider/useAppDataProvider';
import { GasPriceData } from '../../../hooks/useGetGasPrices';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { GasOption } from './GasStationProvider';

export interface GasStationProps {
  gasLimit: BigNumber;
  skipLoad?: boolean;
  disabled?: boolean;
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

export const GasStation: React.FC<GasStationProps> = ({ gasLimit, skipLoad, disabled }) => {
  const {
    state,
    gasPriceData: { data },
  } = useGasStation();
  const { reserves } = useAppDataContext();
  const {
    currentNetworkConfig: { wrappedBaseAssetSymbol },
  } = useProtocolDataContext();
  const { loadingTxns } = useModalContext();

  const wrappedAsset = reserves.find(
    (token) => token.symbol.toLowerCase() === wrappedBaseAssetSymbol?.toLowerCase()
  );

  const totalGasCostsUsd =
    data && wrappedAsset
      ? getGasCosts(gasLimit, state.gasOption, state.customGas, data, wrappedAsset.priceInUSD)
      : undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 6 }}>
      <LocalGasStationIcon color="primary" sx={{ fontSize: '16px', mr: 1.5 }} />

      {loadingTxns && !skipLoad ? (
        <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
      ) : totalGasCostsUsd && !disabled ? (
        <>
          <FormattedNumber value={totalGasCostsUsd} symbol="USD" color="text.secondary" />
          <GasTooltip />
        </>
      ) : (
        '-'
      )}
    </Box>
  );
};
