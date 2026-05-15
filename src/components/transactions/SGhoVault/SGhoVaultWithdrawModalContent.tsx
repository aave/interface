import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, useSghoVaultPreviewRedeem } from '@aave/react';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { useSGhoVaultContext } from 'src/modules/sGho/SGhoVaultContext';

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
  const { mainTxState, txError } = useModalContext();
  const { vault } = useSGhoVaultContext();

  const [_amount, setAmount] = useState('');

  const sharesBalance = vault?.user?.shares.amount.value ?? '0';

  const isMaxSelected = _amount === '-1';
  const amount = isMaxSelected ? sharesBalance : _amount;

  const previewAmount = parseFloat(amount) > 0 ? amount : '0';
  const { data: previewAssets } = useSghoVaultPreviewRedeem({
    amount: bigDecimal(previewAmount),
    chainId: sdkChainId,
  });

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

  if (txError && txError.blocking) return <TxErrorView txError={txError} />;
  if (mainTxState.success) {
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
