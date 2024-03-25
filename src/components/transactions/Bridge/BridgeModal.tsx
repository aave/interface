import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, IconButton, SvgIcon, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { constants, Contract, utils } from 'ethers';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { NetworkSelect } from 'src/components/transactions/NetworkSelect';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useBridgeTokens } from 'src/hooks/bridge/useBridgeWalletBalance';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { TokenInfo } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { BasicModal } from '../../primitives/BasicModal';
import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BridgeActions } from './BridgeActions';
import { supportedNetworksWithBridgeMarket, SupportedNetworkWithChainId } from './common';
import { getRouterConfig } from './Router';
import routerAbi from './Router-abi.json';

// const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];
const defaultNetwork = marketsData[CustomMarket.proto_sepolia_v3];

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string;
}

type TokenAmount = {
  token: string;
  amount: string;
};

type Message = {
  receiver: string;
  data: string;
  tokenAmounts: TokenAmount[];
  feeToken: string;
  extraArgs: string;
};

export const BridgeModal = () => {
  const {
    type,
    close,
    // args: { chainId },
    mainTxState: bridgeTxState,
    txError,
  } = useModalContext();

  const [amount, setAmount] = useState('0');
  const [inputAmountUSD, setInputAmount] = useState('');
  const { readOnlyModeAddress, provider, chainId: currentChainId } = useWeb3Context();

  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const [message, setMessage] = useState<Message>({
    receiver: '',
    data: '',
    tokenAmounts: [
      {
        token: '',
        amount: '',
      },
    ],
    feeToken: '',
    extraArgs: '',
  });

  const [fees, setFees] = useState('');

  const [bridgeFeeFormatted, setBridgeFeeFormatted] = useState('');

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithBridgeMarket.find((elem) => elem.chainId === currentChainId)) {
      return currentChainId;
    }

    return defaultNetwork.chainId;
  });

  const [sourceNetworkObj, setSourceNetworkObj] = useState(() => {
    return (
      supportedNetworksWithBridgeMarket.find((net) => net.chainId === selectedChainId) ||
      supportedNetworksWithBridgeMarket[0]
    );
  });

  useEffect(() => {
    // Check if the current chain ID is supported. If so, update selectedChainId to currentChainId.
    // Otherwise, fallback to the default network's chain ID.
    const isNewChainSupported = supportedNetworksWithBridgeMarket.some(
      (elem) => elem.chainId === currentChainId
    );
    setSelectedChainId(isNewChainSupported ? currentChainId : defaultNetwork.chainId);
  }, [currentChainId]);

  useEffect(() => {
    const updateDestinationNetwork = () => {
      let initialDestination = supportedNetworksWithBridgeMarket.find(
        (net) => net.chainId === selectedChainId
      );

      // If the initial destination is the same as the source, or if no initial destination is found,
      // select an alternative destination that is not the source network
      if (!initialDestination || initialDestination.chainId === sourceNetworkObj.chainId) {
        const alternativeDestinations = supportedNetworksWithBridgeMarket.filter(
          (net) => net.chainId !== sourceNetworkObj.chainId
        );

        initialDestination = alternativeDestinations[0];
      }
      setDestinationNetworkObj(initialDestination);
    };

    updateDestinationNetwork();
  }, [sourceNetworkObj, selectedChainId]);
  useEffect(() => {
    setSourceNetworkObj(() => {
      return (
        supportedNetworksWithBridgeMarket.find((net) => net.chainId === selectedChainId) ||
        supportedNetworksWithBridgeMarket[0]
      );
    });
    setDestinationNetworkObj(() => {
      return (
        supportedNetworksWithBridgeMarket.find(
          (net) => net.chainId === destinationNetworkObj.chainId
        ) || supportedNetworksWithBridgeMarket[1]
      );
    });
  }, [selectedChainId]);

  useEffect(() => {
    if (provider && debounceInputAmount) {
      getBridgeFee();
    }
  }, [provider, debounceInputAmount]);

  const [destinationNetworkObj, setDestinationNetworkObj] = useState<SupportedNetworkWithChainId>(
    {} as SupportedNetworkWithChainId
  );

  // const [tokenListWithBalance, setTokensListBalance] = useState<TokenInfoWithBalance[]>([]);

  const { data: sourceTokenInfo } = useBridgeTokens(
    Object.values(marketsData).find((elem) => elem.chainId === sourceNetworkObj.chainId) ||
      defaultNetwork
  );
  const isWrongNetwork = currentChainId !== selectedChainId;

  const [user] = useRootStore((state) => [state.account]);

  const handleSelectedNetworkChange =
    (networkAction: string) => (network: SupportedNetworkWithChainId) => {
      if (networkAction === 'sourceNetwork') {
        setSourceNetworkObj(network);
      } else {
        setDestinationNetworkObj(network);
      }
    };

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
    }, 1000);
  }, [setDebounceInputAmount]);

  const handleInputChange = (value: string) => {
    if (value === '-1') {
      setAmount(sourceTokenInfo.bridgeTokenBalance);
      debouncedInputChange(sourceTokenInfo.bridgeTokenBalance);
    } else {
      setAmount(value);
      debouncedInputChange(value);
    }
  };

  const resetState = () => {
    setAmount('0');
    setInputAmount('');
    setDebounceInputAmount('');
    setMessage({
      receiver: '',
      data: '',
      tokenAmounts: [
        {
          token: '',
          amount: '',
        },
      ],
      feeToken: '',
      extraArgs: '',
    });
    setFees('');
    setBridgeFeeFormatted('');
  };

  const getBridgeFee = async () => {
    const destinationChain = destinationNetworkObj; // destinationNetwork;

    if (
      !provider ||
      !destinationChain ||
      !sourceNetworkObj.chainId ||
      !sourceTokenInfo.bridgeTokenBalance ||
      !sourceTokenInfo.address
    )
      return;
    const signer = await provider.getSigner();

    const tokenAddress = sourceTokenInfo.address;

    // Get the router's address for the specified chain
    const sourceRouterAddress = getRouterConfig(sourceNetworkObj.chainId).address;
    // Get the chain selector for the target chain
    const destinationChainSelector = getRouterConfig(destinationChain.chainId).chainSelector;
    const sourceRouter = new Contract(sourceRouterAddress, routerAbi, signer);

    // ==================================================
    //     Section: Check token validity
    //     Check first if the token you would like to
    //     transfer is supported.
    // ==================================================
    // */

    const supportedTokens = await sourceRouter.getSupportedTokens(destinationChainSelector);
    const tokenAddressLower = tokenAddress.toLowerCase();

    // Convert each supported token to lowercase and check if the list includes the lowercase token address
    const isSupported = supportedTokens
      .map((token: string) => token.toLowerCase())
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

    const tokenAmounts: TokenAmount[] = [
      {
        token: tokenAddress,
        amount: parseUnits(amount, 18).toString() || '0',
      },
    ];

    // Encoding the data
    const functionSelector = utils.id('CCIP EVMExtraArgsV1').slice(0, 10);
    //  "extraArgs" is a structure that can be represented as [ 'uint256']
    // extraArgs are { gasLimit: 0 }
    // we set gasLimit specifically to 0 because we are not sending any data so we are not expecting a receiving contract to handle data

    const extraArgs = utils.defaultAbiCoder.encode(['uint256'], [0]);

    const encodedExtraArgs = functionSelector + extraArgs.slice(2);

    const message: Message = {
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
  };

  // const maxAmountToSwap = BigNumber.min(GHO.underlyingBalance).toString(10);

  const maxAmountToSwap = BigNumber.min(sourceTokenInfo.bridgeTokenBalance).toString(10);

  const handleBridgeArguments = () => {
    const sourceChain = sourceNetworkObj;
    const destinationChain = destinationNetworkObj;
    const destinationAccount = user;
    const tokenAddress = sourceTokenInfo.address;

    if (!sourceChain || !destinationChain || !destinationAccount || !tokenAddress) {
      throw Error('Missing required arguments');
    }
    return {
      sourceChain,
      destinationChain,
      destinationAccount,
      tokenAddress,
      amount,
      //   feeTokenAddress,
    };
  };

  const handleSwapNetworks = () => {
    const currentSourceNetworkObj = sourceNetworkObj;
    setSourceNetworkObj(destinationNetworkObj);
    setDestinationNetworkObj(currentSourceNetworkObj);

    setSelectedChainId(destinationNetworkObj.chainId);
  };

  const bridgeActionsProps = {
    ...handleBridgeArguments(),
    amountToBridge: parseUnits(amount ? amount : '0', 18).toString() || '0',
    isWrongNetwork: false, // TODO fix
    // poolAddress: GHO.underlying,
    symbol: 'GHO',
    blocked: false,
    decimals: 18,
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
          action={<Trans>Bridged Via CCIP</Trans>}
        />
      </BasicModal>
    );
  }

  if (txError) {
    return (
      <BasicModal open={type === ModalType.Bridge} setOpen={close}>
        <TxErrorView txError={txError} />
      </BasicModal>
    );
  }

  const handleClose = () => {
    resetState();
    close();
  };

  return (
    <BasicModal open={type === ModalType.Bridge} setOpen={handleClose}>
      <TxModalTitle title="Bridge tokens" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={getNetworkConfig(selectedChainId).name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
        />
      )}

      {!user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to be able to bridge your tokens.</Trans>
          </Typography>
          <ConnectWalletButton />
        </Box>
      ) : (
        <>
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
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                gap: '15px',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              <NetworkSelect
                supportedBridgeMarkets={supportedNetworksWithBridgeMarket.filter(
                  (net) => net.chainId !== destinationNetworkObj.chainId
                )}
                onNetworkChange={handleSelectedNetworkChange('sourceNetwork')}
                defaultNetwork={sourceNetworkObj}
              />
              <IconButton
                onClick={handleSwapNetworks}
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
              <NetworkSelect
                supportedBridgeMarkets={supportedNetworksWithBridgeMarket.filter(
                  (net) => net.chainId !== sourceNetworkObj.chainId
                )}
                onNetworkChange={handleSelectedNetworkChange('destinationNetwork')}
                defaultNetwork={destinationNetworkObj}
              />
            </Box>
            <AssetInput
              value={amount}
              onChange={handleInputChange}
              usdValue={inputAmountUSD}
              symbol={'GHO'} // TODO Dynamic later
              assets={[
                {
                  balance: sourceTokenInfo.bridgeTokenBalance,
                  address: sourceTokenInfo.address,
                  symbol: 'GHO',
                  iconSymbol: 'GHO',
                },
              ]}
              maxValue={maxAmountToSwap}
              inputTitle={<Trans>Amount to Bridge</Trans>}
              balanceText={<Trans>GHO balance</Trans>}
              sx={{ width: '100%' }}
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
        </>
      )}
    </BasicModal>
  );
};
