import { normalize, normalizeBN } from '@aave/math-utils';
import { OrderStatus, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { isSafeWallet, isSmartContractWallet } from 'src/helpers/provider';
import { TokenInfoWithBalance, useTokensBalance } from 'src/hooks/generic/useTokensBalance';
import { useMultiProviderSwitchRates } from 'src/hooks/switch/useMultiProviderSwitchRates';
import { useSwitchProvider } from 'src/hooks/switch/useSwitchProvider';
import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
import { useRootStore } from 'src/store/root';
import { findByChainId } from 'src/ui-config/marketsConfig';
import { queryKeysFactory } from 'src/ui-config/queries';
import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
import { wagmiConfig } from 'src/ui-config/wagmiConfig';
import { GENERAL } from 'src/utils/events';
import { CustomMarket, getNetworkConfig, marketsData } from 'src/utils/marketsAndNetworksConfig';
import { parseUnits } from 'viem';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { supportedNetworksWithEnabledMarket, SupportedNetworkWithChainId } from './common';
import { getOrders, isNativeToken } from './cowprotocol.helpers';
import { NetworkSelector } from './NetworkSelector';
import { isCowProtocolRates, SwitchProvider, SwitchRatesType } from './switch.types';
import { SwitchActions } from './SwitchActions';
import { SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { SwitchRates } from './SwitchRates';
import { SwitchSlippageSelector } from './SwitchSlippageSelector';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';
import { validateSlippage, ValidationSeverity } from './validation.helpers';

const SAFETY_MODULE_TOKENS = [
  'stkgho',
  'stkaave',
  'stkaavewstethbptv2',
  'stkbptv2',
  'stkbpt',
  'stkabpt',
];

export type SwitchDetailsParams = Parameters<
  NonNullable<SwitchModalCustomizableProps['switchDetails']>
>[0];

const valueLostPercentage = (destValueInUsd: number, srcValueInUsd: number) => {
  const receivingPercentage = destValueInUsd / srcValueInUsd;
  const valueLostPercentage = receivingPercentage ? 1 - receivingPercentage : 0;
  return valueLostPercentage;
};

const shouldShowWarning = (lostValue: number, srcValueInUsd: number) => {
  if (srcValueInUsd > 500000) return lostValue > 0.03;
  if (srcValueInUsd > 100000) return lostValue > 0.04;
  if (srcValueInUsd > 10000) return lostValue > 0.05;
  if (srcValueInUsd > 1000) return lostValue > 0.07;

  return lostValue > 0.05;
};

const shouldRequireConfirmation = (lostValue: number) => {
  return lostValue > 0.2;
};

export const getFilteredTokensForSwitch = (chainId: number): TokenInfoWithBalance[] => {
  let customTokenList = TOKEN_LIST.tokens;
  const savedCustomTokens = localStorage.getItem('customTokens');
  if (savedCustomTokens) {
    customTokenList = customTokenList.concat(JSON.parse(savedCustomTokens));
  }

  const transformedTokens = customTokenList.map((token) => {
    return { ...token, balance: '0' };
  });
  const realChainId = getNetworkConfig(chainId).underlyingChainId ?? chainId;
  return transformedTokens.filter((token) => token.chainId === realChainId);
};
export interface SwitchModalCustomizableProps {
  modalType: ModalType;
  switchDetails?: ({
    user,
    switchRates,
    gasLimit,
    selectedChainId,
    selectedOutputToken,
    selectedInputToken,
    safeSlippage,
    maxSlippage,
    switchProvider,
    ratesLoading,
    ratesError,
    showGasStation,
  }: {
    user: string;
    switchRates: SwitchRatesType;
    gasLimit: string;
    selectedChainId: number;
    selectedOutputToken: TokenInfoWithBalance;
    selectedInputToken: TokenInfoWithBalance;
    safeSlippage: number;
    maxSlippage: number;
    switchProvider?: SwitchProvider;
    ratesLoading: boolean;
    ratesError: Error | null;
    showGasStation?: boolean;
  }) => React.ReactNode;
  inputBalanceTitle?: string;
  outputBalanceTitle?: string;
  tokensFrom?: TokenInfoWithBalance[];
  tokensTo?: TokenInfoWithBalance[];
  forcedDefaultInputToken?: TokenInfoWithBalance;
  forcedDefaultOutputToken?: TokenInfoWithBalance;
}

export const BaseSwitchModalContent = ({
  showSwitchInputAndOutputAssetsButton = true,
  showTitle = true,
  forcedDefaultInputToken,
  forcedChainId,
  forcedDefaultOutputToken,
  supportedNetworks,
  switchDetails,
  inputBalanceTitle,
  outputBalanceTitle,
  initialFromTokens,
  showChangeNetworkWarning = true,
}: {
  showTitle?: boolean;
  forcedChainId: number;
  showSwitchInputAndOutputAssetsButton?: boolean;
  forcedDefaultInputToken?: TokenInfoWithBalance;
  initialFromTokens: TokenInfoWithBalance[];
  initialToTokens: TokenInfoWithBalance[];
  forcedDefaultOutputToken?: TokenInfoWithBalance;
  supportedNetworks: SupportedNetworkWithChainId[];
  showChangeNetworkWarning?: boolean;
} & SwitchModalCustomizableProps) => {
  // State
  const [inputAmount, setInputAmount] = useState('');
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const { mainTxState: switchTxState, gasLimit, txError, setTxError, close } = useModalContext();
  const user = useRootStore((store) => store.account);
  const { readOnlyModeAddress, chainId: connectedChainId } = useWeb3Context();
  const defaultNetwork = marketsData[CustomMarket.proto_mainnet_v3];
  const [selectedChainId, setSelectedChainId] = useState(() => {
    if (supportedNetworksWithEnabledMarket.find((elem) => elem.chainId === forcedChainId))
      return forcedChainId;
    return defaultNetwork.chainId;
  });
  const switchProvider = useSwitchProvider({ chainId: selectedChainId });
  const [slippage, setSlippage] = useState(switchProvider == 'cowprotocol' ? '0.5' : '0.10');
  const [showGasStation, setShowGasStation] = useState(switchProvider == 'paraswap');
  const [highPriceImpactConfirmed, setHighPriceImpactConfirmed] = useState(false);
  const selectedNetworkConfig = getNetworkConfig(selectedChainId);
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

  const [filteredTokens, setFilteredTokens] = useState<TokenInfoWithBalance[]>(initialFromTokens);
  const { data: baseTokenList, refetch: refetchBaseTokenList } = useTokensBalance(
    filteredTokens,
    selectedChainId,
    user
  );

  const [userIsSmartContractWallet, setUserIsSmartContractWallet] = useState(false);
  const [userIsSafeWallet, setUserIsSafeWallet] = useState(false);
  useEffect(() => {
    try {
      if (user && connectedChainId) {
        getEthersProvider(wagmiConfig, { chainId: connectedChainId }).then((provider) => {
          Promise.all([isSmartContractWallet(user, provider), isSafeWallet(user, provider)]).then(
            ([isSmartContract, isSafe]) => {
              setUserIsSmartContractWallet(isSmartContract);
              setUserIsSafeWallet(isSafe);
            }
          );
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [user, connectedChainId]);

  const debouncedInputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceInputAmount(value);
    }, 300);
  }, [setDebounceInputAmount]);

  const handleInputChange = (value: string) => {
    setTxError(undefined);
    setHighPriceImpactConfirmed(false);
    if (value === '-1') {
      // Max Selected
      setInputAmount(selectedInputToken.balance);
      debouncedInputChange(selectedInputToken.balance);
    } else {
      setInputAmount(value);
      debouncedInputChange(value);
    }
  };

  const handleSelectedInputToken = (token: TokenInfoWithBalance) => {
    if (!baseTokenList?.find((t) => t.address === token.address)) {
      addNewToken(token).then(() => {
        setSelectedInputToken(token);
        setTxError(undefined);
      });
    } else {
      setSelectedInputToken(token);
      setTxError(undefined);
    }
  };

  const handleSelectedOutputToken = (token: TokenInfoWithBalance) => {
    if (!baseTokenList?.find((t) => t.address === token.address)) {
      addNewToken(token).then(() => {
        setSelectedOutputToken(token);
        setTxError(undefined);
      });
    } else {
      setSelectedOutputToken(token);
      setTxError(undefined);
    }
  };

  const onSwitchReserves = () => {
    const fromToken = selectedInputToken;
    const toToken = selectedOutputToken;
    const toInput = switchRates
      ? normalizeBN(switchRates.destAmount, switchRates.destDecimals).toString()
      : '0';
    setSelectedInputToken(toToken);
    setSelectedOutputToken(fromToken);
    setInputAmount(toInput);
    setDebounceInputAmount(toInput);
    setTxError(undefined);
  };

  const handleSelectedNetworkChange = (value: number) => {
    setTxError(undefined);
    setSelectedChainId(value);
    const newFilteredTokens = getFilteredTokensForSwitch(value);
    setFilteredTokens(newFilteredTokens);
    refetchBaseTokenList();
  };

  const queryClient = useQueryClient();
  const addNewToken = async (token: TokenInfoWithBalance) => {
    queryClient.setQueryData<TokenInfoWithBalance[]>(
      queryKeysFactory.tokensBalance(baseTokenList ?? [], selectedChainId, user),
      (oldData) => {
        if (oldData)
          return [...oldData, token].sort((a, b) => Number(b.balance) - Number(a.balance));
        return [token];
      }
    );
    const customTokens = localStorage.getItem('customTokens');
    const newTokenInfo = {
      address: token.address,
      symbol: token.symbol,
      decimals: token.decimals,
      chainId: token.chainId,
      name: token.name,
      logoURI: token.logoURI,
      extensions: {
        isUserCustom: true,
      },
    };
    if (customTokens) {
      const parsedCustomTokens: TokenInfo[] = JSON.parse(customTokens);
      parsedCustomTokens.push(newTokenInfo);
      localStorage.setItem('customTokens', JSON.stringify(parsedCustomTokens));
    } else {
      localStorage.setItem('customTokens', JSON.stringify([newTokenInfo]));
    }
  };

  const { defaultInputToken, defaultOutputToken } = useMemo(() => {
    let auxInputToken = forcedDefaultInputToken;
    let auxOutputToken = forcedDefaultOutputToken;

    const fromList = baseTokenList || filteredTokens;
    const toList = baseTokenList || filteredTokens;

    if (!auxInputToken) {
      auxInputToken = fromList.find(
        (token) => (token.balance !== '0' || token.extensions?.isNative) && token.symbol !== 'GHO'
      );
    }

    if (!auxOutputToken) {
      auxOutputToken = toList.find((token) => token.symbol == 'GHO');
    }

    return {
      defaultInputToken: auxInputToken ?? fromList[0],
      defaultOutputToken: auxOutputToken ?? toList[1],
    };
  }, [baseTokenList, filteredTokens]);

  const [selectedInputToken, setSelectedInputToken] = useState<TokenInfoWithBalance>(
    forcedDefaultInputToken ?? defaultInputToken
  );
  const [selectedOutputToken, setSelectedOutputToken] = useState<TokenInfoWithBalance>(
    forcedDefaultOutputToken ?? defaultOutputToken
  );

  useEffect(() => {
    setSelectedInputToken(defaultInputToken);
  }, [defaultInputToken]);

  useEffect(() => {
    setSelectedOutputToken(defaultOutputToken);
  }, [defaultOutputToken]);

  const slippageValidation = validateSlippage(
    slippage,
    selectedChainId,
    isNativeToken(selectedInputToken?.address),
    switchProvider
  );

  const safeSlippage =
    slippageValidation && slippageValidation.severity === ValidationSeverity.ERROR
      ? 0
      : Number(slippage) / 100;

  // Data
  const {
    data: switchRates,
    error: ratesError,
    isFetching: ratesLoading,
  } = useMultiProviderSwitchRates({
    chainId: selectedChainId,
    amount:
      debounceInputAmount === ''
        ? '0'
        : normalizeBN(debounceInputAmount, -1 * selectedInputToken.decimals).toFixed(0),
    srcToken: selectedInputToken.address,
    srcDecimals: selectedInputToken.decimals,
    destToken: selectedOutputToken.address,
    destDecimals: selectedOutputToken.decimals,
    inputSymbol: selectedInputToken.symbol,
    outputSymbol: selectedOutputToken.symbol,
    isInputTokenCustom: !!selectedInputToken.extensions?.isUserCustom,
    isOutputTokenCustom: !!selectedOutputToken.extensions?.isUserCustom,
    user,
    options: {
      partner: 'aave-widget',
    },
    isTxSuccess: switchTxState.success,
  });

  // Define default slippage for CoW
  useEffect(() => {
    if (switchProvider == 'cowprotocol' && isCowProtocolRates(switchRates)) {
      setSlippage(switchRates.suggestedSlippage.toString());
    }
  }, [switchRates, switchProvider]);

  const [showSlippageWarning, setShowSlippageWarning] = useState(false);
  useEffect(() => {
    // Debounce to avoid race condition
    const timeout = setTimeout(() => {
      setShowSlippageWarning(
        isCowProtocolRates(switchRates) && Number(slippage) < switchRates?.suggestedSlippage
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [slippage, switchRates]);

  const [cowOpenOrdersTotalAmountFormatted, setCowOpenOrdersTotalAmountFormatted] = useState<
    string | undefined
  >(undefined);
  useEffect(() => {
    if (
      switchProvider == 'cowprotocol' &&
      user &&
      selectedChainId &&
      selectedInputToken &&
      selectedOutputToken
    ) {
      setCowOpenOrdersTotalAmountFormatted(undefined);

      getOrders(selectedChainId, user).then((orders) => {
        const cowOpenOrdersTotalAmount = orders
          .filter(
            (order) =>
              order.sellToken.toLowerCase() == selectedInputToken.address.toLowerCase() &&
              order.status == OrderStatus.OPEN
          )
          .map((order) => order.sellAmount)
          .reduce((acc, curr) => acc + Number(curr), 0);
        if (cowOpenOrdersTotalAmount > 0) {
          setCowOpenOrdersTotalAmountFormatted(
            normalize(cowOpenOrdersTotalAmount, selectedInputToken.decimals).toString()
          );
        } else {
          setCowOpenOrdersTotalAmountFormatted(undefined);
        }
      });
    } else {
      setCowOpenOrdersTotalAmountFormatted(undefined);
    }
  }, [selectedInputToken, selectedOutputToken, switchProvider, selectedChainId, user]);

  // Views
  if (!baseTokenList) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', my: '60px' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Success View
  if (switchRates && switchTxState.success) {
    return (
      <SwitchTxSuccessView
        txHash={switchTxState.txHash}
        amount={normalize(switchRates.srcAmount, switchRates.srcDecimals).toString()}
        symbol={selectedInputToken.symbol}
        iconSymbol={selectedInputToken.symbol}
        iconUri={selectedInputToken.logoURI}
        outSymbol={selectedOutputToken.symbol}
        outIconSymbol={selectedOutputToken.symbol}
        outIconUri={selectedOutputToken.logoURI}
        provider={switchProvider ?? 'paraswap'}
        chainId={selectedChainId}
        destDecimals={selectedOutputToken.decimals}
        srcDecimals={selectedInputToken.decimals}
        outAmount={(
          Number(normalize(switchRates.destAmount, switchRates.destDecimals)) *
          (1 - safeSlippage)
        ).toString()}
      />
    );
  }

  // Eth-Flow requires to leave some assets for gas
  const nativeDecimals = 18;
  const gasRequiredForEthFlow =
    selectedChainId === 1
      ? parseUnits('0.01', nativeDecimals)
      : parseUnits('0.0001', nativeDecimals); // TODO: Ask for better value coming from the SDK
  const requiredAssetsLeftForGas = isNativeToken(selectedInputToken.address)
    ? gasRequiredForEthFlow
    : undefined;
  const maxAmount = requiredAssetsLeftForGas
    ? parseUnits(selectedInputToken.balance, nativeDecimals) - requiredAssetsLeftForGas
    : undefined;
  const maxAmountFormatted = maxAmount
    ? normalize(maxAmount.toString(), nativeDecimals).toString()
    : undefined;

  const swapDetailsComponent =
    switchDetails && switchRates
      ? switchDetails({
          switchProvider,
          user,
          switchRates,
          gasLimit,
          selectedChainId,
          selectedOutputToken,
          selectedInputToken,
          safeSlippage,
          maxSlippage: Number(slippage),
          ratesLoading,
          ratesError,
          showGasStation,
        })
      : null;

  const lostValue = switchRates
    ? valueLostPercentage(
        Number(switchRates?.destUSD) * (1 - safeSlippage),
        Number(switchRates?.srcUSD)
      )
    : 0;

  const showWarning = switchRates
    ? shouldShowWarning(lostValue, Number(switchRates?.srcUSD))
    : false;
  const requireConfirmation = switchRates ? shouldRequireConfirmation(lostValue) : false;

  const isSwappingSafetyModuleToken = SAFETY_MODULE_TOKENS.includes(
    selectedInputToken.symbol.toLowerCase()
  );

  // Component
  return (
    <>
      {showTitle && (
        <TxModalTitle
          title={`Swap ${
            debounceInputAmount.length && selectedInputToken ? selectedInputToken.symbol : 'Assets'
          }`}
        />
      )}
      {showChangeNetworkWarning && isWrongNetwork.isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={selectedNetworkConfig.name}
          chainId={selectedChainId}
          event={{
            eventName: GENERAL.SWITCH_NETWORK,
          }}
          askManualSwitch={userIsSmartContractWallet}
        />
      )}

      {cowOpenOrdersTotalAmountFormatted && (
        <Warning severity="info" icon={false} sx={{ mt: 2, mb: 2 }}>
          <Typography variant="caption">
            You have open orders for {cowOpenOrdersTotalAmountFormatted} {selectedInputToken.symbol}
            . <br /> Track them in your{' '}
            <Link
              target="_blank"
              href={`/history?marketName=${findByChainId(selectedChainId)?.market}`}
            >
              transaction history
            </Link>
          </Typography>
        </Warning>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <NetworkSelector
          networks={supportedNetworks}
          selectedNetwork={selectedChainId}
          setSelectedNetwork={handleSelectedNetworkChange}
        />
        <SwitchSlippageSelector
          slippageValidation={slippageValidation}
          slippage={slippage}
          setSlippage={setSlippage}
          suggestedSlippage={
            switchRates?.provider === 'cowprotocol'
              ? switchRates?.suggestedSlippage.toString()
              : undefined
          }
        />
      </Box>
      {!selectedInputToken || !selectedOutputToken ? (
        <CircularProgress />
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
            }}
          >
            <SwitchAssetInput
              chainId={selectedChainId}
              balanceTitle={inputBalanceTitle}
              assets={baseTokenList.filter(
                (token) =>
                  token.address !== selectedOutputToken.address &&
                  Number(token.balance) !== 0 &&
                  // Remove native tokens for non-Safe smart contract wallets
                  !(userIsSmartContractWallet && !userIsSafeWallet && token.extensions?.isNative) &&
                  // Avoid wrapping
                  !(
                    isNativeToken(selectedOutputToken.address) &&
                    token.address ===
                      WRAPPED_NATIVE_CURRENCIES[selectedChainId as SupportedChainId]?.address
                  ) &&
                  !(
                    selectedOutputToken.address ===
                      WRAPPED_NATIVE_CURRENCIES[selectedChainId as SupportedChainId]?.address &&
                    isNativeToken(token.address)
                  )
              )}
              value={inputAmount}
              onChange={handleInputChange}
              usdValue={switchRates?.srcUSD || '0'}
              onSelect={handleSelectedInputToken}
              selectedAsset={selectedInputToken}
              forcedMaxValue={maxAmountFormatted}
            />
            {showSwitchInputAndOutputAssetsButton && (
              <IconButton
                onClick={onSwitchReserves}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'absolute',
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'background.surface' },
                }}
              >
                <SvgIcon
                  sx={{
                    color: 'primary.main',
                    fontSize: '18px',
                  }}
                >
                  <SwitchVerticalIcon />
                </SvgIcon>
              </IconButton>
            )}
            <SwitchAssetInput
              chainId={selectedChainId}
              balanceTitle={outputBalanceTitle}
              assets={baseTokenList.filter(
                (token) =>
                  token.address !== selectedInputToken.address &&
                  // Avoid wrapping
                  !(
                    isNativeToken(selectedInputToken.address) &&
                    token.address ===
                      WRAPPED_NATIVE_CURRENCIES[selectedChainId as SupportedChainId]?.address
                  ) &&
                  !(
                    selectedInputToken.address ===
                      WRAPPED_NATIVE_CURRENCIES[selectedChainId as SupportedChainId]?.address &&
                    isNativeToken(token.address)
                  )
              )}
              value={
                switchRates
                  ? normalizeBN(switchRates.destSpot, switchRates.destDecimals).toString()
                  : '0'
              }
              usdValue={switchRates?.destSpotInUsd || '0'}
              loading={
                debounceInputAmount !== '0' &&
                debounceInputAmount !== '' &&
                ratesLoading &&
                !ratesError
              }
              onSelect={handleSelectedOutputToken}
              disableInput={true}
              selectedAsset={selectedOutputToken}
              showBalance={false}
            />
          </Box>
          {switchRates && (
            <>
              <SwitchRates
                rates={switchRates}
                srcSymbol={selectedInputToken.symbol}
                destSymbol={selectedOutputToken.symbol}
                showPriceImpact={!isCowProtocolRates(switchRates)}
              />
            </>
          )}

          {user ? (
            <>
              {(selectedInputToken.extensions?.isUserCustom ||
                selectedOutputToken.extensions?.isUserCustom) && (
                <Warning severity="warning" icon={false} sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="caption">
                    You selected a custom imported token. Make sure it&apos;s the right token.
                  </Typography>
                </Warning>
              )}

              {swapDetailsComponent}

              {showSlippageWarning && (
                <Warning severity="warning" icon={false} sx={{ mt: 5 }}>
                  <Typography variant="caption">
                    Slippage is lower than recommended. The swap may be delayed or fail.
                  </Typography>
                </Warning>
              )}

              <SwitchErrors
                ratesError={ratesError}
                balance={selectedInputToken.balance}
                inputAmount={debounceInputAmount}
              />
              {txError && <ParaswapErrorDisplay txError={txError} />}

              {showWarning && (
                <Warning
                  severity="warning"
                  icon={false}
                  sx={{
                    mt: 2,
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption">
                    <Trans>
                      High price impact. This route may return less due to low liquidity.
                    </Trans>
                  </Typography>
                  {requireConfirmation && (
                    <Box
                      sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2 }}
                    >
                      <Typography variant="caption">
                        <Trans>
                          I confirm the swap with a potential {(lostValue * 100).toFixed(0)}% value
                          loss
                        </Trans>
                      </Typography>
                      <Checkbox
                        checked={highPriceImpactConfirmed}
                        onChange={() => {
                          setHighPriceImpactConfirmed(!highPriceImpactConfirmed);
                        }}
                        size="small"
                        data-cy={'high-price-impact-checkbox'}
                      />
                    </Box>
                  )}
                </Warning>
              )}

              {isSwappingSafetyModuleToken && (
                <Warning severity="error" icon={false} sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="caption">
                    <Trans>
                      For swapping safety module assets please unstake your position{' '}
                      <Link href="/safety-module" onClick={() => close()}>
                        here
                      </Link>
                      .
                    </Trans>
                  </Typography>
                </Warning>
              )}

              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={debounceInputAmount}
                inputToken={selectedInputToken.address}
                outputToken={selectedOutputToken.address}
                inputName={selectedInputToken.name}
                outputName={selectedOutputToken.name}
                inputSymbol={selectedInputToken.symbol}
                outputSymbol={selectedOutputToken.symbol}
                slippage={safeSlippage.toString()}
                setShowGasStation={setShowGasStation}
                blocked={
                  !switchRates ||
                  Number(debounceInputAmount) > Number(selectedInputToken.balance) ||
                  !user ||
                  slippageValidation?.severity === ValidationSeverity.ERROR ||
                  isSwappingSafetyModuleToken ||
                  (requireConfirmation && !highPriceImpactConfirmed)
                }
                chainId={selectedChainId}
                switchRates={switchRates}
              />
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', mt: 4, alignItems: 'center' }}>
              <Typography sx={{ mb: 6, textAlign: 'center' }} color="text.secondary">
                <Trans>Please connect your wallet to swap tokens.</Trans>
              </Typography>
              <ConnectWalletButton
                onClick={() => {
                  close();
                }}
              />
            </Box>
          )}
        </>
      )}
    </>
  );
};
