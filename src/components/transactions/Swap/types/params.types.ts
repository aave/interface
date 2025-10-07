import { InterestRate } from '@aave/contract-helpers';
import { FormattedUserReserves } from 'src/hooks/pool/useUserSummaryAndIncentives';

import { SupportedNetworkWithChainId } from '../helpers/shared/misc.helpers';
import { SwapKind, SwapType } from './shared.types';
import { SwappableToken } from './tokens.types';

export type TokensSwapParams = {
  swapType: SwapType.Swap;
  allowLimitOrders: boolean;
  chainId: number;
  inputBalanceTitle: string;
  outputBalanceTitle: string;
  customReceivedTitle: string;
  allowCustomTokens: boolean;
  showSwitchInputAndOutputAssetsButton: boolean;
  showNetworkSelector: boolean;
  showTitle: boolean;
  titleTokenPostfix?: string;
  supportedNetworks: SupportedNetworkWithChainId[];
  // TODO: Can we simplify?
  forcedInputToken?: SwappableToken;
  forcedOutputToken?: SwappableToken;
  suggestedDefaultInputToken?: SwappableToken;
  suggestedDefaultOutputToken?: SwappableToken;
  showOutputBalance: boolean;
  sourceTokens: SwappableToken[];
  destinationTokens: SwappableToken[];
  inputInputTitle?: string;
  outputInputTitle?: string;
  invalidateAppState: () => void;
  refreshTokens: (chainId: number) => void;
  interestMode: InterestRate;
  swapKind: SwapKind;
  resultScreenTokensPrefix?: string;
  resultScreenTitleItems?: string;
};

export const isProtocolSwapParams = (params: SwapParams): params is ProtocolSwapParams => {
  return (
    'swapType' in params &&
    params.swapType !== undefined &&
    (params.swapType === SwapType.DebtSwap ||
      params.swapType === SwapType.CollateralSwap ||
      params.swapType === SwapType.RepayWithCollateral ||
      params.swapType === SwapType.WithdrawAndSwap)
  );
};

export const isTokensSwapParams = (params: SwapParams): params is TokensSwapParams => {
  return 'swapType' in params && params.swapType === SwapType.Swap;
};

export type ProtocolSwapParams = Omit<TokensSwapParams, 'swapType'> & {
  swapType:
    | SwapType.DebtSwap
    | SwapType.CollateralSwap
    | SwapType.RepayWithCollateral
    | SwapType.WithdrawAndSwap;

  sourceReserve: FormattedUserReserves;
  destinationReserve: FormattedUserReserves;
};

export type SwapParams = TokensSwapParams | ProtocolSwapParams;

export const SwapDefaultParams: SwapParams = {
  swapType: SwapType.Swap,
  swapKind: 'sell',
  allowLimitOrders: true,
  chainId: 1,
  inputBalanceTitle: 'Balance',
  outputBalanceTitle: 'Balance',
  showOutputBalance: false,
  inputInputTitle: undefined,
  outputInputTitle: undefined,
  allowCustomTokens: true,
  showSwitchInputAndOutputAssetsButton: true,
  sourceTokens: [],
  destinationTokens: [],
  customReceivedTitle: 'Received',
  showNetworkSelector: true,
  showTitle: true,
  supportedNetworks: [],

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  invalidateAppState: function () {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refreshTokens: function () {},
  interestMode: InterestRate.Variable,
};
