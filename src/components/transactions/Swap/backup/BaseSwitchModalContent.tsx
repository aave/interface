// import { normalize, normalizeBN, valueToBigNumber } from '@aave/math-utils';
// import { OrderStatus, SupportedChainId, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/cow-sdk';
// import { SwitchVerticalIcon } from '@heroicons/react/outline';
// import { Trans } from '@lingui/macro';
// import { Box, Checkbox, CircularProgress, IconButton, SvgIcon, Typography } from '@mui/material';
// import { useQueryClient } from '@tanstack/react-query';
// import { BigNumber } from 'bignumber.js';
// import { debounce } from 'lodash';
// import React, { useEffect, useMemo, useState } from 'react';
// import { BasicModal } from 'src/components/primitives/BasicModal';
// import { Link } from 'src/components/primitives/Link';
// import { Warning } from 'src/components/primitives/Warning';
// import { isSafeWallet, isSmartContractWallet } from 'src/helpers/provider';
// import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
// import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
// import { useMultiProviderSwitchRates } from 'src/hooks/switch/useMultiProviderSwitchRates';
// import { useIsWrongNetwork } from 'src/hooks/useIsWrongNetwork';
// import { ModalType, useModalContext } from 'src/hooks/useModal';
// import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
// import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
// import { useRootStore } from 'src/store/root';
// import { findByChainId } from 'src/ui-config/marketsConfig';
// import { queryKeysFactory } from 'src/ui-config/queries';
// import { TokenInfo } from 'src/ui-config/TokenList';
// import { wagmiConfig } from 'src/ui-config/wagmiConfig';
// import { GENERAL } from 'src/utils/events';
// import { calculateHFAfterSwap } from 'src/utils/hfUtils';
// import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';
// import { parseUnits } from 'viem';

// import { TxModalTitle } from '../FlowCommons/TxModalTitle';
// import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
// import { ParaswapErrorDisplay } from '../Warnings/ParaswapErrorDisplay';
// import { SupportedNetworkWithChainId } from './common';
// import { getOrders, isNativeToken } from './cowprotocol/cowprotocol.helpers';
// import { NetworkSelector } from './NetworkSelector';
// import { getParaswapSlippage } from './slippage.helpers';
// import { isCowProtocolRates } from './switch.types';
// import { SwitchActions } from './SwitchActions';
// import { SwitchAssetInput } from './SwitchAssetInput';
// import { SwitchErrors } from './SwitchErrors';
// import { SwitchModalTxDetails } from './SwitchModalTxDetails';
// import { SwitchRates } from './SwitchRates';
// import { SwitchSlippageSelector } from './SwitchSlippageSelector';
// import { SwitchTxSuccessView } from './SwitchTxSuccessView';
// import { validateSlippage, ValidationSeverity } from './validation.helpers';

// export interface SwitchModalCustomizableProps {
//   modalType: ModalType;
//   inputBalanceTitle?: string;
//   outputBalanceTitle?: string;
//   tokensFrom?: TokenInfoWithBalance[];
//   tokensTo?: TokenInfoWithBalance[];
//   forcedDefaultInputToken?: TokenInfoWithBalance;
//   forcedDefaultOutputToken?: TokenInfoWithBalance;
//   suggestedDefaultInputToken?: TokenInfoWithBalance;
//   suggestedDefaultOutputToken?: TokenInfoWithBalance;
//   showSwitchInputAndOutputAssetsButton?: boolean;
//   forcedChainId?: number;
// }

// export const BaseSwitchModalContent = ({
//   showSwitchInputAndOutputAssetsButton = true,
//   showTitle = true,
//   forcedDefaultInputToken,
//   forcedDefaultOutputToken,
//   suggestedDefaultInputToken,
//   suggestedDefaultOutputToken,
//   supportedNetworks,
//   inputBalanceTitle,
//   outputBalanceTitle,
//   initialFromTokens,
//   initialToTokens,
//   showChangeNetworkWarning = true,
//   modalType,
//   selectedChainId,
//   setSelectedChainId,
//   refetchInitialTokens,
// }: {
//   showTitle?: boolean;
//   forcedChainId: number;
//   showSwitchInputAndOutputAssetsButton?: boolean;
//   forcedDefaultInputToken?: TokenInfoWithBalance;
//   initialFromTokens: TokenInfoWithBalance[];
//   initialToTokens: TokenInfoWithBalance[];
//   forcedDefaultOutputToken?: TokenInfoWithBalance;
//   suggestedDefaultInputToken?: TokenInfoWithBalance;
//   suggestedDefaultOutputToken?: TokenInfoWithBalance;
//   supportedNetworks: SupportedNetworkWithChainId[];
//   showChangeNetworkWarning?: boolean;
//   modalType: ModalType;
//   selectedChainId: number;
//   setSelectedChainId: (chainId: number) => void;
//   refetchInitialTokens: () => void;
// } & SwitchModalCustomizableProps) => {
//   // State
//   const [inputAmount, setInputAmount] = useState('');
//   const [debounceInputAmount, setDebounceInputAmount] = useState('');
//   const { mainTxState: switchTxState, close } = useModalContext();
//   const user = useRootStore((store) => store.account);
//   const { readOnlyModeAddress, chainId: connectedChainId } = useWeb3Context();
//   const trackEvent = useRootStore((store) => store.trackEvent);
//   const [showUSDTResetWarning, setShowUSDTResetWarning] = useState(false);
//   const [highPriceImpactConfirmed, setHighPriceImpactConfirmed] = useState(false);
//   const [lowHFConfirmed, setLowHFConfirmed] = useState(false);
//   const selectedNetworkConfig = getNetworkConfig(selectedChainId);
//   const isWrongNetwork = useIsWrongNetwork(selectedChainId);
//   const [isSwapFlowSelected, setIsSwapFlowSelected] = useState(false);
//   const [isExecutingActions, setIsExecutingActions] = useState(false);

//   const [userIsSmartContractWallet, setUserIsSmartContractWallet] = useState(false);
//   const [userIsSafeWallet, setUserIsSafeWallet] = useState(false);

//   const debouncedInputChange = useMemo(() => {
//     return debounce((value: string) => {
//       setDebounceInputAmount(value);
//     }, 1500);
//   }, [setDebounceInputAmount]);

//   const [slippage, setSlippage] = useState(switchRates?.provider == 'cowprotocol' ? '0.5' : '0.10');
//   const [showGasStation, setShowGasStation] = useState(switchRates?.provider == 'paraswap');

//   // Define default s

//   // No tokens found
//   if (
//     (initialFromTokens !== undefined && initialFromTokens.length === 0) ||
//     (initialToTokens !== undefined && initialToTokens.length === 0)
//   ) {
//     return (
//       <BasicModal open setOpen={() => close()}>
//         <Typography color="text.secondary">
//           <Trans>No eligible assets to swap.</Trans>
//         </Typography>
//       </BasicModal>
//     );
//   }

//   // Success View
//   if (switchRates && switchTxState.success) {
//     return (
//       <SwitchTxSuccessView
//         txHash={switchTxState.txHash}
//         amount={normalize(switchRates.srcAmount, switchRates.srcDecimals).toString()}
//         symbol={selectedInputToken.symbol}
//         iconSymbol={selectedInputToken.symbol}
//         iconUri={selectedInputToken.logoURI}
//         outSymbol={selectedOutputToken.symbol}
//         outIconSymbol={selectedOutputToken.symbol}
//         outIconUri={selectedOutputToken.logoURI}
//         provider={switchRates?.provider ?? 'paraswap'}
//         chainId={selectedChainId}
//         destDecimals={selectedOutputToken.decimals}
//         srcDecimals={selectedInputToken.decimals}
//         outAmount={normalizeBN(switchRates.destAmount, switchRates.destDecimals)
//           .multipliedBy(1 - safeSlippage)
//           .decimalPlaces(switchRates.destDecimals, BigNumber.ROUND_UP)
//           .toString()}
//       />
//     );
//   }

//   // const swapDetailsComponent = (
//   //   <SwitchModalTxDetails
//   //     switchRates={switchRates}
//   //     selectedOutputToken={selectedOutputToken}
//   //     safeSlippage={safeSlippage}
//   //     gasLimit={gasLimit}
//   //     selectedChainId={selectedChainId}
//   //     showGasStation={showGasStation}
//   //     reserves={reserves}
//   //     user={extendedUser}
//   //     selectedInputToken={selectedInputToken}
//   //     modalType={modalType}
//   //     customReceivedTitle={
//   //       modalType === ModalType.CollateralSwap && <Trans>Minimum new collateral</Trans>
//   //     }
//   //   />
//   // );

//   // Component
//   return (
//     <>
//       {!selectedInputToken || !selectedOutputToken ? (
//         <CircularProgress />
//       ) : (
//         <>
//           <>
//             {isSwapFlowSelected && (
//               <SwitchActions
//                 isWrongNetwork={isWrongNetwork.isWrongNetwork}
//                 inputAmount={debounceInputAmount}
//                 inputToken={
//                   modalType === ModalType.CollateralSwap && shouldUseFlashloan === true
//                     ? selectedInputToken.address
//                     : modalType === ModalType.CollateralSwap
//                     ? selectedInputToken.aToken ?? selectedInputToken.address
//                     : selectedInputToken.address
//                 }
//                 outputToken={
//                   modalType === ModalType.CollateralSwap && shouldUseFlashloan === true
//                     ? selectedOutputToken.address
//                     : modalType === ModalType.CollateralSwap
//                     ? selectedOutputToken.aToken ?? selectedOutputToken.address
//                     : selectedOutputToken.address
//                 }
//                 loading={ratesLoading || !isSwapFlowSelected}
//                 setShowUSDTResetWarning={setShowUSDTResetWarning}
//                 inputSymbol={selectedInputToken.symbol}
//                 outputSymbol={selectedOutputToken.symbol}
//                 slippage={safeSlippage.toString()}
//                 setShowGasStation={setShowGasStation}
//                 useFlashloan={shouldUseFlashloan === true}
//                 poolReserve={poolReserve}
//                 targetReserve={targetReserve}
//                 isMaxSelected={inputAmount === selectedInputToken.balance}
//                 blocked={
//                   !switchRates ||
//                   Number(debounceInputAmount) > Number(selectedInputToken.balance) ||
//                   !user ||
//                   slippageValidation?.severity === ValidationSeverity.ERROR ||
//                   isSwappingSafetyModuleToken ||
//                   (requireConfirmation && !highPriceImpactConfirmed) ||
//                   (shouldUseFlashloan === true && !!poolReserve && !poolReserve.flashLoanEnabled) ||
//                   (modalType === ModalType.CollateralSwap && isLiquidatable) ||
//                   (modalType === ModalType.CollateralSwap &&
//                     isHFLow &&
//                     requireConfirmationHFlow &&
//                     !lowHFConfirmed)
//                 }
//                 chainId={selectedChainId}
//                 switchRates={switchRates}
//                 modalType={modalType}
//                 setIsExecutingActions={setIsExecutingActions}
//               />
//             )}
//           </>
//         </>
//       )}
//     </>
//   );
// };
