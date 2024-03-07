import { Trans } from '@lingui/macro';
import { Box, Button } from '@mui/material';
import { API_ETH_MOCK_ADDRESS, ReserveDataHumanized } from '@aave/contract-helpers';
import BigNumber from 'bignumber.js';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { debounce } from 'lodash';
import { providers, Contract, utils, constants } from 'ethers';
import { formatEther } from 'ethers/lib/utils';

import { normalize } from '@aave/math-utils';
import { usePoolsReservesHumanized } from 'src/hooks/pool/usePoolReserves';
import React, { useMemo, useState } from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { fetchIconSymbolAndName } from 'src/ui-config/reservePatches';
import { NetworkSelect } from 'src/components/transactions/NetworkSelect';
import { ReserveWithBalance } from '../SwitchModal';
import { useRootStore } from 'src/store/root';
import { UserPoolTokensBalances } from 'src/services/WalletBalanceService';
import { usePoolsTokensBalance } from 'src/hooks/pool/usePoolTokensBalance';
import { TokenInfo } from 'src/ui-config/TokenList';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { getRouterConfig } from './Router';
import routerAbi from './Router-abi.json';
import erc20Abi from './IERC20Meta.json';

import {
  TxModalDetails,
  DetailsNumberLine,
} from 'src/components/transactions/FlowCommons/TxModalDetails';

import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';

import { BridgeActions } from './BridgeActions';
import { TxSuccessView } from '../FlowCommons/Success';

import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { supportedNetworksWithBridgeMarket } from './common';

import { BasicModal } from '../../primitives/BasicModal';
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
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const [message, setMessage] = useState({});

  const [fees, setFees] = useState('');

  const [bridgeFeeFormatted, setBridgeFeeFormatted] = useState('');

  const { readOnlyModeAddress, provider } = useWeb3Context();

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithBridgeMarket.find((elem) => elem.chainId === currentChainId))
      return currentChainId;
    return defaultNetwork.chainId;
  });
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

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

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
      getBridgeFee(value);
    }, 2000);
  }, [setDebounceInputAmount]);

  const handleInputChange = (value: string) => {
    if (value === '-1') {
      setAmount(selectedInputToken.balance);
      debouncedInputChange(selectedInputToken.balance);
    } else {
      setAmount(value);
      debouncedInputChange(value);
    }
  };

  const getBridgeFee = async (value: string) => {
    console.log(`API called with value: ${value}`);
    // Your API call logic here
    const destinationChain = { chainId: 421614 }; // destinationNetwork;

    console.log('provider', provider);
    let signer;
    try {
      signer = await provider.getSigner();
    } catch (err) {
      console.log('error on signer', err);
    }

    if (!provider || !destinationChain || !sourceNetwork) return;

    console.log('are we in here');

    // let response: TransactionResponse;
    // let action = ProtocolAction.default;
    const tokenAddress = GHO.underlyingAsset;

    const erc20 = new Contract(tokenAddress, erc20Abi, signer);

    //   // Get the router's address for the specified chain
    const sourceRouterAddress = getRouterConfig(sourceNetwork.chainId).address;
    const sourceChainSelector = getRouterConfig(sourceNetwork.chainId).chainSelector;
    // Get the chain selector for the target chain
    const destinationChainSelector = getRouterConfig(destinationChain.chainId).chainSelector;
    const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

    // ==================================================
    //     Section: Check token validity
    //     Check first if the token you would like to
    //     transfer is supported.
    // ==================================================
    // */

    //   // Fetch the list of supported tokens

    //   console.log('destinationChainSelector', destinationChainSelector);

    const supportedTokens = await sourceRouter.getSupportedTokens(destinationChainSelector);

    const tokenAddressLower = tokenAddress.toLowerCase();

    // Convert each supported token to lowercase and check if the list includes the lowercase token address
    const isSupported = supportedTokens
      .map((token) => token.toLowerCase())
      .includes(tokenAddressLower);

    if (!isSupported) {
      throw Error(
        `Token address ${tokenAddress} not in the list of supportedTokens ${supportedTokens}`
      );
    }
    /*
==================================================
  Section: BUILD CCIP MESSAGE
  build CCIP message that you will send to the
  Router contract.
==================================================
*/

    // build message
    const tokenAmounts = [
      {
        token: tokenAddress,
        amount: amount,
      },
    ];

    // Encoding the data

    const functionSelector = utils.id('CCIP EVMExtraArgsV1').slice(0, 10);
    //  "extraArgs" is a structure that can be represented as [ 'uint256']
    // extraArgs are { gasLimit: 0 }
    // we set gasLimit specifically to 0 because we are not sending any data so we are not expecting a receiving contract to handle data

    const extraArgs = utils.defaultAbiCoder.encode(['uint256'], [0]);

    const encodedExtraArgs = functionSelector + extraArgs.slice(2);

    const message = {
      receiver: utils.defaultAbiCoder.encode(['address'], [user]),
      data: '0x', // no data
      tokenAmounts: tokenAmounts,
      feeToken: constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.
      // feeToken: feeTokenAddress ? feeTokenAddress : ethers.constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.

      extraArgs: encodedExtraArgs,
    };

    setMessage(message);

    /*
==================================================
  Section: CALCULATE THE FEES
  Call the Router to estimate the fees for sending tokens.
==================================================
*/
    const fees = await sourceRouter.getFee(destinationChainSelector, message);
    setBridgeFeeFormatted(formatEther(fees));
    setFees(fees);

    console.log('FEEES', fees);
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
    message,
    fees,
  };

  if (bridgeTxState.success) {
    return (
      <BasicModal open={type === ModalType.Bridge} setOpen={close}>
        <TxModalTitle title="Bridge tokens" />
        {/* <TxSuccessView action={<Trans>Bridged!</Trans>} amount={amount} symbol={'GHO'} />; */}
        <TxSuccessView
          customAction={
            <Box mt={5}>
              <Button
                component="a"
                target="_blank"
                href={`https://ccip.chain.link/tx/${bridgeTxState.txHash}`}
                variant="gradient"
                size="medium"
              >
                <Trans>See Transaction status on CCIP</Trans>
              </Button>
            </Box>
          }
          customText={
            <Trans>
              Asset has been successfully sent to router contract. You can check the status of the
              transaction above
            </Trans>
          }
          action={<Trans>Brided Via CCIP</Trans>}
        />
      </BasicModal>
    );
  }
  return (
    <BasicModal open={type === ModalType.Bridge} setOpen={close}>
      <TxModalTitle title="Bridge tokens" />
      {isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(selectedChainId).name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
        />
      )}
      <Box
        sx={{
          display: 'flex',
          gap: '15px',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: '100%',
        }}
      >
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
        <Box width="100%">
          <TxModalDetails gasLimit={'100'}>
            <DetailsNumberLine
              description={<Trans>Amount</Trans>}
              iconSymbol={'GHO'}
              symbol={'GHO'}
              value={amount}
            />
            <DetailsNumberLine
              description={<Trans>Fee</Trans>}
              iconSymbol={'ETH'}
              symbol={'ETH'}
              value={bridgeFeeFormatted}
            />
          </TxModalDetails>
        </Box>
      </Box>
      <BridgeActions {...bridgeActionsProps} />
    </BasicModal>
  );
};
