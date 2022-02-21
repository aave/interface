import { InterestRate } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { useTransactionHandler } from 'src/helpers/useTransactionHandler';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { useGasStation } from 'src/hooks/useGasStation';
import { useTxBuilderContext } from 'src/hooks/useTxBuilder';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { RightHelperText } from '../FlowCommons/RightHelperText';
import { GasOption } from '../GasStation/GasStationProvider';
import { TxActionsWrapper } from '../TxActionsWrapper';

export type RateSwitchActionsProps = {
  poolReserve: ComputedReserveData;
  isWrongNetwork: boolean;
  currentRateMode: InterestRate;
  blocked: boolean;
};

export const RateSwitchActions = ({
  poolReserve,
  isWrongNetwork,
  currentRateMode,
  blocked,
}: RateSwitchActionsProps) => {
  const { lendingPool } = useTxBuilderContext();
  const { currentAccount, chainId: connectedChainId } = useWeb3Context();
  const { state, gasPriceData } = useGasStation();

  const { action, loadingTxns, mainTxState } = useTransactionHandler({
    tryPermit: false,
    handleGetTxns: async () => {
      return await lendingPool.swapBorrowRateMode({
        user: currentAccount,
        reserve: poolReserve.underlyingAsset,
        interestRateMode: currentRateMode,
      });
    },
    customGasPrice:
      state.gasOption === GasOption.Custom
        ? state.customGas
        : gasPriceData.data?.[state.gasOption].legacyGasPrice,
    skip: blocked,
  });

  return (
    <TxActionsWrapper
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      actionText={<Trans>Switch rate</Trans>}
      actionInProgressText={<Trans>Switching rate</Trans>}
      handleAction={action}
      helperText={
        <RightHelperText
          actionHash={mainTxState.txHash}
          chainId={connectedChainId}
          action="collateral change"
        />
      }
    />
  );
};
