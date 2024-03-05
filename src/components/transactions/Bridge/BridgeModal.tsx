import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { API_ETH_MOCK_ADDRESS, ReserveDataHumanized } from '@aave/contract-helpers';
import { providers, Contract, utils, constants } from 'ethers';
import BigNumber from 'bignumber.js';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';

import { normalize } from '@aave/math-utils';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import React, { useEffect, useMemo, useState } from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { NetworkSelect } from 'src/components/transactions/NetworkSelect';
import { ReserveWithBalance } from './SwitchModal';
import { useRootStore } from 'src/store/root';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { AaveV3Ethereum, AaveV3Sepolia } from '@bgd-labs/aave-address-book';
import { getRouterConfig } from './Router';
import { useApprovedAmount } from 'src/hooks/useApprovedAmount';
import { ApprovalMethod } from 'src/store/walletSlice';
import { BridgeActions } from './BridgeActions';
import { TxSuccessView } from '../FlowCommons/Success';

import routerAbi from './Router-abi.json';
import erc20Abi from './IERC20Meta.json';
import {
  CustomMarket,
  getNetworkConfig,
  getProvider,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';
import { NetworkSelector } from '../Switch/NetworkSelector';
import { supportedNetworksWithBridgeMarket } from './common';

import { BasicModal } from '../../primitives/BasicModal';
import { SwitchModalContent } from './SwitchModalContent';
import { AssetInput } from '../AssetInput';

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];
import NetworkConfiguration from '../NetworkSelect';
export interface TokenInfoWithBalance extends TokenInfo {
  balance: string;
}

interface SignedParams {
  signature: string;
  deadline: string;
  amount: string;
  approvedToken: string;
}

export const BridgeModal = () => {
  const {
    type,
    close,
    args: { chainId },
    mainTxState: bridgeTxState,
  } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const [amount, setAmount] = useState('0');
  const [inputAmountUSD, setInputAmount] = useState('');
  const [sourceToken, setSourceToken] = useState('');
  const [destinationToken, setDestinationToken] = useState('');
  const [sourceNetwork, setSourceNetwork] = useState({ chainId: '' });
  const [destinationNetwork, setDestinationNetwork] = useState('');
  const { provider } = useWeb3Context();

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithBridgeMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });

  const [user] = useRootStore((state) => [state.account]);

  // const usePermit = walletApprovalMethodPreference === ApprovalMethod.PERMIT;

  // const [signatureParams, setSignatureParams] = useState<SignedParams | undefined>();
  // const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);

  // useEffect(() => {
  //   if (sourceRouter) {
  //     console.log('sourceRouter foo ---->', sourceRouter);
  //   }
  // }, [sourceRouter]);

  //   const selectedNetworkConfig = getNetworkConfig(selectedChainId);

  //   useEffect(() => {
  //     // Passing chainId as prop will set default network for switch modal
  //     if (chainId && supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === chainId)) {
  //       setSelectedChainId(chainId);
  //     } else if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === currentChainId)) {
  //       setSelectedChainId(currentChainId);
  //     } else {
  //       setSelectedChainId(defaultNetwork.chainId);
  //     }
  //   }, [currentChainId, chainId]);

  const handleChange = (value: string) => {};

  const handleSelectedNetworkChange =
    (networkAction: string) => (network: NetworkConfiguration) => {
      if (networkAction === 'sourceNetwork') {
        setSourceNetwork(network);
      } else {
        setDestinationNetwork(network);
      }
    };

  const marketsBySupportedNetwork = useMemo(
    () =>
      Object.values(marketsData).filter(
        (elem) => elem.chainId === selectedChainId && elem.enabledFeatures?.bridge
      ),
    [selectedChainId]
  );

  const poolReservesDataQueries = usePoolsReservesHumanized(marketsBySupportedNetwork, {
    refetchInterval: 0,
  });

  const selectedNetworkConfig = getNetworkConfig(selectedChainId);

  const networkReserves = poolReservesDataQueries.reduce((acum, elem) => {
    if (elem.data) {
      const wrappedBaseAsset = elem.data.reservesData.find(
        (reserveData) => reserveData.symbol === selectedNetworkConfig.wrappedBaseAssetSymbol
      );
      const acumWithoutBaseAsset = acum.concat(
        elem.data.reservesData.filter(
          (reserveDataElem) =>
            !acum.find((acumElem) => acumElem.underlyingAsset === reserveDataElem.underlyingAsset)
        )
      );
      if (
        wrappedBaseAsset &&
        !acum.find((acumElem) => acumElem.underlyingAsset === API_ETH_MOCK_ADDRESS)
      )
        return acumWithoutBaseAsset.concat({
          ...wrappedBaseAsset,
          underlyingAsset: API_ETH_MOCK_ADDRESS,
          decimals: selectedNetworkConfig.baseAssetDecimals,
          ...fetchIconSymbolAndName({
            underlyingAsset: API_ETH_MOCK_ADDRESS,
            symbol: selectedNetworkConfig.baseAssetSymbol,
          }),
        });
      return acumWithoutBaseAsset;
    }
    return acum;
  }, [] as ReserveDataHumanized[]);

  const poolBalancesDataQueries = usePoolsTokensBalance(marketsBySupportedNetwork, user, {
    refetchInterval: 0,
  });

  const poolsBalances = poolBalancesDataQueries.reduce((acum, elem) => {
    if (elem.data) return acum.concat(elem.data);
    return acum;
  }, [] as UserPoolTokensBalances[]);

  const reservesWithBalance: ReserveWithBalance[] = useMemo(() => {
    return networkReserves.map((elem) => {
      return {
        ...elem,
        ...fetchIconSymbolAndName({
          underlyingAsset: elem.underlyingAsset,
          symbol: elem.symbol,
          name: elem.name,
        }),
        balance: normalize(
          poolsBalances
            .find(
              (balance) =>
                balance.address.toLocaleLowerCase() === elem.underlyingAsset.toLocaleLowerCase()
            )
            ?.amount.toString() || '0',
          elem.decimals
        ),
      };
    });
  }, [networkReserves, poolsBalances]);

  const handleInputChange = (value: string) => {
    if (value === '-1') {
      setAmount(selectedInputToken.balance);
    } else {
      setAmount(value);
    }
  };
  const GHO = reservesWithBalance.find((reserve) => reserve.symbol === 'GHO');

  if (!GHO) return null;

  const maxAmountToSwap = BigNumber.min(GHO.underlyingBalance).toString(10);

  const handleBridge = () => {
    setSourceNetwork(sourceNetwork);
    setDestinationNetwork({ chainId: 421614 }); // destinationNetwork
  };

  const handleBridgeArguments = () => {
    const sourceChain = sourceNetwork;
    const destinationChain = { chainId: 421614 }; // destinationNetwork;
    const destinationAccount = user;
    const tokenAddress = GHO.underlyingAsset;
    // Note for now leaving out
    // const feeTokenAddress = process.argv[7];
    return {
      sourceChain,
      destinationChain,
      destinationAccount,
      tokenAddress,
      amount,
      //   feeTokenAddress,
    };
  };

  const bridgeActionsProps = {
    ...handleBridgeArguments(),
    amountToBridge: amount,
    isWrongNetwork: false, // TODO fix
    poolAddress: GHO.underlying,
    symbol: 'GHO',
    blocked: false,
    decimals: GHO.decimals,
    isWrappedBaseAsset: false,
  };

  if (bridgeTxState.success)
    return (
      <BasicModal open={type === ModalType.Bridge} setOpen={close}>
        <TxModalTitle title="Bridge tokens" />
        <TxSuccessView action={<Trans>Bridged!</Trans>} amount={amount} symbol={'GHO'} />;
      </BasicModal>
    );

  return (
    <BasicModal open={type === ModalType.Bridge} setOpen={close}>
      <TxModalTitle title="Bridge tokens" />
      <Box
        sx={{
          display: 'flex',
          gap: '15px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        Hola
        {/* // TODO check correct network */}
        {/* <NetworkSelector
          networks={supportedNetworksWithBridgeMarket}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={handleSelectedNetworkChange}
        /> */}
        <NetworkSelect
          value={amount}
          onChange={handleInputChange}
          usdValue={inputAmountUSD}
          symbol={GHO.iconSymbol}
          assets={[
            {
              balance: GHO.balance,
              address: GHO.underlyingAsset,
              symbol: GHO.symbol,
              iconSymbol: GHO.iconSymbol,
            },
          ]}
          maxValue={maxAmountToSwap}
          inputTitle={<Trans>Amount to Bridge</Trans>}
          balanceText={<Trans>GHO balance</Trans>}
          supportedBridgeMarkets={supportedNetworksWithBridgeMarket}
          onNetworkChange={handleSelectedNetworkChange('sourceNetwork')}

          //   isMaxSelected={isMaxSelected}
        />
        <NetworkSelect
          value={amount}
          onChange={handleInputChange}
          usdValue={inputAmountUSD}
          symbol={GHO.iconSymbol}
          assets={[
            {
              balance: GHO.balance,
              address: GHO.underlyingAsset,
              symbol: GHO.symbol,
              iconSymbol: GHO.iconSymbol,
            },
          ]}
          maxValue={maxAmountToSwap}
          inputTitle={<Trans>Amount to Bridge</Trans>}
          balanceText={<Trans>GHO balance</Trans>}
          supportedBridgeMarkets={supportedNetworksWithBridgeMarket}
          onNetworkChange={handleSelectedNetworkChange('destinationNetwork')}
          //   isMaxSelected={isMaxSelected}
        />
        <AssetInput
          value={amount}
          onChange={handleInputChange}
          usdValue={inputAmountUSD}
          symbol={GHO.iconSymbol}
          assets={[
            {
              balance: GHO.balance,
              address: GHO.underlyingAsset,
              symbol: GHO.symbol,
              iconSymbol: GHO.iconSymbol,
            },
          ]}
          maxValue={maxAmountToSwap}
          inputTitle={<Trans>Amount to Bridge</Trans>}
          balanceText={<Trans>GHO balance</Trans>}
          //   isMaxSelected={isMaxSelected}
        />
        {/* <Button onClick={handleBridge} variant="contained">
          Bridge
        </Button> */}
      </Box>
      <BridgeActions {...bridgeActionsProps} />
    </BasicModal>
  );
};
