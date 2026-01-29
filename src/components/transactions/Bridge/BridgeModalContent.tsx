import { ChainId } from '@aave/contract-helpers';
import { AaveV3InkWhitelabel, AaveV3Mantle } from '@bgd-labs/aave-address-book';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  IconButton,
  SelectChangeEvent,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { constants } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import React, { useEffect, useState } from 'react';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { Row } from 'src/components/primitives/Row';
import { Warning } from 'src/components/primitives/Warning';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import {
  DetailsNumberLine,
  TxModalDetails,
} from 'src/components/transactions/FlowCommons/TxModalDetails';
import { NetworkSelect } from 'src/components/transactions/NetworkSelect';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { useBridgeTokens, UseBridgeTokensParams } from 'src/hooks/bridge/useBridgeWalletBalance';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { GENERAL } from 'src/utils/events';
import { GHO_SYMBOL } from 'src/utils/ghoUtilities';
import { getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';

import { AssetInput } from '../AssetInput';
import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { BridgeActionProps, BridgeActions } from './BridgeActions';
import { BridgeAmount } from './BridgeAmount';
import {
  getConfigFor,
  laneConfig,
  supportedNetworksWithBridge,
  SupportedNetworkWithChainId,
} from './BridgeConfig';
import { BridgeDestinationInput } from './BridgeDestinationInput';
import { BridgeFeeTokenSelector } from './BridgeFeeTokenSelector';
import { useGetBridgeLimit, useGetRateLimit } from './useGetBridgeLimits';
import { useGetBridgeMessage } from './useGetBridgeMessage';
import { useTimeToDestination } from './useGetFinalityTime';

const defaultNetwork = supportedNetworksWithBridge[0];

function getUseBridgeTokensParams(chainId: number): UseBridgeTokensParams {
  const tokenOracle = getConfigFor(chainId).tokenOracle;

  if (chainId === ChainId.ink) {
    // no market config available yet for ink, so values are set here
    return {
      chainId,
      ghoTokenAddress: AaveV3InkWhitelabel.ASSETS.GHO.UNDERLYING,
      tokenOracle,
      walletBalanceProviderAddress: AaveV3InkWhitelabel.WALLET_BALANCE_PROVIDER,
    };
  } else if (chainId === ChainId.mantle) {
    // no active market config available yet for mantle, this is needed for gho ccip
    return {
      chainId,
      ghoTokenAddress: '0xfc421aD3C883Bf9E7C4f42dE845C4e4405799e73',
      tokenOracle,
      walletBalanceProviderAddress: AaveV3Mantle.WALLET_BALANCE_PROVIDER,
    };
  }

  const market = Object.values(marketsData).filter(
    (md) => md.chainId === chainId && md.v3 === true && md.addresses.GHO_TOKEN_ADDRESS
  )[0];
  if (!market || !market.addresses.GHO_TOKEN_ADDRESS) {
    throw new Error('Market not found');
  }

  return {
    chainId,
    ghoTokenAddress: market.addresses.GHO_TOKEN_ADDRESS,
    tokenOracle: getConfigFor(chainId).tokenOracle,
    walletBalanceProviderAddress: market.addresses.WALLET_BALANCE_PROVIDER,
  };
}

export const BridgeModalContent = () => {
  const { mainTxState: bridgeTxState, txError, close, gasLimit } = useModalContext();
  const user = useRootStore((state) => state.account);
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

  const getFilteredFeeTokens = (chainId: number) => {
    return laneConfig
      .filter((token) => token.sourceChainId === chainId)
      .flatMap((config) => config.feeTokens);
  };

  const filteredFeeTokensByChainId = getFilteredFeeTokens(sourceNetworkObj.chainId);

  const { data: feeTokenListWithBalance, isFetching: loadingTokenBalances } = useTokensBalance(
    filteredFeeTokensByChainId,
    sourceNetworkObj.chainId,
    user
  );

  const getGHOToken = (tokenList: TokenInfoWithBalance[]) => {
    return tokenList.find((token: TokenInfoWithBalance) => token.symbol === 'GHO') || tokenList[0];
  };

  const [selectedFeeToken, setSelectedFeeToken] = useState(
    getGHOToken(feeTokenListWithBalance || filteredFeeTokensByChainId)
  );

  const handleTokenChange = (event: SelectChangeEvent) => {
    const token = feeTokenListWithBalance?.find((token) => token.symbol === event.target.value);

    if (token) {
      setSelectedFeeToken(token);
    } else {
      setSelectedFeeToken(filteredFeeTokensByChainId[0]);
    }
  };

  useEffect(() => {
    if (feeTokenListWithBalance && feeTokenListWithBalance.length > 0 && !selectedFeeToken) {
      setSelectedFeeToken(feeTokenListWithBalance[0]);
    }
  }, [feeTokenListWithBalance, sourceNetworkObj]);

  useEffect(() => {
    // reset when source network changes
    setAmount('');
    setMaxSelected(false);
  }, [sourceNetworkObj]);

  const params = getUseBridgeTokensParams(sourceNetworkObj.chainId);
  const { data: sourceTokenInfo, isFetching: fetchingBridgeTokenBalance } = useBridgeTokens(params);

  const isWrongNetwork = currentChainId !== sourceNetworkObj.chainId;

  const {
    message,
    bridgeFee,
    bridgeFeeFormatted,
    loading: loadingBridgeMessage,
    latestAnswer: bridgeFeeUSD,
    error: txErrorBridgeMessage,
  } = useGetBridgeMessage({
    sourceChainId: sourceNetworkObj.chainId,
    destinationChainId: destinationNetworkObj?.chainId || 0,
    amount,
    sourceTokenAddress: sourceTokenInfo?.address || '',
    destinationAccount,
    feeToken: selectedFeeToken?.address || '',
    feeTokenOracle: selectedFeeToken?.oracle || ('' as string),
  });

  const { data: bridgeLimits, isInitialLoading: loadingBridgeLimit } = useGetBridgeLimit(
    sourceNetworkObj.chainId
  );

  const { data: rateLimit, isInitialLoading: loadingRateLimit } = useGetRateLimit({
    destinationChainId: destinationNetworkObj?.chainId || 0,
    sourceChainId: sourceNetworkObj.chainId,
  });

  const loadingLimits = loadingBridgeLimit || loadingRateLimit;

  const handleSelectedNetworkChange =
    (networkAction: string) => (network: SupportedNetworkWithChainId) => {
      if (networkAction === 'sourceNetwork') {
        setSourceNetworkObj(network);
        // setSelectedChainId(network.chainId);
      } else {
        setDestinationNetworkObj(network);
      }
    };

  let maxAmountReducedDueToBridgeLimit = false;
  let maxAmountReducedDueToRateLimit = false;
  let maxAmountToBridge = sourceTokenInfo?.bridgeTokenBalance || '0';
  const hasBridgeLimit = bridgeLimits?.bridgeLimit !== '-1';
  const remainingBridgeLimit = BigNumber(bridgeLimits?.remainingAmount || '0');

  if (!loadingLimits && bridgeLimits && rateLimit) {
    if (hasBridgeLimit && remainingBridgeLimit.lt(maxAmountToBridge)) {
      maxAmountToBridge = bridgeLimits.remainingAmount;
      maxAmountReducedDueToBridgeLimit = true;
      maxAmountReducedDueToRateLimit = false;
    } else if (BigNumber(rateLimit.tokens).lt(maxAmountToBridge)) {
      maxAmountToBridge = rateLimit.tokens;
      maxAmountReducedDueToRateLimit = true;
      maxAmountReducedDueToBridgeLimit = false;
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

    const newFilteredFeeTokens = getFilteredFeeTokens(destinationNetworkObj.chainId);
    setSelectedFeeToken(newFilteredFeeTokens[0]);
  };

  // string formatting for tx display
  const amountUsd = Number(amount) * sourceTokenInfo.tokenPriceUSD;
  const parsedAmountFee = new BigNumber(amount || '0');
  const parsedBridgeFee = new BigNumber(bridgeFeeFormatted || '0');
  const amountAfterFee = BigNumber.max(0, parsedAmountFee.minus(parsedBridgeFee));
  const amountAfterFeeFormatted = amountAfterFee.toString();
  const feeTokenBalance =
    feeTokenListWithBalance?.find((t) => t.address === selectedFeeToken.address)?.balance || '0';

  const feesExceedWalletBalance =
    !loadingBridgeMessage &&
    !loadingTokenBalances &&
    amountUsd !== 0 &&
    ((selectedFeeToken.address !== constants.AddressZero && amountAfterFee.lte(0)) ||
      (selectedFeeToken.address === constants.AddressZero && parsedBridgeFee.gte(feeTokenBalance)));

  const bridgeActionsProps: BridgeActionProps = {
    amountToBridge: amount,
    isWrongNetwork,
    symbol: GHO_SYMBOL,
    blocked:
      loadingBridgeMessage ||
      loadingTokenBalances ||
      !destinationAccount ||
      loadingLimits ||
      feesExceedWalletBalance,
    decimals: 18,
    message,
    fees: bridgeFee,
    sourceChainId: sourceNetworkObj.chainId,
    destinationChainId: destinationNetworkObj.chainId,
    tokenAddress: sourceTokenInfo?.address || constants.AddressZero,
    isCustomFeeToken: selectedFeeToken.address !== constants.AddressZero,
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

  const amountWithFee = (
    <TextWithTooltip text={<Trans>Amount After Fee</Trans>}>
      <Trans>
        The total amount bridged minus CCIP fees. Paying in network token does not impact gho
        amount.
      </Trans>
    </TextWithTooltip>
  );

  // There's no market config available for ink yet, so skip showing gas station since it relies on having a market
  const showGasStation = sourceNetworkObj.chainId !== ChainId.ink;

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
        autoSwitchOnMount={true}
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
            maxValue={maxAmountToBridgeFormatted}
            inputTitle={<Trans>Amount to Bridge</Trans>}
            balanceText={<Trans>GHO balance</Trans>}
            sx={{ width: '100%' }}
            loading={fetchingBridgeTokenBalance || loadingLimits}
            isMaxSelected={maxSelected}
          />

          <Box sx={{ mt: 3 }}>
            <BridgeDestinationInput
              connectedAccount={user}
              onInputValid={(account) => {
                setDestinationAccount(account);
              }}
              onInputError={() => setDestinationAccount('')}
              sourceChainId={sourceNetworkObj.chainId}
            />
          </Box>
          <TxModalDetails
            gasLimit={gasLimit}
            chainId={sourceNetworkObj.chainId}
            showGasStation={showGasStation}
          >
            <BridgeAmount
              amount={amount}
              maxAmountToBridgeFormatted={maxAmountToBridgeFormatted}
              maxAmountReducedDueToBridgeLimit={maxSelected && maxAmountReducedDueToBridgeLimit}
              maxAmountReducedDueToRateLimit={maxSelected && maxAmountReducedDueToRateLimit}
              refillRate={rateLimit?.rate || '0'}
              maxRateLimitCapacity={rateLimit?.capacity || '0'}
            />
            <BridgeFeeTokenSelector
              feeTokens={feeTokenListWithBalance || []}
              selectedFeeToken={selectedFeeToken}
              onFeeTokenChanged={handleTokenChange}
              bridgeFeeFormatted={bridgeFeeFormatted}
              bridgeFeeUSD={bridgeFeeUSD}
              loading={loadingBridgeMessage || loadingTokenBalances}
            />
            {selectedFeeToken.address !== constants.AddressZero && (
              <DetailsNumberLine
                description={amountWithFee}
                iconSymbol={GHO_SYMBOL}
                symbol={GHO_SYMBOL}
                value={amountAfterFeeFormatted}
                loading={loadingBridgeMessage || loadingTokenBalances}
              />
            )}
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
            {/* <Row caption={'Bridged Amount'} captionVariant="description" mb={4}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {loadingBridgeMessage ? (
                  <Skeleton
                    variant="rectangular"
                    height={20}
                    width={100}
                    sx={{ borderRadius: '4px' }}
                  />
                ) : (
                  <Typography variant="secondary14">{estimatedTimeToDestination}</Typography>
                )}
              </Box> */}
            <Row /> {/* Spacer */}
            {feesExceedWalletBalance && (
              <Warning severity="warning" sx={{ my: 0 }}>
                <Typography variant="caption">
                  <Trans>Fees exceed wallet balance</Trans>
                </Typography>
              </Warning>
            )}
          </TxModalDetails>
          {txError && <GasEstimationError txError={txError} />}

          {txErrorBridgeMessage && (
            <Warning severity="error" sx={{ mt: 4 }} icon={false}>
              <Typography variant="caption">
                <Trans>Something went wrong fetching bridge message, please try again later.</Trans>
              </Typography>
            </Warning>
          )}

          <BridgeActions {...bridgeActionsProps} />
        </>
      )}
    </>
  );
};
