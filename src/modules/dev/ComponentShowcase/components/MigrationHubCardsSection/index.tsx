import { ChainId } from '@aave/contract-helpers';
import { Box } from '@mui/material';
import { useState } from 'react';
import { SparklineDatum } from 'src/components/charts/SparklineChart';
import { Curator } from 'src/components/CuratorBy';
import {
  V4MigrationHubCard,
  V4MigrationHubCardProps,
} from 'src/modules/v4Migration/V4MigrationHubCard';
import { MigrationAsset } from 'src/modules/v4Migration/V4MigrationPage/utils/types';

import { HEX_TEXT } from '../../utils/tokenHex';
import { ON_OFF, PropControl } from '../PropControl';
import { PropRow, PropsTable } from '../PropsTable';
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

const average = (history: SparklineDatum[]) =>
  history.reduce((sum, d) => sum + d.value, 0) / history.length;

const EARN_APY = 0.0618;
const BORROW_APY = 0.0041;
const EARN_HISTORY = makeHistory();
const BORROW_HISTORY = EARN_HISTORY.map((d) => ({
  ...d,
  value: (d.value * BORROW_APY) / EARN_APY,
}));

const SENTORA: Curator = {
  name: 'Sentora',
  icon: '/icons/curators/sentora.webp',
  tooltip: 'Curator details (placeholder until the copy is designed)',
};

const RATE_TOOLTIP = 'Rate breakdown (placeholder until the copy is designed)';

const SIDES = [
  { value: 'earn', label: 'Earn' },
  { value: 'borrow', label: 'Borrow' },
] as const;

const STATES = [
  { value: 'default', label: 'Default' },
  { value: 'unavailable', label: 'Unavailable' },
  { value: 'loading', label: 'Loading' },
] as const;

interface Options {
  side: (typeof SIDES)[number]['value'];
  state: (typeof STATES)[number]['value'];
  bestApy: boolean;
  curator: boolean;
  apyTooltip: boolean;
  incentives: boolean;
}

const EARN_DESIGN: Options = {
  side: 'earn',
  state: 'default',
  bestApy: true,
  curator: false,
  apyTooltip: false,
  incentives: true,
};

const BORROW_DESIGN: Options = {
  side: 'borrow',
  state: 'default',
  bestApy: true,
  curator: true,
  apyTooltip: true,
  incentives: false,
};

const EARN_AVERAGE = average(EARN_HISTORY);
const BORROW_AVERAGE = average(BORROW_HISTORY);

const propsFor = (options: Options): V4MigrationHubCardProps => {
  const identity = {
    hubName: 'Core',
    chainId: ChainId.mainnet,
    curators: options.curator ? [SENTORA] : undefined,
  };
  const rate = {
    apyTooltip: options.apyTooltip ? RATE_TOOLTIP : undefined,
    hasIncentives: options.incentives,
  };
  const flags = {
    bestApy: options.bestApy,
    unavailable: options.state === 'unavailable',
    loading: options.state === 'loading',
    onClick: () => undefined,
  };

  return options.side === 'borrow'
    ? {
        side: 'borrow',
        marketName: 'Main',
        ...identity,
        apy: BORROW_APY,
        ...rate,
        apyAverage: BORROW_AVERAGE,
        apyHistory: BORROW_HISTORY,
        healthFactor: '5',
        ...flags,
      }
    : {
        side: 'earn',
        ...identity,
        apy: EARN_APY,
        ...rate,
        apyAverage: EARN_AVERAGE,
        apyHistory: EARN_HISTORY,
        totalDepositsUSD: 45_620_000,
        backingCollateral: BACKING_COLLATERAL,
        ...flags,
      };
};

const STAND_INS: Record<string, string> = {
  chainId: 'ChainId.mainnet',
  curators: '[{ name, icon, tooltip }]',
  apyTooltip: 'rateBreakdown',
  apyAverage: 'average',
  apyHistory: 'history',
  backingCollateral: 'assets',
  onClick: 'selectHub',
};

const snippetFor = (props: V4MigrationHubCardProps) =>
  [
    '<V4MigrationHubCard',
    ...Object.entries(props).flatMap(([key, value]) => {
      if (value === undefined || value === false) return [];
      if (value === true) return [`  ${key}`];
      if (key in STAND_INS) return [`  ${key}={${STAND_INS[key]}}`];
      return [typeof value === 'string' ? `  ${key}="${value}"` : `  ${key}={${value}}`];
    }),
    '/>',
  ].join('\n');

const TOGGLES = [
  ['bestApy', 'Best / cheapest'],
  ['curator', 'Curator'],
  ['apyTooltip', 'APY tooltip'],
  ['incentives', 'Incentives'],
] as const;

const Playground = () => {
  const [options, setOptions] = useState<Options>(BORROW_DESIGN);
  const props = propsFor(options);
  const set =
    <K extends keyof Options>(key: K) =>
    (value: Options[K]) =>
      setOptions((current) => ({ ...current, [key]: value }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem' }}>
        <PropControl label="Side" value={options.side} options={SIDES} onChange={set('side')} />
        <PropControl label="State" value={options.state} options={STATES} onChange={set('state')} />
        {TOGGLES.map(([key, label]) => (
          <PropControl
            key={key}
            label={label}
            value={options[key]}
            options={ON_OFF}
            onChange={set(key)}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem' }}>
        <Box sx={{ flex: `1 1 ${CARD_WIDTH}`, maxWidth: CARD_WIDTH }}>
          <V4MigrationHubCard {...props} />
        </Box>
        <Box
          component="pre"
          sx={{
            ...HEX_TEXT,
            flex: '1 1 18rem',
            m: 0,
            p: '1rem',
            borderRadius: '0.5rem',
            bgcolor: 'bg-4',
            color: 'fg-2',
            fontSize: '0.75rem',
            lineHeight: 1.6,
            overflowX: 'auto',
          }}
        >
          {snippetFor(props)}
        </Box>
      </Box>
    </Box>
  );
};

const PROPS: PropRow[] = [
  {
    name: 'side',
    type: "'earn' | 'borrow'",
    scope: 'both',
    description: "Which card to draw. Defaults to 'earn'.",
  },
  {
    name: 'hubName',
    type: 'string',
    scope: 'both',
    description:
      'A trailing "Hub" is dropped and added back, so "Core" and "Core Hub" both work. The title on earn, the subtitle after the dot on borrow.',
  },
  {
    name: 'marketName',
    type: 'string',
    scope: 'borrow',
    description: 'The title. A trailing "Market" is dropped and added back.',
  },
  {
    name: 'chainId',
    type: 'ChainId',
    scope: 'both',
    description: 'Chain badge on the hub or market icon.',
  },
  {
    name: 'curators',
    type: '{ name, icon, tooltip? }[]',
    scope: 'both',
    description:
      '"by" plus each curator\'s 16px logo and name, after the title. A curator with a tooltip gets a dotted name that opens it.',
  },
  {
    name: 'apy',
    type: 'number',
    scope: 'both',
    description: 'A fraction: 0.0618 shows as 6.18%. Borrow reads "Up to …".',
  },
  {
    name: 'apyTooltip',
    type: 'ReactNode',
    scope: 'both',
    description: 'Dots the APY and opens this on click.',
  },
  {
    name: 'apyAverage',
    type: 'number',
    scope: 'both',
    description: 'The "7D avg." line under the APY.',
  },
  {
    name: 'apyHistory',
    type: '{ date, value }[]',
    scope: 'both',
    description:
      'Sparkline data; its mean draws the dashed line. Purple on earn, orange on borrow.',
  },
  {
    name: 'hasIncentives',
    type: 'boolean',
    scope: 'both',
    description: 'Incentives icon after the APY.',
  },
  {
    name: 'bestApy',
    type: 'boolean',
    scope: 'both',
    description: '"Best APY" pill on earn, "Cheapest APY" on borrow.',
  },
  {
    name: 'totalDepositsUSD',
    type: 'number',
    scope: 'earn',
    description: 'Total deposits row, in compact USD.',
  },
  {
    name: 'backingCollateral',
    type: 'MigrationAsset[]',
    scope: 'earn',
    description: 'New Backing Collateral row, as overlapping asset icons.',
  },
  {
    name: 'healthFactor',
    type: 'string',
    scope: 'borrow',
    description: 'Health factor row with the heart, coloured by the health factor scale.',
  },
  {
    name: 'unavailable',
    type: 'boolean',
    scope: 'both',
    description: 'Dims the card to 50% and turns off clicks.',
  },
  {
    name: 'loading',
    type: 'boolean',
    scope: 'both',
    description: 'Skeletons for the title, APY, average, chart and rows.',
  },
  {
    name: 'href / onClick',
    type: 'string / () => void',
    scope: 'both',
    description: 'Makes the whole card a link or a button.',
  },
];

export const MigrationHubCardsSection = () => (
  <Section
    title="Migration hub cards"
    description="V4MigrationHubCard, built on OpportunityCard (ported from Aave Pro), with mock data until the backend lands. Earn cards are hubs to move a deposit into; borrow cards are markets to move a borrow position into. Clicking does nothing here, and below 640px the chart gets its own row."
  >
    <Specimen label="Playground — the snippet follows your choices" fullWidth>
      <Playground />
    </Specimen>
    <Specimen label="Earn and borrow, as designed" fullWidth>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 26rem), 1fr))',
          gap: '1.5rem',
          width: '100%',
        }}
      >
        <Box sx={{ maxWidth: CARD_WIDTH }}>
          <V4MigrationHubCard {...propsFor(EARN_DESIGN)} />
        </Box>
        <Box sx={{ maxWidth: CARD_WIDTH }}>
          <V4MigrationHubCard {...propsFor(BORROW_DESIGN)} />
        </Box>
      </Box>
    </Specimen>
    <Specimen label="Props" fullWidth>
      <PropsTable rows={PROPS} />
    </Specimen>
  </Section>
);
