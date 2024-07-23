import { Address, fromNano, OpenedContract } from '@ton/core';
import _ from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { useTonClient } from '../useTonClient';
import { WalletBalancesMap } from './useWalletBalances';

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
  const client = useTonClient();

  const onGetBalanceTonNetwork = useCallback(
    async (add: string) => {
      if (!client || !walletAddressTonWallet) return;
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
      return fromNano(balance);
    },
    [client, walletAddressTonWallet]
  );

  return {
    onGetBalanceTonNetwork,
  };
};

export const useWalletBalancesTon = (reservesTon: DashboardReserve[]): WalletBalancesTop => {
  const [walletBalancesTon, setWalletBalancesTon] = useState<WalletBalancesMap>({});
  console.log('walletBalancesTonwalletBalancesTon', walletBalancesTon);
  useMemo(() => {
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
  }, [reservesTon]);

  return {
    walletBalancesTon,
    hasEmptyWallet: _.isEmpty(walletBalancesTon),
    loading: false,
  };
};
