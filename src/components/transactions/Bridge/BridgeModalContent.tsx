import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';

import BigNumber from 'bignumber.js';
import { constants } from 'ethers';
import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';

import { formatUnits, parseUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { NoData } from 'src/components/primitives/NoData';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { Warning } from 'src/components/primitives/Warning';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
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
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { GENERAL } from 'src/utils/mixPanelEvents';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BridgeActionProps, BridgeActions } from './BridgeActions';
import {
  getConfigFor,
  supportedNetworksWithBridge,
  SupportedNetworkWithChainId,
} from './BridgeConfig';
import { BridgeDestinationInput } from './BridgeDestinationInput';
import { SwitchAssetInput } from 'src/components/transactions/Switch/SwitchAssetInput';

import { useGetBridgeLimit, useGetRateLimit } from './useGetBridgeLimits';
import { useGetBridgeMessage } from './useGetBridgeMessage';
import { useTimeToDestination } from './useGetFinalityTime';

const feeTokens = [
  {
    name: 'Gho Token',
    address: '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    symbol: 'GHO',
    decimals: 18,
    chainId: 1,
    logoURI:
      'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
  },
  {
    name: 'Gho Token',
    address: '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33',
    symbol: 'GHO',
    decimals: 18,
    chainId: 42161,
    logoURI:
      'https://assets.coingecko.com/coins/images/30663/standard/gho-token-logo.png?1720517092',
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    address: API_ETH_MOCK_ADDRESS,
    chainId: 1,
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    extensions: {
      isNative: true,
    },
  },
  {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
    address: API_ETH_MOCK_ADDRESS,
    chainId: 42161, // Arb
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    extensions: {
      isNative: true,
    },
  },
];

const defaultNetwork = supportedNetworksWithBridge[0]; // TODO Remove for Production
const defaultNetworkMarket = marketsData[defaultNetwork.chainId];

export interface TokenInfoWithBalance extends TokenInfo {
  balance: string;
}

export const BridgeModalContent = () => {
  const { mainTxState: bridgeTxState, txError, close, gasLimit } = useModalContext();
  const [user] = useRootStore((state) => [state.account]);
  const [destinationAccount, setDestinationAccount] = useState(user);
  const [amount, setAmount] = useState('');
  const [maxSelected, setMaxSelected] = useState(false);

  const { readOnlyModeAddress, chainId: currentChainId } = useWeb3Context();

  const [sourceNetworkObj, setSourceNetworkObj] = useState(
    supportedNetworksWithBridge.find((net) => net.chainId === currentChainId) ?? defaultNetwork
  );

  const defaultDestinationNetwork = supportedNetworksWithBridge.find(
    (net) => net.chainId !== sourceNetworkObj.chainId
  ) as SupportedNetworkWithChainId;

  const [destinationNetworkObj, setDestinationNetworkObj] = useState(defaultDestinationNetwork);

  const { data: estimatedTimeToDestination, isFetching: loadingEstimatedTime } =
    useTimeToDestination(sourceNetworkObj.chainId);

  console.log('PARM', sourceNetworkObj.chainId, user);

  const filteredFeeTokensByChainId = feeTokens.filter(
    (token) => token.chainId === sourceNetworkObj.chainId
  );

  const { data: baseTokenList, error } = useTokensBalance(
    filteredFeeTokensByChainId,
    sourceNetworkObj.chainId,
    user
  );

  const [selectedToken, setSelectedToken] = useState(filteredFeeTokensByChainId[0]);
  const handleTokenChange = (event) => {
    const token = filteredFeeTokensByChainId.find((token) => token.address === event.target.value);
    setSelectedToken(token);
  };

  console.log('baseTokenList', baseTokenList, error);

  useEffect(() => {
    // reset when source network changes
    setAmount('');
    setMaxSelected(false);
  }, [sourceNetworkObj]);

  const { data: sourceTokenInfo, isFetching: fetchingBridgeTokenBalance } = useBridgeTokens(
    Object.values(marketsData).find((elem) => elem.chainId === sourceNetworkObj.chainId) ||
      defaultNetworkMarket,
    getConfigFor(sourceNetworkObj.chainId).tokenOracle
  );

  const isWrongNetwork = currentChainId !== sourceNetworkObj.chainId;

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
    sourceTokenAddress: sourceTokenInfo?.address || '',
    destinationAccount,
  });

  const { data: bridgeLimits, isFetching: fetchingBridgeLimits } = useGetBridgeLimit(
    sourceNetworkObj.chainId
  );

  const parsedAmount = parseUnits(amount || '0', 18);

  const { data: rateLimit, isFetching: fetchingRateLimit } = useGetRateLimit({
    destinationChainId: destinationNetworkObj?.chainId || 0,
    sourceChainId: sourceNetworkObj.chainId,
  });

  let bridgeLimitExceeded = false;
  if (!fetchingBridgeLimits && bridgeLimits && bridgeLimits.bridgeLimit.gt(0)) {
    bridgeLimitExceeded = bridgeLimits.currentBridgedAmount
      .add(parsedAmount)
      .gt(bridgeLimits.bridgeLimit);
  }

  let rateLimitExceeded = false;
  if (!fetchingRateLimit && rateLimit) {
    rateLimitExceeded = rateLimit.gt(0) && parsedAmount.gt(rateLimit);
  }

  const loadingLimits = fetchingBridgeLimits || fetchingRateLimit;

  const handleSelectedNetworkChange =
    (networkAction: string) => (network: SupportedNetworkWithChainId) => {
      if (networkAction === 'sourceNetwork') {
        setSourceNetworkObj(network);
        // setSelectedChainId(network.chainId);
      } else {
        setDestinationNetworkObj(network);
      }
    };

  const hasBridgeLimit = bridgeLimits?.bridgeLimit.gt(-1);

  let maxAmountReducedDueToBridgeLimit = false;
  let maxAmountToBridge = sourceTokenInfo?.bridgeTokenBalance || '0';
  const remainingBridgeLimit =
    bridgeLimits?.bridgeLimit.sub(bridgeLimits?.currentBridgedAmount) || BigNumber(0);
  if (!fetchingBridgeLimits && hasBridgeLimit) {
    if (remainingBridgeLimit.lt(maxAmountToBridge)) {
      maxAmountToBridge = remainingBridgeLimit.toString();
      maxAmountReducedDueToBridgeLimit = true;
    }
  }

  const maxAmountToBridgeFormatted = formatUnits(maxAmountToBridge, 18);

  const handleInputChange = (value: string) => {
    if (value === '-1') {
      setAmount(maxAmountToBridgeFormatted);
      setMaxSelected(true);
    } else {
      setAmount(value);
      setMaxSelected(false);
    }
  };

  const handleSwapNetworks = () => {
    const currentSourceNetworkObj = sourceNetworkObj;
    setSourceNetworkObj(destinationNetworkObj);
    setDestinationNetworkObj(currentSourceNetworkObj);
  };

  const bridgeActionsProps: BridgeActionProps = {
    amountToBridge: amount,
    isWrongNetwork,
    symbol: GHO_SYMBOL,
    blocked:
      loadingBridgeMessage ||
      !destinationAccount ||
      bridgeLimitExceeded ||
      rateLimitExceeded ||
      loadingLimits,
    decimals: 18,
    message,
    fees: bridgeFee,
    sourceChainId: sourceNetworkObj.chainId,
    destinationChainId: destinationNetworkObj.chainId,
    tokenAddress: sourceTokenInfo?.address || constants.AddressZero,
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

  const feeTooltip = (
    <TextWithTooltip text={<Trans>Fee</Trans>}>
      <Trans>
        This fee is in addition to gas costs, which is paid to Chainlink CCIP service providers.{' '}
        <Link
          href="https://docs.chain.link/ccip/billing"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Trans>
    </TextWithTooltip>
  );

  const estimatedTimeTooltip = (
    <TextWithTooltip text={<Trans>Estimated time</Trans>}>
      <Trans>
        The source chain time to finality is the main factor that determines the time to
        destination.{' '}
        <Link
          href="https://docs.chain.link/ccip/concepts#finality"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          Learn more
        </Link>
      </Trans>
    </TextWithTooltip>
  );

  const handleFeeChange = () => {
    // handle state
  };
  const amountUsd = Number(amount) * sourceTokenInfo.tokenPriceUSD;

  console.log('filteredFeeTokensByChainId', filteredFeeTokensByChainId);

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h2">
          <Trans>Bridge GHO</Trans>
        </Typography>
        {user && (
          <Box
            sx={{
              right: '0px',
            }}
          >
            <Button
              component={Link}
              href={ROUTES.bridge}
              sx={{ mr: 8 }}
              variant="surface"
              size="small"
              onClick={close}
            >
              <Trans>Transactions</Trans>
            </Button>
          </Box>
        )}
      </Box>

      <ChangeNetworkWarning
        networkName={getNetworkConfig(sourceNetworkObj.chainId).name}
        chainId={sourceNetworkObj.chainId}
        event={{
          eventName: GENERAL.SWITCH_NETWORK,
        }}
        sx={{ my: 1, visibility: isWrongNetwork && !readOnlyModeAddress ? 'visible' : 'hidden' }}
      />
      {!user ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
          <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
            <Trans>Please connect your wallet to be able to bridge your tokens.</Trans>
          </Typography>
          <ConnectWalletButton />
        </Box>
      ) : (
        <>
          <Stack
            sx={{ mb: 3 }}
            gap={3}
            direction="column"
            alignItems="center"
            justifyContent="center"
          >
            <NetworkSelect
              supportedBridgeMarkets={supportedNetworksWithBridge.filter(
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
                mt: -1,
                '&:hover': { backgroundColor: 'background.surface' },
              }}
            >
              <SvgIcon sx={{ color: 'primary.main', fontSize: '18px' }}>
                <SwitchVerticalIcon />
              </SvgIcon>
            </IconButton>
            <NetworkSelect
              supportedBridgeMarkets={supportedNetworksWithBridge.filter(
                (net) => net.chainId !== sourceNetworkObj.chainId
              )}
              onNetworkChange={handleSelectedNetworkChange('destinationNetwork')}
              defaultNetwork={destinationNetworkObj}
            />
          </Stack>
          <AssetInput
            disableInput={!loadingBridgeMessage && sourceTokenInfo?.bridgeTokenBalance === '0'}
            value={amount}
            onChange={handleInputChange}
            usdValue={amountUsd.toString()}
            symbol={GHO_SYMBOL}
            assets={[
              {
                balance: sourceTokenInfo.bridgeTokenBalanceFormatted,
                address: sourceTokenInfo.address,
                symbol: GHO_SYMBOL,
                iconSymbol: GHO_SYMBOL,
              },
            ]}
            maxValue={
              hasBridgeLimit
                ? formatUnits(remainingBridgeLimit.toString(), 18)
                : sourceTokenInfo.bridgeTokenBalanceFormatted
            }
            inputTitle={<Trans>Amount to Bridge</Trans>}
            balanceText={<Trans>GHO balance</Trans>}
            sx={{ width: '100%' }}
            loading={fetchingBridgeTokenBalance || loadingLimits}
            isMaxSelected={maxSelected}
          />

          {amount !== '' &&
            maxAmountReducedDueToBridgeLimit &&
            maxSelected &&
            !rateLimitExceeded && (
              <Warning severity="warning" sx={{ my: 2 }}>
                <Stack direction="row">
                  <Typography variant="caption">
                    Due to bridging limits, the maximum amount currently available to bridge is{' '}
                    <FormattedNumber
                      variant="caption"
                      value={maxAmountToBridgeFormatted}
                      visibleDecimals={2}
                    />
                  </Typography>
                </Stack>
              </Warning>
            )}

          <Box sx={{ mt: 3 }}>
            <BridgeDestinationInput
              connectedAccount={user}
              onInputValid={(account) => {
                setDestinationAccount(account);
              }}
              onInputError={() => setDestinationAccount('')}
              sourceChainId={sourceNetworkObj.chainId}
            />
            <FormControl fullWidth>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography color="text.secondary">
                  <Trans>Fee Token</Trans>
                </Typography>
              </Box>
              <Select
                labelId="token-select-label"
                value={selectedToken.address}
                onChange={handleTokenChange}
                label="Token"
                // MenuProps={{
                //   sx: {
                //     maxHeight: '240px',
                //     '.MuiPaper-root': {
                //       // border: theme.palette.mode === 'dark' ? '1px solid #EBEBED1F' : 'unset',
                //       boxShadow: '0px 2px 10px 0px #0000001A',
                //     },
                //   },
                // }}
                sx={{
                  padding: '8px 12px',
                  border: '1px solid #EAEBEF',
                  borderRadius: '6px',
                  width: '100%',
                  marginBottom: '4px',
                }}
              >
                {filteredFeeTokensByChainId.map((token) => (
                  <MenuItem key={token.address} value={token.address}>
                    <Box display="flex" alignItems="center">
                      <TokenIcon symbol={token.symbol} logoURI={token.logoURI} sx={{ mr: 2 }} />
                      {token.symbol} - Balance: {baseTokenList?.[token.address]?.balance || '0'}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TxModalDetails gasLimit={gasLimit} chainId={sourceNetworkObj.chainId}>
            <DetailsNumberLine
              description={<Trans>Amount</Trans>}
              iconSymbol={GHO_SYMBOL}
              symbol={GHO_SYMBOL}
              value={amount}
            />
            <Row caption={estimatedTimeTooltip} captionVariant="description" mb={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loadingEstimatedTime ? (
                  <Skeleton
                    variant="rectangular"
                    height={20}
                    width={100}
                    sx={{ borderRadius: '4px' }}
                  />
                ) : (
                  <Typography variant="secondary14">{estimatedTimeToDestination}</Typography>
                )}
              </Box>
            </Row>
            <Row caption={feeTooltip} captionVariant="description" mb={4}>
              {!message && !loadingBridgeMessage ? (
                <NoData variant="secondary14" color="text.secondary" />
              ) : loadingBridgeMessage ? (
                <Skeleton
                  variant="rectangular"
                  height={20}
                  width={100}
                  sx={{ borderRadius: '4px' }}
                />
              ) : (
                <Stack direction="column" alignItems="flex-end" position="relative">
                  <Stack direction="row" alignItems="center">
                    <TokenIcon symbol="ETH" sx={{ mr: 1, fontSize: '16px' }} />
                    <FormattedNumber
                      value={bridgeFeeFormatted}
                      symbol="ETH"
                      variant="secondary14"
                    />
                  </Stack>
                  <FormattedNumber
                    value={bridgeFeeUSD}
                    variant="helperText"
                    compact
                    symbol="USD"
                    color="text.secondary"
                    sx={{ position: 'absolute', top: '20px' }}
                  />
                </Stack>
              )}
            </Row>
            <Row /> {/* Spacer */}
          </TxModalDetails>
          {txError && <GasEstimationError txError={txError} />}

          {/* {bridgeLimitExceeded && (
            <Warning severity="error" sx={{ mt: 4 }} icon={false}>
              <Typography variant="caption">
                <Trans>
                  The selected amount is not available to bridge due to the bridge limit of
                </Trans>{' '}
                {formatUnits(bridgeLimits?.bridgeLimit || 0, 18)}.{' '}
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
          )} */}
          {rateLimitExceeded && (
            <Warning severity="error" sx={{ mt: 4 }} icon={false}>
              <Typography variant="caption">
                <Trans>
                  Bridging is currently unavailable due to the rate limit being exceeded. Please try
                  again later or reduce the amount to bridge.
                </Trans>
              </Typography>
            </Warning>
          )}

          <BridgeActions {...bridgeActionsProps} />
        </>
      )}
    </>
  );
};
