import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React from 'react';
import { uiConfig } from '../../../uiConfig';
import { GasTooltip } from 'src/components/infoTooltips/GasTooltip';
import { useGasStation } from 'src/hooks/useGasStation';
import { useModalContext } from 'src/hooks/useModal';
import { useHelpContext } from 'src/hooks/useHelp';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { useAppDataContext } from '../../../hooks/app-data-provider/useAppDataProvider';
import { GasPriceData } from '../../../hooks/useGetGasPrices';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { GasOption } from './GasStationProvider';

import { HelpTooltip } from 'src/components/infoTooltips/HelpTooltip';

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
  const {
    state,
    gasPriceData: { data },
  } = useGasStation();
  const { pagination } = useHelpContext();
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
      {pagination['SupplyTour'] === 5 && (
        <HelpTooltip
          title={'Gas Fee Stimation'}
          description={
            <Box>
              <Box sx={{ width: '149px', height: '52px' }}>
                <img
                  src={
                    localStorage.getItem('colorMode') === 'light' ||
                    !localStorage.getItem('colorMode')
                      ? uiConfig.gasEstationImageLight
                      : uiConfig.gasEstationImageDark
                  }
                  alt="SVG of a gas estation price fee"
                />
              </Box>
              <Typography sx={{ mt: 4 }}>
                This gas calculation is only an estimation. Your wallet will set the price of the
                transaction. You can modify the gas settings directly from your wallet provider.
              </Typography>
            </Box>
          }
          pagination={pagination['SupplyTour']}
          top={'340px'}
          placement={'left'}
          right={'390px'}
          offset={[0, 15]}
        />
      )}
      <LocalGasStationIcon color="primary" sx={{ fontSize: '16px', mr: 1.5 }} />
      {loadingTxns ? (
        <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
      ) : totalGasCostsUsd ? (
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
