import { valueToBigNumber } from '@aave/math-utils';
import {
  bigDecimal,
  evmAddress,
  useSghoVault,
  useSghoVaultPreviewRedeem,
  useSghoVaultRedeemShares,
} from '@aave/react';
import { useSendTransaction } from '@aave/react/viem';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { errAsync } from 'neverthrow';
import { useState } from 'react';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { TxErrorType } from 'src/ui-config/errorMapping';
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

const SGHO_SYMBOL = 'sGHO';

export const SGhoVaultWithdrawModalContent = () => {
  const { chainId: connectedChainId, currentAccount } = useWeb3Context();
  const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();

  const [_amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string>();
  const [txError, setTxErrorState] = useState<TxErrorType>();

  const { data: vault } = useSghoVault({
    user: currentAccount
      ? evmAddress(currentAccount)
      : evmAddress('0x0000000000000000000000000000000000000000'),
    chainId: sdkChainId,
  });

  const sharesBalance = vault?.user?.shares.amount.value ?? '0';

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? sharesBalance : _amount;

  const previewAmount = parseFloat(amount) > 0 ? amount : '0';
  const { data: previewAssets } = useSghoVaultPreviewRedeem({
    amount: bigDecimal(previewAmount),
    chainId: sdkChainId,
  });

  const { data: walletClient } = useWalletClient();
  const [redeem] = useSghoVaultRedeemShares();
  const [sendTransaction] = useSendTransaction(walletClient);

  const isWrongNetwork = connectedChainId !== targetChainId;

  let blockingError: ErrorType | undefined;
  if (amount && valueToBigNumber(amount).gt(sharesBalance)) {
    blockingError = ErrorType.NOT_ENOUGH_BALANCE;
  }

  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_BALANCE:
        return <Trans>Not enough sGHO balance</Trans>;
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (!currentAccount || !walletClient || !amount) return;
    setSubmitting(true);
    setTxErrorState(undefined);

    const amountInput = isMaxSelected
      ? { maxRedeem: true as const }
      : { shares: bigDecimal(amount) };

    const result = await redeem({
      amount: amountInput,
      sharesOwner: evmAddress(currentAccount),
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
          return errAsync(new Error(`Insufficient sGHO balance: ${plan.required.value} required.`));
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
    return <TxSuccessView action={<Trans>withdrew</Trans>} amount={amount} symbol={SGHO_SYMBOL} />;
  }

  return (
    <>
      <AssetInput
        value={amount}
        onChange={setAmount}
        usdValue={amount}
        symbol={SGHO_SYMBOL}
        assets={[{ balance: sharesBalance, symbol: SGHO_SYMBOL }]}
        isMaxSelected={isMaxSelected}
        maxValue={sharesBalance}
        balanceText={<Trans>sGHO balance</Trans>}
      />
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit="" chainId={targetChainId}>
        <DetailsNumberLine
          description={<Trans>You&apos;ll receive</Trans>}
          value={previewAssets?.value ?? '0'}
          symbol="GHO"
        />
      </TxModalDetails>

      <TxActionsWrapper
        requiresApproval={false}
        preparingTransactions={false}
        mainTxState={{ loading: submitting, success: !!txHash, txHash }}
        isWrongNetwork={isWrongNetwork}
        amount={amount}
        handleAction={handleSubmit}
        symbol={SGHO_SYMBOL}
        requiresAmount
        actionText={<Trans>Withdraw</Trans>}
        actionInProgressText={<Trans>Withdrawing</Trans>}
        sx={{ mt: '48px' }}
        blocked={blockingError !== undefined}
      />
    </>
  );
};
