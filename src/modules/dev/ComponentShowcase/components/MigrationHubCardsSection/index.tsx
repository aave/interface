import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import { SparklineDatum } from 'src/components/charts/SparklineChart';
import { V4MigrationHubCard } from 'src/modules/v4Migration/V4MigrationHubCard';
import { MigrationAsset } from 'src/modules/v4Migration/V4MigrationPage/utils/types';

import { Section } from '../Section';
import { Specimen } from '../Specimen';

const CARD_WIDTH = '33.5rem';

const BACKING_COLLATERAL: MigrationAsset[] = [
  {
    symbol: 'wstETH',
    name: 'Wrapped liquid staked Ether 2.0',
    address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  },
  {
    symbol: 'weETH',
    name: 'Wrapped eETH',
    address: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  },
];

const APY_SHAPE: [number, number][] = [
  [0, 0.039],
  [0.15, 0.037],
  [0.25, 0.0345],
  [0.3, 0.0355],
  [0.44, 0.035],
  [0.45, 0.053],
  [0.57, 0.052],
  [0.58, 0.034],
  [0.63, 0.03],
  [0.7, 0.042],
  [0.78, 0.054],
  [0.9, 0.058],
  [1, 0.0618],
];

const HOURS = 7 * 24;

const makeHistory = (): SparklineDatum[] => {
  let seed = 7;
  const noise = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647 - 0.5) * 0.0016;
  };
  return Array.from({ length: HOURS + 1 }, (_, hour) => {
    const t = hour / HOURS;
    const next = APY_SHAPE.findIndex(([at]) => at >= t);
    const [t1, v1] = APY_SHAPE[next];
    const [t0, v0] = APY_SHAPE[Math.max(next - 1, 0)];
    const value = t1 === t0 ? v1 : v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
    return {
      date: new Date(Date.UTC(2026, 10, 13, hour)),
      value: hour === HOURS ? value : value + noise(),
    };
  });
};

const HISTORY = makeHistory();
const AVERAGE = HISTORY.reduce((sum, d) => sum + d.value, 0) / HISTORY.length;

const HUB = {
  hubName: 'Core',
  chainId: ChainId.mainnet,
  apy: 0.0618,
  apyAverage: AVERAGE,
  apyHistory: HISTORY,
  hasIncentives: true,
  totalDepositsUSD: 45_620_000,
  backingCollateral: BACKING_COLLATERAL,
  onClick: () => undefined,
};

export const MigrationHubCardsSection = () => (
  <Section
    title="Migration hub cards"
    description="V4MigrationHubCard, built on OpportunityCard (ported from Aave Pro), with mock data until the backend lands. Clicking does nothing here. Below 640px the chart moves to its own row."
  >
    <Specimen label="Best APY" fullWidth>
      <Box sx={{ width: '100%', maxWidth: CARD_WIDTH }}>
        <V4MigrationHubCard {...HUB} bestApy />
      </Box>
    </Specimen>
    <Specimen label="Default" fullWidth>
      <Box sx={{ width: '100%', maxWidth: CARD_WIDTH }}>
        <V4MigrationHubCard {...HUB} />
      </Box>
    </Specimen>
    <Specimen label="Unavailable" fullWidth>
      <Box sx={{ width: '100%', maxWidth: CARD_WIDTH }}>
        <V4MigrationHubCard {...HUB} unavailable />
      </Box>
    </Specimen>
    <Specimen label="Loading" fullWidth>
      <Box sx={{ width: '100%', maxWidth: CARD_WIDTH }}>
        <V4MigrationHubCard {...HUB} loading />
      </Box>
    </Specimen>
  </Section>
);
