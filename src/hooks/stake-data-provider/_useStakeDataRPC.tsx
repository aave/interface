// import { useState, useEffect } from 'react';
// import { BigNumber, ethers } from 'ethers';

// import { ChainId, Stake } from '@aave/contract-helpers';
// import { usePolling } from '../usePolling';
// import { useApolloClient } from '@apollo/client';
// import { getProvider } from 'src/utils/marketsAndNetworksConfig';
// import { C_StakeGeneralUiDataDocument, C_StakeGeneralUiDataQuery } from './graphql/hooks';

// function formatRawStakeData(
//   data: StakeGeneralDataT<BigNumber, BigNumber> & StakeUserDataT<BigNumber, BigNumber>
// ): StakeData {
//   return {
//     stakeTokenTotalSupply: data.stakeTokenTotalSupply.toString(),
//     stakeCooldownSeconds: data.stakeCooldownSeconds.toNumber(),
//     stakeUnstakeWindow: data.stakeUnstakeWindow.toNumber(),
//     stakeTokenPriceEth: data.stakeTokenPriceEth.toString(),
//     rewardTokenPriceEth: data.rewardTokenPriceEth.toString(),
//     stakeApy: data.stakeApy.toString(),
//     distributionPerSecond: data.distributionPerSecond.toString(),
//     distributionEnd: data.distributionEnd.toString(),
//     stakeTokenUserBalance: data.stakeTokenUserBalance.toString(),
//     underlyingTokenUserBalance: data.underlyingTokenUserBalance.toString(),
//     userCooldown: data.userCooldown.toNumber(),
//     userIncentivesToClaim: data.userIncentivesToClaim.toString(),
//     userPermitNonce: data.userPermitNonce.toString(),
//   };
// }

// export function _useStakeDataRPC(chainId: ChainId, userAddress?: string, skip = false) {
//   const { cache } = useApolloClient();
//   const [loading, setLoading] = useState(true);
//   const [usdPriceEth, setUsdPriceEth] = useState<string>('0');

//   const loadStakeData = async (_userAddress: string | undefined, helperAddress: string) => {
//     const userAddress = _userAddress ? _userAddress : ethers.constants.AddressZero;
//     const helperContract = StakeUiHelperIFactory.connect(helperAddress, getProvider(chainId));
//     try {
//       const data = await helperContract.getUserUIData(userAddress);

//       setStakeData({
//         [Stake.aave]: formatRawStakeData(data['0']),
//         [Stake.bpt]: formatRawStakeData(data['1']),
//       });
//       cache.writeQuery<C_StakeGeneralUiDataQuery>({
//         query: C_StakeGeneralUiDataDocument,
//         data: {
//           __typename: 'Query',
//           stakeGeneralUIData: {
//             __typename: 'StakeGeneralUIData',
//             aave: data['0'],
//             bpt: data['1'],
//             usdPriceEth: data['2'],
//           },
//         },
//         variables: { userAddress },
//       });
//       setUsdPriceEth(data[2].toString());
//     } catch (e) {
//       console.log('Stake data loading error', e);
//     }
//     setLoading(false);
//   };

//   useEffect(() => {
//     setLoading(true);

//     if (!skip) {
//       loadStakeData(user, stakeDataProvider);
//       const intervalId = setInterval(
//         () => loadStakeData(user, stakeDataProvider),
//         poolingInterval * 1000
//       );
//       return () => clearInterval(intervalId);
//     } else {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, skip, stakeDataProvider, chainId]);
//   usePolling(loadStakeData, 30000, skip, [userAddress, helperAddress]);

//   return {
//     loading,
//     data: stakeData,
//     usdPriceEth,
//     refresh: async () => await loadStakeData(user, stakeDataProvider),
//   };
// }
