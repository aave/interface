import { ProposalMetadata } from '@aave/contract-helpers';
import { base58 } from 'ethers/lib/utils';
import fetch from 'isomorphic-unfetch';
import matter from 'gray-matter';

export function getLink(hash: string, gateway: string): string {
  return `${gateway}/${hash}`;
}
type MemorizeMetadata = Record<string, ProposalMetadata>;

const MEMORIZE: MemorizeMetadata = {};

export async function getProposalMetadata(
  hash: string,
  gateway = 'https://cloudflare-ipfs.com/ipfs'
): Promise<ProposalMetadata> {
  const ipfsHash = hash.startsWith('0x')
    ? base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'))
    : hash;
  if (MEMORIZE[ipfsHash]) return MEMORIZE[ipfsHash];
  const ipfsResponse: Response = await fetch(getLink(ipfsHash, gateway), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!ipfsResponse.ok) {
    throw Error('Fetch not working');
  }

  const response: ProposalMetadata = await ipfsResponse.json();

  const { content, data } = matter(response.description);

  MEMORIZE[ipfsHash] = {
    ...response,
    ipfsHash,
    description: content,
    ...data,
  };
  return MEMORIZE[ipfsHash];
}
