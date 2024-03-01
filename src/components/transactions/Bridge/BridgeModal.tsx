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
  const [sourceRouter, setSourceRouter] = useState<Contract>();
  // const [approvedAmount, setApprovedAmount] = useState<number | undefined>(undefined);

  const { sendTx } = useWeb3Context();

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

  // const handleBridge = async () => {
  //   const {
  //     sourceChain,
  //     destinationChain,
  //     destinationAccount,
  //     tokenAddress,
  //     amount,
  //     // feeTokenAddress,
  //   } = handleBridgeArguments();

  //   console.log('sourceChain', sourceChain);
  //   console.log('destinationChain', destinationChain);
  //   console.log('destinationAccount', destinationAccount);
  //   console.log('tokenAddress', tokenAddress);
  //   console.log('amount', amount);
  //   // const provider = getProvider(selectedChainId);

  //   console.log('provider', provider);

  //   const signer = await provider.getSigner();

  //   // Get the router's address for the specified chain
  //   const sourceRouterAddress = getRouterConfig(sourceChain.chainId).address;
  //   const sourceChainSelector = getRouterConfig(sourceChain.chainId).chainSelector;
  //   // Get the chain selector for the target chain
  //   const destinationChainSelector = getRouterConfig(destinationChain.chainId).chainSelector;

  //   // Create a contract instance for the router using its ABI and address

  //   console.log('sourceRouterAddress', sourceRouterAddress);

  //   // const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

  //   setSourceRouter(new Contract(sourceRouterAddress, routerAbi, signer));

  //   // STOP HERE FOR NOW
  //   /*
  // ==================================================
  //     Section: Check token validity
  //     Check first if the token you would like to
  //     transfer is supported.
  // ==================================================
  // */

  //   // Fetch the list of supported tokens

  //   console.log('destinationChainSelector', destinationChainSelector);

  //   const supportedTokens = await sourceRouter.getSupportedTokens(destinationChainSelector);

  //   const tokenAddressLower = tokenAddress.toLowerCase();

  //   // Convert each supported token to lowercase and check if the list includes the lowercase token address
  //   const isSupported = supportedTokens
  //     .map((token) => token.toLowerCase())
  //     .includes(tokenAddressLower);

  //   if (!isSupported) {
  //     throw Error(
  //       `Token address ${tokenAddress} not in the list of supportedTokens ${supportedTokens}`
  //     );
  //   }

  //   console.log('WE GOOOD');

  //   /*
  // ==================================================
  //     Section: BUILD CCIP MESSAGE
  //     build CCIP message that you will send to the
  //     Router contract.
  // ==================================================
  // */

  //   // build message
  //   const tokenAmounts = [
  //     {
  //       token: tokenAddress,
  //       amount: amount,
  //     },
  //   ];

  //   // Encoding the data

  //   const functionSelector = utils.id('CCIP EVMExtraArgsV1').slice(0, 10);
  //   //  "extraArgs" is a structure that can be represented as [ 'uint256']
  //   // extraArgs are { gasLimit: 0 }
  //   // we set gasLimit specifically to 0 because we are not sending any data so we are not expecting a receiving contract to handle data

  //   const extraArgs = utils.defaultAbiCoder.encode(['uint256'], [0]);

  //   const encodedExtraArgs = functionSelector + extraArgs.slice(2);

  //   const message = {
  //     receiver: utils.defaultAbiCoder.encode(['address'], [destinationAccount]),
  //     data: '0x', // no data
  //     tokenAmounts: tokenAmounts,
  //     feeToken: constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.
  //     // feeToken: feeTokenAddress ? feeTokenAddress : ethers.constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.

  //     extraArgs: encodedExtraArgs,
  //   };

  //   /*
  // ==================================================
  //     Section: CALCULATE THE FEES
  //     Call the Router to estimate the fees for sending tokens.
  // ==================================================
  // */

  //   const fees = await sourceRouter.getFee(destinationChainSelector, message);
  //   console.log(`Estimated fees (wei): ${fees}`);

  //   /*
  // ==================================================
  //     Section: SEND tokens
  //     This code block initializes an ERC20 token contract for token transfer across chains. It handles three cases:
  //     1. If the fee token is the native blockchain token, it makes one approval for the transfer amount. The fees are included in the msg.value field.
  //     2. If the fee token is different from both the native blockchain token and the transfer token, it makes two approvals: one for the transfer amount and another for the fees. The fees are part of the message.
  //     3. If the fee token is the same as the transfer token but not the native blockchain token, it makes a single approval for the sum of the transfer amount and fees. The fees are part of the message.
  //     The code waits for the transaction to be mined and stores the transaction receipt.
  // ==================================================
  // */

  //   // Create a contract instance for the token using its ABI and address
  //   const erc20 = new Contract(tokenAddress, erc20Abi, signer);

  //   try {
  //     let sendTx, approvalTx;

  //     // if (!feeTokenAddress) {
  //     // Pay native
  //     // First approve the router to spend tokens

  //     console.log('FOOOOOO', erc20);

  //     try {
  //       // START HERE, approval is not working

  //       approvalTx = await erc20.approve(sourceRouterAddress, amount);
  //     } catch (err) {
  //       console.log('error approving tx', err);
  //     }

  //     console.log('here =====');
  //     await approvalTx.wait(); // wait for the transaction to be mined
  //     console.log(
  //       `approved router ${sourceRouterAddress} to spend ${amount} of token ${tokenAddress}. Transaction: ${approvalTx.hash}`
  //     );

  //     sendTx = await sourceRouter.ccipSend(destinationChainSelector, message, {
  //       value: fees,
  //     }); // fees are send as value since we are paying the fees in native
  //     //}

  //     // else {
  //     //   if (tokenAddress.toUpperCase() === feeTokenAddress.toUpperCase()) {
  //     //     // fee token is the same as the token to transfer
  //     //     // Amount tokens to approve are transfer amount + fees
  //     //     approvalTx = await erc20.approve(sourceRouterAddress, amount + fees);
  //     //     await approvalTx.wait(); // wait for the transaction to be mined
  //     //     console.log(
  //     //       `approved router ${sourceRouterAddress} to spend ${amount} and fees ${fees} of token ${tokenAddress}. Transaction: ${approvalTx.hash}`
  //     //     );
  //     //   }
  //     //   else {
  //     //     // fee token is different than the token to transfer
  //     //     // 2 approvals
  //     //     approvalTx = await erc20.approve(sourceRouterAddress, amount); // 1 approval for the tokens to transfer
  //     //     await approvalTx.wait(); // wait for the transaction to be mined
  //     //     console.log(
  //     //       `approved router ${sourceRouterAddress} to spend ${amount} of token ${tokenAddress}. Transaction: ${approvalTx.hash}`
  //     //     );
  //     //     const erc20Fees = new ethers.Contract(feeTokenAddress, erc20Abi, signer);
  //     //     approvalTx = await erc20Fees.approve(sourceRouterAddress, fees); // 1 approval for the fees token
  //     //     await approvalTx.wait();
  //     //     console.log(
  //     //       `approved router ${sourceRouterAddress} to spend  fees ${fees} of token ${feeTokenAddress}. Transaction: ${approvalTx.hash}`
  //     //     );
  //     //   }
  //     //   sendTx = await sourceRouter.ccipSend(destinationChainSelector, message);
  //     // }

  //     const receipt = await sendTx.wait(); // wait for the transaction to be mined

  //     /*
  //     ==================================================
  //         Section: Fetch message ID
  //         The Router ccipSend function returns the messageId.
  //         This section makes a call (simulation) to the blockchain
  //         to fetch the messageId that was returned by the Router.
  //     ==================================================
  //     */

  //     // Simulate a call to the router to fetch the messageID
  //     const call = {
  //       from: sendTx.from,
  //       to: sendTx.to,
  //       data: sendTx.data,
  //       gasLimit: sendTx.gasLimit,
  //       gasPrice: sendTx.gasPrice,
  //       value: sendTx.value,
  //     };

  //     // Simulate a contract call with the transaction data at the block before the transaction
  //     const messageId = await provider.call(call, receipt.blockNumber - 1);

  //     console.log(
  //       `\n✅ ${amount} of Tokens(${tokenAddress}) Sent to account ${destinationAccount} on destination chain ${destinationChain} using CCIP. Transaction hash ${sendTx.hash} -  Message id is ${messageId}`
  //     );

  //     // 100 of Tokens(0xc4bf5cbdabe595361438f8c6a187bdc330539c60) Sent to account 0x3f1cf2c4ed96554b76763c8b38d66b66cc48e841 on destination chain [object Object] using CCIP. Transaction hash 0x847bcb76cc5ced74d8a869d5d057cdd314079c507cec57c3be76c7b2efb1e6ec -  Message id is 0x5efe6982ec39c9eba60819284e05bd1691c0903aaec7d12f4e30925b69e6c5f5
  //   } catch (error) {
  //     console.log('ERRRR', error);
  //   }
  // };

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
