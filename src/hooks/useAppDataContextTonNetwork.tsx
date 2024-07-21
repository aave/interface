import dataAssumeReserves from '@public/assume-reserves.json';
import { Address, Cell, ContractProvider, OpenedContract, Sender, toNano } from '@ton/core';
import { useCallback, useEffect, useState } from 'react';
import { JettonMinter } from 'src/contracts/JettonMinter';
import { JettonWallet } from 'src/contracts/JettonWallet';
import { Pool } from 'src/contracts/Pool';
import { useContract } from 'src/hooks/useContract';
import { useTonConnectContext } from 'src/libs/hooks/useTonConnectContext';
import { DashboardReserve } from 'src/utils/dashboardSortUtils';

import { WalletBalancesMap } from './app-data-provider/useWalletBalances';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';

export interface interfaceSendSupply {
  provider: ContractProvider;
  via: Sender;
  value: bigint;
  jetton_amount: bigint;
  toPool: Address;
  responseAddress: Address; // address of user make tx
  customPayload: Cell; //Cell.EMPTY
  forward_ton_amount: bigint;
  tokenAddress: Address;
}

const address_pools = 'EQCvM_iN3f_bqO_ADopJ8SR8ix5YT8wDBxfuQQ6B0QNKbhzV';

export function useAppDataContextTonNetwork() {
  const dataReserves = dataAssumeReserves as unknown as DashboardReserve[];
  const { walletAddressTonWallet } = useTonConnectContext();
  const client = useTonClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [listPoolContract, setListPoolContract] = useState<unknown>([]);
  const [reservesTon, setReservesTon] = useState<DashboardReserve[]>();
  const [walletBalancesTon, setWalletBalancesTon] = useState<WalletBalancesMap>();
  const poolContract = useContract<Pool>(address_pools, Pool);
  const { sender } = useTonConnect();

  const onGetBalance = useCallback(
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
      return balance;
    },
    [client, walletAddressTonWallet]
  );

  useEffect(() => {
    if (!poolContract) return;
    poolContract.getReservesList().then(setListPoolContract);
  }, [poolContract]);

  useEffect(() => {
    if (!poolContract || !client || !walletAddressTonWallet) return;
    setLoading(true);
    const getValueReserve = async () => {
      const reserve = await poolContract.getReservesData();
      const arr = await Promise.all(
        reserve.map(async (item) => {
          const walletBalance = await onGetBalance(
            'kQCb4tUBkfQ_eqaO1yRhPpyqBADvQn5P09_GumokdIgHxbj_'
          );
          console.log(
            'walletBalancewalletBalancewalletBalancewalletBalance',
            walletBalance?.toString()
          );
          return {
            // ...item,
            // id: '1-eqco6bp6wqbhrdrdahmtwizjvdmk1lg_-_qox5d7qpvj_ed5-0x2f39d218133afab8f2b819b1066c7e434ad94e9e',
            name: 'ETHx',
            symbol: 'ETHx',
            decimals: 18,
            baseLTVasCollateral: '7450',
            reserveLiquidationThreshold: '7700',
            reserveLiquidationBonus: '10750',
            usageAsCollateralEnabled: true,
            borrowingEnabled: true,
            stableBorrowRateEnabled: false,
            isActive: true,
            isFrozen: false,
            variableBorrowIndex: '1000336281593385554723464203',
            liquidityRate: '31123474726224900471975',
            variableBorrowRate: '2386587374537667364806198',
            stableBorrowRate: '70000000000000000000000000',
            aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
            stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
            variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
            interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
            availableLiquidity: '2314651612891643030158',
            totalPrincipalStableDebt: '0',
            averageStableRate: '0',
            stableDebtLastUpdateTimestamp: 0,
            totalScaledVariableDebt: '36.053394800123496879',
            priceInMarketReferenceCurrency: '352765932594',
            priceOracle: '0xD6270dAabFe4862306190298C2B48fed9e15C847',
            variableRateSlope1: '70000000000000000000000000',
            variableRateSlope2: '3000000000000000000000000000',
            stableRateSlope1: '0',
            stableRateSlope2: '0',
            baseStableBorrowRate: '70000000000000000000000000',
            baseVariableBorrowRate: '0',
            optimalUsageRatio: '450000000000000000000000000',
            isPaused: false,
            debtCeiling: '0',
            eModeCategoryId: 1,
            eModeLtv: 9300,
            eModeLiquidationThreshold: 9500,
            eModeLiquidationBonus: 10100,
            eModePriceSource: '0x0000000000000000000000000000000000000000',
            eModeLabel: 'ETH correlated',
            borrowableInIsolation: false,
            accruedToTreasury: '2830594058160721',
            unbacked: '0',
            isolationModeTotalDebt: '0',
            debtCeilingDecimals: 2,
            isSiloedBorrowing: false,
            flashLoanEnabled: true,
            totalDebt: '36.065596887825658831',
            totalStableDebt: '0',
            totalVariableDebt: '36.065596887825658831',
            totalLiquidity: '2350.717209779468688989',
            borrowUsageRatio: '0.01534238007778448775',
            supplyUsageRatio: '0.01534238007778448775',
            formattedReserveLiquidationBonus: '0.075',
            formattedEModeLiquidationBonus: '0.01',
            formattedEModeLiquidationThreshold: '0.95',
            formattedEModeLtv: '0.93',
            supplyAPY: '0.00003112395906657383',
            variableBorrowAPY: '0.00238943754103481217',
            stableBorrowAPY: '0.07250818117089440143',
            formattedAvailableLiquidity: '2314.651612891643030158',
            unborrowedLiquidity: '2314.651612891643030158',
            formattedBaseLTVasCollateral: '0.745',
            supplyAPR: '0.0000311234747262249',
            variableBorrowAPR: '0.00238658737453766736',
            stableBorrowAPR: '0.07',
            formattedReserveLiquidationThreshold: '0.77',
            debtCeilingUSD: '0',
            isolationModeTotalDebtUSD: '0',
            availableDebtCeilingUSD: '0',
            isIsolated: false,
            totalLiquidityUSD: '8292529.48772619809145027124',
            availableLiquidityUSD: '1001623.84509386917457247047',
            totalDebtUSD: '127227.13920693082542400187',
            totalVariableDebtUSD: '127227.13920693082542400187',
            totalStableDebtUSD: '0',
            formattedPriceInMarketReferenceCurrency: '3527.65932594',
            priceInUSD: '3527.65932594',
            borrowCapUSD: '1128850.9843008',
            supplyCapUSD: '11288509.843008',
            unbackedUSD: '0',
            aIncentivesData: [
              {
                incentiveAPR: '0.02478541814898917815',
                rewardTokenAddress: '0x30D20208d987713f46DFD34EF128Bb16C404D10f',
                rewardTokenSymbol: 'SD',
              },
            ],
            vIncentivesData: [],
            sIncentivesData: [],
            iconSymbol: 'ETHX',
            isEmodeEnabled: true,
            isWrappedBaseAsset: false,
            reserve: {
              id: '1-eqco6bp6wqbhrdrdahmtwizjvdmk1lg_-_qox5d7qpvj_ed5-0x2f39d218133afab8f2b819b1066c7e434ad94e9e',
              underlyingAsset: 'eqco6bp6wqbhrdrdahmtwizjvdmk1lg_-_qox5d7qpvj_ed5',
              name: 'ETHx',
              symbol: 'ETHx',
              decimals: 18,
              baseLTVasCollateral: '7450',
              reserveLiquidationThreshold: '7700',
              reserveLiquidationBonus: '10750',
              reserveFactor: '0.15',
              usageAsCollateralEnabled: true,
              borrowingEnabled: true,
              stableBorrowRateEnabled: false,
              isActive: true,
              isFrozen: false,
              liquidityIndex: '1000022049756451495411451411',
              variableBorrowIndex: '1000336281593385554723464203',
              liquidityRate: '31123474726224900471975',
              variableBorrowRate: '2386587374537667364806198',
              stableBorrowRate: '70000000000000000000000000',
              lastUpdateTimestamp: 1721331935,
              aTokenAddress: '0x1c0E06a0b1A4c160c17545FF2A951bfcA57C0002',
              stableDebtTokenAddress: '0xBDfa7DE5CF7a7DdE4F023Cac842BF520fcF5395C',
              variableDebtTokenAddress: '0x08a8Dc81AeA67F84745623aC6c72CDA3967aab8b',
              interestRateStrategyAddress: '0x48AF11111764E710fcDcE2750db848C63edab57B',
              availableLiquidity: '2314651612891643030158',
              totalPrincipalStableDebt: '0',
              averageStableRate: '0',
              stableDebtLastUpdateTimestamp: 0,
              totalScaledVariableDebt: '36.053394800123496879',
              priceInMarketReferenceCurrency: '352765932594',
              priceOracle: '0xD6270dAabFe4862306190298C2B48fed9e15C847',
              variableRateSlope1: '70000000000000000000000000',
              variableRateSlope2: '3000000000000000000000000000',
              stableRateSlope1: '0',
              stableRateSlope2: '0',
              baseStableBorrowRate: '70000000000000000000000000',
              baseVariableBorrowRate: '0',
              optimalUsageRatio: '450000000000000000000000000',
              isPaused: false,
              debtCeiling: '0',
              eModeCategoryId: 1,
              borrowCap: '320',
              supplyCap: '3200',
              eModeLtv: 9300,
              eModeLiquidationThreshold: 9500,
              eModeLiquidationBonus: 10100,
              eModePriceSource: '0x0000000000000000000000000000000000000000',
              eModeLabel: 'ETH correlated',
              borrowableInIsolation: false,
              accruedToTreasury: '2830594058160721',
              unbacked: '0',
              isolationModeTotalDebt: '0',
              debtCeilingDecimals: 2,
              isSiloedBorrowing: false,
              flashLoanEnabled: true,
              totalDebt: '36.065596887825658831',
              totalStableDebt: '0',
              totalVariableDebt: '36.065596887825658831',
              totalLiquidity: '2350.717209779468688989',
              borrowUsageRatio: '0.01534238007778448775',
              supplyUsageRatio: '0.01534238007778448775',
              formattedReserveLiquidationBonus: '0.075',
              formattedEModeLiquidationBonus: '0.01',
              formattedEModeLiquidationThreshold: '0.95',
              formattedEModeLtv: '0.93',
              supplyAPY: '0.00003112395906657383',
              variableBorrowAPY: '0.00238943754103481217',
              stableBorrowAPY: '0.07250818117089440143',
              formattedAvailableLiquidity: '2314.651612891643030158',
              unborrowedLiquidity: '2314.651612891643030158',
              formattedBaseLTVasCollateral: '0.745',
              supplyAPR: '0.0000311234747262249',
              variableBorrowAPR: '0.00238658737453766736',
              stableBorrowAPR: '0.07',
              formattedReserveLiquidationThreshold: '0.77',
              debtCeilingUSD: '0',
              isolationModeTotalDebtUSD: '0',
              availableDebtCeilingUSD: '0',
              isIsolated: false,
              totalLiquidityUSD: '8292529.48772619809145027124',
              availableLiquidityUSD: '1001623.84509386917457247047',
              totalDebtUSD: '127227.13920693082542400187',
              totalVariableDebtUSD: '127227.13920693082542400187',
              totalStableDebtUSD: '0',
              formattedPriceInMarketReferenceCurrency: '3527.65932594',
              priceInUSD: '3527.65932594',
              borrowCapUSD: '1128850.9843008',
              supplyCapUSD: '11288509.843008',
              unbackedUSD: '0',
              aIncentivesData: [
                {
                  incentiveAPR: '0.02478541814898917815',
                  rewardTokenAddress: '0x30D20208d987713f46DFD34EF128Bb16C404D10f',
                  rewardTokenSymbol: 'SD',
                },
              ],
              vIncentivesData: [],
              sIncentivesData: [],
              iconSymbol: 'ETHX',
              isEmodeEnabled: true,
              isWrappedBaseAsset: false,
            },
            walletBalance: walletBalance?.toString() || '0',
            walletBalanceUSD: '0',
            availableToDeposit: '0',
            availableToDepositUSD: '0',
            usageAsCollateralEnabledOnUser: true,
            detailsAddress: 'eqco6bp6wqbhrdrdahmtwizjvdmk1lg_-_qox5d7qpvj_ed5',

            //
            LTV: item.LTV.toString(),
            borrowBalance: item.borrowBalance.toString(),
            borrowCap: item.borrowCap.toString(),
            borrowIndex: item.borrowIndex.toString(),
            currentBorrowRate: item.currentBorrowRate.toString(),
            currentLiquidityRate: item.currentLiquidityRate.toString(),
            lastUpdateTimestamp: Number(item.lastUpdateTimestamp.toString()),
            liquidityIndex: item.liquidityIndex.toString(),
            reserveFactor: item.reserveFactor.toString(),
            supplyBalance: item.supplyBalance.toString(),
            supplyCap: item.supplyCap.toString(),
            underlyingAsset: 'eqco6bp6wqbhrdrdahmtwizjvdmk1lg_-_qox5d7qpvj_ed5',
            //

            id: item.underlyingAsset.toString(),
          };
        })
      );
      const mergedArray = JSON.parse(JSON.stringify([...arr, ...dataReserves]));
      setReservesTon(mergedArray as unknown as DashboardReserve[]);
      setLoading(false);
    };
    getValueReserve();
  }, [client, dataReserves, onGetBalance, poolContract, walletAddressTonWallet]);

  const onSendSupply = useCallback(
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

  useEffect(() => {
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

  // const walletBalancesTon: WalletBalancesMap = {
  //   'eqco6bp6wqbhrdrdahmtwizjvdmk1lg_-_qox5d7qpvj_ed5': {
  //     amount: '1500000000000',
  //     amountUSD: '0',
  //   },
  //   '0x0b2c639c533813f4aa9d7837caf62653d097ff85': {
  //     amount: '0.5001750',
  //     amountUSD: '0',
  //   },
  //   '0x76fb31fb4af56892a25e32cfc43de717950c9278': {
  //     amount: '0.0034669',
  //     amountUSD: '0',
  //   },
  //   '0xc40f949f8a4e094d1b49a23ea9241d289b7b2819': {
  //     amount: '0.3004372',
  //     amountUSD: '0',
  //   },
  // };

  const userReserveTon = {
    id: '534352-0x3945eb8822bf488b41a9a84039c717e09b3c4282-0x5300000000000000000000000000000000000004-0x69850d0b276776781c063771b161bd8894bcdd04',
    underlyingAsset: '0x5300000000000000000000000000000000000004',
    scaledATokenBalance: '0',
    usageAsCollateralEnabledOnUser: false,
    stableBorrowRate: '0',
    scaledVariableDebt: '0',
    principalStableDebt: '0',
    stableBorrowLastUpdateTimestamp: 0,
    reserve: {
      id: '534352-0x5300000000000000000000000000000000000004-0x69850d0b276776781c063771b161bd8894bcdd04',
      underlyingAsset: '0x5300000000000000000000000000000000000004',
      name: 'Wrapped ETH',
      symbol: 'WETH',
      decimals: 18,
      baseLTVasCollateral: '7500',
      reserveLiquidationThreshold: '7800',
      reserveLiquidationBonus: '10600',
      reserveFactor: '0.15',
      usageAsCollateralEnabled: true,
      borrowingEnabled: true,
      stableBorrowRateEnabled: false,
      isActive: true,
      isFrozen: false,
      liquidityIndex: '1003080200887518046516376834',
      variableBorrowIndex: '1007010314009521918134925942',
      liquidityRate: '8329255460843957063209850',
      variableBorrowRate: '18185720701029778023538935',
      stableBorrowRate: '69226991967925284250992031',
      lastUpdateTimestamp: 1721374270,
      aTokenAddress: '0xf301805bE1Df81102C957f6d4Ce29d2B8c056B2a',
      stableDebtTokenAddress: '0x117d9cF336287F46DBE509a43925cFF115Aa563c',
      variableDebtTokenAddress: '0xfD7344CeB1Df9Cf238EcD667f4A6F99c6Ef44a56',
      interestRateStrategyAddress: '0xE9EcAE0EDA2A97BB6a06a6244FfdFa6b1D886967',
      availableLiquidity: '17074696638490308698754',
      totalPrincipalStableDebt: '0',
      averageStableRate: '0',
      stableDebtLastUpdateTimestamp: 0,
      totalScaledVariableDebt: '19811.646899489503912067',
      priceInMarketReferenceCurrency: '342405000000',
      priceOracle: '0x6bF14CB0A831078629D993FDeBcB182b21A8774C',
      variableRateSlope1: '27000000000000000000000000',
      variableRateSlope2: '800000000000000000000000000',
      stableRateSlope1: '33000000000000000000000000',
      stableRateSlope2: '800000000000000000000000000',
      baseStableBorrowRate: '47000000000000000000000000',
      baseVariableBorrowRate: '0',
      optimalUsageRatio: '800000000000000000000000000',
      isPaused: false,
      debtCeiling: '0',
      eModeCategoryId: 1,
      borrowCap: '34000',
      supplyCap: '45000',
      eModeLtv: 9000,
      eModeLiquidationThreshold: 9300,
      eModeLiquidationBonus: 10100,
      eModePriceSource: '0x0000000000000000000000000000000000000000',
      eModeLabel: 'ETH correlated',
      borrowableInIsolation: false,
      accruedToTreasury: '3886603987814300263',
      unbacked: '0',
      isolationModeTotalDebt: '0',
      debtCeilingDecimals: 2,
      isSiloedBorrowing: false,
      flashLoanEnabled: true,
      totalDebt: '19950.532926367650387293',
      totalStableDebt: '0',
      totalVariableDebt: '19950.532926367650387293',
      totalLiquidity: '37025.229564857959086047',
      borrowUsageRatio: '0.53883617092555323821',
      supplyUsageRatio: '0.53883617092555323821',
      formattedReserveLiquidationBonus: '0.06',
      formattedEModeLiquidationBonus: '0.01',
      formattedEModeLiquidationThreshold: '0.93',
      formattedEModeLtv: '0.9',
      supplyAPY: '0.00836404021797486982',
      variableBorrowAPY: '0.01835208788660847489',
      stableBorrowAPY: '0.07167944408569156485',
      formattedAvailableLiquidity: '17074.696638490308698754',
      unborrowedLiquidity: '17074.696638490308698754',
      formattedBaseLTVasCollateral: '0.75',
      supplyAPR: '0.00832925546084395706',
      variableBorrowAPR: '0.01818572070102977802',
      stableBorrowAPR: '0.06922699196792528425',
      formattedReserveLiquidationThreshold: '0.78',
      debtCeilingUSD: '0',
      isolationModeTotalDebtUSD: '0',
      availableDebtCeilingUSD: '0',
      isIsolated: false,
      totalLiquidityUSD: '126776237.29155189480857923035',
      availableLiquidityUSD: '48106077.7334708466913859793',
      totalDebtUSD: '68311622.26652915330861059665',
      totalVariableDebtUSD: '68311622.26652915330861059665',
      totalStableDebtUSD: '0',
      formattedPriceInMarketReferenceCurrency: '3424.05',
      priceInUSD: '3424.05',
      borrowCapUSD: '116417700',
      supplyCapUSD: '154082250',
      unbackedUSD: '0',
      iconSymbol: 'WETH',
      isEmodeEnabled: true,
      isWrappedBaseAsset: true,
    },
    underlyingBalance: '0',
    underlyingBalanceMarketReferenceCurrency: '0',
    underlyingBalanceUSD: '0',
    stableBorrows: '0',
    stableBorrowsMarketReferenceCurrency: '0',
    stableBorrowsUSD: '0',
    variableBorrows: '0',
    variableBorrowsMarketReferenceCurrency: '0',
    variableBorrowsUSD: '0',
    totalBorrows: '0',
    totalBorrowsMarketReferenceCurrency: '0',
    totalBorrowsUSD: '0',
    stableBorrowAPR: '0',
    stableBorrowAPY: '0',
  };

  const symbolTon = 'ETHx';

  const approvedAmountTonAssume = {
    user: '0x6385fb98e0ae7bd76b55a044e1635244e46b07ef',
    token: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    spender: '0xe9E52021f4e11DEAD8661812A0A6c8627abA2a54',
    amount: '-1',
  };

  return {
    symbolTon,
    reservesTon,
    userReserveTon,
    listPoolContract,
    address: 'counterContract?.address.toString()',
    onGetBalance,
    walletBalancesTon,
    onSendSupply,
    loading,
    approvedAmountTonAssume,
  };
}
