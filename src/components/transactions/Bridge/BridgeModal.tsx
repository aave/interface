import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { API_ETH_MOCK_ADDRESS, ReserveDataHumanized } from '@aave/contract-helpers';
import { providers } from 'ethers';
import BigNumber from 'bignumber.js';

import { formatUnits } from 'ethers/lib/utils';
import { normalize, normalizeBN } from '@aave/math-utils';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { NetworkSelect } from 'src/components/transactions/NetworkSelect';
import { ReserveWithBalance } from './SwitchModal';
import { useRootStore } from 'src/store/root';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
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

export const BridgeModal = () => {
  const {
    type,
    close,
    args: { chainId },
  } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);
  const [amount, setAmount] = useState('0');
  const [inputAmountUSD, setInputAmount] = useState('');
  const [sourceToken, setSourceToken] = useState('');
  const [destinationToken, setDestinationToken] = useState('');
  const [sourceNetwork, setSourceNetwork] = useState('');
  const [destinationNetwork, setDestinationNetwork] = useState('');

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithBridgeMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });

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

  //   const provider = getProvider(selectedChainId);

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
      setInputAmount(selectedInputToken.balance);
    } else {
      setInputAmount(value);
    }
  };
  const GHO = reservesWithBalance.find((reserve) => reserve.symbol === 'GHO');

  if (!GHO) return null;

  const maxAmountToSwap = BigNumber.min(GHO.underlyingBalance).toString(10);

  const handleBridgeArguments = () => {
    const sourceChain = process.argv[2];
    const destinationChain = process.argv[3];
    const destinationAccount = process.argv[4];
    const tokenAddress = process.argv[5];
    const amount = BigNumber.from(process.argv[6]);
    const feeTokenAddress = process.argv[7];

    return {
      sourceChain,
      destinationChain,
      destinationAccount,
      tokenAddress,
      amount,
      feeTokenAddress,
    };
  };

  const handleBridge = () => {
    alert('Bridge');
  };

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
        {/* <SwitchAssetInput
          assets={tokens.filter((token) => token.address !== selectedOutputToken.address)}
          value={inputAmount}
          onChange={handleInputChange}
          usdValue={sellRates?.srcUSD || '0'}
          symbol={selectedInputToken.symbol}
          onSelect={handleSelectedInputToken}
          inputTitle={' '}
          sx={{ width: '100%' }}
        />
        <IconButton
          onClick={onSwitchReserves}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            position: 'absolute',
            backgroundColor: 'background.paper',
          }}
        >
          <SvgIcon sx={{ color: 'primary.main', fontSize: '18px' }}>
            <SwitchVerticalIcon />
          </SvgIcon>
        </IconButton>
        <SwitchAssetInput
          assets={tokens.filter((token) => token.address !== selectedInputToken.address)}
          value={
            sellRates ? normalizeBN(sellRates.destAmount, sellRates.destDecimals).toString() : '0'
          }
          usdValue={sellRates?.destUSD || '0'}
          symbol={selectedOutputToken.symbol}
          loading={
            debounceInputAmount !== '0' && debounceInputAmount !== '' && ratesLoading && !ratesError
          }
          onSelect={handleSelectedOutputToken}
          disableInput={true}
          inputTitle={' '}
          sx={{ width: '100%' }}
        /> */}
        <Button onClick={handleBridge} variant="contained">
          Bridge
        </Button>
      </Box>
      {/* {tokenListSortedByBalace.length > 1 ? (
        <SwitchModalContent
          key={selectedChainId}
          selectedChainId={selectedChainId}
          setSelectedChainId={setSelectedChainId}
          supportedNetworks={supportedNetworksWithEnabledMarket}
          tokens={tokenListSortedByBalace}
          selectedNetworkConfig={selectedNetworkConfig}
          // defaultAsset={underlyingAsset}
        />
      ) : !user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to be able to switch your tokens.</Trans>
          </Typography>
          <ConnectWalletButton />
        </Box>
      ) : (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
          <CircularProgress />
        </Box>
      )} */}
    </BasicModal>
  );
};
