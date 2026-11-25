import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { BigNumber } from 'ethers/lib/ethers';
import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { ReactNode } from 'react';
import { GasTooltip } from 'src/components/infoTooltips/GasTooltip';
import { tooltipLabelProps } from 'src/components/infoTooltips/tooltipLabelProps';
import { Row } from 'src/components/primitives/Row';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { usePoolReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import { useGasStation } from 'src/hooks/useGasStation';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import invariant from 'tiny-invariant';
import { useShallow } from 'zustand/shallow';

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
  const [currentChainId, account] = useRootStore(
    useShallow((store) => [store.currentChainId, store.account])
  );
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

  const insufficientGasWarning = !disabled &&
    !isContractAddress &&
    Number(nativeBalanceUSD) < Number(totalGasCostsUsd) && (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Alert severity="warning" data-size="small" sx={{ width: '100%', mb: 0, mx: 'auto' }}>
          You do not have enough {baseAssetSymbol} in your account to pay for transaction fees on{' '}
          {name} network. Please deposit {baseAssetSymbol} from another account.
        </Alert>
      </Box>
    );

  return (
    <Stack gap={6} sx={{ width: '100%' }}>
      <Row
        caption={
          <GasTooltip {...tooltipLabelProps} iconMargin={1.5} text={<Trans>Network fee</Trans>} />
        }
        captionVariant="description"
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loadingTxns && !skipLoad ? (
            <CircularProgress color="inherit" size="16px" />
          ) : totalGasCostsUsd && !disabled ? (
            <FormattedNumber value={totalGasCostsUsd} symbol="USD" variant="h5" />
          ) : (
            <Typography variant="h5">-</Typography>
          )}
          {rightComponent}
        </Box>
      </Row>
      {insufficientGasWarning}
    </Stack>
  );
};
