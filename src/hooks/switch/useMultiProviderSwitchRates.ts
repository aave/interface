// import { useQuery } from '@tanstack/react-query';
// import { useMemo } from 'react';
// import {
//   ADAPTER_APP_CODE,
//   HEADER_WIDGET_APP_CODE,
// } from 'src/components/transactions/Switch/cowprotocol/cowprotocol.helpers';
// import {
//   MultiProviderRatesParams,
//   SwitchRatesType,
// } from 'src/components/transactions/Switch/switch.types';
// import { queryKeysFactory } from 'src/ui-config/queries';

// import { ModalType } from '../useModal';
// import { getCowProtocolSellRates } from './cowprotocol.rates';
// import { getParaswapSellRates } from './paraswap.rates';
// import { getSwitchProvider } from './switchProvider.helpers';

// export const useMultiProviderSwitchRates = ({
//   chainId,
//   amount,
//   srcUnderlyingToken,
//   srcAToken,
//   destUnderlyingToken,
//   destAToken,
//   user,
//   inputSymbol,
//   isInputTokenCustom,
//   isOutputTokenCustom,
//   outputSymbol,
//   srcDecimals,
//   destDecimals,
//   isTxSuccess,
//   shouldUseFlashloan = false,
//   isExecutingActions = false,
//   modalType,
// }: MultiProviderRatesParams & {
//   isTxSuccess?: boolean;
//   shouldUseFlashloan?: boolean;
//   isExecutingActions?: boolean;
//   modalType: ModalType;
// }) => {
//   const provider = useMemo(
//     () =>
//       getSwitchProvider({
//         chainId,
//         assetFrom: srcAToken ?? srcUnderlyingToken,
//         assetTo: destAToken ?? destUnderlyingToken,
//         modalType: modalType,
//         shouldUseFlashloan,
//       }),
//     [
//       chainId,
//       srcAToken,
//       srcUnderlyingToken,
//       destAToken,
//       destUnderlyingToken,
//       modalType,
//       shouldUseFlashloan,
//     ]
//   );

//   const srcToken = useMemo(() => {
//     return modalType === ModalType.CollateralSwap
//       ? shouldUseFlashloan === true || provider === 'paraswap'
//         ? srcUnderlyingToken
//         : srcAToken ?? srcUnderlyingToken
//       : srcUnderlyingToken;
//   }, [srcAToken, srcUnderlyingToken, provider, modalType, shouldUseFlashloan]);

//   const destToken = useMemo(() => {
//     return modalType === ModalType.CollateralSwap
//       ? shouldUseFlashloan === true || provider === 'paraswap'
//         ? destUnderlyingToken
//         : destAToken ?? destUnderlyingToken
//       : destUnderlyingToken;
//   }, [destAToken, destUnderlyingToken, provider, modalType, shouldUseFlashloan]);

//   const appCode =
//     modalType === ModalType.CollateralSwap ? ADAPTER_APP_CODE : HEADER_WIDGET_APP_CODE;

//   return useQuery<SwitchRatesType>({
//     queryFn: async () => {
//       if (!provider) {
//         throw new Error('No swap provider found in the selected chain for this pair');
//       }

//       if (srcToken === destToken) {
//         throw new Error('Source and destination tokens cannot be the same');
//       }

//       switch (provider) {
//         case 'cowprotocol':
//           return await getCowProtocolSellRates({
//             chainId,
//             amount,
//             srcToken,
//             destToken,
//             user,
//             srcDecimals,
//             destDecimals,
//             inputSymbol,
//             outputSymbol,
//             isInputTokenCustom,
//             isOutputTokenCustom,
//             appCode,
//           });
//         case 'paraswap':
//           return await getParaswapSellRates({
//             chainId,
//             amount,
//             srcToken,
//             destToken,
//             user,
//             srcDecimals,
//             destDecimals,
//             options: {
//               partner: 'aave-widget',
//             },
//           });
//       }
//     },
//     queryKey: queryKeysFactory.cowProtocolRates(
//       chainId,
//       amount,
//       srcToken,
//       destToken,
//       user,
//       appCode
//     ),
//     enabled: amount !== '0' && !isTxSuccess,
//     retry: 0,
//     throwOnError: false,
//     refetchOnWindowFocus: (query) => (query.state.error ? false : true),
//     refetchInterval: provider === 'cowprotocol' && !isExecutingActions ? 30000 : false, // 30 seconds, but pause during action execution
//   });
// };
