import { Address, OpenedContract } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export const useGetBalanceTon = (isConnectedTonWallet: boolean) => {
  const { walletAddressTonWallet } = useTonConnectContext();
  const { balance: yourWalletBalanceTon, loading: loadingTokenTon } = useTonBalance(
    walletAddressTonWallet,
    isConnectedTonWallet
  );
  const client = useTonClient();

  useEffect(() => {
    console.log('balance- ton-------', yourWalletBalanceTon, isConnectedTonWallet);
  }, [yourWalletBalanceTon, isConnectedTonWallet]);

  const onGetBalanceTonNetwork = useCallback(
    async (add: string, decimals: string | number) => {
      if (!client || !walletAddressTonWallet) {
        console.error('Client or wallet address is not available.');
        return '0';
      }
      try {
        const minterAddress = JettonMinter.createFromAddress(
          Address.parse(add)
        )?.address.toRawString();

        if (!minterAddress) {
          console.error('Minter address not found.');
          return '0';
        }

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
      } catch (error) {
        console.error('Error fetching Jetton balance:', error);
        return '0';
      }
    },
    [client, walletAddressTonWallet]
  );

  return {
    onGetBalanceTonNetwork,
    yourWalletBalanceTon,
    loadingTokenTon,
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
