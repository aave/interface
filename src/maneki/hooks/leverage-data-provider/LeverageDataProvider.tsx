import { BigNumber, Contract } from 'ethers';
import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import LENDING_PROTOCOL_DATA_PROVIDER_ABI from 'src/maneki/abi/lendingProtocolDataProviderABI';
import MANEKI_PRICE_ORACLE_ABI from 'src/maneki/abi/priceOracleABI';
import PROXY_TOKEN_ABI from 'src/maneki/abi/proxyTokenABI';
import {
  collateralAssetsType,
  convertReservesTokens,
} from 'src/maneki/modules/leverage/utils/leverageActionHelper';
import { marketsData } from 'src/ui-config/marketsConfig';

interface LeverageData {
  collateralAmount: BigNumber;
  setCollateralAmount: (value: BigNumber) => void;
  collateralValue: BigNumber;
  setCollateralValue: (value: BigNumber) => void;
  collateralAssets: collateralAssetsType[];
  setCollateralAssets: (asset: collateralAssetsType[]) => void;
  walletBalance: BigNumber;
  setWalletBalance: (value: BigNumber) => void;
  leverage: number;
  setLeverage: (value: number) => void;
  apr: BigNumber;
  setApr: (value: BigNumber) => void;
  borrowAmount: { stable: BigNumber; unstable: BigNumber };
  setBorrowAmount: (value: { stable: BigNumber; unstable: BigNumber }) => void;
  leverageLoading: boolean;
  setLeverageLoading: (value: boolean) => void;
  assetsLoading: boolean;
  setAssetsLoading: (value: boolean) => void;
}

export const LeverageDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [collateralAmount, setCollateralAmount] = React.useState<BigNumber>(BigNumber.from(-1));
  const [collateralValue, setCollateralValue] = React.useState<BigNumber>(BigNumber.from(-1));
  const [collateralAssets, setCollateralAssets] = React.useState<collateralAssetsType[]>([]);
  const [walletBalance, setWalletBalance] = React.useState<BigNumber>(BigNumber.from(-1));
  const [leverage, setLeverage] = React.useState<number>(2);
  const [apr, setApr] = React.useState<BigNumber>(BigNumber.from(-1));
  const [borrowAmount, setBorrowAmount] = React.useState({
    stable: BigNumber.from(-1),
    unstable: BigNumber.from(-1),
  });
  const [assetsLoading, setAssetsLoading] = React.useState<boolean>(true);
  const [leverageLoading, setLeverageLoading] = React.useState<boolean>(true);
  const { provider, currentAccount } = useWeb3Context();
  const PROTOCOL_DATA_PROVIDER = marketsData.arbitrum_mainnet_v3.addresses
    .LENDING_PROTOCOL_DATA_PROVIDER as string;
  const PRICE_ORACLE = marketsData.arbitrum_mainnet_v3.addresses.PRICE_ORACLE as string;

  React.useEffect(() => {
    if (!provider || !currentAccount) return;
    const getCollateralAssets = async () => {
      const dataProviderContract = new Contract(
        PROTOCOL_DATA_PROVIDER,
        LENDING_PROTOCOL_DATA_PROVIDER_ABI,
        provider
      );
      const priceOracleContract = new Contract(PRICE_ORACLE, MANEKI_PRICE_ORACLE_ABI, provider);
      try {
        const dataProvider = await dataProviderContract.getAllReservesTokens();
        const assetsObject = convertReservesTokens(dataProvider);
        const priceOracle = await priceOracleContract.getAssetsPrices(
          assetsObject.map((obj) => obj['address'])
        );
        for (let i = 0; i < assetsObject.length; i++) {
          assetsObject[i].value = priceOracle[i];
        }
        const assetWithBalances = (await getAssetsBalance(
          assetsObject,
          currentAccount
        )) as collateralAssetsType[];
        setCollateralAssets(assetWithBalances);
        setAssetsLoading(false);
      } catch (e) {
        console.error(e);
      }
    };
    getCollateralAssets();
  }, [provider, currentAccount, PROTOCOL_DATA_PROVIDER, PRICE_ORACLE]);

  const getAssetsBalance = (collateralAssets: collateralAssetsType[], currentAccount: string) => {
    const assetsCopy = collateralAssets.map((asset) => asset);

    for (let i = 0; i < assetsCopy.length; i++) {
      const contract = new Contract(assetsCopy[i].address, PROXY_TOKEN_ABI, provider);
      const promises = [];

      promises.push(contract.balanceOf(currentAccount) as BigNumber);
      promises.push(contract.decimals() as BigNumber);

      Promise.all(promises)
        .then((data: BigNumber[]) => {
          assetsCopy[i].balance = data[0];
          assetsCopy[i].decimals = data[1];
        })
        .catch((e) => {
          console.log('Asset Balance Error: ', e);
        });
    }

    return assetsCopy;
  };

  return (
    <LeverageContext.Provider
      value={{
        collateralAmount,
        setCollateralAmount,
        collateralValue,
        setCollateralValue,
        collateralAssets,
        setCollateralAssets,
        walletBalance,
        setWalletBalance,
        leverage,
        setLeverage,
        apr,
        setApr,
        borrowAmount,
        setBorrowAmount,
        leverageLoading,
        setLeverageLoading,
        assetsLoading,
        setAssetsLoading,
      }}
    >
      {children}
    </LeverageContext.Provider>
  );
};

export const LeverageContext = React.createContext({} as LeverageData);

export const useLeverageContext = () => {
  const LeverageData = React.useContext(LeverageContext);

  return LeverageData;
};
