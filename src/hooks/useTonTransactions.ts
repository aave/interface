import { Address, beginCell, Cell, OpenedContract, toNano } from '@ton/core';
import { useCallback } from 'react';
import { Op } from 'src/contracts/JettonConstants';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { Pool } from 'src/contracts/Pool';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
import { useContract } from './useContract';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';
import { getKeyPair } from 'src/contracts/utils';
import { KeyPair, sign } from 'ton-crypto';
import { parseUnits } from 'ethers/lib/utils';
import { FormattedReservesAndIncentives } from './pool/usePoolFormattedReserves';

export const useTonTransactions = (yourAddressWallet: string, underlyingAssetTon: string) => {
  const { onGetGetTxByBOC, getTransactionStatus } = useTonGetTxByBOC();
  const client = useTonClient();
  const { sender, getLatestBoc } = useTonConnect();

  const providerJettonMinter = useContract<JettonMinter>(underlyingAssetTon, JettonMinter);
  const providerPoolAssetTon = useContract<Pool>(underlyingAssetTon, Pool);
  const providerPool = useContract<Pool>(address_pools, Pool);

  const approvedAmountTonAssume = {
    user: '0x6385fb98e0ae7bd76b55a044e1635244e46b07ef',
    token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    spender: '0xe9E52021f4e11DEAD8661812A0A6c8627abA2a54',
    amount: '-1',
  };

  const onSendJettonToken = useCallback(
    async (amount: string) => {
      if (!client || !yourAddressWallet || !amount || !providerJettonMinter) return;

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
          toNano('0.3'), //value: bigint, --- gas fee default 1
          BigInt(amount), // User input amount
          Address.parse(address_pools), //Address poll
          Address.parse(yourAddressWallet), // User address wallet
          Cell.EMPTY, // customPayload: Cell, //Cell.EMPTY
          toNano('0.1'), // forward_ton_amount: bigint,
          beginCell()
            .storeUint(Op.supply, 32)
            .storeAddress(Address.parse(underlyingAssetTon)) // = address asset
            .storeUint(1, 1)
            .endCell() //tokenAddress: Address
        );

        return true;
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [client, providerJettonMinter, sender, underlyingAssetTon, yourAddressWallet]
  );

  const onSendNativeToken = useCallback(
    async (amount: string) => {
      if (!client || !yourAddressWallet || !amount || !providerPoolAssetTon) return;
      try {
        const params = {
          queryId: Date.now(),
          amount: BigInt(amount),
        };
        await providerPoolAssetTon.sendDeposit(
          sender, //via: Sender
          params //via: Sender
        );

        return true;
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [client, providerPoolAssetTon, sender, yourAddressWallet]
  );

  const onSendSupplyTon = useCallback(
    async (amount: string, isJetton: boolean | undefined) => {
      try {
        if (isJetton) await onSendJettonToken(amount);
        else await onSendNativeToken(amount);

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
    [
      getLatestBoc,
      getTransactionStatus,
      onGetGetTxByBOC,
      onSendJettonToken,
      onSendNativeToken,
      yourAddressWallet,
    ]
  );

  const onSendBorrowTon = useCallback(
    async (amount: string, poolReserve: FormattedReservesAndIncentives) => {
      try {
        const beKeyPair: KeyPair = await getKeyPair();
        if (!client || !amount || !providerPool || !poolReserve.poolJettonWalletAddress) return;
        if (!beKeyPair || !beKeyPair.secretKey) {
          throw new Error('Invalid KeyPair or secretKey is missing');
        }

        const parseAmount = parseUnits(amount, poolReserve.decimals);
        const parsePrice = parseUnits(poolReserve.priceInUSD, poolReserve.decimals);
        const dataPrice = beginCell().storeInt(+parsePrice, 32).endCell();

        const sig = sign(dataPrice.hash(), beKeyPair.secretKey);

        const params = {
          queryId: Date.now(),
          poolJettonWalletAddress: Address.parse(poolReserve.poolJettonWalletAddress),
          amount: BigInt(parseAmount.toString()),
          price: BigInt(parsePrice.toString()),
          sig,
        };

        await providerPool.sendBorrow(
          sender, //via: Sender
          params //via: Sender,
        );

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);

        return { success: true, txHash };
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [getLatestBoc, onGetGetTxByBOC, sender, providerPoolAssetTon, yourAddressWallet]
  );

  return {
    approvedAmountTonAssume,
    onSendSupplyTon,
    onSendBorrowTon,
  };
};
