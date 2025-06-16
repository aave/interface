import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
import {
  OrderKind,
  OrderStatus,
  SupportedChainId,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/cow-sdk';
import { SwitchVerticalIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import { Box, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'src/components/primitives/Link';
import { Warning } from 'src/components/primitives/Warning';
import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
import { isSmartContractWallet } from 'src/helpers/provider';
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
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
import { parseUnits } from 'viem';

import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
import { SupportedNetworkWithChainId } from './common';
import { getOrders, isNativeToken } from './cowprotocol.helpers';
import { Expiry, ExpirySelector } from './ExpirySelector';
import { NetworkSelector } from './NetworkSelector';
import { SwitchPriceInput } from './PriceInput';
import { isCowProtocolRates, SwitchProvider, SwitchRatesType } from './switch.types';
import { SwitchActions } from './SwitchActions';
import { InputRole, SwitchAssetInput } from './SwitchAssetInput';
import { SwitchErrors } from './SwitchErrors';
import { SwitchModalTxDetails } from './SwitchModalTxDetails';
import { SwitchTxSuccessView } from './SwitchTxSuccessView';
import { SwitchType } from './SwitchTypeSelector';

export type SwitchDetailsParams = Parameters<
  NonNullable<SwitchModalCustomizableProps['switchDetails']>
>[0];

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
    switchProvider,
    ratesLoading,
    ratesError,
    showGasStation,
    switchType,
  }: {
    user: string;
    switchRates: SwitchRatesType;
    gasLimit: string;
    selectedChainId: number;
    selectedOutputToken: TokenInfoWithBalance;
    selectedInputToken: TokenInfoWithBalance;
    switchProvider?: SwitchProvider;
    ratesLoading: boolean;
    ratesError: Error | null;
    showGasStation?: boolean;
    switchType: SwitchType;
  }) => React.ReactNode;
  inputBalanceTitle?: string;
  outputBalanceTitle?: string;
  tokensFrom?: TokenInfoWithBalance[];
  tokensTo?: TokenInfoWithBalance[];
  forcedDefaultInputToken?: TokenInfoWithBalance;
  forcedDefaultOutputToken?: TokenInfoWithBalance;
}

export const LimitSwitch = ({
  showSwitchInputAndOutputAssetsButton = true,
  forcedDefaultInputToken,
  forcedDefaultOutputToken,
  supportedNetworks,
  inputBalanceTitle,
  outputBalanceTitle,
  initialFromTokens,
  showChangeNetworkWarning = true,
  selectedChainId,
  setSelectedChainId,
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
  selectedChainId: number;
  setSelectedChainId: (chainId: number) => void;
} & SwitchModalCustomizableProps) => {
  // State
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [debounceInputAmount, setDebounceInputAmount] = useState('');
  const [debounceOutputAmount, setDebounceOutputAmount] = useState('');
  const [amountForRatesProvider, setAmountForRatesProvider] = useState<string>('0');
  const [rate, setRate] = useState<
    | {
        rate: number;
        rateUsd: number;
        originAsset: TokenInfoWithBalance;
        targetAsset: TokenInfoWithBalance;
      }
    | undefined
  >(undefined);
  const { mainTxState: switchTxState, gasLimit, txError, setTxError, close } = useModalContext();
  const user = useRootStore((store) => store.account);
  const { readOnlyModeAddress, chainId: connectedChainId } = useWeb3Context();
  const [selectedExpiry, setSelectedExpiry] = useState(Expiry['One day']);
  const switchProvider = useSwitchProvider({ chainId: selectedChainId });
  const [showGasStation, setShowGasStation] = useState(switchProvider == 'paraswap');
  const selectedNetworkConfig = getNetworkConfig(selectedChainId);
  const isWrongNetwork = useIsWrongNetwork(selectedChainId);

  const [filteredTokens, setFilteredTokens] = useState<TokenInfoWithBalance[]>(initialFromTokens);
  const { data: baseTokenList, refetch: refetchBaseTokenList } = useTokensBalance(
    filteredTokens,
    selectedChainId,
    user
  );
  const [limitOrderKind, setLimitOrderKind] = useState<OrderKind>(OrderKind.SELL);

  const [userIsSmartContractWallet, setUserIsSmartContractWallet] = useState(false);
  useEffect(() => {
    try {
      if (user && connectedChainId) {
        getEthersProvider(wagmiConfig, { chainId: connectedChainId }).then((provider) => {
          isSmartContractWallet(user, provider).then((isSmartContractWallet) => {
            setUserIsSmartContractWallet(isSmartContractWallet);
          });
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

  const debouncedOutputChange = useMemo(() => {
    return debounce((value: string) => {
      setDebounceOutputAmount(value);
    }, 300);
  }, [setDebounceOutputAmount]);

  const handleInputChange = (value: string) => {
    setTxError(undefined);

    setLimitOrderKind(OrderKind.SELL);

    const amountToSet = value === '-1' ? selectedInputToken.balance : value;

    setInputAmount(amountToSet);
    debouncedInputChange(amountToSet);

    if (amountToSet === '') {
      setOutputAmount('');
      setAmountForRatesProvider('0');
      setRate(undefined);
    } else if (outputAmount === '') {
      setAmountForRatesProvider(
        normalizeBN(amountToSet, -1 * selectedInputToken.decimals).toFixed(0)
      );
    } else if (rate) {
      // Re-calculate output based on rate
      let rateToUse;
      if (rate?.originAsset == selectedInputToken) {
        rateToUse = rate.rate;
      } else {
        rateToUse = 1 / rate.rate;
      }

      const newOutputAmount = valueToBigNumber(amountToSet).multipliedBy(rateToUse).toString();
      setOutputAmount(newOutputAmount);
      debouncedOutputChange(newOutputAmount);
    }
  };

  const handleOutputChange = (value: string) => {
    setTxError(undefined);

    setLimitOrderKind(OrderKind.BUY);

    const amountToSet = value === '-1' ? selectedOutputToken.balance : value;

    setOutputAmount(amountToSet);
    debouncedOutputChange(amountToSet);

    if (amountToSet === '') {
      setInputAmount('');
      setAmountForRatesProvider('0');
      setRate(undefined);
    } else if (inputAmount === '') {
      setAmountForRatesProvider(
        normalizeBN(amountToSet, -1 * selectedOutputToken.decimals).toFixed(0)
      );
    } else if (rate) {
      // Re-calculate input based on rate
      let rateToUse;
      if (rate?.originAsset == selectedOutputToken) {
        rateToUse = rate.rate;
      } else {
        rateToUse = 1 / rate.rate;
      }

      const newInputAmount = valueToBigNumber(amountToSet).multipliedBy(rateToUse).toString();
      setInputAmount(newInputAmount);
      debouncedInputChange(newInputAmount);
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
    const fromInput = switchRates
      ? normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).toString()
      : '0';
    const toInput = switchRates
      ? normalizeBN(switchRates.destAmount, switchRates.destDecimals).toString()
      : '0';
    setSelectedInputToken(toToken);
    setSelectedOutputToken(fromToken);
    setInputAmount(toInput);
    setOutputAmount(fromInput);
    setDebounceInputAmount(toInput);
    setDebounceOutputAmount(fromInput);
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

  // Data
  const {
    data: switchRates,
    error: ratesError,
    isFetching: ratesLoading,
  } = useMultiProviderSwitchRates({
    chainId: selectedChainId,
    amount: amountForRatesProvider,
    srcToken: selectedInputToken.address,
    srcDecimals: selectedInputToken.decimals,
    destToken: selectedOutputToken.address,
    destDecimals: selectedOutputToken.decimals,
    inputSymbol: selectedInputToken.symbol,
    outputSymbol: selectedOutputToken.symbol,
    user,
    orderKind: limitOrderKind,
    options: {
      partner: 'aave-widget',
    },
    isTxSuccess: switchTxState.success,
  });

  useEffect(() => {
    if (switchProvider == 'cowprotocol' && isCowProtocolRates(switchRates)) {
      if (limitOrderKind == OrderKind.SELL) {
        // Define rate
        let rateAmount = 0,
          rateUsd = 0,
          rateFrom = rate?.originAsset;

        if (!rateFrom) {
          rateFrom = selectedInputToken;
        }

        if (rateFrom == selectedOutputToken) {
          rateAmount = Number(
            normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).div(
              normalizeBN(switchRates.destAmount, switchRates.destDecimals)
            )
          );
          rateUsd = rateAmount * Number(switchRates.srcTokenPriceUsd);
        } else if (rateFrom == selectedInputToken) {
          rateAmount = Number(
            normalizeBN(switchRates.destAmount, switchRates.destDecimals).div(
              normalizeBN(switchRates.srcAmount, switchRates.srcDecimals)
            )
          );
          rateUsd = rateAmount * Number(switchRates.destTokenPriceUsd);
        }
        setRate({
          rate: rateAmount,
          rateUsd,
          originAsset: selectedInputToken,
          targetAsset: selectedOutputToken,
        });

        if (inputAmount === '') {
          setInputAmount(normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).toString());
          debouncedInputChange(
            normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).toString()
          );
        }
        if (outputAmount === '') {
          setOutputAmount(normalizeBN(switchRates.destAmount, switchRates.destDecimals).toString());
          debouncedOutputChange(
            normalizeBN(switchRates.destAmount, switchRates.destDecimals).toString()
          );
        }
      }
    }
  }, [switchRates, switchProvider]);

  const switchRate = () => {
    if (!switchRates || switchRates.provider !== 'cowprotocol') {
      return;
    }

    if (rate?.originAsset == selectedInputToken) {
      const rateAmount = Number(
        normalizeBN(switchRates.srcAmount, switchRates.srcDecimals).div(
          normalizeBN(switchRates.destAmount, switchRates.destDecimals)
        )
      );
      const rateUsd = rateAmount * Number(switchRates.srcTokenPriceUsd);
      setRate({
        originAsset: selectedOutputToken,
        targetAsset: selectedInputToken,
        rate: rateAmount,
        rateUsd,
      });
    } else if (rate?.originAsset == selectedOutputToken) {
      const rateAmount = Number(
        normalizeBN(switchRates.destAmount, switchRates.destDecimals).div(
          normalizeBN(switchRates.srcAmount, switchRates.srcDecimals)
        )
      );
      const rateUsd = rateAmount * Number(switchRates.destTokenPriceUsd);
      setRate({
        originAsset: selectedInputToken,
        targetAsset: selectedOutputToken,
        rate: rateAmount,
        rateUsd,
      });
    }
  };

  const onChangeRate = (newRate: number, targetToken: TokenInfoWithBalance) => {
    // Calculate new amount
    if (!switchRates) {
      return;
    }
    // calculate 1 input in usd
    const previousUsd = rate?.rateUsd || 0;

    const rateChange = newRate / (rate?.rate || 1);
    const newUsd = previousUsd * rateChange;

    if (targetToken == selectedInputToken) {
      const newAmount =
        newRate * Number(normalizeBN(switchRates.destAmount, switchRates.destDecimals));
      setInputAmount(newAmount.toString());
    } else if (targetToken == selectedOutputToken) {
      const newAmount =
        newRate * Number(normalizeBN(switchRates.srcAmount, switchRates.srcDecimals));
      setInputAmount(newAmount.toString());
    }

    setRate({
      originAsset: selectedInputToken,
      targetAsset: selectedOutputToken,
      rate: newRate,
      rateUsd: newUsd,
    });
  };

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
        outAmount={normalize(switchRates.destAmount, switchRates.destDecimals).toString()}
      />
    );
  }

  // Eth-Flow requires to leave some assets for gas
  const nativeDecimals = 18;
  const gasRequiredForEthFlow = parseUnits('0.01', nativeDecimals); // TODO: Ask for better value coming from the SDK
  const requiredAssetsLeftForGas = isNativeToken(selectedInputToken.address)
    ? gasRequiredForEthFlow
    : undefined;
  const maxAmount = requiredAssetsLeftForGas
    ? parseUnits(selectedInputToken.balance, nativeDecimals) - requiredAssetsLeftForGas
    : undefined;
  const maxAmountFormatted = maxAmount
    ? normalize(maxAmount.toString(), nativeDecimals).toString()
    : undefined;

  // Component
  return (
    <>
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

        {switchProvider === 'cowprotocol' && (
          <ExpirySelector selectedExpiry={selectedExpiry} setSelectedExpiry={setSelectedExpiry} />
        )}
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
              orderKind={limitOrderKind}
              loading={
                debounceOutputAmount !== '0' &&
                debounceOutputAmount !== '' &&
                ratesLoading &&
                limitOrderKind !== OrderKind.SELL &&
                !ratesError
              }
              role={InputRole.INPUT}
            />
            {showSwitchInputAndOutputAssetsButton && (
              <IconButton
                onClick={onSwitchReserves}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'absolute',
                  transform: 'translateY(-130%)',
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
              value={outputAmount}
              usdValue={switchRates?.destUSD || '0'}
              loading={
                debounceInputAmount !== '0' &&
                debounceInputAmount !== '' &&
                ratesLoading &&
                limitOrderKind !== OrderKind.BUY &&
                !ratesError
              }
              onSelect={handleSelectedOutputToken}
              selectedAsset={selectedOutputToken}
              showBalance={false}
              onChange={handleOutputChange}
              orderKind={limitOrderKind}
              role={InputRole.OUTPUT}
              showMaxButton={false}
            />
            {switchProvider === 'cowprotocol' && (
              <SwitchPriceInput
                loading={
                  limitOrderKind === OrderKind.BUY
                    ? debounceOutputAmount !== '0' &&
                      debounceOutputAmount !== '' &&
                      ratesLoading &&
                      !ratesError
                    : debounceInputAmount !== '0' &&
                      debounceInputAmount !== '' &&
                      ratesLoading &&
                      !ratesError
                }
                rate={rate?.rate.toString() || ''}
                rateUsd={rate?.rateUsd.toString() || ''}
                originAsset={rate?.originAsset || selectedInputToken}
                targetAsset={rate?.targetAsset || selectedOutputToken}
                disabled={!switchRates}
                switchRate={switchRate}
                onChangeRate={onChangeRate}
              />
            )}
          </Box>

          {user ? (
            <>
              {(selectedInputToken.extensions?.isUserCustom ||
                selectedOutputToken.extensions?.isUserCustom) && (
                <Warning severity="warning" icon={false} sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="caption">
                    You have selected a custom imported token.
                  </Typography>
                </Warning>
              )}

              {switchRates && (
                <SwitchModalTxDetails
                  rates={{
                    type: 'limit',
                    // TBD
                  }}
                  provider={switchProvider}
                  selectedOutputToken={selectedOutputToken}
                  safeSlippage={0}
                  gasLimit={gasLimit}
                  selectedChainId={selectedChainId}
                  showGasStation={showGasStation}
                />
              )}

              <SwitchErrors
                ratesError={ratesError}
                balance={selectedInputToken.balance}
                inputAmount={debounceInputAmount}
              />
              {txError && <ParaswapErrorDisplay txError={txError} />}

              <SwitchActions
                isWrongNetwork={isWrongNetwork.isWrongNetwork}
                inputAmount={debounceInputAmount}
                inputToken={selectedInputToken.address}
                outputToken={selectedOutputToken.address}
                inputName={selectedInputToken.name}
                orderKind="limit"
                outputName={selectedOutputToken.name}
                inputSymbol={selectedInputToken.symbol}
                outputSymbol={selectedOutputToken.symbol}
                expiry={selectedExpiry}
                setShowGasStation={setShowGasStation}
                blocked={
                  !switchRates ||
                  Number(debounceInputAmount) > Number(selectedInputToken.balance) ||
                  !user
                }
                chainId={selectedChainId}
                switchRates={
                  switchRates
                    ? {
                        ...switchRates,
                        srcAmount: normalizeBN(
                          debounceInputAmount || '0',
                          -1 * selectedInputToken.decimals
                        ).toFixed(0),
                        destAmount: normalizeBN(
                          debounceOutputAmount || '0',
                          -1 * selectedOutputToken.decimals
                        ).toFixed(0),
                      }
                    : undefined
                }
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
