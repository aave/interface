import { ProposalMetadata } from '@aave/contract-helpers';
import { base58 } from 'ethers/lib/utils';
import matter from 'gray-matter';
import fetch from 'isomorphic-unfetch';
import { governanceConfig } from 'src/ui-config/governanceConfig';

export function getLink(hash: string, gateway: string): string {
  return `${gateway}/${hash}`;
}
type MemorizeMetadata = Record<string, ProposalMetadata>;

const MEMORIZE: MemorizeMetadata = {};

export async function getProposalMetadata(
  hash: string,
  gateway: string
): Promise<ProposalMetadata> {
  try {
    return await fetchFromIpfs(hash, gateway);
  } catch (e) {
    console.groupCollapsed('Fetching proposal metadata from IPFS...');
    console.info('failed with', gateway);
    if (gateway === governanceConfig.ipfsGateway) {
      console.info('retrying with', governanceConfig.fallbackIpfsGateway);
      console.error(e);
      console.groupEnd();
      return getProposalMetadata(hash, governanceConfig.fallbackIpfsGateway);
    }
    console.info('exiting');
    console.error(e);
    console.groupEnd();
    throw e;
  }
}

async function fetchFromIpfs(hash: string, gateway: string): Promise<ProposalMetadata> {
  const ipfsHash = hash.startsWith('0x')
    ? base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'))
    : hash;
  if (MEMORIZE[ipfsHash]) return MEMORIZE[ipfsHash];
  const ipfsResponse: Response = await fetch(getLink(ipfsHash, gateway));
  if (!ipfsResponse.ok) {
    throw Error('Fetch not working');
  }
  const clone = await ipfsResponse.clone();
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
