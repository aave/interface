import {
  encodeAbiParameters,
  erc20Abi,
  encodeFunctionData,
  keccak256,
  toHex,
} from 'viem';
import { getPublicClient } from 'wagmi/actions';

import { wagmiConfig } from 'src/ui-config/wagmiConfig';

const MULTICALL3_ADDRESS = '0xcA11bde05977b3631167028862bE2a173976CA11';
const MULTICALL3_AGGREGATE3_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'bool', name: 'allowFailure', type: 'bool' },
          { internalType: 'bytes', name: 'callData', type: 'bytes' },
        ],
        internalType: 'struct IMulticall3.Call3[]',
        name: 'calls',
        type: 'tuple[]',
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        components: [
          { internalType: 'bool', name: 'success', type: 'bool' },
          { internalType: 'bytes', name: 'returnData', type: 'bytes' },
        ],
        internalType: 'struct IMulticall3.Result[]',
        name: 'returnData',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

type HookDefinition = {
  target?: string;
  callData?: string;
  gasLimit?: string | number;
};

type FlashloanMetadata = {
  amount?: string;
  token?: string;
  protocolAdapter?: string;
  receiver?: string;
};

type OrderSettlementContext = {
  receiver?: string;
  buyToken?: string;
  buyAmount?: bigint;
};

const DEFAULT_BALANCE_SLOT_CANDIDATES = [0n, 1n, 2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 10n, 11n, 12n];

const getBalanceSlotKeys = (owner: string, slotCandidates = DEFAULT_BALANCE_SLOT_CANDIDATES) => {
  return slotCandidates.map((slot) => {
    const encoded = encodeAbiParameters(
      [{ type: 'address' }, { type: 'uint256' }],
      [owner as `0x${string}`, slot]
    );
    return keccak256(encoded);
  });
};

const buildBalanceOverride = async ({
  chainId,
  token,
  recipient,
  amount,
}: {
  chainId: number;
  token?: string;
  recipient?: string;
  amount?: bigint;
}) => {
  const normalizedToken = token as `0x${string}` | undefined;
  const normalizedRecipient = recipient as `0x${string}` | undefined;
  if (!normalizedToken || !normalizedRecipient || amount === undefined) return undefined;

  const publicClient = getPublicClient(wagmiConfig, { chainId });
  if (!publicClient) return undefined;

  let currentBalance = 0n;
  try {
    currentBalance = await publicClient.readContract({
      address: normalizedToken,
      functionName: 'balanceOf',
      args: [normalizedRecipient],
      abi: erc20Abi,
    });
  } catch (error) {
    console.warn('[CoW][CollateralSwap] Could not read current balance for state override', error);
  }

  const updatedBalance = currentBalance + amount;
  const balanceSlots = getBalanceSlotKeys(normalizedRecipient);

  const stateDiff: Record<string, string> = {};
  balanceSlots.forEach((slot) => {
    stateDiff[slot] = toHex(updatedBalance, { size: 32 });
  });

  return { [normalizedToken]: { stateDiff } };
};

const mergeOverrides = (...overrides: (Record<string, { stateDiff: Record<string, string> }> | undefined)[]) => {
  const merged: Record<string, { stateDiff: Record<string, string> }> = {};
  overrides.forEach((override) => {
    if (!override) return;
    Object.entries(override).forEach(([addr, overrideVal]) => {
      if (!merged[addr]) {
        merged[addr] = { stateDiff: {} };
      }
      merged[addr].stateDiff = { ...merged[addr].stateDiff, ...overrideVal.stateDiff };
    });
  });
  return Object.keys(merged).length ? merged : undefined;
};

export const simulateCollateralSwapPreHook = async ({
  chainId,
  from,
  preHook,
  flashloan,
  postHook,
  settlementContext,
}: {
  chainId: number;
  from?: `0x${string}`;
  preHook?: HookDefinition;
  flashloan?: FlashloanMetadata;
  postHook?: HookDefinition;
  settlementContext?: OrderSettlementContext;
}) => {
  const caller = from;

  if (!caller || !preHook?.target || !preHook?.callData) {
    console.log('[CoW][CollateralSwap] Skipping preHook simulation, missing data');
    return false;
  }

  const publicClient = getPublicClient(wagmiConfig, { chainId });
  if (!publicClient) {
    console.warn('[CoW][CollateralSwap] No public client available for simulation');
    return;
  }

  const flashloanOverride = await buildBalanceOverride({
    chainId,
    token: flashloan?.token,
    recipient: flashloan?.protocolAdapter ?? flashloan?.receiver,
    amount: flashloan?.amount ? BigInt(flashloan.amount) : undefined,
  });

  const settlementOverride = await buildBalanceOverride({
    chainId,
    token: settlementContext?.buyToken,
    recipient: settlementContext?.receiver,
    amount: settlementContext?.buyAmount,
  });

  const encodedPreHook = {
    from: caller,
    to: preHook.target as `0x${string}`,
    input: preHook.callData as `0x${string}`,
    gas: preHook.gasLimit ? toHex(BigInt(preHook.gasLimit)) : undefined,
  };

  const encodedPostHook =
    postHook?.target && postHook?.callData
      ? {
          from: caller,
          to: postHook.target as `0x${string}`,
          input: postHook.callData as `0x${string}`,
          gas: postHook?.gasLimit !== undefined ? toHex(BigInt(postHook.gasLimit)) : undefined,
        }
      : undefined;

  const callsSequence = [{ ...encodedPreHook, label: 'preHook' }, ...(encodedPostHook ? [{ ...encodedPostHook, label: 'postHook' }] : [])];

  const aggregateData = encodeFunctionData({
    abi: MULTICALL3_AGGREGATE3_ABI,
    functionName: 'aggregate3',
    args: [
      callsSequence.map((c) => ({
        target: c.to as `0x${string}`,
        allowFailure: true,
        callData: (c as any).input ?? c.data,
      })),
    ],
  });

  const stateOverrides = mergeOverrides(flashloanOverride, settlementOverride);

  const blockStateCall = {
    calls: [{ from, to: MULTICALL3_ADDRESS as `0x${string}`, input: aggregateData, label: 'multicall' }],
    transactions: [{ from, to: MULTICALL3_ADDRESS as `0x${string}`, data: aggregateData }],
    ...(stateOverrides ? { stateOverrides } : {}),
  };

  const simulationPayload = {
    parentBlock: 'latest',
    blockStateCalls: [blockStateCall],
  };

  console.log('[CoW][CollateralSwap] PreHook simulation payload', simulationPayload);

  try {
    const result = await publicClient.request({
      method: 'eth_simulateV1',
      params: [simulationPayload] as unknown[],
    });
    console.log('[CoW][CollateralSwap] PreHook simulation result', result);
    return true;
  } catch (error) {
    console.error('[CoW][CollateralSwap] PreHook simulation failed', error);
    return false;
  }
};
