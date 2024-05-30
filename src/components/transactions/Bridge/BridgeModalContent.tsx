import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Button, IconButton, SvgIcon, Typography } from '@mui/material';
import BigNumber from 'bignumber.js';
import { constants } from 'ethers';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { NetworkSelect } from 'src/components/transactions/NetworkSelect';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useBridgeTokens } from 'src/hooks/bridge/useBridgeWalletBalance';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { TokenInfo } from 'src/ui-config/TokenList';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BridgeActions } from './BridgeActions';
import { supportedNetworksWithBridgeMarket, SupportedNetworkWithChainId } from './common';
import { useBridgingValues, useRateLimit } from './useGetBridgeLimits';
import { useGetBridgeMessage } from './useGetBridgeMessage';

// const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];
const defaultNetwork = marketsData[CustomMarket.proto_sepolia_v3]; // TODO Remove for Production

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string;
}

export const BridgeModalContent = () => {
  const { mainTxState: bridgeTxState, txError, close } = useModalContext();

  const [amount, setAmount] = useState('');
  // const [inputAmountUSD, setInputAmount] = useState('');
  const { readOnlyModeAddress, chainId: currentChainId } = useWeb3Context();

  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithBridgeMarket.find((elem) => elem.chainId === currentChainId)) {
      return currentChainId;
    }

    return defaultNetwork.chainId;
  });

  const defaultSourceNetwork =
    supportedNetworksWithBridgeMarket.find((net) => net.chainId === selectedChainId) ||
    supportedNetworksWithBridgeMarket[0];

  const [sourceNetworkObj, setSourceNetworkObj] = useState(defaultSourceNetwork);

  const defaultDestinationNetwork = supportedNetworksWithBridgeMarket.find(
    (net) => net.chainId !== sourceNetworkObj.chainId
  ) as SupportedNetworkWithChainId;

  const [destinationNetworkObj, setDestinationNetworkObj] = useState(defaultDestinationNetwork);

  useEffect(() => {
    // Check if the current chain ID is supported. If so, update selectedChainId to currentChainId.
    // Otherwise, fallback to the default network's chain ID.
    const isNewChainSupported = supportedNetworksWithBridgeMarket.some(
      (elem) => elem.chainId === currentChainId
    );
    setSelectedChainId(isNewChainSupported ? currentChainId : defaultNetwork.chainId);
  }, [currentChainId]);

  // useEffect(() => {
  //   const updateDestinationNetwork = () => {
  //     let initialDestination = destinationNetworkObj;

  //     // If the initial destination is the same as the source, or if no initial destination is found,
  //     // select an alternative destination that is not the source network
  //     if (!initialDestination || initialDestination.chainId === sourceNetworkObj.chainId) {
  //       const alternativeDestinations = supportedNetworksWithBridgeMarket.filter(
  //         (net) => net.chainId !== sourceNetworkObj.chainId
  //       );

  //       initialDestination = alternativeDestinations[0];
  //     }
  //     setDestinationNetworkObj(initialDestination);
  //   };

  //   updateDestinationNetwork();
  // }, [sourceNetworkObj]);

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
          (net) => net.chainId === destinationNetworkObj?.chainId
        ) || supportedNetworksWithBridgeMarket[1]
      );
    });
  }, [selectedChainId]);

  // const [tokenListWithBalance, setTokensListBalance] = useState<TokenInfoWithBalance[]>([]);

  const { data: sourceTokenInfo, isFetching: fetchingBridgeTokenBalance } = useBridgeTokens(
    Object.values(marketsData).find((elem) => elem.chainId === sourceNetworkObj.chainId) ||
      defaultNetwork
  );
  const isWrongNetwork = currentChainId !== selectedChainId;

  const [user] = useRootStore((state) => [state.account]);

  const {
    message,
    bridgeFee,
    bridgeFeeFormatted,
    loading: loadingBridgeMessage,
    latestAnswer: bridgeFeeUSD,
  } = useGetBridgeMessage({
    sourceChainId: sourceNetworkObj.chainId,
    destinationChainId: destinationNetworkObj?.chainId || 0,
    amount,
    sourceTokenAddress: sourceTokenInfo.address || '',
  });

  const bridgingValues = useBridgingValues(sourceNetworkObj.chainId);

  const rateLimit = useRateLimit({
    destinationChainId: destinationNetworkObj?.chainId || 0,
    sourceChainId: sourceNetworkObj.chainId,
  });

  const bridgeLimitExceeded =
    bridgingValues &&
    bridgingValues.currentAmountBridged + parseInt(amount, 10) >= bridgingValues.maxAmountBridged;
  const rateLimitExceeded = rateLimit !== 0 && parseInt(amount, 10) >= (rateLimit || 0);

  const handleSelectedNetworkChange =
    (networkAction: string) => (network: SupportedNetworkWithChainId) => {
      if (networkAction === 'sourceNetwork') {
        setSourceNetworkObj(network);
        setSelectedChainId(network.chainId);
      } else {
        setDestinationNetworkObj(network);
      }
    };

  const handleInputChange = (value: string) => {
    if (value === '-1') {
      setAmount(sourceTokenInfo.bridgeTokenBalance);
    } else {
      setAmount(value);
    }
  };

  const maxAmountToSwap = BigNumber.min(sourceTokenInfo.bridgeTokenBalance).toString(10);
  // when switching networks, max amounts could be different so make sure amount is not higher than max
  if (Number(amount) > Number(maxAmountToSwap) && !fetchingBridgeTokenBalance) {
    setAmount(maxAmountToSwap);
  }

  const handleBridgeArguments = () => {
    const sourceChain = sourceNetworkObj;
    const destinationChain = destinationNetworkObj;
    const destinationAccount = user;
    const tokenAddress = sourceTokenInfo.address || constants.AddressZero;

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
    amountToBridge: amount,
    isWrongNetwork,
    // poolAddress: GHO.underlying,
    symbol: 'GHO',
    blocked: loadingBridgeMessage || bridgeLimitExceeded || rateLimitExceeded,
    decimals: 18,
    isWrappedBaseAsset: false,
    message,
    fees: bridgeFee,
  };

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }

  if (bridgeTxState.success) {
    return (
      <TxSuccessView
        customAction={
          <Box mt={5}>
            <Button
              component={Link}
              href={ROUTES.bridge}
              variant="outlined"
              size="small"
              onClick={close}
            >
              <Trans>View Bridge Transactions</Trans>
            </Button>
          </Box>
        }
        customText={
          <Trans>
            Asset has been successfully sent to CCIP contract. You can check the status of the
            transactions below
          </Trans>
        }
        action={<Trans>Bridged Via CCIP</Trans>}
      />
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <TxModalTitle title="Bridge tokens" />
        {user && (
          <Box
            sx={{
              right: '0px',
            }}
          >
            <Button
              component={Link}
              href={ROUTES.bridge}
              sx={{ mr: 8, mb: '24px' }}
              variant="surface"
              size="small"
              onClick={close}
            >
              <Trans>Bridge Transactions</Trans>
            </Button>
          </Box>
        )}
      </Box>

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
              usdValue={amount} // TODO
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
              loading={fetchingBridgeTokenBalance}
              //   isMaxSelected={isMaxSelected}
            />
            <Box width="100%">
              <TxModalDetails gasLimit={'100'} chainId={sourceNetworkObj.chainId}>
                <DetailsNumberLine
                  description={<Trans>Amount</Trans>}
                  iconSymbol={'GHO'}
                  symbol={'GHO'}
                  value={amount}
                />
                {message || loadingBridgeMessage ? (
                  <>
                    <DetailsNumberLine
                      description={<Trans>Fee</Trans>}
                      iconSymbol={'ETH'}
                      symbol={'ETH'}
                      value={bridgeFeeFormatted}
                      loading={loadingBridgeMessage}
                      customMb={0}
                    />
                    <Box display={'flex'} justifyContent={'flex-end'}>
                      <FormattedNumber
                        value={bridgeFeeUSD}
                        variant="helperText"
                        compact
                        symbol="USD"
                        color="text.secondary"
                      />
                    </Box>
                  </>
                ) : (
                  <Row caption={<Trans>Fee</Trans>} captionVariant="description" mb={4}>
                    <NoData variant="secondary14" color="text.secondary" />
                  </Row>
                )}
              </TxModalDetails>
            </Box>
          </Box>
          {txError && <GasEstimationError txError={txError} />}

          {bridgeLimitExceeded && (
            <Warning severity="error" sx={{ mt: 4 }} icon={false}>
              <Typography variant="caption">
                <Trans>
                  The selected amount is not available to bridge due to the bridge limit of
                </Trans>{' '}
                {bridgingValues.maxAmountBridged - bridgingValues.currentAmountBridged}.{' '}
                <Trans>Please try again later or reduce the amount to bridge</Trans>
              </Typography>
            </Warning>
          )}

          {rateLimitExceeded && (
            <Warning severity="error" sx={{ mt: 4 }} icon={false}>
              <Typography variant="caption">
                <Trans>
                  The selected amount is not available to bridge due to CCIP rate limit of
                </Trans>
                <Trans>Please try again later or reduce the amount to bridge to less than</Trans>{' '}
                {rateLimit}
              </Typography>
            </Warning>
          )}

          <BridgeActions {...bridgeActionsProps} />
        </>
      )}
    </>
  );
};
