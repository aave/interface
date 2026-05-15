import { valueToBigNumber } from '@aave/math-utils';
import { bigDecimal, useSghoVaultPreviewDeposit } from '@aave/react';
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';
import { Trans } from '@lingui/macro';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { useModalContext } from 'src/hooks/useModal';
import { useSavingsMarketData } from 'src/hooks/useSavingsMarketData';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';

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
  const { marketData, chainId: targetChainId, sdkChainId } = useSavingsMarketData();
  const { mainTxState, txError } = useModalContext();

  const [_amount, setAmount] = useState('');

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

  if (txError && txError.blocking) return <TxErrorView txError={txError} />;
  if (mainTxState.success) {
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

      <SGhoVaultDepositActions
        amount={amount}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
        sx={{ mt: '48px' }}
      />
    </>
  );
};
