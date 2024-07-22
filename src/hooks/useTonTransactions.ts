import { Address, Cell, OpenedContract, toNano } from '@ton/core';
import { useCallback } from 'react';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';

import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';

export function useTonTransactions() {
  const { walletAddressTonWallet } = useTonConnectContext();
  const client = useTonClient();
  const { sender } = useTonConnect();

  const approvedAmountTonAssume = {
    user: '0x6385fb98e0ae7bd76b55a044e1635244e46b07ef',
    token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    spender: '0xe9E52021f4e11DEAD8661812A0A6c8627abA2a54',
    amount: '-1',
  };

  const onSendSupplyTon = useCallback(
    async (add: string) => {
      if (!client || !walletAddressTonWallet) return;

      const contractJettonWallet = new JettonWallet(Address.parse(add));

      const providerJettonWallet = client.open(
        contractJettonWallet
      ) as OpenedContract<JettonWallet>;
      return await providerJettonWallet.sendSupply(
        sender, //via: Sender,
        toNano('1'), //value: bigint, --- fix cứng 1
        toNano('50'), //jetton_amount: bigint, --- user input amount
        Address.parse('EQBoyA1NN8uoEDR3ePK8PKECaWEMItPEs6Of1W1ljPyn-ne4'), //toPool: Address, --- address poll
        Address.parse(walletAddressTonWallet), //responseAddress: Address -- user address
        Cell.EMPTY, // customPayload: Cell, //Cell.EMPTY
        toNano('0.5'), // forward_ton_amount: bigint,
        Address.parse('kQCb4tUBkfQ_eqaO1yRhPpyqBADvQn5P09_GumokdIgHxbj_') //tokenAddress: Address
      );
    },
    [client, sender, walletAddressTonWallet]
  );

  return {
    approvedAmountTonAssume,
    onSendSupplyTon,
  };
}
