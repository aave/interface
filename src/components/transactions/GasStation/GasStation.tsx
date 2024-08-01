import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import { Box, CircularProgress, Stack } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { ReactNode } from 'react';
import { GasTooltip } from 'src/components/infoTooltips/GasTooltip';
import { Warning } from 'src/components/primitives/Warning';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { usePoolReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { useGasStation } from 'src/hooks/useGasStation';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';

import { GasPriceData, useGasPrice } from '../../../hooks/useGetGasPrices';
import { FormattedNumber } from '../../primitives/FormattedNumber';
import { GasOption } from './GasStationProvider';

export interface GasStationProps {
  gasLimit: BigNumber;
  skipLoad?: boolean;
  disabled?: boolean;
  rightComponent?: ReactNode;
  chainId?: number;
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

export const GasStation: React.FC<GasStationProps> = ({
  gasLimit,
  skipLoad,
  disabled,
  rightComponent,
  chainId,
}) => {
  const { state } = useGasStation();
  const [currentChainId, account] = useRootStore((store) => [store.currentChainId, store.account]);
  const selectedChainId = chainId ?? currentChainId;
  // TODO: find a better way to query base token price instead of using a random market.
  const marketOnNetwork = Object.values(marketsData).find(
    (elem) => elem.chainId === selectedChainId
  );
  invariant(marketOnNetwork, 'No market for this network');
  const { data: poolReserves } = usePoolReservesHumanized(marketOnNetwork);
  const { data: gasPrice } = useGasPrice(selectedChainId);
  const { walletBalances } = useWalletBalances(marketOnNetwork);
  const { data: isContractAddress } = useIsContractAddress(account);
  const nativeBalanceUSD = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD;
  const { name, baseAssetSymbol } = getNetworkConfig(selectedChainId);

  const { loadingTxns } = useModalContext();

  const totalGasCostsUsd =
    gasPrice && poolReserves?.baseCurrencyData
      ? getGasCosts(
          gasLimit,
          state.gasOption,
          state.customGas,
          gasPrice,
          normalize(
            poolReserves?.baseCurrencyData.networkBaseTokenPriceInUsd,
            poolReserves?.baseCurrencyData.networkBaseTokenPriceDecimals
          )
        )
      : undefined;

  return (
    <Stack gap={6} sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', mt: 6, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocalGasStationIcon color="primary" sx={{ fontSize: '16px', mr: 1.5 }} />

          {loadingTxns && !skipLoad ? (
            <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
          ) : totalGasCostsUsd && !disabled ? (
            <>
              <FormattedNumber
                value={totalGasCostsUsd}
                symbol="USD"
                color="text.secondary"
                variant="caption"
              />
              <GasTooltip />
            </>
          ) : (
            '-'
          )}
        </Box>
        {rightComponent}
      </Box>
      {!disabled && !isContractAddress && Number(nativeBalanceUSD) < Number(totalGasCostsUsd) && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Warning severity="warning" sx={{ mb: 0, mx: 'auto' }}>
            You do not have enough {baseAssetSymbol} in your account to pay for transaction fees on{' '}
            {name} network. Please deposit {baseAssetSymbol} from another account.
          </Warning>
        </Box>
      )}
    </Stack>
  );
};
