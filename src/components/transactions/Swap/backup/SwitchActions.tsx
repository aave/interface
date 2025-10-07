// import {
//   API_ETH_MOCK_ADDRESS,
//   ERC20Service,
//   gasLimitRecommendations,
//   ProtocolAction,
// } from '@aave/contract-helpers';
// import { normalize, valueToBigNumber } from '@aave/math-utils';
// import {
//   calculateUniqueOrderId,
//   COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
//   OrderClass,
//   SupportedChainId,
// } from '@cowprotocol/cow-sdk';
// import { Trans } from '@lingui/macro';
// import { useQueryClient } from '@tanstack/react-query';
// import { BigNumber, ethers } from 'ethers';
// import { defaultAbiCoder, splitSignature } from 'ethers/lib/utils';
// import stringify from 'json-stringify-deterministic';
// import { useCallback, useEffect, useMemo, useState } from 'react';
// import { isSmartContractWallet } from 'src/helpers/provider';
// import { useParaSwapTransactionHandler } from 'src/helpers/useParaSwapTransactionHandler';
// import { MOCK_SIGNED_HASH } from 'src/helpers/useTransactionHandler';
// import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
// import {
//   calculateSignedAmount,
//   fetchExactInTxParams,
//   minimumReceivedAfterSlippage,
// } from 'src/hooks/paraswap/common';
// import { useParaswapSellTxParams } from 'src/hooks/paraswap/useParaswapRates';
// import { ModalType, TxStateType, useModalContext } from 'src/hooks/useModal';
// import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
// import { getEthersProvider } from 'src/libs/web3-data-provider/adapters/EthersAdapter';
// import { useRootStore } from 'src/store/root';
// import { TransactionContext, TransactionDetails } from 'src/store/transactionsSlice';
// import { ApprovalMethod } from 'src/store/walletSlice';
// import { getErrorTextFromError, TxAction } from 'src/ui-config/errorMapping';
// import { findByChainId } from 'src/ui-config/marketsConfig';
// import { permitByChainAndToken } from 'src/ui-config/permitConfig';
// import { queryKeysFactory } from 'src/ui-config/queries';
// import { wagmiConfig } from 'src/ui-config/wagmiConfig';
// import { GENERAL } from 'src/utils/events';
// import { getNetworkConfig, getProvider } from 'src/utils/marketsAndNetworksConfig';
// import { needsUSDTApprovalReset } from 'src/utils/usdtHelpers';
// import { useShallow } from 'zustand/shallow';

// import { TxActionsWrapper } from '../TxActionsWrapper';
// import { APPROVAL_GAS_LIMIT } from '../utils';
// import {
//   ADAPTER_APP_CODE,
//   COW_APP_DATA,
//   getPreSignTransaction,
//   getUnsignerOrder,
//   HEADER_WIDGET_APP_CODE,
//   isNativeToken,
//   populateEthFlowTx,
//   sendOrder,
//   uploadAppData,
// } from './cowprotocol/cowprotocol.helpers';
// import {
//   isCowProtocolRates,
//   isParaswapRates,
//   ParaswapRatesType,
//   SwitchRatesType,
// } from './switch.types';

// interface SwitchProps {
//   inputAmount: string;
//   inputToken: string;
//   outputToken: string;
//   setShowUSDTResetWarning: (showUSDTResetWarning: boolean) => void;
//   slippage: string;
//   blocked: boolean;
//   loading?: boolean;
//   isWrongNetwork: boolean;
//   chainId: number;
//   switchRates?: SwitchRatesType;
//   inputSymbol: string;
//   outputSymbol: string;
//   setShowGasStation: (showGasStation: boolean) => void;
//   modalType: ModalType;
//   useFlashloan: boolean;
//   poolReserve?: ComputedReserveData;
//   targetReserve?: ComputedReserveData;
//   isMaxSelected: boolean;
//   setIsExecutingActions?: (isExecuting: boolean) => void;
// }

// export const ParaswapSwitchActionsWrapper = ({
//   inputAmount: amountToSwap,
//   inputSymbol,
//   slippage,
//   blocked,
//   loading,
//   isWrongNetwork,
//   chainId,
//   switchRates,
//   poolReserve,
//   targetReserve,
//   isMaxSelected,
//   addTransaction,
//   setMainTxState,
//   invalidate,
// }: {
//   inputAmount: string;
//   inputSymbol: string;
//   slippage: string;
//   blocked: boolean;
//   loading?: boolean;
//   isWrongNetwork: boolean;
//   chainId: number;
//   switchRates: ParaswapRatesType;
//   poolReserve: ComputedReserveData;
//   targetReserve: ComputedReserveData;
//   isMaxSelected: boolean;
//   addTransaction: (
//     txHash: string,
//     transaction: TransactionDetails,
//     context?: TransactionContext
//   ) => void;
//   setMainTxState: (txState: TxStateType) => void;
//   invalidate: () => void;
// }) => {};

// export const SwitchActions = ({
//   inputAmount,
//   inputToken,
//   outputToken,
//   inputSymbol,
//   outputSymbol,
//   setShowUSDTResetWarning,
//   slippage: slippageInPercent,
//   blocked,
//   loading,
//   isWrongNetwork,
//   chainId,
//   switchRates,
//   setShowGasStation,
//   modalType,
//   useFlashloan,
//   poolReserve,
//   targetReserve,
//   isMaxSelected,
//   setIsExecutingActions,
// }: SwitchProps) => {};
