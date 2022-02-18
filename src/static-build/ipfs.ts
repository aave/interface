import { join, dirname } from 'path';
import { Low, JSONFile } from 'lowdb';
import { fileURLToPath } from 'url';
import lodash from 'lodash';
import { getProposalMetadata } from '@aave/contract-helpers';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface IpfsType {
  id: number;
  aip: number;
  originalHash: string;
  ipfsHash: string;
  description: string;
  shortDescription: string;
  author: string;
  discussions: string;
  title: string;
}

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

// Use JSON file for storage
const file = join(__dirname, 'ipfsFiles.json');
const adapter = new JSONFile<{ ipfs: IpfsType[] }>(file);
const db = new LowWithLodash(adapter);
await db.read();

export class Ipfs {
  async get(id: number) {
    // seed

    // fallback to empty array
    db.data ||= { ipfs: [] };

    const value = db.chain.get('ipfs').find({ id }).value();
    if (value) return value;
    const proposal = await governanceContract.getProposal({ proposalId: id });
    if (!proposal) throw new Error(`error fetching proposal ${id}`);
    const ipfs = await getProposalMetadata(proposal.ipfsHash);
    const newIpfs = { ...ipfs, originalHash: proposal.ipfsHash, id };
    db.data.ipfs.push(newIpfs);
    await db.write();
    return newIpfs;
  }
}
