import { ProposalMetadata } from '@aave/contract-helpers';
import { base58 } from 'ethers/lib/utils';
import matter from 'gray-matter';
import fetch from 'isomorphic-unfetch';
import { governanceConfig } from 'src/ui-config/governanceConfig';

type MemorizeMetadata = Record<string, ProposalMetadata>;
const MEMORIZE: MemorizeMetadata = {};

/**
 * Composes a URI based off of a given IPFS CID hash and gateway
 * @param  {string} hash - The IPFS CID hash
 * @param  {string} gateway - The IPFS gateway host
 * @returns string
 */
export function getLink(hash: string, gateway: string): string {
  return `${gateway}/${hash}`;
}

/**
 * Fetches the IPFS metadata JSON from our preferred public gateway, once.
 * If the gateway fails, attempt to fetch recursively with a fallback gateway, once.
 * If the fallback fails, throw an error.
 * @param  {string} hash - The IPFS CID hash to query
 * @param  {string} gateway - The IPFS gateway host
 * @returns Promise
 */
export async function getProposalMetadata(
  hash: string,
  gateway: string
): Promise<ProposalMetadata> {
  try {
    return await fetchFromIpfs(hash, gateway);
  } catch (e) {
    console.groupCollapsed('Fetching proposal metadata from IPFS...');
    console.info('failed with', gateway);

    // Primary gateway failed, retry with fallback
    if (gateway === governanceConfig.ipfsGateway) {
      console.info('retrying with', governanceConfig.fallbackIpfsGateway);
      console.error(e);
      console.groupEnd();
      return getProposalMetadata(hash, governanceConfig.fallbackIpfsGateway);
    }

    // Fallback gateway failed, exit
    console.info('exiting');
    console.error(e);
    console.groupEnd();
    throw e;
  }
}

/**
 * Fetches data from a provided IPFS gateway with a simple caching mechanism.
 * Cache keys are the hashes, values are ProposalMetadata objects.
 * The cache does not implement any invalidation mechanisms nor sets expiries.
 * @param  {string} hash - The IPFS CID hash to query
 * @param  {string} gateway - The IPFS gateway host
 * @returns Promise
 */
async function fetchFromIpfs(hash: string, gateway: string): Promise<ProposalMetadata> {
  // Read from cache
  const ipfsHash = hash.startsWith('0x')
    ? base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'))
    : hash;
  if (MEMORIZE[ipfsHash]) return MEMORIZE[ipfsHash];

  // Fetch
  const ipfsResponse: Response = await fetch(getLink(ipfsHash, gateway));
  if (!ipfsResponse.ok) throw Error('Fetch not working');
  const clone = await ipfsResponse.clone();

  // Store in cache
  try {
    const response: ProposalMetadata = await ipfsResponse.json();
    const { content, data } = matter(response.description);
    MEMORIZE[ipfsHash] = {
      ...response,
      ipfsHash,
      description: content,
      ...data,
    };
  } catch (e) {
    const text = await clone.text();
    const { content, data } = matter(text);
    MEMORIZE[ipfsHash] = {
      ...(data as ProposalMetadata),
      ipfsHash,
      description: content,
    };
  }
  return MEMORIZE[ipfsHash];
}
