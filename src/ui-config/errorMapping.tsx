import { Trans } from '@lingui/macro';
import { ReactElement } from 'react';

export enum TxAction {
  APPROVAL,
  MAIN_ACTION,
  GAS_ESTIMATION,
}

export type TxErrorType = {
  blocking: boolean;
  actionBlocked: boolean;
  rawError: Error;
  error: ReactElement | undefined;
  txAction: TxAction;
};

export const getErrorTextFromError = (
  error: Error,
  txAction: TxAction,
  blocking = true
): TxErrorType => {
  let errorNumber = 1;

  if (
    error.message === 'MetaMask Tx Signature: User denied transaction signature.' ||
    error.message === 'MetaMask Message Signature: User denied message signature.'
  ) {
    return {
      error: errorMapping[4001],
      blocking: false,
      actionBlocked: false,
      rawError: error,
      txAction,
    };
  }

  // Try to parse the Pool error number from RPC provider revert error
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsedError = JSON.parse((error as any)?.error?.body);
    const parsedNumber = Number(parsedError.error.message.split(': ')[1]);
    if (!isNaN(parsedNumber)) {
      errorNumber = parsedNumber;
    }
  } catch {}

  const errorRender = errorMapping[errorNumber];

  if (errorRender) {
    return {
      error: errorRender,
      blocking,
      actionBlocked: true,
      rawError: error,
      txAction,
    };
  }

  return {
    error: undefined,
    blocking,
    actionBlocked: true,
    rawError: error,
    txAction,
  };
};

export const errorMapping: Record<number, ReactElement> = {
  // 1: <Trans>The caller of the function is not a pool admin</Trans>,
  // 2: <Trans>The caller of the function is not an emergency admin</Trans>,
  // 3: <Trans>The caller of the function is not a pool or emergency admin</Trans>,
  // 4: <Trans>The caller of the function is not a risk or pool admin</Trans>,
  // 5: <Trans>The caller of the function is not an asset listing or pool admin</Trans>,
  // 6: <Trans>The caller of the function is not a bridge</Trans>,
  7: <Trans>Pool addresses provider is not registered</Trans>,
  // 8: <Trans>Invalid id for the pool addresses provider</Trans>,
  9: <Trans>Address is not a contract</Trans>,
  // 10: <Trans>The caller of the function is not the pool configurator</Trans>,
  11: <Trans>The caller of the function is not an AToken</Trans>,
  12: <Trans>The address of the pool addresses provider is invalid</Trans>,
  13: <Trans>Invalid return value of the flashloan executor function</Trans>,
  // 14: <Trans>Reserve has already been added to reserve list</Trans>,
  // 15: <Trans>Maximum amount of reserves in the pool reached</Trans>,
  // 16: <Trans>Zero eMode category is reserved for volatile heterogeneous assets</Trans>,
  // 17: <Trans>Invalid eMode category assignment to asset</Trans>,
  // 18: <Trans>The liquidity of the reserve needs to be 0</Trans>,
  19: <Trans>Invalid flashloan premium</Trans>,
  // 20: <Trans>Invalid risk parameters for the reserve</Trans>,
  // 21: <Trans>Invalid risk parameters for the eMode category</Trans>,
  22: <Trans>Invalid bridge protocol fee</Trans>,
  23: <Trans>The caller of this function must be a pool</Trans>,
  24: <Trans>Invalid amount to mint</Trans>,
  25: <Trans>Invalid amount to burn</Trans>,
  26: <Trans>Amount must be greater than 0</Trans>,
  27: <Trans>Action requires an active reserve</Trans>,
  28: <Trans>Action cannot be performed because the reserve is frozen</Trans>,
  29: <Trans>Action cannot be performed because the reserve is paused</Trans>,
  30: <Trans>Borrowing is not enabled</Trans>,
  31: <Trans>Stable borrowing is not enabled</Trans>,
  32: <Trans>User cannot withdraw more than the available balance</Trans>,
  // 33: <Trans>Invalid interest rate mode selected</Trans>,
  34: <Trans>The collateral balance is 0</Trans>,
  35: <Trans>Health factor is lesser than the liquidation threshold</Trans>,
  36: <Trans>There is not enough collateral to cover a new borrow</Trans>,
  37: <Trans>Collateral is (mostly) the same currency that is being borrowed</Trans>,
  38: <Trans>The requested amount is greater than the max loan size in stable rate mode</Trans>,
  39: (
    <Trans>For repayment of a specific type of debt, the user needs to have debt that type</Trans>
  ),
  40: <Trans>To repay on behalf of a user an explicit amount to repay is needed</Trans>,
  41: <Trans>User does not have outstanding stable rate debt on this reserve</Trans>,
  42: <Trans>User does not have outstanding variable rate debt on this reserve</Trans>,
  43: <Trans>The underlying balance needs to be greater than 0</Trans>,
  44: <Trans>Interest rate rebalance conditions were not met</Trans>,
  45: <Trans>Health factor is not below the threshold</Trans>,
  46: <Trans>The collateral chosen cannot be liquidated</Trans>,
  47: <Trans>User did not borrow the specified currency</Trans>,
  48: <Trans>Borrow and repay in same block is not allowed</Trans>,
  49: <Trans>Inconsistent flashloan parameters</Trans>,
  50: <Trans>Borrow cap is exceeded</Trans>,
  51: <Trans>Supply cap is exceeded</Trans>,
  52: <Trans>Unbacked mint cap is exceeded</Trans>,
  53: <Trans>Debt ceiling is exceeded</Trans>,
  54: <Trans>AToken supply is not zero</Trans>,
  55: <Trans>Stable debt supply is not zero</Trans>,
  56: <Trans>Variable debt supply is not zero</Trans>,
  57: <Trans>Ltv validation failed</Trans>,
  // 58: <Trans>Inconsistent eMode category</Trans>,
  // 59: <Trans>Price oracle sentinel validation failed</Trans>,
  60: <Trans>Asset is not borrowable in isolation mode</Trans>,
  // 61: <Trans>Reserve has already been initialized</Trans>,
  62: <Trans>User is in isolation mode</Trans>,
  // 63: <Trans>Invalid ltv parameter for the reserve</Trans>,
  // 64: <Trans>Invalid liquidity threshold parameter for the reserve</Trans>,
  // 65: <Trans>Invalid liquidity bonus parameter for the reserve</Trans>,
  // 66: <Trans>Invalid decimals parameter of the underlying asset of the reserve</Trans>,
  // 67: <Trans>Invalid reserve factor parameter for the reserve</Trans>,
  // 68: <Trans>Invalid borrow cap for the reserve</Trans>,
  // 69: <Trans>Invalid supply cap for the reserve</Trans>,
  // 70: <Trans>Invalid liquidation protocol fee for the reserve</Trans>,
  // 71: <Trans>Invalid eMode category for the reserve</Trans>,
  // 72: <Trans>Invalid unbacked mint cap for the reserve</Trans>,
  // 73: <Trans>Invalid debt ceiling for the reserve</Trans>,
  // 74: <Trans>Invalid reserve index</Trans>,
  // 75: <Trans>ACL admin cannot be set to the zero address</Trans>,
  76: <Trans>Array parameters that should be equal length are not</Trans>,
  77: <Trans>Zero address not valid</Trans>,
  78: <Trans>Invalid expiration</Trans>,
  79: <Trans>Invalid signature</Trans>,
  80: <Trans>Operation not supported</Trans>,
  81: <Trans>Debt ceiling is not zero</Trans>,
  82: <Trans>Asset is not listed</Trans>,
  // 83: <Trans>Invalid optimal usage ratio</Trans>,
  // 84: <Trans>Invalid optimal stable to total debt ratio</Trans>,
  85: <Trans>The underlying asset cannot be rescued</Trans>,
  // 86: <Trans>Reserve has already been added to reserve list</Trans>,
  // 87: (
  //   <Trans>
  //     The token implementation pool address and the pool address provided by the initializing pool
  //     do not match
  //   </Trans>
  // ),
  88: <Trans>Stable borrowing is enabled</Trans>,
  89: <Trans>User is trying to borrow multiple assets including a siloed one</Trans>,
  // 90: <Trans>the total debt of the reserve needs to be</Trans>,

  4001: <Trans>You cancelled the transaction.</Trans>,
};
