import { ChainId } from '@aave/contract-helpers';
import { AaveV3Ethereum } from '@aave-dao/aave-address-book';
import { Button } from '@mui/material';
import { ComponentProps } from 'react';
import { BaseSuccessTxViewProps } from 'src/components/transactions/FlowCommons/BaseSuccess';
import { SuccessTxViewProps } from 'src/components/transactions/FlowCommons/Success';
import { GasEstimationError as SwapGasEstimationError } from 'src/components/transactions/Swap/errors/shared/GasEstimationError';
import { SwapTxSuccessViewProps } from 'src/components/transactions/Swap/modals/result/SwapResultView';
import { SwapProvider } from 'src/components/transactions/Swap/types';
import { getErrorTextFromError, TxAction, TxErrorType } from 'src/ui-config/errorMapping';

export interface MockCase<P> {
  label: string;
  modalTitle?: string;
  props: P;
}

export const MOCK_TX_HASH = '0x91777189aabcc274e4093020b93a3d50b83a509b6331ca0e48ced8a91fec37e1';

const MOCK_COW_ORDER_ID =
  '0xd5970e1a4e86dd0af9f4c296c9892e2717bd04486e2245ee60172e78c583937d579233b2c479241523cba5e3af55d0f50f2d641468d2a3c0';

const noop = () => undefined;

const revertError = (code: number) =>
  Object.assign(new Error(`execution reverted: ${code}`), {
    error: { body: JSON.stringify({ error: { message: `execution reverted: ${code}` } }) },
  });

export const AMOUNT_SUCCESS_CASES: MockCase<SuccessTxViewProps>[] = [
  {
    label: 'Supply · add aToken to wallet',
    props: {
      title: 'Supplied Successfully',
      action: 'supplied',
      amount: '1250.5',
      symbol: 'USDC',
      addToken: {
        address: AaveV3Ethereum.ASSETS.USDC.A_TOKEN,
        symbol: 'USDC',
        decimals: 6,
        aToken: true,
      },
    },
  },
  {
    label: 'Borrow · add token to wallet',
    props: {
      title: 'Borrowed Successfully',
      action: 'borrowed',
      amount: '5000',
      symbol: 'GHO',
      addToken: { address: AaveV3Ethereum.ASSETS.GHO.UNDERLYING, symbol: 'GHO', decimals: 18 },
    },
  },
  {
    label: 'Repay',
    props: { title: 'Repaid Successfully', action: 'repaid', amount: '500', symbol: 'DAI' },
  },
  {
    label: 'Withdraw, sGHO withdraw, Savings GHO withdraw',
    props: { title: 'Withdrawn Successfully', action: 'withdrew', amount: '2.5', symbol: 'ETH' },
  },
  {
    label: 'Faucet',
    props: { title: 'Received Successfully', action: 'received', amount: '10000', symbol: 'DAI' },
  },
  {
    label: 'Stake, Umbrella stake',
    props: { title: 'Staked Successfully', action: 'staked', amount: '100', symbol: 'AAVE' },
  },
  {
    label: 'Unstake, Umbrella unstake',
    props: { title: 'Unstaked Successfully', action: 'unstaked', amount: '100', symbol: 'AAVE' },
  },
  {
    label: 'Claim staking rewards',
    props: { title: 'Claimed Successfully', action: 'claimed', amount: '12.5', symbol: 'AAVE' },
  },
  {
    label: 'Restake staking rewards',
    props: { title: 'Restaked Successfully', action: 'restaked', amount: '12.5', symbol: 'AAVE' },
  },
  {
    label: 'Staking migration',
    props: { title: 'Migrated Successfully', action: 'migrated', amount: '250', symbol: 'stkABPT' },
  },
  {
    label: 'sGHO deposit, Savings GHO deposit',
    props: { title: 'Deposited Successfully', action: 'deposited', amount: '1000', symbol: 'sGHO' },
  },
  {
    label: 'stkGHO → sGHO migration',
    props: { title: 'Migrated Successfully', action: 'received', amount: '1000', symbol: 'sGHO' },
  },
];

export const STATUS_SUCCESS_CASES: MockCase<SuccessTxViewProps>[] = [
  { label: 'Collateral enabled', props: { collateral: true, symbol: 'WBTC' } },
  { label: 'Collateral disabled', props: { collateral: false, symbol: 'WBTC' } },
  {
    label: 'Claim rewards, Umbrella claim (USD amount, no symbol)',
    props: { title: 'Claimed Successfully', action: 'claimed', amount: '42.18' },
  },
  {
    label: 'E-Mode, delegation, revoke, cooldown, representatives',
    props: { action: 'Emode' },
  },
  { label: 'Governance vote', props: { customText: 'Thank you for voting' } },
  {
    label: 'V2 → V3 migration',
    props: {
      title: 'Migrated Successfully',
      customText:
        'Selected assets have successfully migrated. Visit the Market Dashboard to see them.',
      customAction: (
        <Button variant="outlined" size="medium">
          Go to V3 Dashboard
        </Button>
      ),
    },
  },
];

export const CUSTOM_SUCCESS_CASES: MockCase<BaseSuccessTxViewProps>[] = [
  {
    label: 'Bridge · CCIP explorer link',
    props: {
      txHash: MOCK_TX_HASH,
      customExplorerLink: `https://ccip.chain.link/tx/${MOCK_TX_HASH}`,
      customExplorerLinkText: 'View on CCIP Explorer',
      description:
        'Asset has been successfully sent to CCIP contract. You can check the status of the transactions below.',
    },
  },
  {
    label: 'Cancel CoW order · on-chain',
    props: { txHash: MOCK_TX_HASH, title: 'Cancellation Submitted' },
  },
  {
    label: 'Cancel CoW order · off-chain',
    props: { hideTx: true, title: 'Cancellation Submitted' },
  },
  {
    label: 'Support inquiry (SupportModal)',
    props: { hideTx: true, description: 'Thank you for submitting your inquiry!' },
  },
];

const tokenPair = (amount: string, symbol: string, outAmount: string, outSymbol: string) => ({
  amount,
  symbol,
  iconSymbol: symbol,
  iconUri: `/icons/tokens/${symbol.toLowerCase()}.svg`,
  outAmount,
  outSymbol,
  outIconSymbol: outSymbol,
  outIconUri: `/icons/tokens/${outSymbol.toLowerCase()}.svg`,
});

const SWAP_BASE: SwapTxSuccessViewProps = {
  ...tokenPair('1.5', 'WETH', '3712.45', 'USDC'),
  isInvertedSwap: false,
  txHash: MOCK_TX_HASH,
  provider: SwapProvider.PARASWAP,
  chainId: ChainId.mainnet,
  sellDecimals: 18,
  buyDecimals: 6,
  invalidateAppState: noop,
};

const COW_ORDER: SwapTxSuccessViewProps = {
  ...SWAP_BASE,
  provider: SwapProvider.COW_PROTOCOL,
  txHash: MOCK_COW_ORDER_ID,
};

export const SWAP_STATUS_CASES: MockCase<SwapTxSuccessViewProps>[] = [
  { label: 'ParaSwap market order', props: SWAP_BASE },
  { label: 'CoW order submitted', props: { ...COW_ORDER, previewOrder: { status: 'open' } } },
  {
    label: 'CoW order submitted · order id pending',
    props: {
      ...COW_ORDER,
      ...tokenPair('1.5', 'ETH', '3712.45', 'USDC'),
      txHash: undefined,
      previewOrder: { status: 'open' },
    },
  },
  {
    label: 'CoW order filled · with surplus',
    props: {
      ...COW_ORDER,
      outAmount: '3724.79',
      previewOrder: { status: 'succeed', surplus: BigInt(12340000) },
    },
  },
  {
    label: 'CoW order cancelled',
    props: { ...COW_ORDER, previewOrder: { status: 'failed' } },
  },
  {
    label: 'CoW order expired',
    props: { ...COW_ORDER, previewOrder: { status: 'expired' } },
  },
];

export const SWAP_FLOW_CASES: MockCase<SwapTxSuccessViewProps>[] = [
  {
    label: 'Collateral swap',
    props: {
      ...SWAP_BASE,
      ...tokenPair('2.5', 'WETH', '0.0781', 'WBTC'),
      resultScreenTokensFromTitle: 'Collateral sent',
      resultScreenTokensToTitle: 'Collateral received',
      resultScreenTitleItems: 'collateral',
    },
  },
  {
    label: 'Debt swap',
    props: {
      ...SWAP_BASE,
      ...tokenPair('5000', 'USDC', '5002.1', 'GHO'),
      resultScreenTokensFromTitle: 'Debt sent',
      resultScreenTokensToTitle: 'Debt received',
      resultScreenTitleItems: 'debt',
    },
  },
  {
    label: 'Repay with collateral',
    props: {
      ...SWAP_BASE,
      ...tokenPair('1000', 'USDC', '0.4', 'WETH'),
      resultScreenTokensFromTitle: 'Repay',
      resultScreenTokensToTitle: 'With',
      resultScreenTitleItems: 'and repaid',
    },
  },
  {
    label: 'Withdraw and swap',
    props: {
      ...SWAP_BASE,
      resultScreenTokensFromTitle: 'Withdrawn',
      resultScreenTokensToTitle: 'Received',
      resultScreenTitleItems: 'and withdrawn',
    },
  },
];

export const BLOCKING_ERROR_CASES: MockCase<TxErrorType>[] = [
  {
    label: 'Main transaction reverted',
    props: getErrorTextFromError(revertError(35), TxAction.MAIN_ACTION),
  },
];

export const INLINE_ERROR_CASES: MockCase<TxErrorType>[] = [
  {
    label: 'Rejected in wallet',
    modalTitle: 'Supply USDC',
    props: getErrorTextFromError(new Error('User rejected the request.'), TxAction.MAIN_ACTION),
  },
  {
    label: 'Known revert reason',
    modalTitle: 'Supply USDC',
    props: getErrorTextFromError(revertError(51), TxAction.GAS_ESTIMATION, false),
  },
  {
    label: 'Unknown error',
    modalTitle: 'Supply USDC',
    props: getErrorTextFromError(
      new Error('Internal JSON-RPC error.'),
      TxAction.GAS_ESTIMATION,
      false
    ),
  },
];

export const SWAP_INLINE_ERROR_CASES: MockCase<ComponentProps<typeof SwapGasEstimationError>>[] = [
  {
    label: 'Market order',
    modalTitle: 'Swap',
    props: { error: new Error('execution reverted') },
  },
  {
    label: 'Limit order',
    modalTitle: 'Swap',
    props: { error: new Error('execution reverted'), isLimitOrder: true },
  },
];
