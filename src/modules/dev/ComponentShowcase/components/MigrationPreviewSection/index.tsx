import { Box } from '@mui/material';
import { ReactNode, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { Curator, CuratorNames } from 'src/components/CuratorBy';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SelectTargetModal } from 'src/components/SelectTargetModal';
import { ValueChange } from 'src/modules/v4Migration/V4MigrationPage/components/ValueChange';
import {
  V4MigrationPreview,
  V4MigrationPreviewRow,
} from 'src/modules/v4Migration/V4MigrationPreview';
import { PositionName } from 'src/modules/v4Migration/V4MigrationPreview/components/PositionName';

import { CodeSnippet } from '../CodeSnippet';
import { ON_OFF, PropControl } from '../PropControl';
import { PropRow, PropsTable } from '../PropsTable';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

const EARN_WIDTH = '33rem';
const BORROW_WIDTH = '38.75rem';
const NARROW_WIDTH = '20rem';

const SENTORA: Curator = {
  name: 'Sentora',
  icon: '/icons/curators/sentora.webp',
  tooltip: 'Curator details (placeholder until the copy is designed)',
};

interface MockHub {
  id: string;
  hubName: string;
  curators: Curator[];
  earnApy: number;
  earnings: number;
  positionApy: number;
  borrowEarnings: number;
  disabled?: boolean;
}

const HUBS: MockHub[] = [
  {
    id: 'core',
    hubName: 'Core',
    curators: [SENTORA],
    earnApy: 0.0348,
    earnings: 14.44,
    positionApy: 0.0148,
    borrowEarnings: 4.44,
  },
  {
    id: 'prime',
    hubName: 'Prime',
    curators: [],
    earnApy: 0.0412,
    earnings: 17.1,
    positionApy: 0.0175,
    borrowEarnings: 5.25,
  },
  {
    id: 'plus',
    hubName: 'Plus',
    curators: [],
    earnApy: 0.0295,
    earnings: 12.24,
    positionApy: 0.0126,
    borrowEarnings: 3.78,
    disabled: true,
  },
];

const SIDES = [
  { value: 'earn', label: 'Earn' },
  { value: 'borrow', label: 'Borrow' },
] as const;

const WIDTHS = [
  { value: 'figma', label: 'Figma' },
  { value: 'narrow', label: 'Narrow' },
] as const;

type Side = (typeof SIDES)[number]['value'];

interface Options {
  side: Side;
  title: boolean;
  loading: boolean;
  width: (typeof WIDTHS)[number]['value'];
}

const TOOLTIPS = {
  market: 'The market where your assets are deposited and your position is managed',
  curator: 'An external party that manages the risk and assets of one or more hubs and markets',
  earnApy: 'Current annualized rate earned on deposits',
  earnEarnings: 'Interest your deposits earn over a year at the current APY',
  netBalance: 'Total value of your supplied assets minus your outstanding debt',
  positionApy:
    'Your annualized return for this position after combining deposit yield and borrow costs',
  borrowEarnings: 'Estimated annual earnings based on your current position and market conditions',
  borrowingPower:
    'Amount you can still borrow before your position becomes eligible for liquidation',
  collateralValue:
    'The value of your deposits that counts as collateral for borrowing. This is determined by each asset’s collateral factor',
  collateral: 'Collateral currently supporting your borrows',
  borrowedValue: 'Total value you have borrowed for this asset',
  borrowed: 'Amount you have borrowed in this position',
  healthFactor:
    'A ratio of your total collateral value to total debt. Below 1.0, your position can be liquidated.',
};

const usd = (value: number) => <FormattedNumber value={value} symbol="USD" variant="inherit" />;
const pct = (value: number) => <FormattedNumber value={value} percent variant="inherit" />;
const change = (current: ReactNode, after: ReactNode) => (
  <ValueChange current={current} after={after} />
);

const tokens = (amount: number, decimals: number, icon?: boolean) => (
  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
    {icon ? <TokenIcon symbol="USDC" sx={{ fontSize: '1.25rem' }} /> : null}
    <FormattedNumber value={amount} visibleDecimals={decimals} symbol="USDC" variant="inherit" />
  </Box>
);

const healthFactor = (
  <HealthFactorNumber
    value="1.82"
    variant="inherit"
    withHeart
    heartGap="0.375rem"
    sx={{ color: 'inherit' }}
  />
);

const rowsFor = (side: Side, target: MockHub, marketCell: ReactNode, loading: boolean) => {
  const earn = side === 'earn';
  const curator = target.curators.length ? <CuratorNames curators={target.curators} /> : undefined;

  const shared: V4MigrationPreviewRow[] = [
    {
      id: 'market',
      label: 'Market',
      tooltip: TOOLTIPS.market,
      v3: earn ? 'Core Market' : 'V3 Lido Market',
      v4: marketCell,
    },
    { id: 'curator', label: 'Curator', tooltip: TOOLTIPS.curator, v4: curator },
  ];

  const earnRows: V4MigrationPreviewRow[] = [
    {
      id: 'apy',
      label: 'Earn APY',
      tooltip: TOOLTIPS.earnApy,
      v3: change(pct(0.0025), pct(0)),
      v4: pct(target.earnApy),
    },
    {
      id: 'earnings',
      label: 'Est. Annual earnings',
      tooltip: TOOLTIPS.earnEarnings,
      v3: change(usd(3), usd(0)),
      v4: usd(target.earnings),
    },
    {
      id: 'exposure',
      label: 'Collateral Exposure',
      tooltip: `Assets that share liquidity and risk within the ${target.hubName} Hub`,
      v3: <AssetGroup symbols={['WETH', 'wstETH']} size={20} />,
      v4: <AssetGroup symbols={['WETH', 'wstETH', 'weETH']} size={20} />,
    },
  ];

  const borrowRows: V4MigrationPreviewRow[] = [
    {
      id: 'netBalance',
      label: 'Net balance',
      tooltip: TOOLTIPS.netBalance,
      v3: change(usd(1199.98), usd(899.99)),
      v4: usd(300),
    },
    {
      id: 'positionApy',
      label: 'Position APY',
      tooltip: TOOLTIPS.positionApy,
      v3: change(pct(0.0025), pct(0.0025)),
      v4: pct(target.positionApy),
    },
    {
      id: 'earnings',
      label: 'Est. Annual earnings',
      tooltip: TOOLTIPS.borrowEarnings,
      v3: change(usd(3), usd(2.25)),
      v4: usd(target.borrowEarnings),
    },
    {
      id: 'borrowingPower',
      label: 'Borrowing power',
      tooltip: TOOLTIPS.borrowingPower,
      v3: change(usd(632.98), usd(474.74)),
      v4: usd(158.49),
    },
    {
      id: 'collateralValue',
      label: 'Collateral value',
      tooltip: TOOLTIPS.collateralValue,
      v3: change(usd(2100), usd(1575)),
      v4: usd(535),
    },
    {
      id: 'collateral',
      label: 'Collateral',
      tooltip: TOOLTIPS.collateral,
      v3: <AssetGroup symbols={['WBTC', 'WETH']} size={20} />,
      v4: <AssetGroup symbols={['WBTC', 'WETH']} size={20} />,
    },
    {
      id: 'borrowedValue',
      label: 'Borrowed value',
      tooltip: TOOLTIPS.borrowedValue,
      v3: change(usd(900.02), usd(675.02)),
      v4: usd(225),
    },
    {
      id: 'borrowed',
      label: 'Borrowed',
      tooltip: TOOLTIPS.borrowed,
      v3: change(tokens(150, 0), tokens(100, 0, true)),
      v4: tokens(37.5, 1, true),
    },
    {
      id: 'healthFactor',
      label: 'Health factor',
      tooltip: TOOLTIPS.healthFactor,
      v3: change(healthFactor, healthFactor),
      v4: healthFactor,
    },
  ];

  return [...shared, ...(earn ? earnRows : borrowRows).map((row) => ({ ...row, loading }))];
};

const PreviewDemo = ({ options }: { options: Options }) => {
  const [target, setTarget] = useState(HUBS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const earn = options.side === 'earn';
  const pickable = HUBS.map((hub) => ({
    ...hub,
    kind: 'hub' as const,
    name: `${hub.hubName} Hub`,
    apy: earn ? hub.earnApy : hub.positionApy,
  }));

  return (
    <>
      <V4MigrationPreview
        title={options.title ? 'Position after migration' : undefined}
        rows={rowsFor(
          options.side,
          target,
          <PositionName hubName={target.hubName} onClick={() => setPickerOpen(true)} />,
          options.loading
        )}
      />
      <SelectTargetModal
        open={pickerOpen}
        setOpen={setPickerOpen}
        title="Choose Hub"
        groups={[
          {
            label: earn ? 'Earn Hubs' : 'Hubs',
            options: pickable.filter((option) => !option.disabled),
          },
          {
            label: 'Unavailable Hubs',
            options: pickable.filter((option) => option.disabled),
          },
        ]}
        onSelect={(option) => {
          setTarget(option);
          setPickerOpen(false);
        }}
      />
    </>
  );
};

const EARN_DESIGN: Options = {
  side: 'earn',
  title: false,
  loading: false,
  width: 'figma',
};

const BORROW_DESIGN: Options = { ...EARN_DESIGN, side: 'borrow', title: true };

const widthFor = (options: Options) =>
  options.width === 'narrow' ? NARROW_WIDTH : options.side === 'earn' ? EARN_WIDTH : BORROW_WIDTH;

const SNIPPET_ROWS: Record<Side, string[]> = {
  earn: [
    "id: 'apy', label: 'Earn APY', tooltip, v3: <ValueChange current={…} after={…} />, v4: apy",
    "id: 'exposure', label: 'Collateral Exposure', tooltip, v3: <AssetGroup … />, v4: <AssetGroup … />",
  ],
  borrow: [
    "id: 'netBalance', label: 'Net balance', tooltip, v3: <ValueChange … />, v4: netBalance",
    "id: 'borrowingPower', label: 'Borrowing power', tooltip, v3: <ValueChange … />, v4: borrowingPower",
    "id: 'healthFactor', label: 'Health factor', tooltip, v3: …, v4: <HealthFactorNumber … />",
  ],
};

const snippetFor = (options: Options) => {
  const loading = options.loading ? ', loading' : '';

  return [
    '<V4MigrationPreview',
    ...(options.title ? ['  title="Position after migration"'] : []),
    '  rows={[',
    '    {',
    "      id: 'market',",
    "      label: 'Market',",
    '      tooltip: marketTooltip,',
    '      v3: v3MarketName,',
    '      v4: <PositionName hubName={hub.name} onClick={() => setPickerOpen(true)} />,',
    '    },',
    "    { id: 'curator', label: 'Curator', tooltip, v4: <CuratorNames curators={hub.curators} /> },",
    ...SNIPPET_ROWS[options.side].map((row) => `    { ${row}${loading} },`),
    '  ]}',
    '/>',
    '',
    '<SelectTargetModal',
    '  open={pickerOpen}',
    '  setOpen={setPickerOpen}',
    '  title="Choose Hub"',
    `  groups={[{ label: '${options.side === 'earn' ? 'Earn Hubs' : 'Hubs'}', options: hubs }]}`,
    '  onSelect={(hub) => {',
    '    setHub(hub);',
    '    setPickerOpen(false);',
    '  }}',
    '/>',
  ].join('\n');
};

const Playground = () => {
  const [options, setOptions] = useState(BORROW_DESIGN);
  const width = widthFor(options);
  const set =
    <K extends keyof Options>(key: K) =>
    (value: Options[K]) =>
      setOptions((current) => ({ ...current, [key]: value }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '1rem 2rem' }}>
        <PropControl label="Side" value={options.side} options={SIDES} onChange={set('side')} />
        <PropControl label="Title" value={options.title} options={ON_OFF} onChange={set('title')} />
        <PropControl
          label="Loading"
          value={options.loading}
          options={ON_OFF}
          onChange={set('loading')}
        />
        <PropControl label="Width" value={options.width} options={WIDTHS} onChange={set('width')} />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1.5rem' }}>
        <Box sx={{ flex: `1 1 ${width}`, maxWidth: width, minWidth: 0 }}>
          <PreviewDemo key={options.side} options={options} />
        </Box>
        <CodeSnippet>{snippetFor(options)}</CodeSnippet>
      </Box>
    </Box>
  );
};

const PREVIEW_PROPS: PropRow[] = [
  {
    name: 'rows',
    type: 'V4MigrationPreviewRow[]',
    description:
      'The rows under the V3 | V4 header, in order. Fields below. The card scrolls sideways when it is narrower than its content.',
  },
  {
    name: 'title',
    type: 'ReactNode',
    description: 'The uppercase heading above the card, e.g. "Position after migration".',
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
    name: 'v3 / v4',
    type: 'ReactNode',
    description:
      'The two cells, right-aligned in h5 fg-1: text, a FormattedNumber with variant="inherit", a ValueChange (current → after), an AssetGroup, CuratorNames, PositionName… Leave one out for an fg-4 "—".',
  },
  {
    name: 'loading',
    type: 'boolean',
    description: 'Skeletons in place of both cells, e.g. while the V4 projection loads.',
  },
];

const POSITION_NAME_PROPS: PropRow[] = [
  {
    name: 'hubName',
    type: 'string',
    description: 'The hub, with the hub icon. "Core" and "Core Hub" both show "Core Hub".',
  },
  {
    name: 'marketName',
    type: 'string',
    description:
      'Shows "{market} Market · {hub} Hub" with the market icon instead, as Aave Pro does for markets.',
  },
  {
    name: 'onClick',
    type: '() => void',
    description:
      'Makes it the small button with the ⇕ chevron, as in the Market row. Open SelectTargetModal here.',
  },
];

const SELECT_TARGET_MODAL_PROPS: PropRow[] = [
  {
    name: 'open / setOpen',
    type: 'boolean / (open: boolean) => void',
    description: "The modal's state, as for BasicModal. Closing calls setOpen(false).",
  },
  { name: 'title', type: 'ReactNode', description: 'The heading, e.g. "Choose Hub".' },
  {
    name: 'groups',
    type: '{ label, options }[]',
    description: 'Labelled lists, top to bottom. Empty groups are skipped.',
  },
  {
    name: 'options[]',
    type: '{ id, kind, name, subtitle?, apy, balanceUSD?, disabled? }',
    description:
      "kind is 'hub' or 'market' for the 44px icon. name over subtitle on the left; on the right the APY, or balanceUSD over the APY when the user already has a position there. disabled fades the row to 50% and turns it off.",
  },
  {
    name: 'onSelect',
    type: '(option) => void',
    description: 'Called with the picked option (your own object back). Close the modal here.',
  },
];

const CURATOR_NAMES_PROPS: PropRow[] = [
  {
    name: 'curators',
    type: '{ name, icon, tooltip? }[]',
    description:
      'The curator logo and name, without "by" (CuratorBy adds it). A tooltip adds the dotted underline.',
  },
];

export const MigrationPreviewSection = () => (
  <Section
    title="Migration preview"
    description="The review step's V3 → V4 comparison card. Rows are generic: each takes a label, a tooltip and any two cells, so the earn and borrow cards are the same component. The hub button opens the hub picker modal, as Aave Pro's flows do. Mock data only."
  >
    <Specimen label="As designed — earn" fullWidth>
      <Box sx={{ width: '100%', maxWidth: EARN_WIDTH }}>
        <PreviewDemo options={EARN_DESIGN} />
      </Box>
    </Specimen>
    <Specimen label="As designed — borrow" fullWidth>
      <Box sx={{ width: '100%', maxWidth: BORROW_WIDTH }}>
        <PreviewDemo options={BORROW_DESIGN} />
      </Box>
    </Specimen>
    <Specimen label="Playground — the snippet follows your choices" fullWidth>
      <Playground />
    </Specimen>
    <Specimen label="V4MigrationPreview props" fullWidth>
      <PropsTable rows={PREVIEW_PROPS} />
    </Specimen>
    <Specimen label="Row fields" fullWidth>
      <PropsTable rows={ROW_PROPS} />
    </Specimen>
    <Specimen label="PositionName props — the Market row's hub button" fullWidth>
      <PropsTable rows={POSITION_NAME_PROPS} />
    </Specimen>
    <Specimen label="SelectTargetModal props — what the hub button opens" fullWidth>
      <PropsTable rows={SELECT_TARGET_MODAL_PROPS} />
    </Specimen>
    <Specimen label="CuratorNames props" fullWidth>
      <PropsTable rows={CURATOR_NAMES_PROPS} />
    </Specimen>
  </Section>
);
