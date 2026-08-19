import { SupportedChainId } from '@cowprotocol/cow-sdk';
import {
  AaveCollateralSwapSdk,
  AaveFlashLoanType,
  CollateralPermitData,
  CollateralSwapHooksGasLimit,
  EMPTY_PERMIT,
  EncodedOrder,
  FlashLoanHookAmounts,
} from '@cowprotocol/sdk-flash-loans';
import { encodeFunctionData } from 'viem';

import { FlashLoanFlow } from '../../types';

/**
 * The SDK has no Leverage variant, so its own maps are missed on lookup; the value only has to
 * agree with the key added to `HOOK_ADAPTER_PER_TYPE`.
 */
export const LEVERAGE_FLASH_LOAN_TYPE = FlashLoanFlow.Leverage as unknown as AaveFlashLoanType;

const LEVERAGE_DAPP_ID = 'cow-sdk://flashloans/aave/v3/leverage';

const PERMIT_COMPONENTS = [
  { name: 'amount', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
  { name: 'v', type: 'uint8' },
  { name: 'r', type: 'bytes32' },
  { name: 's', type: 'bytes32' },
] as const;

export const leverageAdapterHookAbi = [
  {
    type: 'function',
    name: 'leverageWithFlashLoan',
    inputs: [
      { name: 'permitData', type: 'tuple', components: PERMIT_COMPONENTS },
      { name: 'creditDelegationData', type: 'tuple', components: PERMIT_COMPONENTS },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const;

const toAbiPermit = (permit: CollateralPermitData) =>
  ({
    amount: BigInt(permit.amount),
    deadline: BigInt(permit.deadline),
    v: permit.v,
    r: permit.r as `0x${string}`,
    s: permit.s as `0x${string}`,
  } as const);

/**
 * Every other part of `getOrderPostingSettings` is type-agnostic: the instance address and the
 * pre-hook only need the implementation address, which arrives through `hookAdapterPerType`.
 * Only the post-hook calldata and the dapp id have to be supplied here.
 */
export class AaveLeverageFlashLoanSdk extends AaveCollateralSwapSdk {
  /**
   * The SDK's encoders each take one tuple, while `leverageWithFlashLoan` takes two. The single
   * slot carries the credit delegation, the signature leverage always needs; the ERC20 permit
   * stays empty until supplying beyond the swap output is offered.
   */
  getFlashLoanPostHook(
    flashLoanType: AaveFlashLoanType,
    creditDelegation: CollateralPermitData = EMPTY_PERMIT
  ): string {
    if (flashLoanType !== LEVERAGE_FLASH_LOAN_TYPE) {
      return super.getFlashLoanPostHook(flashLoanType, creditDelegation);
    }

    return encodeFunctionData({
      abi: leverageAdapterHookAbi,
      functionName: 'leverageWithFlashLoan',
      args: [toAbiPermit(EMPTY_PERMIT), toAbiPermit(creditDelegation)],
    });
  }

  async getOrderHooks(
    flashLoanType: AaveFlashLoanType,
    chainId: SupportedChainId,
    trader: `0x${string}`,
    expectedInstanceAddress: `0x${string}`,
    hookAmounts: FlashLoanHookAmounts,
    order: EncodedOrder,
    collateralPermit?: CollateralPermitData,
    hooksGasLimit?: CollateralSwapHooksGasLimit
  ) {
    const hooks = await super.getOrderHooks(
      flashLoanType,
      chainId,
      trader,
      expectedInstanceAddress,
      hookAmounts,
      order,
      collateralPermit,
      hooksGasLimit
    );

    if (flashLoanType !== LEVERAGE_FLASH_LOAN_TYPE) return hooks;

    // Without a Leverage key in the SDK's map the dapp id resolves to undefined, which the
    // appData schema rejects.
    return {
      ...hooks,
      pre: hooks?.pre?.map((hook) => ({ ...hook, dappId: LEVERAGE_DAPP_ID })),
      post: hooks?.post?.map((hook) => ({ ...hook, dappId: LEVERAGE_DAPP_ID })),
    };
  }
}
