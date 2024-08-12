import { Address, toNano } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { User } from 'src/contracts/User';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
import { FormattedUserReserves } from './pool/useUserSummaryAndIncentives';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';

interface UseTransactionHandlerTonProps {
  yourAddressWallet: string;
}

export const useTonYourSupplies = (yourAddressWallet: string, reserves: DashboardReserve[]) => {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [yourSuppliesTon, setYourSuppliesTon] = useState<FormattedUserReserves[]>([]);

  const onGetYourSupply = useCallback(async () => {
    if (!client || !address_pools || !yourAddressWallet) return;
    const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
    const res = await poolContract.getUserSupplies(Address.parse(yourAddressWallet));
    return res;
  }, [client, yourAddressWallet]);

  const getYourSupplies = useCallback(async () => {
    setLoading(true);

    try {
      if (!client || !address_pools || !yourAddressWallet || !reserves) {
        return;
      }

      const yourSupplies = await onGetYourSupply();

      const result = await Promise.all(
        _.chain(reserves)
          .filter((reserve) =>
            _.some(
              yourSupplies,
              (yourSupply) =>
                reserve.poolJettonWalletAddress === yourSupply.underlyingAddress.toString() &&
                Number(yourSupply.supplyBalance) > 0
            )
          )
          .map(async (reserve) => {
            const matchedSupply = _.find(
              yourSupplies,
              (yourSupply) =>
                reserve.poolJettonWalletAddress === yourSupply.underlyingAddress.toString()
            );
            return {
              ...reserve,
              underlyingBalance: formatUnits(matchedSupply?.supplyBalance || '0', reserve.decimals),
              reserveID: matchedSupply?.underlyingAddress,
              usageAsCollateralEnabledOnUser: matchedSupply?.isCollateral,
              id: reserve.id,
              underlyingAsset: reserve.underlyingAsset,
              scaledATokenBalance: reserve.scaledATokenBalance,
              stableBorrowRate: reserve.stableBorrowRate,
              scaledVariableDebt: reserve.scaledVariableDebt,
              principalStableDebt: reserve.principalStableDebt,
              stableBorrowLastUpdateTimestamp: reserve.stableBorrowLastUpdateTimestamp,
            };
          })
          .value()
      );

      setYourSuppliesTon(result as FormattedUserReserves[]);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    } finally {
      setLoading(false);
    }
  }, [client, yourAddressWallet, reserves, onGetYourSupply]);

  useEffect(() => {
    getYourSupplies();
  }, [client, onGetYourSupply, yourAddressWallet, reserves, getYourSupplies]);

  return {
    yourSuppliesTon,
    getYourSupplies,
    loading,
  };
};

export const useTonCollateral = ({ yourAddressWallet }: UseTransactionHandlerTonProps) => {
  const client = useTonClient();
  const { onGetGetTxByBOC } = useTonGetTxByBOC();
  const { sender, getLatestBoc } = useTonConnect();

  const onToggleCollateralTon = useCallback(
    async (reserveId: string, status: boolean) => {
      if (!client || !yourAddressWallet || !address_pools) {
        return;
      }
      const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
      const userContractAddress = await poolContract.getUserAddress(
        Address.parse(yourAddressWallet)
      );

      const collateralContract = client.open(User.createFromAddress(userContractAddress));
      try {
        await collateralContract.sendUpdateColleteral(
          sender, //via: Sender,
          toNano('0.1'), // gas 0.1
          Address.parse(reserveId), // reserveID
          status // true = isCollateral, false = unCollateral
        );

        const boc = await getLatestBoc();
        const txHash = await onGetGetTxByBOC(boc, yourAddressWallet);
        if (txHash) {
          return { success: true, txHash: txHash };
        }
      } catch (error) {
        console.error('Transaction failed:', error);
        return { success: false, error };
      }
    },
    [client, getLatestBoc, onGetGetTxByBOC, sender, yourAddressWallet]
  );

  return {
    onToggleCollateralTon,
  };
};
