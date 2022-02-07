import {
  ChainId,
  EthereumTransactionTypeExtended,
  GasType,
  InterestRate,
  Pool,
} from '@aave/contract-helpers';
import { BoxProps } from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import { TxState } from 'src/helpers/types';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { GasOption } from '../GasStation/GasStationProvider';

export interface RepayActionProps extends BoxProps {
  amountToRepay: string;
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  setRepayTxState: Dispatch<SetStateAction<TxState>>;
  customGasPrice?: string;
  handleClose: () => void;
  setGasLimit: Dispatch<SetStateAction<string | undefined>>;
  poolAddress: string;
  symbol: string;
  debtType: InterestRate;
  repayWithATokens: boolean;
  blocked: boolean;
}

export const RepayActions = ({
  amountToRepay,
  poolReserve,
  setRepayTxState,
  handleClose,
  setGasLimit,
  poolAddress,
  isWrongNetwork,
  sx,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  ...props
}: RepayActionProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentChainId: chainId, currentMarketData } = useProtocolDataContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const {
    approval,
    approved,
    action,
    requiresApproval,
    loading,
    approvalTxState,
    mainTxState,
    usePermit,
    resetStates,
  } = useTransactionHandler({
    tryPermit:
      currentMarketData.v3 && chainId !== ChainId.harmony && chainId !== ChainId.harmony_testnet,
    handleGetTxns: async () => {
      if (currentMarketData.v3) {
        // TO-DO: No need for this cast once a single Pool type is used in use-tx-builder-context
        const newPool: Pool = lendingPool as Pool;
        let tx: EthereumTransactionTypeExtended[];
        if (repayWithATokens) {
          tx = await newPool.repayWithATokens({
            user: currentAccount,
            reserve: poolReserve.underlyingAsset,
            amount: amountToRepay.toString(),
            rateMode: debtType as InterestRate,
          });
        } else {
          tx = await newPool.repay({
            user: currentAccount,
            reserve: poolReserve.underlyingAsset,
            amount: amountToRepay.toString(),
            interestRateMode: debtType,
          });
        }
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      } else {
        const tx = await lendingPool.repay({
          user: currentAccount,
          reserve: poolReserve.underlyingAsset,
          amount: amountToRepay.toString(),
          interestRateMode: debtType,
        });
        const gas: GasType | null = await tx[tx.length - 1].gas();
        setGasLimit(gas?.gasLimit);
        return tx;
      }
    },
    handleGetPermitTxns: async (signature) => {
      const newPool: Pool = lendingPool as Pool;
      const tx = await newPool.repayWithPermit({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        amount: amountToRepay, // amountToRepay.toString(),
        interestRateMode: debtType,
        signature,
      });
      const gas: GasType | null = await tx[tx.length - 1].gas();
      setGasLimit(gas?.gasLimit);
      return tx;
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: !amountToRepay || parseFloat(amountToRepay) === 0,
  });

  return <>hola</>;
};
