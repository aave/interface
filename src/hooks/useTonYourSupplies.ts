import { Address, toNano } from '@ton/core';
import { formatUnits } from 'ethers/lib/utils';
import _ from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { Pool } from 'src/contracts/Pool';
import { User } from 'src/contracts/User';
import { ExtendedFormattedUser } from 'src/hooks/pool/useExtendedUserSummaryAndIncentives';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { address_pools } from './app-data-provider/useAppDataProviderTon';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonGetTxByBOC } from './useTonGetTxByBOC';

interface UseTransactionHandlerTonProps {
  yourAddressWallet: string;
}

export const useTonYourSupplies = (yourAddressWallet: string, reserves: DashboardReserve[]) => {
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [userSummaryTon, setUserSummaryTon] = useState<ExtendedFormattedUser>();
  const [yourSuppliesTon, setYourSuppliesTon] = useState<unknown>([]);

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
      if (!yourSupplies) return;

      const result = _.chain(reserves)
        .filter((reserve) =>
          _.some(
            yourSupplies,
            (yourSupply) =>
              reserve.underlyingAssetTon === yourSupply.underlyingAddress.toString() &&
              Number(yourSupply.supplyBalance) > 0
          )
        )
        .map((reserve) => {
          const matchedSupply = _.find(
            yourSupplies,
            (yourSupply) => reserve.underlyingAssetTon === yourSupply.underlyingAddress.toString()
          );

          return {
            ...reserve,
            underlyingBalance: formatUnits(matchedSupply?.supplyBalance || '0', reserve.decimals),
            usageAsCollateralEnabledOnUser: matchedSupply?.isCollateral,
            reserveID: matchedSupply?.reserveID,
          };
        })
        .value();
      setYourSuppliesTon(result);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    } finally {
      setLoading(false);
    }
  }, [client, yourAddressWallet, reserves, onGetYourSupply]);

  useEffect(() => {
    getYourSupplies();
  }, [client, onGetYourSupply, yourAddressWallet, reserves, getYourSupplies]);

  useEffect(() => {
    const res = {
      userReservesData: yourSuppliesTon,
      totalLiquidityMarketReferenceCurrency: '0',
      totalLiquidityUSD: '0',
      totalCollateralMarketReferenceCurrency: '0',
      totalCollateralUSD: '0',
      totalBorrowsMarketReferenceCurrency: '0',
      totalBorrowsUSD: '0',
      netWorthUSD: '0',
      availableBorrowsMarketReferenceCurrency: '0',
      availableBorrowsUSD: '0',
      currentLoanToValue: '0',
      currentLiquidationThreshold: '0',
      healthFactor: '-1',
      isInIsolationMode: false,
      calculatedUserIncentives: {},
      userEmodeCategoryId: 0,
      isInEmode: false,
      earnedAPY: 0,
      debtAPY: 0,
      netAPY: 0,
    };
    setUserSummaryTon(res as ExtendedFormattedUser);
  }, [yourSuppliesTon]);

  return {
    yourSuppliesTon,
    getYourSupplies,
    loading,
    userSummaryTon,
  };
};

export const useTonCollateral = ({ yourAddressWallet }: UseTransactionHandlerTonProps) => {
  const client = useTonClient();
  const { onGetGetTxByBOC } = useTonGetTxByBOC();
  const { sender, getLatestBoc } = useTonConnect();

  const onToggleCollateralTon = useCallback(
    async (reserveId: number, status: boolean) => {
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
          BigInt(reserveId), // reserveID
          BigInt(status) // true = isCollateral, false = unCollateral
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
