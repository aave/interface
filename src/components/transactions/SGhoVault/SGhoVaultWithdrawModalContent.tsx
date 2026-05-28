import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, useSghoVaultPreviewRedeem } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';
import { roundToTokenDecimals } from 'src/utils/utils';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { SGhoVaultWithdrawActions } from './SGhoVaultWithdrawActions';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

const SGHO_SYMBOL = 'sGHO';

export const SGhoVaultWithdrawModalContent = () => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { chainId: targetChainId, sdkChainId } = useSavingsMarketData();
  const { mainTxState, txError, gasLimit } = useModalContext();
  const { vault } = useSGhoVaultContext();

  const [_amount, setAmount] = useState('');

  const handleChange = (value: string) => {
    if (value === '-1') {
      setAmount(value);
    } else {
      setAmount(roundToTokenDecimals(value, 18));
    }
  };

  const sharesBalance = vault?.user?.shares.amount.value ?? '0';

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? sharesBalance : _amount;

  // Debounce typed input so the preview hook (and any future backend
  // simulation hook) don't fire on every keystroke. Max is applied
  // immediately — it's a discrete click, not progressive typing.
  const debouncedAmount = useDebouncedValue(amount);
  const effectiveAmount = isMaxSelected ? amount : debouncedAmount;

  const numericAmount = parseFloat(effectiveAmount);
  const previewAmount = !isNaN(numericAmount) && numericAmount > 0 ? numericAmount.toString() : '0';
  const { data: previewAssets, loading: previewFetching } = useSghoVaultPreviewRedeem({
    amount: bigDecimal(previewAmount),
    chainId: sdkChainId,
  });

  // Show loading while the typed amount is still settling through the debounce
  // OR while the SDK preview query is fetching the new value.
  const debouncePending = amount !== effectiveAmount;
  const previewLoading = parseFloat(amount) > 0 && (debouncePending || previewFetching);

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

  // Snapshot the amount at submit time — once the redeem mines, the vault
  // query refetches and (for a max withdraw) `amount` recomputes to 0,
  // which would otherwise blank the success view.
  const submittedAmountRef = useRef<string | null>(null);
  if (mainTxState.txHash && submittedAmountRef.current === null) {
    submittedAmountRef.current = amount;
  }
  if (!mainTxState.txHash && !mainTxState.success && submittedAmountRef.current !== null) {
    submittedAmountRef.current = null;
  }

  if (txError && txError.blocking) return <TxErrorView txError={txError} />;
  if (mainTxState.success) {
    return (
      <TxSuccessView
        action={<Trans>withdrew</Trans>}
        amount={submittedAmountRef.current ?? amount}
        symbol={SGHO_SYMBOL}
      />
    );
  }

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
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
      <TxModalDetails gasLimit={gasLimit} chainId={targetChainId}>
        <DetailsNumberLine
          description={<Trans>You&apos;ll receive</Trans>}
          value={previewAssets?.value ?? '0'}
          symbol="GHO"
          loading={previewLoading}
        />
      </TxModalDetails>

      <SGhoVaultWithdrawActions
        amount={amount}
        isMaxSelected={isMaxSelected}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        sx={{ mt: '48px' }}
      />
    </>
  );
};
