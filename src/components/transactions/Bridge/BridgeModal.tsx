import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ContractCallContext, ContractCallResults, Multicall } from 'ethereum-multicall';
import { providers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useMemo, useState } from 'react';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { Asset, AssetInput } from 'src/components/transactions/AssetInput';

import { useRootStore } from 'src/store/root';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import {
  CustomMarket,
  getNetworkConfig,
  getProvider,
  marketsData,
} from 'src/utils/marketsAndNetworksConfig';
import { NetworkSelector } from '../Switch/NetworkSelector';
// import { supportedNetworksWithEnabledMarket } from './common';

import { BasicModal } from '../../primitives/BasicModal';
import { SwitchModalContent } from './SwitchModalContent';

const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string;
}

// const supportedNetworksWithEnabledMarket = supportedNetworksConfig.filter((elem) =>
//   Object.values(marketsData).find(
//     (market) => market.chainId === elem.chainId && market.enabledFeatures?.bridge
//   )
// );

export const BridgeModal = () => {
  const {
    type,
    close,
    args: { chainId },
  } = useModalContext();

  const currentChainId = useRootStore((store) => store.currentChainId);
  const user = useRootStore((store) => store.account);
  const [amount, setAmount] = useState(0);

  console.log('type -->', type);

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
        {/* <NetworkSelector
          networks={supportedNetworks}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={handleSelectedNetworkChange}
        /> */}
        {/* <AssetInput
          value={amount}
          onChange={handleChange}
          usdValue={inputAmountUSD}
          symbol={poolReserve.iconSymbol}
          assets={[
            {
              balance: maxAmountToSwap,
              address: poolReserve.underlyingAsset,
              symbol: poolReserve.symbol,
              iconSymbol: poolReserve.iconSymbol,
            },
          ]}
          maxValue={maxAmountToSwap}
          inputTitle={<Trans>Supplied asset amount</Trans>}
          balanceText={<Trans>Supply balance</Trans>}
          isMaxSelected={isMaxSelected}
        /> */}
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
