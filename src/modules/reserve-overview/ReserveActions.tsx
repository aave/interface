// import { API_ETH_MOCK_ADDRESS, InterestRate } from '@aave/contract-helpers';
// import { USD_DECIMALS, valueToBigNumber } from '@aave/math-utils';
// import { Trans } from '@lingui/macro';
// import {
//   Box,
//   Button,
//   CircularProgress,
//   Divider,
//   Paper,
//   Skeleton,
//   Stack,
//   Typography,
//   useTheme,
// } from '@mui/material';
// <<<<<<< HEAD
// import BigNumber from 'bignumber.js';
// import React, { ReactNode } from 'react';
// =======
// import React, { ReactNode, useState } from 'react';
// import { WalletIcon } from 'src/components/icons/WalletIcon';
// >>>>>>> main
// import { getMarketInfoById } from 'src/components/MarketSwitcher';
// import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
// import { Warning } from 'src/components/primitives/Warning';
// import StyledToggleButton from 'src/components/StyledToggleButton';
// import StyledToggleButtonGroup from 'src/components/StyledToggleButtonGroup';
// import { ConnectWalletButton } from 'src/components/WalletConnection/ConnectWalletButton';
// import {
//   ComputedReserveData,
//   useAppDataContext,
// } from 'src/hooks/app-data-provider/useAppDataProvider';
// import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
// import { useModalContext } from 'src/hooks/useModal';
// import { usePermissions } from 'src/hooks/usePermissions';
// import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
// import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
// import { BuyWithFiat } from 'src/modules/staking/BuyWithFiat';
// import { useRootStore } from 'src/store/root';
// <<<<<<< HEAD
// import {
//   assetCanBeBorrowedByUser,
//   getMaxAmountAvailableToBorrow,
//   getMaxGhoMintAmount,
// } from 'src/utils/getMaxAmountAvailableToBorrow';
// =======
// import { getMaxAmountAvailableToBorrow } from 'src/utils/getMaxAmountAvailableToBorrow';
// >>>>>>> main
// import { getMaxAmountAvailableToSupply } from 'src/utils/getMaxAmountAvailableToSupply';
// import { isGhoAndSupported } from 'src/utils/ghoUtilities';

// import { CapType } from '../../components/caps/helper';
// import { AvailableTooltip } from '../../components/infoTooltips/AvailableTooltip';
// import { Link, ROUTES } from '../../components/primitives/Link';
// import { useReserveActionState } from '../../hooks/useReserveActionState';

// const amountToUSD = (
//   amount: string,
//   formattedPriceInMarketReferenceCurrency: string,
//   marketReferencePriceInUsd: string
// ) => {
//   return valueToBigNumber(amount)
//     .multipliedBy(formattedPriceInMarketReferenceCurrency)
//     .multipliedBy(marketReferencePriceInUsd)
//     .shiftedBy(-USD_DECIMALS)
//     .toString();
// };

// interface ReserveActionsProps {
//   reserve: ComputedReserveData;
// }

// export const ReserveActions = ({ reserve }: ReserveActionsProps) => {
//   const [selectedAsset, setSelectedAsset] = useState<string>(reserve.symbol);

//   const { currentAccount, loading: loadingWeb3Context } = useWeb3Context();
//   const { isPermissionsLoading } = usePermissions();
//   const { openBorrow, openSupply } = useModalContext();
//   const { currentMarket, currentNetworkConfig } = useProtocolDataContext();
//   const { user, loading: loadingReserves, marketReferencePriceInUsd } = useAppDataContext();
//   const { walletBalances, loading: loadingWalletBalance } = useWalletBalances();
//   const {
//     poolComputed: { minRemainingBaseTokenBalance },
//   } = useRootStore();

//   const { baseAssetSymbol } = currentNetworkConfig;
//   let balance = walletBalances[reserve.underlyingAsset];
//   if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
//     balance = walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()];
//   }

//   const maxAmountToBorrow = getMaxAmountAvailableToBorrow(
//     reserve,
//     user,
//     InterestRate.Variable
//   ).toString();

//   const maxAmountToBorrowUSD = amountToUSD(
//     maxAmountToBorrow,
//     reserve.formattedPriceInMarketReferenceCurrency,
//     marketReferencePriceInUsd
//   );

//   const maxAmountToSupply = getMaxAmountAvailableToSupply(
//     balance?.amount || '0',
//     reserve,
//     reserve.underlyingAsset,
//     minRemainingBaseTokenBalance
//   ).toString();

//   const maxAmountToSupplyUSD = amountToUSD(
//     maxAmountToSupply,
//     reserve.formattedPriceInMarketReferenceCurrency,
//     marketReferencePriceInUsd
//   );

//   const { disableSupplyButton, disableBorrowButton, alerts } = useReserveActionState({
//     balance: balance?.amount || '0',
//     maxAmountToSupply,
//     maxAmountToBorrow,
//     reserve,
//   });

//   if (!currentAccount && !isPermissionsLoading) {
//     return <ConnectWallet loading={loadingWeb3Context} />;
//   }

//   if (loadingReserves || loadingWalletBalance) {
//     return <ActionsSkeleton />;
//   }

//   const onSupplyClicked = () => {
//     if (reserve.isWrappedBaseAsset && selectedAsset === baseAssetSymbol) {
//       openSupply(API_ETH_MOCK_ADDRESS.toLowerCase());
//     } else {
//       openSupply(reserve.underlyingAsset);
//     }
//   };

//   const { market } = getMarketInfoById(currentMarket);

//   return (
//     <PaperWrapper>
//       {reserve.isWrappedBaseAsset && (
//         <Box>
//           <WrappedBaseAssetSelector
//             assetSymbol={reserve.symbol}
//             baseAssetSymbol={baseAssetSymbol}
//             selectedAsset={selectedAsset}
//             setSelectedAsset={setSelectedAsset}
//           />
//         </Box>
//       )}
//       <WalletBalance
//         balance={balance.amount}
//         symbol={selectedAsset}
//         marketTitle={market.marketTitle}
//       />
//       {reserve.isFrozen ? (
//         <Box sx={{ mt: 3 }}>
//           <FrozenWarning />
//         </Box>
//       ) : (
//         <>
//           <Divider sx={{ my: 6 }} />
//           <Stack gap={3}>
//             <SupplyAction
//               value={maxAmountToSupply}
//               usdValue={maxAmountToSupplyUSD}
//               symbol={selectedAsset}
//               disable={disableSupplyButton}
//               onActionClicked={onSupplyClicked}
//             />
//             <BorrowAction
//               value={maxAmountToBorrow}
//               usdValue={maxAmountToBorrowUSD}
//               symbol={selectedAsset}
//               disable={disableBorrowButton}
//               onActionClicked={() => openBorrow(reserve.underlyingAsset)}
//             />
//             {alerts}
//           </Stack>
//         </>
//       )}
//     </PaperWrapper>
//   );
// };

// const FrozenWarning = () => {
//   return (
//     <Warning sx={{ mb: 0 }} severity="error" icon={true}>
//       <Trans>
//         Since this asset is frozen, the only available actions are withdraw and repay which can be
//         accessed from the <Link href={ROUTES.dashboard}>Dashboard</Link>
//       </Trans>
//     </Warning>
//   );
// };

// const ActionsSkeleton = () => {
//   const RowSkeleton = (
//     <Stack>
//       <Skeleton width={150} height={14} />
//       <Stack
//         sx={{ height: '44px' }}
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//       >
//         <Box>
//           <Skeleton width={100} height={14} sx={{ mt: 1, mb: 2 }} />
//           <Skeleton width={75} height={12} />
//         </Box>
//         <Skeleton height={36} width={96} />
//       </Stack>
//     </Stack>
//   );

//   return (
//     <PaperWrapper>
//       <Stack direction="row" gap={3}>
//         <Skeleton width={42} height={42} sx={{ borderRadius: '12px' }} />
//         <Box>
//           <Skeleton width={100} height={12} sx={{ mt: 1, mb: 2 }} />
//           <Skeleton width={100} height={14} />
//         </Box>
//       </Stack>
//       <Divider sx={{ my: 6 }} />
//       <Box>
//         <Stack gap={3}>
//           {RowSkeleton}
//           {RowSkeleton}
//         </Stack>
//       </Box>
//     </PaperWrapper>
//   );
// };

// const PaperWrapper = ({ children }: { children: ReactNode }) => {
//   return (
//     <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
//       <Typography variant="h3" sx={{ mb: 6 }}>
//         <Trans>Your info</Trans>
//       </Typography>

//       {children}
//     </Paper>
//   );
// };

// const ConnectWallet = ({ loading }: { loading: boolean }) => {
//   return (
//     <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
//       {loading ? (
//         <CircularProgress />
//       ) : (
//         <>
//           <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
//             <Trans>Your info</Trans>
//           </Typography>
//           <Typography sx={{ mb: 6 }} color="text.secondary">
//             <Trans>Please connect a wallet to view your personal information here.</Trans>
//           </Typography>
//           <ConnectWalletButton />
//         </>
//       )}
//     </Paper>
//   );
// };

// interface ActionProps {
//   value: string;
//   usdValue: string;
//   symbol: string;
//   disable: boolean;
//   onActionClicked: () => void;
// }

// <<<<<<< HEAD
// export const ReserveActions = ({ underlyingAsset }: ReserveActionsProps) => {
//   const theme = useTheme();
//   const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));
//   const { openBorrow, openFaucet, openSupply } = useModalContext();
//   const { currentAccount, loading: web3Loading } = useWeb3Context();
//   const { user, reserves, loading: loadingReserves, eModes } = useAppDataContext();
//   const { walletBalances, loading: loadingBalance } = useWalletBalances();
//   const { isPermissionsLoading } = usePermissions();
//   const { currentNetworkConfig, currentChainId, currentMarket } = useProtocolDataContext();
//   const { bridge, name: networkName } = currentNetworkConfig;
//   const {
//     market: { marketTitle: networkMarketName },
//   } = getMarketInfoById(currentMarket);
//   const { supplyCap, borrowCap, debtCeiling } = useAssetCaps();
//   const {
//     ghoComputed: { maxAvailableFromFacilitator },
//     poolComputed: { minRemainingBaseTokenBalance },
//   } = useRootStore();

//   if (!currentAccount && !isPermissionsLoading)
//     return (
//       <Paper sx={{ pt: 4, pb: { xs: 4, xsm: 6 }, px: { xs: 4, xsm: 6 } }}>
//         {web3Loading ? (
//           <CircularProgress />
//         ) : (
//           <>
//             <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
//               <Trans>Your info</Trans>
//             </Typography>
//             <Typography sx={{ mb: 6 }} color="text.secondary">
//               <Trans>Please connect a wallet to view your personal information here.</Trans>
//             </Typography>
//             <ConnectWalletButton />
//           </>
//         )}
//       </Paper>
//     );

//   if (loadingReserves || loadingBalance)
//     return (
//       <PaperWrapper>
//         <Row
//           caption={<Skeleton width={100} height={20} />}
//           align="flex-start"
//           mb={6}
//           captionVariant="description"
//         >
//           <Skeleton width={70} height={20} />
//         </Row>

//         <Row caption={<Skeleton width={100} height={20} />} mb={3}>
//           <Skeleton width={70} height={20} />
//         </Row>

//         <Row caption={<Skeleton width={100} height={20} />} mb={10}>
//           <Skeleton width={70} height={20} />
//         </Row>

//         <Stack direction="row" spacing={2}>
//           <Skeleton width={downToXSM ? '100%' : 70} height={36} />
//           <Skeleton width={downToXSM ? '100%' : 70} height={36} />
//         </Stack>
//       </PaperWrapper>
//     );

//   const poolReserve = reserves.find(
//     (reserve) => reserve.underlyingAsset === underlyingAsset
//   ) as ComputedReserveData;

//   const balance = walletBalances[underlyingAsset];
//   const canSupply =
//     balance?.amount !== '0' && !isGhoAndSupported({ symbol: poolReserve.symbol, currentMarket });
//   const canBorrow = assetCanBeBorrowedByUser(poolReserve, user);
//   const displayGho = isGhoAndSupported({ symbol: poolReserve.symbol, currentMarket });

//   let maxAmountToBorrow: BigNumber;
//   let maxAmountToSupply: string;
//   if (displayGho) {
//     const maxAmountUserCanBorrow = getMaxGhoMintAmount(user);
//     maxAmountToBorrow = BigNumber.min(maxAmountUserCanBorrow, maxAvailableFromFacilitator);
//     maxAmountToSupply = '0';
//   } else {
//     maxAmountToBorrow = getMaxAmountAvailableToBorrow(poolReserve, user, InterestRate.Variable);
//     maxAmountToSupply = getMaxAmountAvailableToSupply(
//       balance.amount,
//       poolReserve,
//       underlyingAsset,
//       minRemainingBaseTokenBalance
//     ).toString();
//   }
//   const formattedMaxAmountToBorrow = maxAmountToBorrow.toString(10);

//   const isolationModeBorrowDisabled = user?.isInIsolationMode && !poolReserve.borrowableInIsolation;
//   const eModeBorrowDisabled =
//     user?.isInEmode && poolReserve.eModeCategoryId !== user.userEmodeCategoryId;

//   // Remove all supply/borrow elements and display warning message instead for frozen reserves
//   if (poolReserve.isFrozen) {
//     return (
//       <PaperWrapper>
//         {balance?.amount !== '0' && (
//           <Row
//             caption={<Trans>Wallet balance</Trans>}
//             align="flex-start"
//             mb={6}
//             captionVariant="description"
//           >
//             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
//               <FormattedNumber
//                 value={balance?.amount || 0}
//                 variant="secondary14"
//                 symbol={poolReserve.symbol}
//               />
//               <FormattedNumber
//                 value={balance?.amountUSD || '0'}
//                 variant="helperText"
//                 color="text.muted"
//                 symbolsColor="text.muted"
//                 symbol="USD"
//               />
//             </Box>
//           </Row>
//         )}
//         <Warning sx={{ mb: '12px' }} severity="error" icon={true}>
//           <Trans>
//             Since this asset is frozen, the only available actions are withdraw and repay which can
//             be accessed from the <Link href={ROUTES.dashboard}>Dashboard</Link>
//           </Trans>
//         </Warning>
//       </PaperWrapper>
//     );
//   }

// =======
// const SupplyAction = ({ value, usdValue, symbol, disable, onActionClicked }: ActionProps) => {
// >>>>>>> main
//   return (
//     <Stack>
//       <AvailableTooltip
//         variant="description"
//         text={<Trans>Available to supply</Trans>}
//         capType={CapType.supplyCap}
//       />
//       <Stack
//         sx={{ height: '44px' }}
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//       >
//         <Box>
//           <ValueWithSymbol value={value} symbol={symbol} />
//           <FormattedNumber
//             value={usdValue}
//             variant="subheader2"
//             color="text.muted"
//             symbolsColor="text.muted"
//             symbol="USD"
//           />
//         </Box>
// <<<<<<< HEAD
//       </Row>

//       <Row
//         caption={
//           <AvailableTooltip
//             variant="description"
//             text={<Trans>Available to supply</Trans>}
//             capType={CapType.supplyCap}
//           />
//         }
//         mb={3}
//       >
//         <FormattedNumber
//           value={maxAmountToSupply}
//           variant="secondary14"
//           symbol={poolReserve.symbol}
//         />
//       </Row>
//       {canBorrow && (
//         <Row
//           caption={
//             <AvailableTooltip
//               variant="description"
//               text={<Trans>Available to borrow</Trans>}
//               capType={CapType.borrowCap}
//             />
//           }
//           mb={3}
//         >
//           <FormattedNumber
//             value={formattedMaxAmountToBorrow}
//             variant="secondary14"
//             symbol={poolReserve.symbol}
//           />
//         </Row>
//       )}
//       {balance?.amount !== '0' && user?.totalCollateralMarketReferenceCurrency === '0' && (
//         <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
//           <Trans>To borrow you need to supply any asset to be used as collateral.</Trans>
//         </Warning>
//       )}

//       {isolationModeBorrowDisabled && (
//         <Warning sx={{ mb: '12px' }} severity="warning" icon={false}>
//           <Trans>Collateral usage is limited because of Isolation mode.</Trans>
//         </Warning>
//       )}

//       {eModeBorrowDisabled && isolationModeBorrowDisabled && (
//         <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
//           <Trans>
//             Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) and Isolation
//             mode. To manage E-Mode and Isolation mode visit your{' '}
//             <Link href={ROUTES.dashboard}>Dashboard</Link>.
//           </Trans>
//         </Warning>
//       )}

//       {eModeBorrowDisabled && !isolationModeBorrowDisabled && (
//         <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
//           <Trans>
//             Borrowing is unavailable because you’ve enabled Efficiency Mode (E-Mode) for{' '}
//             {getEmodeMessage(eModes[user.userEmodeCategoryId].label)} category. To manage E-Mode
//             categories visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
//           </Trans>
//         </Warning>
//       )}

//       {!eModeBorrowDisabled && isolationModeBorrowDisabled && (
//         <Warning sx={{ mb: '12px' }} severity="info" icon={false}>
//           <Trans>
//             Borrowing is unavailable because you’re using Isolation mode. To manage Isolation mode
//             visit your <Link href={ROUTES.dashboard}>Dashboard</Link>.
//           </Trans>
//         </Warning>
//       )}

//       <Row mb={3} />

//       {poolReserve.isFrozen && currentNetworkConfig.name === 'Harmony' && (
//         <Row align="flex-start" mb={3}>
//           <MarketWarning marketName="Harmony" />
//         </Row>
//       )}
//       {poolReserve.isFrozen && currentNetworkConfig.name === 'Fantom' && (
//         <Row align="flex-start" mb={3}>
//           <MarketWarning marketName="Fantom" />
//         </Row>
//       )}

//       <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
// =======
// >>>>>>> main
//         <Button
//           sx={{ height: '36px', width: '96px' }}
//           onClick={onActionClicked}
//           disabled={disable}
//           fullWidth={false}
//           variant="contained"
// <<<<<<< HEAD
//           disabled={!canSupply}
//           onClick={() => openSupply(underlyingAsset)}
//           fullWidth={downToXSM}
//           data-cy={'supplyButton'}
// =======
//           data-cy="supplyButton"
// >>>>>>> main
//         >
//           <Trans>Supply</Trans>
//         </Button>
//       </Stack>
// <<<<<<< HEAD
//       {maxAmountToSupply === '0' && supplyCap?.determineWarningDisplay({ supplyCap, icon: false })}
//       {formattedMaxAmountToBorrow === '0' &&
//         borrowCap?.determineWarningDisplay({ borrowCap, icon: false })}
//       {poolReserve.isIsolated &&
//         balance?.amount !== '0' &&
//         user?.totalCollateralUSD !== '0' &&
//         debtCeiling.determineWarningDisplay({ debtCeiling, icon: false })}
//     </PaperWrapper>
// =======
//     </Stack>
//   );
// };

// const BorrowAction = ({ value, usdValue, symbol, disable, onActionClicked }: ActionProps) => {
//   return !disable ? (
//     <Stack>
//       <AvailableTooltip
//         variant="description"
//         text={<Trans>Available to borrow</Trans>}
//         capType={CapType.borrowCap}
//       />
//       <Stack
//         sx={{ height: '44px' }}
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//       >
//         <Box>
//           <ValueWithSymbol value={value} symbol={symbol} />
//           <FormattedNumber
//             value={usdValue}
//             variant="subheader2"
//             color="text.muted"
//             symbolsColor="text.muted"
//             symbol="USD"
//           />
//         </Box>
//         <Button
//           sx={{ height: '36px', width: '96px' }}
//           onClick={onActionClicked}
//           disabled={disable}
//           fullWidth={false}
//           variant="contained"
//           data-cy="borrowButton"
//         >
//           <Trans>Borrow</Trans>
//         </Button>
//       </Stack>
//     </Stack>
//   ) : null;
// };

// const WrappedBaseAssetSelector = ({
//   assetSymbol,
//   baseAssetSymbol,
//   selectedAsset,
//   setSelectedAsset,
// }: {
//   assetSymbol: string;
//   baseAssetSymbol: string;
//   selectedAsset: string;
//   setSelectedAsset: (value: string) => void;
// }) => {
//   return (
//     <StyledToggleButtonGroup
//       color="primary"
//       value={selectedAsset}
//       exclusive
//       onChange={(_, value) => setSelectedAsset(value)}
//       sx={{ width: '100%', height: '36px', p: 0.5, mb: 4 }}
//     >
//       <StyledToggleButton value={assetSymbol}>
//         <Typography variant="subheader1" sx={{ mr: 1 }}>
//           {assetSymbol}
//         </Typography>
//       </StyledToggleButton>

//       <StyledToggleButton value={baseAssetSymbol}>
//         <Typography variant="subheader1" sx={{ mr: 1 }}>
//           {baseAssetSymbol}
//         </Typography>
//       </StyledToggleButton>
//     </StyledToggleButtonGroup>
//   );
// };

// interface ValueWithSymbolProps {
//   value: string;
//   symbol: string;
//   children?: ReactNode;
// }

// const ValueWithSymbol = ({ value, symbol, children }: ValueWithSymbolProps) => {
//   return (
//     <Stack direction="row" alignItems="center" gap={1}>
//       <FormattedNumber value={value} variant="h4" color="text.primary" />
//       <Typography variant="buttonL" color="text.secondary">
//         {symbol}
//       </Typography>
//       {children}
//     </Stack>
//   );
// };

// interface WalletBalanceProps {
//   balance: string;
//   symbol: string;
//   marketTitle: string;
// }
// const WalletBalance = ({ balance, symbol, marketTitle }: WalletBalanceProps) => {
//   const theme = useTheme();

//   return (
//     <Stack direction="row" gap={3}>
//       <Box
//         sx={(theme) => ({
//           width: '42px',
//           height: '42px',
//           background: theme.palette.background.surface,
//           border: `0.5px solid ${theme.palette.background.disabled}`,
//           borderRadius: '12px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         })}
//       >
//         <WalletIcon sx={{ stroke: `${theme.palette.text.secondary}` }} />
//       </Box>
//       <Box>
//         <Typography variant="description" color="text.secondary">
//           Wallet balance
//         </Typography>
//         <ValueWithSymbol value={balance} symbol={symbol}>
//           <Box sx={{ ml: 2 }}>
//             <BuyWithFiat cryptoSymbol={symbol} networkMarketName={marketTitle} />
//           </Box>
//         </ValueWithSymbol>
//       </Box>
//     </Stack>
// >>>>>>> main
//   );
// };
