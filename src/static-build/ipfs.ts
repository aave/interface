import { join } from 'path';
import { LowSync, JSONFileSync } from 'lowdb';
import lodash from 'lodash';
import { CustomProposalType } from './proposal';
import { getProposalMetadata } from 'src/modules/governance/utils/getProposalMetadata';

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

class LowWithLodash<T> extends LowSync<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

// Use JSON file for storage
const file = join(process.cwd(), 'src/static-build', 'ipfsFiles.json');
const adapter = new JSONFileSync<{ ipfs: IpfsType[] }>(file);
const db = new LowWithLodash(adapter);
db.read();

export class Ipfs {
  get(id: number) {
    const value = db.chain.get('ipfs').find({ id }).value();
    if (!value) throw new Error(`trying to fetch ipfs cache, but failed ${id}`);
    return value;
  }

  async populate(id: number, proposal: CustomProposalType) {
    // fallback to empty array
    db.data ||= { ipfs: [] };

    const value = db.chain.get('ipfs').find({ id }).value();
    if (value) return;
    if (!proposal) throw new Error(`error populating proposal ${id}`);
    const ipfs = await getProposalMetadata(proposal.ipfsHash);
    const newIpfs = { ...ipfs, originalHash: proposal.ipfsHash, id };
    db.data.ipfs.push(newIpfs);
    return db.write();
  }
}
