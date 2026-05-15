import { JsonRpcProvider } from '@ethersproject/providers';

/**
 * On-chain classification of an account, from CoW's signing-scheme
 * perspective.
 *
 * Vendored from the cow-sdk proposal in
 * https://github.com/cowprotocol/cow-sdk/pull/878. When that PR merges, drop
 * this module and import `classifyAccount` from `@cowprotocol/sdk-common`.
 */
export type WalletKind = 'eoa' | 'delegated-eoa-plain' | 'delegated-eoa-wrapping' | 'contract';

const EIP7702_DELEGATION_PREFIX = '0xef0100';
const EIP7702_DELEGATION_HEX_LENGTH = 2 + 23 * 2; // "0x" + 23 bytes

/**
 * Delegate addresses (lowercase, no `0x`) known to force signature wrapping
 * at `signTypedData_v4` time (ERC-7739 / ERC-7579 MA v2 / both). Empty today;
 * populate as wrapping delegates are confirmed in production.
 */
const WRAPPING_DELEGATES = new Set<string>();

function isEip7702DelegationCode(code: string): boolean {
  if (!code) return false;
  const lower = code.toLowerCase();
  return (
    lower.length === EIP7702_DELEGATION_HEX_LENGTH && lower.startsWith(EIP7702_DELEGATION_PREFIX)
  );
}

function extractEip7702Delegate(code: string): string | null {
  if (!isEip7702DelegationCode(code)) return null;
  return code.slice(2 + 6).toLowerCase();
}

/**
 * Classify an account by inspecting its on-chain code. Drives CoW
 * signing-scheme selection at the call-site of `sendOrder` /
 * `getPreSignTransaction` / `sendOrderForWrappingDelegate`.
 */
export async function classifyAccount(
  user: string,
  provider: JsonRpcProvider
): Promise<WalletKind> {
  const code = await provider.getCode(user);
  if (!code || code === '0x') return 'eoa';

  const delegate = extractEip7702Delegate(code);
  if (delegate !== null) {
    return WRAPPING_DELEGATES.has(delegate) ? 'delegated-eoa-wrapping' : 'delegated-eoa-plain';
  }
  return 'contract';
}
