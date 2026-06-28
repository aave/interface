import { Stake } from '@aave/contract-helpers';
import { stakeConfig } from 'src/ui-config/stakeConfig';

export const {
  tokens: {
    aave: { TOKEN_STAKING: STK_AAVE, TOKEN_ORACLE: STK_AAVE_ORACLE },
    bpt: { TOKEN_STAKING: STK_BPT, TOKEN_ORACLE: STK_BPT_ORACLE },
    gho: { TOKEN_STAKING: STK_GHO, TOKEN_ORACLE: STK_GHO_ORACLE },
    bptv2: { TOKEN_STAKING: STK_BPTV2, TOKEN_ORACLE: STK_BPTV2_ORACLE },
  },
} = stakeConfig;

export const stakedTokens = [STK_AAVE, STK_BPT, STK_GHO, STK_BPTV2];
export const oracles = [STK_AAVE_ORACLE, STK_BPT_ORACLE, STK_GHO_ORACLE, STK_BPTV2_ORACLE];

export function getStakeIndex(stake: Stake) {
  switch (stake) {
    case Stake.aave:
      return 0;
    case Stake.bpt:
      return 1;
    case Stake.gho:
      return 2;
    case Stake.bptv2:
      return 3;
  }
}
