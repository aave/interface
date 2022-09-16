import { ProposalMetadata } from '@aave/contract-helpers';
import { Base58 } from '@ethersproject/basex';
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
    ? Base58.encode(Buffer.from(`1220${hash.slice(2)}`, 'hex'))
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
