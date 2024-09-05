import { Address, OpenedContract } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { useTonClient } from '../useTonClient';
import { useTonBalance, WalletBalancesMap } from './useWalletBalances';

export interface WalletBalancesTop {
  walletBalancesTon: WalletBalancesMap;
  hasEmptyWallet: boolean;
  loading: boolean;
}

export const useGetNameAssetTon = () => {
  const { walletAddressTonWallet } = useTonConnectContext();
  const client = useTonClient();

  const onGetContentAssetTon = useCallback(
    async (add: string) => {
      if (!client || !walletAddressTonWallet) return;
      const minterAddress = JettonMinter.createFromAddress(
        Address.parse(add)
      )?.address.toRawString();
      const contractJettonMinter = new JettonMinter(Address.parse(minterAddress));
      const providerJettonMinter = client.open(
        contractJettonMinter
      ) as OpenedContract<JettonMinter>;

      const walletAddressJettonMinter = await providerJettonMinter.getContent();
      return walletAddressJettonMinter;
    },
    [client, walletAddressTonWallet]
  );

  return {
    onGetContentAssetTon,
  };
};

export const useGetBalanceTon = () => {
  const { walletAddressTonWallet } = useTonConnectContext();
  const { balance: yourWalletBalanceTon } = useTonBalance(walletAddressTonWallet);
  const client = useTonClient();

  const onGetBalanceTonNetwork = useCallback(
    async (add: string, decimals: string | number, isJetton: boolean) => {
      if (!client || !walletAddressTonWallet) return;
      if (!isJetton) {
        return yourWalletBalanceTon;
      } else {
        const minterAddress = JettonMinter.createFromAddress(
          Address.parse(add)
        )?.address.toRawString();
        const contractJettonMinter = new JettonMinter(Address.parse(minterAddress));
        const providerJettonMinter = client.open(
          contractJettonMinter
        ) as OpenedContract<JettonMinter>;

        const walletAddressJettonMinter = await providerJettonMinter.getWalletAddress(
          Address.parse(walletAddressTonWallet)
        );

        const contractJettonWallet = new JettonWallet(
          Address.parse(walletAddressJettonMinter.toRawString())
        );

        const providerJettonWallet = client.open(
          contractJettonWallet
        ) as OpenedContract<JettonWallet>;

        const balance = await providerJettonWallet.getJettonBalance();

        return formatUnits(balance || '0', decimals);
      }
    },
    [client, walletAddressTonWallet, yourWalletBalanceTon]
  );

  return {
    onGetBalanceTonNetwork,
    yourWalletBalanceTon,
  };
};

export const useWalletBalancesTon = (reservesTon: DashboardReserve[]): WalletBalancesTop => {
  const [walletBalancesTon, setWalletBalancesTon] = useState<WalletBalancesMap>({});
  const [loading, setLoading] = useState<boolean>(false);
  useMemo(() => {
    setLoading(true);
    if (!reservesTon) return;
    const transformedData: WalletBalancesMap = {};
    reservesTon.forEach((item) => {
      const address = item.underlyingAsset;
      transformedData[address] = {
        amount: item.walletBalance,
        amountUSD: item.walletBalanceUSD,
      };
    });
    setWalletBalancesTon(transformedData);
    setLoading(false);
  }, [reservesTon]);

  return {
    walletBalancesTon,
    hasEmptyWallet: _.isEmpty(walletBalancesTon),
    loading: loading,
  };
};
