import {
  Alert,
  AlertColor,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import { figVars } from 'src/utils/figmaColors';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

/**
 * TEMPORARY audit page, now showing the TARGET cleaned-up pattern for every in-app `<Alert>`:
 *  - no `icon={false}` — the compact/inline alerts use the small size (`data-size="small"`) instead;
 *  - text always inherits the theme's alert message style (no per-site Typography variants/colours);
 *  - a title uses the themed `<AlertTitle>` (body text, one weight step up) — no bespoke bold/colour;
 *  - inline links/buttons inherit the alert text + an underline;
 *  - custom centering / layout sx removed — only positioning margins (mb/width/mt/my) are kept.
 * Once the real components are cleaned to match, delete this section + its registry entry.
 */

type AlertUsage = {
  source: string;
  severity: AlertColor;
  size?: 'small' | 'small-icon';
  sx?: SxProps<Theme>;
  text?: ReactNode;
  note?: string;
};

// A title + description body — rendered with the themed AlertTitle (no per-site styling).
const titled = (title: string, body: ReactNode): ReactNode => (
  <>
    <AlertTitle>{title}</AlertTitle>
    {body}
  </>
);

const SWAP_ERRORS: AlertUsage[] = [
  {
    source: 'Swap/ZeroLTVBlockingError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'You have zero-LTV assets blocking this operation; withdraw or disable them as collateral first.',
  },
  {
    source: 'Swap/SupplyCapBlockingError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Supply cap reached for USDC; reduce the amount or choose a different asset.',
  },
  {
    source: 'Swap/ProviderError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Provider-specific quote/swap error (Paraswap or CoW).',
    note: 'dynamic message',
  },
  {
    source: 'Swap/InsufficientLiquidityBlockingError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Not enough liquidity in USDC to complete this swap; try lowering the amount.',
  },
  {
    source: 'Swap/InsufficientBorrowPowerBlockingError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Insufficient collateral to cover the new borrow position for this debt switch.',
  },
  {
    source: 'Swap/GenericError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    note: 'inline copy button — now inherits alert text + underline',
    text: (
      <>
        Something went wrong. <Button variant="text">copy</Button>
      </>
    ),
  },
  {
    source: 'Swap/GasEstimationError',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'Tip: try increasing slippage / reducing the input amount, or improving your order parameters.',
  },
  {
    source: 'Swap/FlashLoanDisabledBlockingError',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Position swaps are disabled for this asset for security reasons.',
  },
  {
    source: 'Swap/BalanceLowerThanInput',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Your collateral balance is lower than the selected amount.',
  },
  {
    source: 'Swap/UserDenied',
    severity: 'info',
    sx: { width: '100%', margin: 0 },
    text: 'User denied the operation.',
    note: 'was: action prop + .MuiAlert-action sx (progress ring dropped)',
  },
];

const SWAP_WARNINGS: AlertUsage[] = [
  {
    source: 'Swap/ZeroLTVDestinationWarning',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'Destination token has 0 LTV, so it will not be auto-enabled as collateral after the swap.',
  },
  {
    source: 'Swap/USDTResetWarning',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 5 },
    text: 'USDT on Ethereum needs an approval reset before a new approval, adding an extra transaction.',
  },
  {
    source: 'Swap/SlippageWarning',
    severity: 'warning',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 5 },
    text: 'Slippage is lower than recommended; the swap may be delayed or fail.',
  },
  {
    source: 'Swap/ShieldSwapWarning',
    severity: 'error',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    note: 'title now via AlertTitle (no bold/custom); centering sx removed',
    text: titled(
      'Aave Shield: Transaction blocked',
      'This swap has a price impact of 30%, which exceeds the 25% safety threshold. To proceed, disable Aave Shield in the settings menu.'
    ),
  },
  {
    source: 'Swap/SafetyModuleSwapWarning',
    severity: 'error',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'To swap safety-module assets, unstake your position first.',
    note: 'has Link',
  },
  {
    source: 'Swap/LowHealthFactorWarning',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    note: 'confirm checkbox kept; centering sx removed',
    text: (
      <>
        Low health factor after swap. Your position will carry a higher risk of liquidation.
        <Box sx={{ display: 'flex', alignItems: 'center', mt: '0.13rem' }}>
          I understand the liquidation risk and want to proceed
          <Checkbox size="small" sx={{ p: 0, ml: 2 }} />
        </Box>
      </>
    ),
  },
  {
    source: 'Swap/LiquidationCriticalWarning',
    severity: 'error',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'Health factor after the swap will be critically low; choose another asset or reduce the amount.',
    note: 'was dynamic display:none/flex + centering (removed)',
  },
  {
    source: 'Swap/LimitOrderAmountWarning',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'Your order amounts are less favorable than recommended; the order may not execute.',
    note: 'dynamic: warning|info',
  },
  {
    source: 'Swap/HighPriceImpactWarning',
    severity: 'error',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    note: 'dynamic: error|warning; two lines + confirm checkbox',
    text: (
      <>
        High price impact (30%)! This route will return less due to low liquidity or small order
        size. Please review the swap values before confirming.
        <Box sx={{ display: 'flex', alignItems: 'center', mt: '0.13rem' }}>
          I confirm the swap knowing that I could lose up to 30% on this swap.
          <Checkbox size="small" sx={{ p: 0, ml: 2 }} />
        </Box>
      </>
    ),
  },
  {
    source: 'Swap/HighCostsLimitOrderWarning',
    severity: 'warning',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 2 },
    text: 'Estimated costs are a high percentage of the sell amount; the order is unlikely to be filled.',
  },
  {
    source: 'Swap/GasEstimationWarning',
    severity: 'warning',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 5 },
    text: 'The swap could not be completed; try increasing slippage or changing the amount.',
  },
  {
    source: 'Swap/CustomTokenWarning',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'You selected a custom imported token; make sure it is the right one.',
  },
  {
    source: 'Swap/CowAdapterApprovalInfo',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'A temporary contract executes the trade; your wallet may warn about approving a new address.',
  },
  {
    source: 'Swap/NativeLimitOrderInfo',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'Limit orders are not supported for native tokens; use the wrapped version.',
  },
  {
    source: 'Swap/CowOpenOrdersWarning',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mt: 2, mb: 2 },
    text: 'You have open orders / in-progress swaps for this token; track them in transaction history.',
    note: 'has Link',
  },
  {
    source: 'Swap/SwitchSlippageSelector',
    severity: 'warning',
    sx: { width: '100%', mb: 0, mt: 2 },
    text: 'Slippage is higher than recommended for this trade.',
    note: 'dynamic severity + message; inside the slippage Menu',
  },
];

const WARNINGS: AlertUsage[] = [
  {
    source: 'Warnings/USDTResetWarning',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 5 },
    text: 'USDT on Ethereum requires an approval reset before a new approval, needing an extra transaction.',
  },
  {
    source: 'Warnings/SupplyCapWarning',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Protocol supply cap is at (or near) 100%; further supply is limited.',
    note: 'has Link',
  },
  {
    source: 'Warnings/SNXWarning',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Before supplying SNX, check the amount is not used for staking or the transaction might fail.',
  },
  {
    source: 'Warnings/ParaswapErrorDisplay',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'Tip: try increasing slippage or reducing the input amount.',
  },
  {
    source: 'Warnings/MarketWarning',
    severity: 'error',
    sx: { mb: 6, width: '100%' },
    text: 'Per the community, the market has been frozen.',
    note: 'has Link',
  },
  {
    source: 'Warnings/IsolationModeWarning',
    severity: 'info',
    sx: { width: '100%', mb: 3 },
    note: 'dynamic severity; title via AlertTitle',
    text: titled(
      'You are entering Isolation mode',
      <>
        USDC can only be used as collateral with a debt ceiling; other assets can&apos;t be used as
        collateral. <a href="#">FAQ</a>
      </>
    ),
  },
  {
    source: 'Warnings/DebtCeilingWarning',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Protocol debt ceiling is at (or near) 100%; borrowing against this asset is limited.',
    note: 'dynamic: warning|error; has Link',
  },
  {
    source: 'Warnings/CowLowerThanMarketWarning',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 5 },
    text: 'The selected rate is lower than the market price; you might incur a loss if you proceed.',
  },
  {
    source: 'Warnings/ChangeNetworkWarning',
    severity: 'info',
    size: 'small',
    sx: { mb: 6, width: '100%' },
    note: 'switch button now inherits alert text + underline',
    text: (
      <>
        Please switch to Ethereum. <Button variant="text">Switch Network</Button>
      </>
    ),
  },
  {
    source: 'Warnings/BorrowCapWarning',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Protocol borrow cap is at (or near) 100%; further borrowing is limited.',
    note: 'has Link',
  },
  {
    source: 'Warnings/AAVEWarning',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'Supplying AAVE is not the same as staking; to stake, go to the staking view.',
    note: 'has Link',
  },
  {
    source: 'Warnings/CooldownWarning',
    severity: 'warning',
    sx: { width: '100%', mb: 6 },
    note: 'was .MuiAlert-message p:0 override (removed); title via AlertTitle',
    text: titled(
      'Cooldown period warning',
      <>
        The cooldown period (20 days) is the wait required before unstaking. You can only withdraw
        after cooldown and within the unstake window. <a href="#">Learn more</a>
      </>
    ),
  },
];

const MODAL_CONTENTS: AlertUsage[] = [
  {
    source: 'Emode/EmodeModalContent #1',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 6 },
    note: 'centering sx removed',
    text: titled(
      'Cannot disable E-Mode',
      'You must disable your 0-LTV collateral assets (USDC, DAI) before exiting E-Mode.'
    ),
  },
  {
    source: 'Emode/EmodeModalContent #2',
    severity: 'error',
    sx: { mb: 6, width: '100%', mt: 6 },
    note: 'hardcoded #4F1919 title colour removed',
    text: titled(
      'Cannot disable E-Mode',
      'Disabling E-Mode could cause liquidation; supply or repay borrowed positions first.'
    ),
  },
  {
    source: 'Emode/EmodeModalContent #3',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 6 },
    text: titled(
      'Cannot switch to this category',
      'Repay incompatible borrows (USDC) and/or disable 0% LTV collateral (DAI) first.'
    ),
  },
  {
    source: 'Emode/EmodeModalContent #4',
    severity: 'error',
    sx: { mb: 6, width: '100%', mt: 6 },
    note: 'hardcoded #4F1919 title colour removed',
    text: titled('Liquidation risk', 'This action will reduce your health factor.'),
  },
  {
    source: 'CollateralChange/CollateralChangeModalContent #1',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mb: 3 },
    text: 'Enabling this asset as collateral raises borrowing power and HF, but it can be liquidated if HF drops below 1.',
  },
  {
    source: 'CollateralChange/CollateralChangeModalContent #2',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mb: 3 },
    text: 'Disabling this asset as collateral affects your borrowing power and Health Factor.',
  },
  {
    source: 'CollateralChange/CollateralChangeModalContent #3',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mb: 3 },
    text: 'You will exit isolation mode and other tokens can now be used as collateral.',
  },
  {
    source: 'CollateralChange/CollateralChangeModalContent #4',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 4 },
    note: 'centering sx removed',
    text: titled(
      'E-Mode required',
      'This asset has 0 LTV; enable an E-Mode to use USDC as collateral.'
    ),
  },
  {
    source: 'Supply/SupplyModalContent #1',
    severity: 'warning',
    sx: { width: '100%', mt: '16px', mb: '40px' },
    text: 'AMPL rebasing-token supply warning (rendered by the <AMPLWarning/> component).',
    note: 'child is an external component',
  },
  {
    source: 'Supply/SupplyModalContent #2',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 2 },
    text: titled(
      'E-Mode change',
      'This transaction will enable E-Mode and restrict borrowing to the stablecoins category.'
    ),
  },
  {
    source: 'FlowCommons/GasEstimationError #1',
    severity: 'info',
    sx: { width: '100%', mt: 4, mb: 0 },
    text: 'Shows the transaction error message (user-rejection case).',
  },
  {
    source: 'FlowCommons/GasEstimationError #2',
    severity: 'error',
    sx: { width: '100%', mt: 4, mb: 0 },
    note: 'copy button now inherits alert text + underline',
    text: (
      <>
        There was an error. Try changing parameters, or{' '}
        <Button variant="text">copy the error</Button>
      </>
    ),
  },
  {
    source: 'Bridge/BridgeModalContent #1',
    severity: 'warning',
    sx: { width: '100%', my: 0 },
    text: 'Fees exceed wallet balance.',
  },
  {
    source: 'Bridge/BridgeModalContent #2',
    severity: 'error',
    size: 'small',
    sx: { mb: 6, width: '100%', mt: 4 },
    text: 'Something went wrong fetching the bridge message, please try again later.',
  },
  {
    source: 'Withdraw/WithdrawModalContent',
    severity: 'error',
    sx: { width: '100%', my: 6 },
    text: 'Withdrawing this amount will reduce your health factor and increase risk of liquidation.',
  },
  {
    source: 'StakeCooldown/StakeCooldownModalContent',
    severity: 'error',
    sx: { mb: 6, width: '100%' },
    text: 'If you do not unstake within the unstake window, you will need to activate cooldown again.',
  },
  {
    source: 'Repay/RepayModalContent',
    severity: 'info',
    sx: { mb: 6, width: '100%', mt: 5 },
    text: 'USDT on Ethereum requires an approval reset before a new approval, needing an additional transaction.',
  },
  {
    source: 'GasStation/GasStation',
    severity: 'warning',
    sx: { width: '100%', mb: 0, mx: 'auto' },
    text: 'You do not have enough ETH to pay transaction fees on this network; deposit more from another account.',
  },
  {
    source: 'Borrow/ParameterChangewarning',
    severity: 'info',
    sx: { width: '100%', my: 6 },
    text: 'Attention: governance parameter changes can alter your health factor and liquidation risk; follow the Aave governance forum.',
    note: 'was <b> + raw <a>',
  },
  {
    source: 'Borrow/BorrowAmountWarning',
    severity: 'error',
    sx: { width: '100%', my: 6 },
    text: 'Borrowing this amount will reduce your health factor and increase risk of liquidation.',
  },
];

const RESERVE_HOOKS: AlertUsage[] = [
  {
    source: 'reserve-overview/ReserveConfiguration #1',
    severity: 'error',
    sx: { width: '100%', mt: '16px', mb: '40px' },
    text: 'This asset is frozen due to an Aave community decision.',
    note: 'has Link',
  },
  {
    source: 'reserve-overview/ReserveConfiguration #2',
    severity: 'error',
    sx: { width: '100%', mt: '16px', mb: '40px' },
    text: 'Asset is being offboarded (rendered by <OffboardingWarning/>).',
    note: 'child is external component',
  },
  {
    source: 'reserve-overview/ReserveConfiguration #3',
    severity: 'warning',
    sx: { width: '100%', mt: '16px', mb: '40px' },
    text: 'AMPL rebasing warning (rendered by <AMPLWarning/>).',
    note: 'child is external component',
  },
  {
    source: 'reserve-overview/ReserveConfiguration #4',
    severity: 'error',
    sx: { width: '100%', mt: '16px', mb: '40px' },
    text: 'MAI has been paused by community decision; supply, borrows and repays are impacted.',
    note: 'has Link',
  },
  {
    source: 'reserve-overview/ReserveConfiguration #5',
    severity: 'error',
    sx: { width: '100%', mt: '16px', mb: '40px' },
    text: 'Asset paused warning (rendered by <PausedTooltipText/>).',
    note: 'child is external component',
  },
  {
    source: 'reserve-overview/ReserveConfiguration #6',
    severity: 'error',
    sx: { width: '100%', mb: '40px' },
    text: 'Borrowing is disabled for this asset (rendered by <BorrowDisabledWarning/>).',
    note: 'child is external component',
  },
  {
    source: 'reserve-overview/SupplyInfo #1',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: titled(
      'Asset can only be used as collateral in isolation mode',
      <>
        In Isolation mode you cannot supply other assets as collateral for borrowing; assets can
        only be borrowed to a specific debt ceiling. <a href="#">Learn more</a>
      </>
    ),
  },
  {
    source: 'reserve-overview/SupplyInfo #2',
    severity: 'info',
    sx: { width: '100%', my: '12px' },
    text: 'This asset can only be used as collateral in E-Mode: Stablecoins, ETH correlated.',
  },
  {
    source: 'reserve-overview/SupplyInfo #3',
    severity: 'warning',
    sx: { width: '100%', my: '12px' },
    text: 'Asset cannot be used as collateral.',
  },
  {
    source: 'reserve-overview/SupplyInfo #4',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    note: 'already used AlertTitle',
    text: titled(
      'Staking Rewards',
      <>
        stETH supplied as collateral will continue to accrue staking rewards from daily rebases.{' '}
        <a href="#">Learn more</a>
      </>
    ),
  },
  {
    source: 'reserve-overview/ReserveActions #1 (PauseWarning)',
    severity: 'error',
    sx: { width: '100%', mb: 0 },
    text: 'Because this asset is paused, no actions can be taken until further notice.',
    note: 'was icon={true} (empty box) → default icon',
  },
  {
    source: 'reserve-overview/ReserveActions #2 (FrozenWarning)',
    severity: 'error',
    sx: { width: '100%', mb: 0 },
    text: 'Since this asset is frozen, only withdraw and repay are available via the Dashboard.',
    note: 'was icon={true} → default icon; has Link',
  },
  {
    source: 'hooks/useReserveActionState #1',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: 'Your Sepolia wallet is empty; get free test DAI at the faucet.',
    note: 'has faucet button',
  },
  {
    source: 'hooks/useReserveActionState #2',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: 'To borrow you need to supply any asset to be used as collateral.',
  },
  {
    source: 'hooks/useReserveActionState #3',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: 'Collateral usage is limited because of Isolation mode.',
  },
  {
    source: 'hooks/useReserveActionState #4',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: 'Borrowing unavailable because both E-Mode and Isolation mode are enabled; manage them in the Dashboard.',
    note: 'has Link',
  },
  {
    source: 'hooks/useReserveActionState #5',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: 'Borrowing unavailable because E-Mode is enabled for the Stablecoins category; manage E-Mode in the Dashboard.',
    note: 'has Link',
  },
  {
    source: 'hooks/useReserveActionState #6',
    severity: 'info',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: 'Borrowing unavailable because you are using Isolation mode; manage it in the Dashboard.',
    note: 'has Link',
  },
];

const LISTS_MISC: AlertUsage[] = [
  {
    source: 'dashboard/BorrowAssetsList #1',
    severity: 'error',
    sx: { mb: 6, width: '100%' },
    text: 'Be careful — you are very close to liquidation; deposit more collateral or repay borrows.',
  },
  {
    source: 'dashboard/BorrowAssetsList #2',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Borrowing power and assets are limited due to Isolation mode.',
    note: 'has Link',
  },
  {
    source: 'dashboard/BorrowAssetsList #3',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'In E-Mode some assets are not borrowable; exit E-Mode for full access.',
  },
  {
    source: 'dashboard/BorrowAssetsList #4',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'To borrow you must supply an asset to use as collateral.',
  },
  {
    source: 'dashboard/BorrowAssetsList #5',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: "We couldn't find assets matching your search; try a different category.",
  },
  {
    source: 'dashboard/SupplyAssetsList #1',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Collateral usage is limited because of isolation mode.',
    note: 'has Link',
  },
  {
    source: 'dashboard/SupplyAssetsList #2',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'Your Sepolia wallet is empty; get free test assets at the Faucet.',
    note: 'has Link',
  },
  {
    source: 'dashboard/SupplyAssetsList #3',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: "We couldn't find assets matching your search; try a different category.",
  },
  {
    source: 'dashboard/WalletEmptyInfo',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'Your Ethereum wallet is empty; purchase/transfer assets or use the bridge.',
    note: 'was icon dynamic; has Link',
  },
  {
    source: 'governance/VoteInfo #1',
    severity: 'success',
    sx: { width: '100%', my: 2 },
    note: "dynamic: 'success'|'error'; title via AlertTitle",
    text: titled('You voted YAE', 'With a voting power of 1,234.56'),
  },
  {
    source: 'governance/VoteInfo #2',
    severity: 'warning',
    sx: { width: '100%', my: 2 },
    text: 'Not enough voting power to participate in this proposal.',
  },
  {
    source: 'governance/ProposalOverview',
    severity: 'error',
    sx: { mb: 6, width: '100%' },
    text: 'An error occurred fetching the proposal.',
  },
  {
    source: 'migration/StETHMigrationWarning',
    severity: 'error',
    size: 'small',
    sx: { width: '100%', mb: 4 },
    text: 'stETH will be migrated to Wrapped stETH, changing your supply balance after migration.',
    note: 'has FormattedNumber',
  },
  {
    source: 'migration/MigrationList',
    severity: 'warning',
    size: 'small',
    sx: { width: '100%', mb: 0 },
    text: "Some migrated assets won't be used as collateral due to isolation mode in the V3 market; manage it from the dashboard.",
    note: 'was custom text colour; has Link',
  },
  {
    source: 'migration/MigrationBottomPanel',
    severity: 'warning',
    sx: { mb: 6, width: '100%' },
    text: 'Blocking migration error (health factor too low / insufficient LTV / no assets selected).',
  },
  {
    source: 'umbrella/UmbrellaModalContent',
    severity: 'error',
    sx: { width: '100%', my: 6 },
    text: 'Staking this amount will reduce your health factor and increase liquidation risk.',
  },
  {
    source: 'umbrella/StakeCooldownModalContent',
    severity: 'error',
    sx: { mb: 6, width: '100%' },
    text: "If you don't unstake within the unstake window, you'll need to activate cooldown again.",
  },
  {
    source: 'markets/MarketAssetsListContainer',
    severity: 'info',
    sx: { mb: 6, width: '100%' },
    text: 'These assets are frozen/paused by Aave governance; supply/borrow unavailable, withdrawals and repayments allowed.',
    note: 'has Link',
  },
  {
    source: 'stkGho/StkGhoCard',
    severity: 'warning',
    sx: { width: '100%', mb: 4 },
    text: 'Rewards for legacy Savings GHO have ended; migrate to keep earning.',
  },
  {
    source: 'pages/safety-module',
    severity: 'warning',
    sx: { width: '100%', mb: 0 },
    text: 'This ABPT staking pool is deprecated; migrate all tokens to v2 or unstake with no cooldown.',
  },
  {
    source: 'history/ActionDetails #1 (StatusBadgeIconOnly)',
    severity: 'info',
    size: 'small-icon',
    sx: { width: '100%', my: 0 },
    note: 'small-icon (default-size text); icon only',
  },
  {
    source: 'history/ActionDetails #2 (StatusBadgeText)',
    severity: 'info',
    size: 'small-icon',
    sx: { width: '100%', my: 0 },
    text: 'Filled',
    note: 'small-icon (default-size text)',
  },
];

const GROUPS: { title: string; usages: AlertUsage[] }[] = [
  { title: 'Swap — errors', usages: SWAP_ERRORS },
  { title: 'Swap — warnings', usages: SWAP_WARNINGS },
  { title: 'Warnings wrappers', usages: WARNINGS },
  { title: 'Transaction modal contents', usages: MODAL_CONTENTS },
  { title: 'Reserve-overview & hooks', usages: RESERVE_HOOKS },
  { title: 'Lists, governance & misc', usages: LISTS_MISC },
];

const AlertRow = ({ u }: { u: AlertUsage }) => (
  <Specimen
    fullWidth
    align="flex-start"
    label={`${u.source} · severity="${u.severity}"${u.size ? ' · ' + u.size : ''}${
      u.note ? ' · ' + u.note : ''
    }`}
  >
    <Box sx={{ width: '100%' }}>
      <Alert severity={u.severity} data-size={u.size} sx={u.sx}>
        {u.text}
      </Alert>
      <Typography
        variant="caption"
        color="fg-3"
        sx={{ display: 'block', mt: 2, fontFamily: 'monospace', wordBreak: 'break-all' }}
      >
        sx = {u.sx ? JSON.stringify(u.sx) : '—'}
      </Typography>
    </Box>
  </Specimen>
);

const total = GROUPS.reduce((n, g) => n + g.usages.length, 0);
const smallCount = GROUPS.reduce((n, g) => n + g.usages.filter((u) => u.size).length, 0);

// figVars kept in scope for parity with the app import surface even though the cleaned mock rows
// no longer hardcode token colours.
void figVars;

export const AlertsAuditSection = () => (
  <Section
    title="Alerts — temporary audit (target pattern)"
    description={`All ${total} in-app <Alert> usages shown in the cleaned-up target: no icon={false} (${smallCount} now use the small size), text/title on the theme's alert styling, links underlined, custom colours/centering removed. Review here, then the real components get cleaned to match. Temporary — delete after.`}
  >
    {GROUPS.map((g) => (
      <Box key={g.title} sx={{ flex: '1 1 100%', mb: 8 }}>
        <Typography variant="subheader1" sx={{ mb: 4, display: 'block' }}>
          {g.title} ({g.usages.length})
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
          {g.usages.map((u) => (
            <AlertRow key={u.source} u={u} />
          ))}
        </Box>
      </Box>
    ))}
  </Section>
);
