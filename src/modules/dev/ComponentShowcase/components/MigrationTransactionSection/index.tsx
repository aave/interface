import { ChainId } from '@aave/contract-helpers';
import { Box, Button } from '@mui/material';
import { ReactNode, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { ChainIcon } from 'src/components/ChainIcon';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { TitleWithSubtitle } from 'src/components/TitleWithSubtitle';
import {
  TransactionCard,
  TransactionCardProps,
  TransactionCardRow,
  TxStatus,
} from 'src/components/TransactionCard';
import {
  MIGRATION_TX_BUTTONS,
  MIGRATION_TX_ROWS,
  migrationTxTitle,
  SPONSORED_BY_AAVE,
} from 'src/modules/v4Migration/utils/copy';
import { endIconSizeSx } from 'src/utils/buttonStyles';

import { pct, Side, SIDES, tokens, usd } from '../../utils/migrationMocks';
import { PlaygroundLayout } from '../PlaygroundLayout';
import { PropControl } from '../PropControl';
import { PropRow, PropsTable } from '../PropsTable';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

const CARD_WIDTH = '33rem';

const STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'success', label: 'Success' },
  { value: 'error', label: 'Error' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
] as const;

const EXPLORER =
  'https://etherscan.io/tx/0x6a0f0a4f1c5e2a8d7b5c0e9f3b2d1a4c6e8f0b2d4c6a8e0f1b3d5c7e9a1b3d5c';

const done = (status: TxStatus) => status === 'success';

const earnRows = (status: TxStatus): TransactionCardRow[] => [
  {
    id: 'amount',
    ...(done(status) ? MIGRATION_TX_ROWS.migrated : MIGRATION_TX_ROWS.migrating),
    value: tokens('USDC', 425.5, 2, true),
  },
  {
    id: 'value',
    ...MIGRATION_TX_ROWS.value,
    value: usd(425.5),
  },
  ...(done(status) ? [] : [{ id: 'hub', ...MIGRATION_TX_ROWS.hub, value: 'Core' }]),
  {
    id: 'apy',
    ...MIGRATION_TX_ROWS.earnApy,
    value: pct(0.0426),
  },
];

const borrowRows = (status: TxStatus): TransactionCardRow[] => [
  {
    id: 'collateralValue',
    ...MIGRATION_TX_ROWS.collateralValue,
    value: usd(2100, true),
  },
  {
    id: 'collateral',
    ...MIGRATION_TX_ROWS.collateral,
    value: tokens('WBTC', 0.0534, 4, true),
  },
  {
    id: 'borrowedValue',
    ...MIGRATION_TX_ROWS.borrowedValue,
    value: usd(done(status) ? 900.02 : 150),
  },
  { id: 'borrow', ...MIGRATION_TX_ROWS.borrow, value: tokens('USDC', 150, 0, true) },
  {
    id: 'market',
    ...MIGRATION_TX_ROWS.market,
    value: (
      <>
        <ChainIcon chainId={ChainId.mainnet} size={20} />
        <TitleWithSubtitle title="Bluechip" subtitle="Core" />
      </>
    ),
  },
  {
    id: 'apy',
    ...MIGRATION_TX_ROWS.positionApy,
    value: pct(0.0041),
  },
];

const METADATA: Record<Side, TransactionCardRow[]> = {
  earn: [
    {
      id: 'date',
      ...MIGRATION_TX_ROWS.date,
      value: 'October 9, 2025, 2:29PM',
    },
    {
      id: 'fee',
      ...MIGRATION_TX_ROWS.networkFee,
      value: SPONSORED_BY_AAVE,
    },
    {
      id: 'block',
      ...MIGRATION_TX_ROWS.block,
      value: '12345',
    },
  ],
  borrow: [
    {
      id: 'transactions',
      ...MIGRATION_TX_ROWS.transactions,
      value: '1',
    },
    {
      id: 'fee',
      ...MIGRATION_TX_ROWS.networkFee,
      value: SPONSORED_BY_AAVE,
    },
  ],
};

const SUBJECT: Record<Side, string | undefined> = { earn: 'USDC', borrow: undefined };

const ICONS: Record<Side, ReactNode> = {
  earn: <TokenIcon symbol="USDC" sx={{ fontSize: '3.5rem' }} />,
  borrow: (
    <AssetGroup symbols={['WBTC', 'USDC']} size={56} overlap={23} cutoutGap={4} animated={false} />
  ),
};

const BUTTON_ROW_SX = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' } as const;

const VIEW_POSITION_SX = endIconSizeSx('1.125rem');

const footerFor = (status: TxStatus) =>
  done(status) ? (
    <Box sx={BUTTON_ROW_SX}>
      <Button variant="outlined" size="large">
        {MIGRATION_TX_BUTTONS.cancel}
      </Button>
      <Button
        variant="outlined"
        size="large"
        endIcon={<ArrowUpRightIcon sx={{ color: 'fg-chevron' }} />}
        sx={VIEW_POSITION_SX}
      >
        {MIGRATION_TX_BUTTONS.viewPosition}
      </Button>
    </Box>
  ) : (
    <Button variant="outlined" size="large" fullWidth>
      {status === 'error' ? MIGRATION_TX_BUTTONS.tryAgain : MIGRATION_TX_BUTTONS.close}
    </Button>
  );

const propsFor = (side: Side, status: TxStatus): TransactionCardProps => ({
  status,
  icon: ICONS[side],
  title: migrationTxTitle(status, SUBJECT[side]),
  rows: side === 'earn' ? earnRows(status) : borrowRows(status),
  metadata: done(status) ? METADATA[side] : undefined,
  explorerHref: EXPLORER,
  explorerLabel: 'Etherscan',
  footer: footerFor(status),
});

const snippetFor = (side: Side, status: TxStatus) =>
  [
    '<TransactionCard',
    `  status="${status}"`,
    side === 'earn'
      ? `  icon={<TokenIcon symbol="USDC" sx={{ fontSize: '3.5rem' }} />}`
      : `  icon={<AssetGroup symbols={['WBTC', 'USDC']} size={56} overlap={23} cutoutGap={4} />}`,
    `  title={migrationTxTitle('${status}'${side === 'earn' ? ", 'USDC'" : ''})}`,
    '  rows={[',
    `    { id: 'amount', ...MIGRATION_TX_ROWS.${
      done(status) ? 'migrated' : 'migrating'
    }, value: <>{icon}{amount}</> },`,
    "    { id: 'value', ...MIGRATION_TX_ROWS.value, value: <FormattedNumber … /> },",
    '    …',
    '  ]}',
    ...(done(status)
      ? [
          '  metadata={[',
          "    { id: 'fee', ...MIGRATION_TX_ROWS.networkFee, value: SPONSORED_BY_AAVE },",
          '    …',
          '  ]}',
        ]
      : []),
    '  explorerHref={explorerUrl}',
    '  explorerLabel="Etherscan"',
    '  footer={buttons}',
    '/>',
  ].join('\n');

const Playground = () => {
  const [side, setSide] = useState<Side>('earn');
  const [status, setStatus] = useState<TxStatus>('pending');
  const [replay, setReplay] = useState(0);

  return (
    <PlaygroundLayout
      controls={
        <>
          <PropControl label="Side" value={side} options={SIDES} onChange={setSide} />
          <PropControl label="Status" value={status} options={STATUSES} onChange={setStatus} />
          <Button
            variant="outlined"
            onClick={() => {
              setStatus('pending');
              setReplay((current) => current + 1);
            }}
          >
            Replay pending
          </Button>
        </>
      }
      width={CARD_WIDTH}
      snippet={snippetFor(side, status)}
    >
      <TransactionCard key={`${side}-${replay}`} {...propsFor(side, status)} />
    </PlaygroundLayout>
  );
};

const DesignedPair = ({ side }: { side: Side }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${CARD_WIDTH}), ${CARD_WIDTH}))`,
      gap: '2rem',
      width: '100%',
    }}
  >
    <TransactionCard {...propsFor(side, 'pending')} />
    <TransactionCard {...propsFor(side, 'success')} />
  </Box>
);

const CARD_PROPS: PropRow[] = [
  {
    name: 'status',
    type: "'pending' | 'success' | 'error' | 'cancelled' | 'expired'",
    description:
      'Drives the bar, the status icon and its colour. Pending fills to 57% with the glow, smoke and particles; the others fill to 100% and settle. Pending → success or error flashes the bar.',
  },
  {
    name: 'icon / title',
    type: 'ReactNode',
    description:
      'The hero: e.g. a 3.5rem TokenIcon, or an AssetGroup of two 56px icons. The title is h2; it shimmers while pending.',
  },
  {
    name: 'rows',
    type: 'TransactionCardRow[]',
    description: 'The detail rows under the hero (DescriptionItem rows). Fields below.',
  },
  {
    name: 'metadata',
    type: 'TransactionCardRow[]',
    description:
      'Rows for the grey band at the bottom (transaction date, network fee, block…), in fg-2. Pass them once the transaction succeeds; the card grows to fit.',
  },
  {
    name: 'explorerHref / explorerLabel',
    type: 'string / ReactNode',
    description:
      'The link at the top right, opened in a new tab, e.g. "Etherscan". The label defaults to "Explorer". No link without explorerHref.',
  },
  {
    name: 'footer',
    type: 'ReactNode',
    description: 'Shown 2rem under the card, e.g. the Close or Cancel / View Position buttons.',
  },
];

const ROW_PROPS: PropRow[] = [
  { name: 'id', type: 'string', description: 'A stable key for the row.' },
  {
    name: 'label / tooltip',
    type: 'ReactNode',
    description: 'The left-hand label in base fg-3. tooltip adds the ⓘ after it.',
  },
  {
    name: 'value',
    type: 'ReactNode',
    description:
      'The right-hand value in h5: text, a FormattedNumber with variant="inherit", an icon next to an amount (0.5rem apart)… Leave it out for "—".',
  },
  { name: 'loading', type: 'boolean', description: 'A skeleton in place of the value.' },
];

export const MigrationTransactionSection = () => (
  <Section
    title="Migration transaction"
    description="The migration's final transaction card, ported from Aave Pro's TransactionCard with its animated status bar. Rows are generic, like the preview card's. Mock data only; the error, cancelled and expired titles and the Transactions tooltip are placeholder copy."
  >
    <Specimen label="Playground — switch the status to watch the card change" fullWidth>
      <Playground />
    </Specimen>
    <Specimen label="As designed — earn, pending and success" fullWidth>
      <DesignedPair side="earn" />
    </Specimen>
    <Specimen label="As designed — borrow, pending and success" fullWidth>
      <DesignedPair side="borrow" />
    </Specimen>
    <Specimen label="TransactionCard props" fullWidth>
      <PropsTable rows={CARD_PROPS} />
    </Specimen>
    <Specimen label="Row fields (rows and metadata)" fullWidth>
      <PropsTable rows={ROW_PROPS} />
    </Specimen>
  </Section>
);
