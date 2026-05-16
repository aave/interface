import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, useSghoVaultPreviewDeposit } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useDebouncedValue } from 'src/hooks/useDebouncedValue';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { marketsData } from 'src/utils/marketsAndNetworksConfig';
import { roundToTokenDecimals } from 'src/utils/utils';

import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { DetailsNumberLine, TxModalDetails } from '../FlowCommons/TxModalDetails';
import { SGhoVaultDepositActions } from './SGhoVaultDepositActions';

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
}

export const SGhoVaultDepositModalContent = () => {
  const { chainId: connectedChainId } = useWeb3Context();
  const { chainId: targetChainId, sdkChainId, marketKey } = useSavingsMarketData();
  const { mainTxState, txError, gasLimit } = useModalContext();

  const [_amount, setAmount] = useState('');

  // On-chain wallet GHO balance — see SGhoCard for the same reasoning.
  const marketData = marketsData[marketKey];
  const { walletBalances } = useWalletBalances(marketData);
  const ghoAddress = marketData.addresses.GHO_TOKEN_ADDRESS?.toLowerCase() ?? '';
  const walletBalance = walletBalances[ghoAddress]?.amount ?? '0';

  const handleChange = (value: string) => {
    if (value === '-1') {
      setAmount(value);
    } else {
      setAmount(roundToTokenDecimals(value, 18));
    }
  };

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? walletBalance : _amount;

  // Debounce the amount so the preview hook (and any future backend simulation
  // hook) don't fire on every keystroke. Max is applied immediately — it's a
  // discrete click, not progressive typing.
  const debouncedAmount = useDebouncedValue(amount);
  const effectiveAmount = isMaxSelected ? amount : debouncedAmount;

  const numericAmount = parseFloat(effectiveAmount);
  const previewAmount = !isNaN(numericAmount) && numericAmount > 0 ? numericAmount.toString() : '0';
  const { data: previewShares, loading: previewFetching } = useSghoVaultPreviewDeposit({
    amount: bigDecimal(previewAmount),
    chainId: sdkChainId,
  });

  // Show loading while the typed amount is still settling through the debounce
  // OR while the SDK preview query is fetching the new value.
  const debouncePending = amount !== effectiveAmount;
  const previewLoading = parseFloat(amount) > 0 && (debouncePending || previewFetching);

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

  // Snapshot the amount at submit time — once the deposit mines, the on-chain
  // wallet balance refetches and (for a max deposit) `amount` recomputes to 0,
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
        action={<Trans>deposited</Trans>}
        amount={submittedAmountRef.current ?? amount}
        symbol="sGHO"
      />
    );
  }

  return (
    <>
      <AssetInput
        value={amount}
        onChange={handleChange}
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
      <TxModalDetails gasLimit={gasLimit} chainId={targetChainId}>
        <DetailsNumberLine
          description={<Trans>You&apos;ll receive</Trans>}
          value={previewShares?.value ?? '0'}
          symbol="sGHO"
          loading={previewLoading}
        />
      </TxModalDetails>

      <SGhoVaultDepositActions
        amount={amount}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        sx={{ mt: '48px' }}
      />
    </>
  );
};
