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

const revertError = (code: number) =>
  Object.assign(new Error(`execution reverted: ${code}`), {
    error: { body: JSON.stringify({ error: { message: `execution reverted: ${code}` } }) },
  });

export const SUCCESS_CASES: MockCase<SuccessTxViewProps>[] = [
  {
    label: 'Amount + add to wallet — Supply, Borrow',
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
    label: 'Amount — Repay, Withdraw, Stake, Claim, Deposit, Migrate, Faucet',
    props: { title: 'Repaid Successfully', action: 'repaid', amount: '500', symbol: 'DAI' },
  },
  {
    label: 'Text — Collateral, Governance vote',
    props: { collateral: true, symbol: 'WBTC' },
  },
  {
    label: 'Title only — E-Mode, delegation, cooldown, reward claims',
    props: { title: 'Claimed Successfully', action: 'claimed', amount: '42.18' },
  },
  {
    label: 'Text + action button — V2 → V3 migration',
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

export const BASE_SUCCESS_CASES: MockCase<BaseSuccessTxViewProps>[] = [
  {
    label: 'Custom explorer label — Bridge',
    props: {
      txHash: MOCK_TX_HASH,
      customExplorerLink: `https://ccip.chain.link/tx/${MOCK_TX_HASH}`,
      customExplorerLinkText: 'View on CCIP Explorer',
      description:
        'Asset has been successfully sent to CCIP contract. You can check the status of the transactions below.',
    },
  },
  {
    label: 'No explorer button — Cancel CoW order (off-chain), Support',
    props: { hideTx: true, title: 'Cancellation Submitted' },
  },
];

const COW_ORDER: SwapTxSuccessViewProps = {
  amount: '1.5',
  symbol: 'WETH',
  iconSymbol: 'WETH',
  iconUri: '/icons/tokens/weth.svg',
  outAmount: '3712.45',
  outSymbol: 'USDC',
  outIconSymbol: 'USDC',
  outIconUri: '/icons/tokens/usdc.svg',
  isInvertedSwap: false,
  txHash: MOCK_COW_ORDER_ID,
  provider: SwapProvider.COW_PROTOCOL,
  chainId: ChainId.mainnet,
  sellDecimals: 18,
  buyDecimals: 6,
  invalidateAppState: () => undefined,
};

export const SWAP_CASES: MockCase<SwapTxSuccessViewProps>[] = [
  {
    label: 'Success with surplus — all swap flows',
    props: {
      ...COW_ORDER,
      outAmount: '3724.79',
      previewOrder: { status: 'succeed', surplus: BigInt(12340000) },
    },
  },
  {
    label: 'In progress — CoW order submitted',
    props: { ...COW_ORDER, previewOrder: { status: 'open' } },
  },
  {
    label: 'In progress, order id pending — ETH-flow CoW order',
    props: {
      ...COW_ORDER,
      symbol: 'ETH',
      iconSymbol: 'ETH',
      iconUri: '/icons/tokens/eth.svg',
      txHash: undefined,
      previewOrder: { status: 'open' },
    },
  },
  {
    label: 'Cancelled — CoW order',
    props: { ...COW_ORDER, previewOrder: { status: 'failed' } },
  },
  {
    label: 'Expired — CoW order',
    props: { ...COW_ORDER, previewOrder: { status: 'expired' } },
  },
];

export const BLOCKING_ERROR_CASES: MockCase<TxErrorType>[] = [
  {
    label: 'Blocking error — any main transaction revert',
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
    label: 'Revert or unknown error',
    modalTitle: 'Supply USDC',
    props: getErrorTextFromError(revertError(51), TxAction.GAS_ESTIMATION, false),
  },
];

export const SWAP_INLINE_ERROR_CASES: MockCase<ComponentProps<typeof SwapGasEstimationError>>[] = [
  {
    label: 'Gas estimation, with tip — swap flows',
    modalTitle: 'Swap',
    props: { error: new Error('execution reverted') },
  },
];
