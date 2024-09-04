import { valueToBigNumber } from '@aave/math-utils';
import { Address, beginCell, Cell, OpenedContract, toNano } from '@ton/core';
import { parseUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback } from 'react';
import { Op } from 'src/contracts/JettonConstants';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { Pool } from 'src/contracts/Pool';
import { getMultiSig } from 'src/contracts/utils';

// import { KeyPair, sign } from 'ton-crypto';
import { address_pools, GAS_FEE_TON } from './app-data-provider/useAppDataProviderTon';
import { FormattedReservesAndIncentives } from './pool/usePoolFormattedReserves';
import { useContract } from './useContract';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';

export const ErrorCancelledTon = [
  'TON Tx Signature: User denied transaction signature.',
  '[ton_connect_sdk_error]tonconnectuierrortransactionwasnotsent',
  '[ton_connect_sdk_error]userrejectserror:userrejectstheactioninthewallet.canceledbytheuser',
  '[ton_connect_sdk_error]e:userrejectstheactioninthewallet.canceledbytheuser',
  '[ton_connect_sdk_error]ertransactionwasnotsent',
];

export const useTonTransactions = (yourAddressWallet: string, underlyingAssetTon: string) => {
  const { onGetGetTxByBOC } = useTonGetTxByBOC();
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
          toNano(`${GAS_FEE_TON}`), //value: bigint, --- gas fee default 1
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

        return { success: true, message: 'success' };
      } catch (error) {
        console.error('Transaction failed:', error);
        console.log(error.message.replace(/\s+/g, '').toLowerCase());
        return { success: false, message: error.message.replace(/\s+/g, '').toLowerCase() };
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

        return { success: true, message: 'success' };
      } catch (error) {
        console.error('Transaction failed:', error);
        console.log(error.message.replace(/\s+/g, '').toLowerCase());
        return { success: false, message: error.message.replace(/\s+/g, '').toLowerCase() };
      }
    },
    [client, providerPoolAssetTon, sender, yourAddressWallet]
  );

  const onSendSupplyTon = useCallback(
    async (amount: string, isJetton: boolean | undefined) => {
      try {
        let res:
          | boolean
          | {
              success: boolean;
              message: string;
            }
          | undefined;
        if (isJetton) res = await onSendJettonToken(amount);
        else res = await onSendNativeToken(amount);

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);

        if (txHash && !!res?.success) {
          // setInterval(async () => {
          // }, 5000);
          // const status = await getTransactionStatus(txHash, yourAddressWallet);
          // console.log('status--------------', status);

          return { success: true, txHash: txHash };
        } else if (_.includes(ErrorCancelledTon, res?.message)) {
          return {
            success: false,
            error: ErrorCancelledTon[0],
          };
        }
      } catch (error) {
        return { success: false, error: error?.message };
      }
    },
    [getLatestBoc, onGetGetTxByBOC, onSendJettonToken, onSendNativeToken, yourAddressWallet]
  );

  const onSendBorrowJettonToken = useCallback(
    async (amount: string, poolReserve: FormattedReservesAndIncentives) => {
      if (!poolReserve || !providerPool || !poolReserve.poolJettonWalletAddress) return;
      try {
        const decimal = poolReserve.decimals; // poolReserve.decimals
        const parseAmount = parseUnits(
          valueToBigNumber(amount).toFixed(decimal),
          decimal
        ).toString();

        const dataMultiSig = await getMultiSig({
          isMock: false,
        });

        const params = {
          queryId: Date.now(),
          poolJettonWalletAddress: Address.parse(poolReserve.poolJettonWalletAddress),
          amount: BigInt(parseAmount),
          priceData: dataMultiSig,
        };

        await providerPool.sendBorrow(
          sender, //via: Sender
          params //via: Sender,
        );

        return { success: true, message: 'success' };
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, message: error.message.replace(/\s+/g, '').toLowerCase() };
      }
    },
    [providerPool, sender]
  );

  const onSendBorrowTon = useCallback(
    async (amount: string, poolReserve: FormattedReservesAndIncentives) => {
      if (!poolReserve || !providerPool || !poolReserve.poolJettonWalletAddress)
        return { success: false, message: 'error' };

      try {
        const res = await onSendBorrowJettonToken(amount, poolReserve);

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);

        if (txHash && !!res?.success) {
          // setInterval(async () => {
          // }, 5000);
          // const status = await getTransactionStatus(txHash, yourAddressWallet);
          // console.log('status--------------', status);

          return { success: true, txHash: txHash };
        } else if (_.includes(ErrorCancelledTon, res?.message)) {
          return {
            success: false,
            error: ErrorCancelledTon[0],
          };
        }
      } catch (error) {
        return { success: false, error };
      }
    },
    [getLatestBoc, onGetGetTxByBOC, onSendBorrowJettonToken, providerPool, yourAddressWallet]
  );

  const onToggleCollateralTon = useCallback(
    async (poolJWAddress: string, status: boolean) => {
      if (!client || !providerPool || !poolJWAddress) return;
      try {
        const dataMultiSig = await getMultiSig({
          isMock: false,
        });

        const params = {
          poolJWAddress: Address.parse(poolJWAddress),
          useAsCollateral: status,
          priceData: dataMultiSig,
        };

        await providerPool.sendSetUseReserveAsCollateral(sender, params);

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);

        if (txHash) {
          return { success: true, txHash: txHash };
        } else {
          throw Error('Error');
        }
      } catch (error) {
        console.error('Transaction failed:', error);
        const errorToCheck = error.message.replace(/\s+/g, '').toLowerCase();
        if (_.includes(ErrorCancelledTon, errorToCheck)) {
          return {
            success: false,
            error: ErrorCancelledTon[0],
          };
        } else {
          return { success: false, error };
        }
      }
    },
    [client, getLatestBoc, onGetGetTxByBOC, providerPool, sender, yourAddressWallet]
  );

  return {
    approvedAmountTonAssume,
    onSendSupplyTon,
    onSendBorrowTon,
    onToggleCollateralTon,
  };
};
