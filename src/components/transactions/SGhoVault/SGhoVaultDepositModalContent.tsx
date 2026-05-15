import { valueToBigNumber } from '@aave/math-utils';
import {
  bigDecimal,
  evmAddress,
  useSghoVaultDeposit,
  useSghoVaultPreviewDeposit,
} from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { errAsync } from 'neverthrow';
import { useState } from 'react';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { TxErrorType } from 'src/ui-config/errorMapping';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { useWalletClient } from 'wagmi';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { TxActionsWrapper } from '../TxActionsWrapper';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const SGhoVaultDepositModalContent = () => {
  const { chainId: connectedChainId, currentAccount } = useWeb3Context();
  const { marketData, chainId: targetChainId, sdkChainId } = useSavingsMarketData();

  const [_amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxErrorState] = useState<TxErrorType>();

  const { walletBalances } = useWalletBalances(marketData);
  const ghoAddress = AaveV3Ethereum.ASSETS.GHO.UNDERLYING.toLowerCase();
  const walletBalance = walletBalances[ghoAddress]?.amount ?? '0';

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? walletBalance : _amount;

  const previewAmount = parseFloat(amount) > 0 ? amount : '0';
  const { data: previewShares } = useSghoVaultPreviewDeposit({
    amount: bigDecimal(previewAmount),
    chainId: sdkChainId,
  });

  const { data: walletClient } = useWalletClient();
  const [deposit] = useSghoVaultDeposit();
  const [sendTransaction] = useSendTransaction(walletClient);

  const isWrongNetwork = connectedChainId !== targetChainId;

  let blockingError: ErrorType | undefined;
  if (amount && valueToBigNumber(amount).gt(walletBalance)) {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough balance on your wallet</Trans>;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!currentAccount || !walletClient || !amount) return;
    setSubmitting(true);
    setTxErrorState(undefined);

    const result = await deposit({
      amount: { value: bigDecimal(amount) },
      depositor: evmAddress(currentAccount),
      chainId: sdkChainId,
    }).andThen((plan) => {
      switch (plan.__typename) {
        case 'TransactionRequest':
          return sendTransaction(plan);
        case 'ApprovalRequired':
          return sendTransaction(plan.approval).andThen(() =>
            sendTransaction(plan.originalTransaction)
          );
        case 'InsufficientBalanceError':
          return errAsync(new Error(`Insufficient balance: ${plan.required.value} GHO required.`));
      }
    });

    setSubmitting(false);
    if (result.isErr()) {
      setTxErrorState({
        blocking: true,
        actionBlocked: true,
        rawError: result.error as Error,
        error: <span>{(result.error as Error).message}</span>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        txAction: 0 as any,
      });
    } else {
      setTxHash(result.value);
    }
  };

  if (txError && txError.blocking) return <TxErrorView txError={txError} />;
  if (txHash) {
    return <TxSuccessView action={<Trans>deposited</Trans>} amount={amount} symbol="sGHO" />;
  }

  return (
    <>
      <AssetInput
        value={amount}
        onChange={setAmount}
        usdValue={amount}
        symbol={GHO_SYMBOL}
        assets={[{ balance: walletBalance, symbol: GHO_SYMBOL }]}
        isMaxSelected={isMaxSelected}
        maxValue={walletBalance}
        balanceText={<Trans>Wallet balance</Trans>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit="" chainId={targetChainId}>
        <DetailsNumberLine
          description={<Trans>You&apos;ll receive</Trans>}
          value={previewShares?.value ?? '0'}
          symbol="sGHO"
        />
      </TxModalDetails>

      <TxActionsWrapper
        requiresApproval={false}
        preparingTransactions={false}
        mainTxState={{ loading: submitting, success: !!txHash, txHash }}
        isWrongNetwork={isWrongNetwork}
        amount={amount}
        handleAction={handleSubmit}
        symbol={GHO_SYMBOL}
        requiresAmount
        actionText={<Trans>Deposit</Trans>}
        actionInProgressText={<Trans>Depositing</Trans>}
        sx={{ mt: '48px' }}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
