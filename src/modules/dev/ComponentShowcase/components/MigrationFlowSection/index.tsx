import { ChainId } from '@aave/contract-helpers';
import { Box, Skeleton } from '@mui/material';
import { ReactNode, useState } from 'react';
import { ChainIcon } from 'src/components/ChainIcon';
import { FlowHeader } from 'src/components/FlowHeader';
import { SearchInput } from 'src/components/SearchInput';
import {
  MIGRATE_FLOW,
  searchEarnHubsPlaceholder,
  searchMarketsPlaceholder,
} from 'src/modules/v4Migration/utils/copy';
import { V4MigrationPositionSummary } from 'src/modules/v4Migration/V4MigrationPositionSummary';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { Side, SIDES } from '../../utils/migrationMocks';
import { ON_OFF, PropControl } from '../PropControl';
import { PropRow, PropsTable } from '../PropsTable';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

const COLUMN_WIDTH = '33.5rem';

const STEPS = [
  { value: 'select-hub', label: 'Select hub' },
  { value: 'review', label: 'Review' },
  { value: 'loading', label: 'Loading' },
] as const;

type Step = (typeof STEPS)[number]['value'];

const CHAINS = [ChainId.mainnet, ChainId.arbitrum_one, ChainId.base, ChainId.avalanche].map(
  (chainId) => ({ value: chainId, label: getNetworkConfig(chainId).name })
);

const chainChip = (chainId: ChainId) => (
  <span>
    <ChainIcon chainId={chainId} />
    <strong>{getNetworkConfig(chainId).name}</strong>
  </span>
);

const subheadingFor = (step: Step, chainId: ChainId): ReactNode => {
  switch (step) {
    case 'select-hub':
      return MIGRATE_FLOW.selectHubSubheading(chainChip(chainId));
    case 'review':
      return MIGRATE_FLOW.reviewSubheading(chainChip(chainId));
    case 'loading':
      return (
        <Skeleton variant="rectangular" width={370} height={17} sx={{ borderRadius: '0.5rem' }} />
      );
  }
};

const FlowHeaderDemo = () => {
  const [step, setStep] = useState<Step>('select-hub');
  const [chainId, setChainId] = useState<ChainId>(ChainId.mainnet);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem' }}>
        <PropControl label="Step" value={step} options={STEPS} onChange={setStep} />
        <PropControl label="Chain" value={chainId} options={CHAINS} onChange={setChainId} />
      </Box>
      <FlowHeader title={MIGRATE_FLOW.title} subheading={subheadingFor(step, chainId)} />
    </Box>
  );
};

const PositionSummaryDemo = () => {
  const [chainId, setChainId] = useState<ChainId>(ChainId.mainnet);
  const [loading, setLoading] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem' }}>
        <PropControl label="Chain" value={chainId} options={CHAINS} onChange={setChainId} />
        <PropControl label="Loading" value={loading} options={ON_OFF} onChange={setLoading} />
      </Box>
      <Box sx={{ maxWidth: COLUMN_WIDTH }}>
        <V4MigrationPositionSummary
          chainId={chainId}
          marketName="Lido"
          balanceUSD={10_900}
          apy={0.0047}
          apyAverage={0.0039}
          healthFactor="3.16"
          loading={loading}
        />
      </Box>
    </Box>
  );
};

const SearchDemo = () => {
  const [side, setSide] = useState<Side>('borrow');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <PropControl label="Side" value={side} options={SIDES} onChange={setSide} />
      <SearchInput
        key={side}
        size="large"
        placeholder={side === 'borrow' ? searchMarketsPlaceholder() : searchEarnHubsPlaceholder()}
        onSearchTermChange={() => undefined}
        wrapperSx={{ width: '100%', maxWidth: COLUMN_WIDTH }}
      />
    </Box>
  );
};

const POSITION_SUMMARY_PROPS: PropRow[] = [
  { name: 'chainId', type: 'ChainId', description: 'Chain badge on the market icon.' },
  {
    name: 'marketName',
    type: 'string',
    description:
      'The V3 market, after "V3 Protocol". A trailing "Market" is dropped and added back.',
  },
  { name: 'balanceUSD', type: 'number', description: 'Balance column, in compact USD.' },
  { name: 'apy', type: 'number', description: 'Position APY. A fraction: 0.0047 shows as 0.47%.' },
  { name: 'apyAverage', type: 'number', description: 'The "7D avg." line under the APY.' },
  {
    name: 'healthFactor',
    type: 'string',
    description: 'Health Factor column; the heart takes the health factor colour.',
  },
  {
    name: 'loading',
    type: 'boolean',
    description: 'Skeletons for the three values and the average.',
  },
];

export const MigrationFlowSection = () => (
  <Section
    title="Migration flow"
    description="Pieces for the migrate flow's pages, on mock data. FlowHeader animates its step line whenever the step text changes. The borrow side's hub page shows the position being moved (V4MigrationPositionSummary) between the header and the search."
  >
    <Specimen label="FlowHeader — switch the step or chain to see the step line animate" fullWidth>
      <FlowHeaderDemo />
    </Specimen>
    <Specimen label="V4MigrationPositionSummary — the borrow position being moved" fullWidth>
      <PositionSummaryDemo />
    </Specimen>
    <Specimen label="V4MigrationPositionSummary props" fullWidth>
      <PropsTable rows={POSITION_SUMMARY_PROPS} />
    </Specimen>
    <Specimen label="SearchInput — large, the hub or market list's search" fullWidth>
      <SearchDemo />
    </Specimen>
  </Section>
);
