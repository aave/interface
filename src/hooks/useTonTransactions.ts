import { Address, beginCell, Cell, OpenedContract, toNano } from '@ton/core';
import { useTonWallet } from '@tonconnect/ui-react';
import { useCallback } from 'react';
import { Op } from 'src/contracts/JettonConstants';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';

export const useTonTransactions = (yourAddressWallet: string) => {
  const { onGetGetTxByBOC, getTransactionStatus } = useTonGetTxByBOC();
  const wallet = useTonWallet();
  const client = useTonClient();
  const { sender, getLatestBoc } = useTonConnect();

  const approvedAmountTonAssume = {
    user: '0x6385fb98e0ae7bd76b55a044e1635244e46b07ef',
    token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    spender: '0xe9E52021f4e11DEAD8661812A0A6c8627abA2a54',
    amount: '-1',
  };

  const onSendSupplyTon = useCallback(
    async (_add: string, amount: string) => {
      if (!client || !yourAddressWallet || !_add || !amount || !wallet || !wallet.account.publicKey)
        return;

      const contractJettonMinter = new JettonMinter(
        Address.parse(_add) // = address asset
      );

      const providerJettonMinter = client.open(
        contractJettonMinter
      ) as OpenedContract<JettonMinter>;

      const walletAddressJettonMinter = await providerJettonMinter.getWalletAddress(
        Address.parse(yourAddressWallet)
      );

      const contractJettonWallet = new JettonWallet(
        walletAddressJettonMinter // z-ton-wallet
      );

      const providerJettonWallet = client.open(
        contractJettonWallet
      ) as OpenedContract<JettonWallet>;

      try {
        await providerJettonWallet.sendTransfer(
          sender, //via: Sender,
          toNano('0.1'), //value: bigint, --- gas fee default 1
          BigInt(amount), // User input amount
          Address.parse(address_pools), //Address poll
          Address.parse(yourAddressWallet), // User address wallet
          Cell.EMPTY, // customPayload: Cell, //Cell.EMPTY
          toNano('0.05'), // forward_ton_amount: bigint,
          beginCell()
            .storeUint(Op.supply, 32)
            .storeAddress(Address.parse(_add)) // = address asset
            .storeUint(1, 1)
            .endCell() //tokenAddress: Address
        );

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);
        if (txHash) {
          // setInterval(async () => {
          // }, 5000);
          const status = await getTransactionStatus(txHash, yourAddressWallet);
          console.log('status--------------', status);

          return { success: true, txHash: txHash };
        }
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [client, getLatestBoc, getTransactionStatus, onGetGetTxByBOC, sender, wallet, yourAddressWallet]
  );

  return {
    approvedAmountTonAssume,
    onSendSupplyTon,
  };
};
