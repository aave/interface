import { Address, beginCell, Cell, OpenedContract, toNano } from '@ton/core';
import { useCallback } from 'react';
import { Op } from 'src/contracts/JettonConstants';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';

export function useTonTransactions() {
  const { walletAddressTonWallet } = useTonConnectContext();
  const { onGetGetTxByBOC } = useTonGetTxByBOC();
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
      if (!client || !walletAddressTonWallet || !_add || !amount) return;

      const contractJettonMinter = new JettonMinter(
        Address.parse(_add) // = address asset
      );

      const providerJettonMinter = client.open(
        contractJettonMinter
      ) as OpenedContract<JettonMinter>;

      const walletAddressJettonMinter = await providerJettonMinter.getWalletAddress(
        Address.parse(walletAddressTonWallet)
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
          toNano('0.1'), //value: bigint, --- gas fee default
          toNano(amount), // User input amount
          Address.parse(address_pools), //Address poll
          Address.parse(walletAddressTonWallet), // User address wallet
          Cell.EMPTY, // customPayload: Cell, //Cell.EMPTY
          toNano('0.05'), // forward_ton_amount: bigint,
          beginCell()
            .storeUint(Op.supply, 32)
            .storeAddress(Address.parse(_add)) // = address asset
            .endCell() //tokenAddress: Address
        );

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, walletAddressTonWallet);
        if (txHash) {
          return { success: true, txHash: txHash };
        }
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [client, getLatestBoc, onGetGetTxByBOC, sender, walletAddressTonWallet]
  );

  return {
    approvedAmountTonAssume,
    onSendSupplyTon,
  };
}
