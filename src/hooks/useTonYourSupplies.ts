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

export interface UserSuppliesType {
  supplyBalance: bigint;
  stableBorrowBalance: bigint;
  variableBorrowBalance: bigint;
  previousIndex: bigint;
  isCollateral: boolean;
  underlyingAddress: string;
}

export const useTonYourSupplies = (yourAddressWallet: string, reserves: DashboardReserve[]) => {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [yourSuppliesTon, setYourSuppliesTon] = useState<FormattedUserReserves[]>([]);
  const [userSupplies, setUserSupplies] = useState<UserSuppliesType[]>([]);

  const getYourSupplies = useCallback(async () => {
    let attempts = 0;
    const maxAttempts = 10;
    setLoading(true);

    const fetchData = async () => {
      try {
        attempts++;
        if (!client || !address_pools || !yourAddressWallet) return;
        const poolContract = client.open(Pool.createFromAddress(Address.parse(address_pools)));
        const res = await poolContract.getUserSupplies(Address.parse(yourAddressWallet));
        return setUserSupplies(res);
      } catch (error) {
        console.error(`Error fetching getYourSupplies (attempt ${attempts}):`, error);
        if (attempts < maxAttempts) {
          console.log('Retrying...');
          await fetchData();
        } else {
          console.log('Max attempts reached, stopping retries. getYourSupplies');
          setUserSupplies([]);
        }
      } finally {
        if (attempts >= maxAttempts || (attempts < maxAttempts && userSupplies.length > 0)) {
          setLoading(false);
        }
      }
    };

    await fetchData();
  }, [client, userSupplies.length, yourAddressWallet]);

  useEffect(() => {
    getYourSupplies();
  }, [client, getYourSupplies, yourAddressWallet]);

  const onMatchDataYourSupplies = useCallback(async () => {
    try {
      const result = await Promise.all(
        _.chain(reserves)
          .filter((reserve) =>
            _.some(
              userSupplies,
              (yourSupply) =>
                reserve.poolJettonWalletAddress === yourSupply.underlyingAddress.toString() &&
                Number(yourSupply.supplyBalance) > 0
            )
          )
          .map(async (reserve) => {
            const matchedSupply = _.find(
              userSupplies,
              (yourSupply) =>
                reserve.poolJettonWalletAddress === yourSupply.underlyingAddress.toString()
            );

            const underlyingBalance = formatUnits(
              matchedSupply?.supplyBalance || '0',
              reserve.decimals
            );

            const variableBorrows = formatUnits(
              matchedSupply?.variableBorrowBalance || '0',
              reserve.decimals
            );

            const underlyingBalanceUSD = (
              parseFloat(reserve.priceInUSD) * parseFloat(underlyingBalance)
            ).toString();

            const variableBorrowsUSD = (
              parseFloat(reserve.priceInUSD) * parseFloat(variableBorrows)
            ).toString();

            return {
              ...reserve,
              underlyingBalance,
              underlyingBalanceUSD,

              variableBorrowsUSD,
              variableBorrows,

              reserveID: matchedSupply?.underlyingAddress.toString(),
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
    }
  }, [reserves, userSupplies]);

  useEffect(() => {
    onMatchDataYourSupplies();
  }, [reserves, userSupplies, onMatchDataYourSupplies]);

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
        await collateralContract.sendUpdateCollateral(
          sender, //via: Sender,
          toNano('0.3'), // gas 0.1
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
