import { useQuery } from '@tanstack/react-query';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

// An EIP-7702 account's code: this prefix and the address it delegates to.
const DELEGATION = /^0xef0100[0-9a-f]{40}$/i;

/**
 * Whether `address` signs with its own key on `chainId`: it has no code, or only an EIP-7702
 * delegation. A migration is authorised with permits, which a contract wallet such as a Safe
 * cannot sign, and the migration API turns those wallets down by the same test.
 *
 * `data` stays undefined while the code is read and if the read fails; only `false` says no.
 */
export const useSignsWithOwnKey = (address: string, chainId: number) =>
  useQuery({
    queryKey: ['v4Migration', 'accountCode', chainId, address.toLowerCase()],
    queryFn: () => getProvider(chainId).getCode(address),
    enabled: !!address,
    staleTime: 5 * 60_000,
    select: (code) => code === '0x' || DELEGATION.test(code),
  });
