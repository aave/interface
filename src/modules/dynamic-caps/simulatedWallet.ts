import { API_ETH_MOCK_ADDRESS } from '@aave/contract-helpers';
import { parseUnits } from 'ethers/lib/utils';
import { TWEAKS_ENABLED, useTweakParam } from 'src/components/tweaks/tweakParams';
import type { UserReservesDataHumanized } from 'src/services/UIPoolService';
import type { UserPoolTokensBalances } from 'src/services/WalletBalanceService';

/**
 * PREVIEW ONLY. A wallet that does not exist, so the screens that need one (the reserve's actions,
 * the borrow modal, the dashboard) can be reviewed without connecting a real one.
 *
 * It rides the app's own read-only mode ("Watch wallet"): one of the addresses below is watched,
 * and what the chain returns for it (nothing: the addresses are random and unused) is replaced by
 * the position and balances described here. Read-only mode cannot sign, so nothing can be sent.
 */
export const SIMULATED_WALLET_SIZES = ['off', 'small', 'large'] as const;
export type SimulatedWalletSize = (typeof SIMULATED_WALLET_SIZES)[number];
export const DEFAULT_SIMULATED_WALLET: SimulatedWalletSize = 'off';
export const SIMULATED_WALLET_PARAM = 'wallet';

export const useSimulatedWalletSize = () =>
  useTweakParam(SIMULATED_WALLET_PARAM, SIMULATED_WALLET_SIZES, DEFAULT_SIMULATED_WALLET);

// The position sits on the pilot market: WETH supplied as collateral, some USDC and ETH in the wallet.
const POSITION_MARKET = 'proto_arbitrum_v3';
const WETH = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1';
const USDC = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';

type SimulatedWallet = {
  address: string;
  /** WETH supplied as collateral. The balance shown is a little higher: it carries the reserve's accrued interest. */
  collateralWeth: number;
  walletUsdc: number;
  walletEth: number;
};

const SIMULATED_WALLETS: Record<Exclude<SimulatedWalletSize, 'off'>, SimulatedWallet> = {
  // Can borrow far less than the cap leaves room for: its own collateral is the limit.
  small: {
    address: '0xa3a954e8854f8a417f26492de1ba4a0211784826',
    collateralWeth: 10,
    walletUsdc: 5_000,
    walletEth: 0.5,
  },
  // Can borrow more than the cap leaves room for: the cap is the limit.
  large: {
    address: '0xa73c23bac80c7d06faddf6e9e5ffd5e917835ca2',
    collateralWeth: 10_000,
    walletUsdc: 250_000,
    walletEth: 5,
  },
};

export const simulatedWalletAddress = (size: SimulatedWalletSize): string | undefined =>
  TWEAKS_ENABLED && size !== 'off' ? SIMULATED_WALLETS[size].address : undefined;

const findSimulatedWallet = (address: string | undefined): SimulatedWallet | undefined => {
  if (!TWEAKS_ENABLED || !address) return undefined;
  const lowered = address.toLowerCase();
  return Object.values(SIMULATED_WALLETS).find((wallet) => wallet.address === lowered);
};

export const isSimulatedWalletAddress = (address: string | undefined): boolean =>
  !!findSimulatedWallet(address);

/** A user's reserves as fetched, or the simulated position when `user` is a simulated wallet. */
export const withSimulatedPosition = (
  data: UserReservesDataHumanized,
  market: string,
  user: string
): UserReservesDataHumanized => {
  const wallet = findSimulatedWallet(user);
  if (!wallet) return data;

  return {
    userEmodeCategoryId: 0,
    userReserves: data.userReserves.map((userReserve) => {
      const isCollateral =
        market === POSITION_MARKET && userReserve.underlyingAsset.toLowerCase() === WETH;
      return {
        ...userReserve,
        scaledATokenBalance: isCollateral
          ? parseUnits(String(wallet.collateralWeth), 18).toString()
          : '0',
        usageAsCollateralEnabledOnUser: isCollateral,
        scaledVariableDebt: '0',
      };
    }),
  };
};

/** A user's wallet balances as fetched, or the simulated ones when `user` is a simulated wallet. */
export const withSimulatedBalances = (
  balances: UserPoolTokensBalances[],
  market: string,
  user: string
): UserPoolTokensBalances[] => {
  const wallet = findSimulatedWallet(user);
  if (!wallet) return balances;

  return balances.map((balance) => {
    if (market !== POSITION_MARKET) return { ...balance, amount: '0' };
    if (balance.address === USDC) {
      return { ...balance, amount: parseUnits(String(wallet.walletUsdc), 6).toString() };
    }
    if (balance.address === API_ETH_MOCK_ADDRESS.toLowerCase()) {
      return { ...balance, amount: parseUnits(String(wallet.walletEth), 18).toString() };
    }
    return { ...balance, amount: '0' };
  });
};
