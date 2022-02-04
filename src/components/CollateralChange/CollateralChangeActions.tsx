import { ChainId, EthereumTransactionTypeExtended, GasType } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';

export type CollateralChangeActionsProps = {
  poolReserve: ComputedReserveData;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  setCollateralChangeTxState: Dispatch<SetStateAction<TxState>>;
  handleClose: () => void;
  isWrongNetwork: boolean;
  usageAsCollateral: boolean;
};

export const CollateralChangeActions = ({
  poolReserve,
  setGasLimit,
  setCollateralChangeTxState,
  handleClose,
  isWrongNetwork,
  usageAsCollateral,
}: CollateralChangeActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loading, mainTxState } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      const tx: EthereumTransactionTypeExtended[] = await lendingPool.setUsageAsCollateral({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        usageAsCollateral,
      });

      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: false,
  });

  useEffect(() => {
    if (mainTxState.txHash) {
      setCollateralChangeTxState({
        success: true,
        error: undefined,
      });
    }
  }, [setCollateralChangeTxState, mainTxState.txHash]);

  return (
    <Box sx={{ mt: '16px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="collateral change"
        />
      </Box>
      {!mainTxState.txHash && !mainTxState.error && (
        <Button variant="contained" onClick={action} disabled={loading || isWrongNetwork}>
          {!loading ? (
            <Trans>
              {usageAsCollateral ? 'ENABLE' : 'DISABLE'} ${poolReserve.symbol} AS COLLATERAL
            </Trans>
          ) : (
            <Trans>PENDING...</Trans>
          )}
        </Button>
      )}
      {(mainTxState.txHash || mainTxState.error) && (
        <Button onClick={handleClose} variant="contained">
          <Trans>OK, CLOSE</Trans>
        </Button>
      )}
    </Box>
  );
};
