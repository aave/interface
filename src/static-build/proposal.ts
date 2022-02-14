import { Proposal as ProposalType } from '@aave/contract-helpers';
import lodash from 'lodash';
import { JSONFile, Low } from 'lowdb';
import { dirname, join } from 'path';
import { enhanceProposalWithTimes } from 'src/modules/governance/utils/formatProposal';
import { governanceContract } from 'src/modules/governance/utils/governanceProvider';
import { isProposalStateImmutable } from 'src/modules/governance/utils/immutableStates';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this['data']> = lodash.chain(this).get('data');
}

export type CustomProposalType = Omit<ProposalType, 'values'> & {
  startTimestamp: number;
  creationTimestamp: number;
  expirationTimestamp: number;
};

// Use JSON file for storage
const file = join(__dirname, 'proposals.json');
const adapter = new JSONFile<{ proposals: CustomProposalType[] }>(file);
const db = new LowWithLodash(adapter);

export class Proposal {
  async get(id: number) {
    // seed
    await db.read();

    // fallback to empty array
    db.data ||= { proposals: [] };

    const value = db.chain.get('proposals').find({ id }).value();
    if (value) return value;
    const { values, ...rest } = await governanceContract.getProposal({ proposalId: id });
    const proposal = await enhanceProposalWithTimes(rest);
    // only store data when it can no longer change
    if (isProposalStateImmutable(proposal)) {
      db.data.proposals.push(proposal);
      await db.write();
    }
    return proposal;
  }
}
