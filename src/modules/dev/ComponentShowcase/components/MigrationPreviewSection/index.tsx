import { Box } from '@mui/material';
import { ReactNode, useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { Curator, CuratorNames } from 'src/components/CuratorBy';
import { DynamicCard } from 'src/components/DynamicCard';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { SelectTargetModal } from 'src/components/SelectTargetModal';
import {
  collateralExposureRow,
  HUB_PICKER,
  hubTitle,
  MARKET_PICKER,
  marketTitle,
  PREVIEW_ROWS,
  PREVIEW_TITLES,
  searchMarketsPlaceholder,
} from 'src/modules/v4Migration/utils/copy';
import {
  NumberChange,
  ValueChange,
} from 'src/modules/v4Migration/V4MigrationPage/components/ValueChange';
import {
  V4MigrationPreview,
  V4MigrationPreviewRow,
} from 'src/modules/v4Migration/V4MigrationPreview';
import { PositionName } from 'src/modules/v4Migration/V4MigrationPreview/components/PositionName';

import { collateralRow, pct, SENTORA, Side, SIDES, tokens, usd } from '../../utils/migrationMocks';
import { PlaygroundLayout, usePlaygroundOptions } from '../PlaygroundLayout';
import { ON_OFF, PropControl } from '../PropControl';
import { PropRow, PropsTable } from '../PropsTable';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

const EARN_WIDTH = '33rem';
const BORROW_WIDTH = '38.75rem';
const NARROW_WIDTH = '20rem';

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

const WIDTHS = [
  { value: 'figma', label: 'Figma' },
  { value: 'narrow', label: 'Narrow' },
] as const;

interface Options {
  side: Side;
  title: boolean;
  loading: boolean;
  width: (typeof WIDTHS)[number]['value'];
}

const change = (current: ReactNode, after: ReactNode) => (
  <ValueChange current={current} after={after} />
);

const pctChange = (current: number, after: number) => (
  <NumberChange value={{ current, after }} percent />
);

const usdChange = (current: number, after: number) => (
  <NumberChange value={{ current, after }} symbol="USD" />
);

const held = (
  symbol: string,
  [before, after, v4]: [number, number, number],
  decimals: [number, number, number]
): V4MigrationPreviewRow => ({
  id: symbol,
  v3: change(tokens(symbol, before, decimals[0]), tokens(symbol, after, decimals[1], true)),
  v4: tokens(symbol, v4, decimals[2], true),
});

const hf = (value: string) => (
  <HealthFactorNumber
    value={value}
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
      ...PREVIEW_ROWS.market,
      v3: marketTitle(earn ? 'Core' : 'V3 Lido'),
      v4: marketCell,
    },
    { id: 'curator', ...PREVIEW_ROWS.curator, v4: curator },
  ];

  const earnRows: V4MigrationPreviewRow[] = [
    {
      id: 'apy',
      ...PREVIEW_ROWS.earnApy,
      v3: pctChange(0.0025, 0),
      v4: pct(target.earnApy),
    },
    {
      id: 'earnings',
      ...PREVIEW_ROWS.earnEarnings,
      v3: usdChange(3, 0),
      v4: usd(target.earnings),
    },
    {
      id: 'exposure',
      ...collateralExposureRow(target.hubName),
      v3: <AssetGroup symbols={['WETH', 'wstETH']} size={20} />,
      v4: <AssetGroup symbols={['WETH', 'wstETH', 'weETH']} size={20} />,
    },
  ];

  const borrowRows: V4MigrationPreviewRow[] = [
    {
      id: 'netBalance',
      ...PREVIEW_ROWS.netBalance,
      v3: usdChange(1199.98, 899.99),
      v4: usd(300),
    },
    {
      id: 'positionApy',
      ...PREVIEW_ROWS.positionApy,
      v3: pctChange(0.0025, 0.0025),
      v4: pct(target.positionApy),
    },
    {
      id: 'earnings',
      ...PREVIEW_ROWS.borrowEarnings,
      v3: usdChange(3, 2.25),
      v4: usd(target.borrowEarnings),
    },
    {
      id: 'borrowingPower',
      ...PREVIEW_ROWS.borrowingPower,
      v3: usdChange(632.98, 474.74),
      v4: usd(158.49),
    },
    {
      id: 'collateralValue',
      ...PREVIEW_ROWS.collateralValue,
      v3: usdChange(2100, 1575),
      v4: usd(535),
    },
    {
      id: 'collateral',
      ...PREVIEW_ROWS.collateral,
      v3: <AssetGroup symbols={['WBTC', 'ETH']} size={20} />,
      v4: <AssetGroup symbols={['WBTC', 'ETH']} size={20} />,
      details: [
        held('WBTC', [0.0623, 0.0123, 0.04421], [4, 4, 5]),
        held('ETH', [0.0423, 0.0123, 0.0212], [4, 4, 4]),
      ],
    },
    {
      id: 'borrowedValue',
      ...PREVIEW_ROWS.borrowedValue,
      v3: usdChange(900.02, 675.02),
      v4: usd(225),
    },
    {
      id: 'borrowed',
      ...PREVIEW_ROWS.borrowed,
      v3: change(tokens('USDC', 150, 0), tokens('USDC', 100, 0, true)),
      v4: tokens('USDC', 37.5, 1, true),
    },
    {
      id: 'healthFactor',
      ...PREVIEW_ROWS.healthFactor,
      v3: change(hf('1.82'), hf('1.82')),
      v4: hf('1.82'),
    },
  ];

  return [
    ...shared,
    ...(earn ? earnRows : borrowRows).map((row) => ({
      ...row,
      loading,
      details: row.details?.map((item) => ({ ...item, loading })),
    })),
  ];
};

const hubOptions = (side: Side) =>
  HUBS.map((hub) => ({
    ...hub,
    kind: 'hub' as const,
    name: hubTitle(hub.hubName),
    apy: side === 'earn' ? hub.earnApy : hub.positionApy,
  }));

const HubPicker = ({
  side,
  open,
  setOpen,
  onSelect,
}: {
  side: Side;
  open: boolean;
  setOpen: (open: boolean) => void;
  onSelect: (hub: MockHub) => void;
}) => {
  const options = hubOptions(side);

  return (
    <SelectTargetModal
      open={open}
      setOpen={setOpen}
      title={HUB_PICKER.title}
      groups={[
        {
          label: side === 'earn' ? HUB_PICKER.earnHubs : HUB_PICKER.hubs,
          options: options.filter((option) => !option.disabled),
        },
        {
          label: HUB_PICKER.unavailableHubs,
          options: options.filter((option) => option.disabled),
        },
      ]}
      onSelect={(option) => {
        onSelect(option);
        setOpen(false);
      }}
    />
  );
};

const PreviewDemo = ({ options }: { options: Options }) => {
  const [target, setTarget] = useState(HUBS[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <>
      <V4MigrationPreview
        title={options.title ? PREVIEW_TITLES[options.side] : undefined}
        rows={rowsFor(
          options.side,
          target,
          <PositionName hubName={target.hubName} onClick={() => setPickerOpen(true)} />,
          options.loading
        )}
      />
      <HubPicker
        side={options.side}
        open={pickerOpen}
        setOpen={setPickerOpen}
        onSelect={setTarget}
      />
    </>
  );
};

const MIGRATING_SYMBOL = 'USDC';

interface MockMarket {
  id: string;
  marketName: string;
  hubName: string;
  curators: Curator[];
  apy: number;
  balanceUSD?: number;
  healthFactor?: string;
  collateralFactor: number;
  assets: string[];
  netBalance: number;
  positionApy: number;
  earnings: number;
  borrowingPower: { current?: number; after: number };
  collateralValue: number;
  healthFactorChange?: { current: string; after: string };
}

const MARKETS: MockMarket[] = [
  {
    id: 'main',
    marketName: 'Main',
    hubName: 'Core',
    curators: [SENTORA],
    apy: 0.0115,
    balanceUSD: 3230,
    healthFactor: '11.00',
    collateralFactor: 0.85,
    assets: ['USDT', 'FRAX', 'USDC'],
    netBalance: 300,
    positionApy: 0.0148,
    earnings: 14.44,
    borrowingPower: { current: 10, after: 158.49 },
    collateralValue: 535,
    healthFactorChange: { current: '6.11', after: '10.16' },
  },
  {
    id: 'bluechip',
    marketName: 'Bluechip',
    hubName: 'Prime',
    curators: [],
    apy: 0.0115,
    collateralFactor: 0.85,
    assets: ['USDT', 'FRAX', 'USDC'],
    netBalance: 100,
    positionApy: 0.0115,
    earnings: 1.15,
    borrowingPower: { after: 85 },
    collateralValue: 100,
  },
];

const marketOption = (market: MockMarket) => {
  const assets = <AssetGroup symbols={market.assets} size={20} animated={false} />;

  return {
    ...market,
    kind: 'market' as const,
    name: market.marketName,
    subtitle: market.healthFactor
      ? [
          market.hubName,
          <HealthFactorNumber key="hf" value={market.healthFactor} variant="h5" withHeart />,
          MARKET_PICKER.collateralFactor(market.collateralFactor),
          assets,
        ]
      : [
          market.hubName,
          MARKET_PICKER.collateralFactor(market.collateralFactor),
          <>
            {MARKET_PICKER.borrowable}
            {assets}
          </>,
        ],
    keywords: [market.marketName, market.hubName, `${market.marketName} ${market.hubName}`],
  };
};

const MARKET_OPTIONS = MARKETS.map(marketOption);

const MARKET_GROUPS = [
  {
    label: MARKET_PICKER.existingPositions,
    tooltip: MARKET_PICKER.existingPositionsTooltip(MIGRATING_SYMBOL),
    options: MARKET_OPTIONS.filter((option) => option.balanceUSD !== undefined),
  },
  {
    label: MARKET_PICKER.opportunities,
    tooltip: MARKET_PICKER.opportunitiesTooltip(MIGRATING_SYMBOL),
    options: MARKET_OPTIONS.filter((option) => option.balanceUSD === undefined),
  },
];

const collateralRowsFor = (market: MockMarket, marketCell: ReactNode): V4MigrationPreviewRow[] => {
  const { borrowingPower, healthFactorChange } = market;

  return [
    { id: 'market', ...PREVIEW_ROWS.market, v3: marketTitle('Core'), v4: marketCell },
    {
      id: 'curator',
      ...PREVIEW_ROWS.curator,
      v4: market.curators.length ? <CuratorNames curators={market.curators} /> : undefined,
    },
    { id: 'netBalance', ...PREVIEW_ROWS.netBalance, v4: usd(market.netBalance) },
    {
      id: 'positionApy',
      ...PREVIEW_ROWS.positionApy,
      v3: pctChange(0.0025, 0.0025),
      v4: pct(market.positionApy),
    },
    {
      id: 'earnings',
      ...PREVIEW_ROWS.borrowEarnings,
      v3: usdChange(3, 1.25),
      v4: usd(market.earnings),
    },
    {
      id: 'borrowingPower',
      ...PREVIEW_ROWS.borrowingPower,
      v4:
        borrowingPower.current === undefined
          ? usd(borrowingPower.after)
          : usdChange(borrowingPower.current, borrowingPower.after),
    },
    { id: 'collateralValue', ...PREVIEW_ROWS.collateralValue, v4: usd(market.collateralValue) },
    {
      id: 'exposure',
      ...collateralExposureRow(market.hubName),
      v3: <AssetGroup symbols={['WETH', 'wstETH']} size={20} />,
      v4: <AssetGroup symbols={['WETH', 'wstETH', 'weETH']} size={20} />,
    },
    {
      id: 'healthFactor',
      ...PREVIEW_ROWS.healthFactor,
      v3: hf('1.82'),
      v4: healthFactorChange
        ? change(hf(healthFactorChange.current), hf(healthFactorChange.after))
        : undefined,
    },
  ];
};

const STACK_SX = { display: 'flex', flexDirection: 'column', gap: '2rem' } as const;

const CollateralPreviewDemo = () => {
  const [useAsCollateral, setUseAsCollateral] = useState(true);
  const [market, setMarket] = useState<MockMarket | undefined>(MARKETS[0]);
  const [hub, setHub] = useState(HUBS[0]);
  const [hubPickerOpen, setHubPickerOpen] = useState(false);
  const [marketPickerOpen, setMarketPickerOpen] = useState(false);

  const toggleCollateral = (next: boolean) => {
    setUseAsCollateral(next);
    if (next) setMarketPickerOpen(true);
    else setMarket(undefined);
  };

  return (
    <Box sx={STACK_SX}>
      <DynamicCard>
        <DynamicCard.Inner>{collateralRow(useAsCollateral, toggleCollateral)}</DynamicCard.Inner>
      </DynamicCard>
      <V4MigrationPreview
        title={PREVIEW_TITLES.earn}
        rows={
          market
            ? collateralRowsFor(
                market,
                <PositionName
                  hubName={market.hubName}
                  marketName={market.marketName}
                  onClick={() => setMarketPickerOpen(true)}
                />
              )
            : rowsFor(
                'earn',
                hub,
                <PositionName hubName={hub.hubName} onClick={() => setHubPickerOpen(true)} />,
                false
              )
        }
      />
      <HubPicker side="earn" open={hubPickerOpen} setOpen={setHubPickerOpen} onSelect={setHub} />
      <SelectTargetModal
        open={marketPickerOpen}
        setOpen={(open) => {
          setMarketPickerOpen(open);
          if (!open && !market) setUseAsCollateral(false);
        }}
        title={MARKET_PICKER.title}
        searchPlaceholder={searchMarketsPlaceholder()}
        groups={MARKET_GROUPS}
        onSelect={(option) => {
          setMarket(option);
          setMarketPickerOpen(false);
        }}
      />
    </Box>
  );
};

const COLLATERAL_SNIPPET = [
  '<DescriptionItem',
  '  label={MIGRATE_AMOUNT.useAsCollateral.label}',
  '  labelTooltip={MIGRATE_AMOUNT.useAsCollateral.tooltip}',
  '  value={',
  '    <Switch',
  '      checked={useAsCollateral}',
  '      onChange={(_, on) => {',
  '        setUseAsCollateral(on);',
  '        if (on) setPickerOpen(true);',
  '        else setMarket(undefined);',
  '      }}',
  '    />',
  '  }',
  '/>',
  '',
  '<V4MigrationPreview',
  '  title={PREVIEW_TITLES.earn}',
  '  rows={[',
  "    { id: 'market', ...PREVIEW_ROWS.market, v3: marketTitle(v3Market),",
  '      v4: <PositionName hubName={market.hub} marketName={market.name} onClick={() => setPickerOpen(true)} /> },',
  '    { id: \'borrowingPower\', ...PREVIEW_ROWS.borrowingPower, v4: <NumberChange value={borrowingPower} symbol="USD" /> },',
  "    { id: 'healthFactor', ...PREVIEW_ROWS.healthFactor, v3: …, v4: <ValueChange … /> },",
  '    …',
  '  ]}',
  '/>',
  '',
  '<SelectTargetModal',
  '  open={pickerOpen}',
  '  setOpen={(open) => {',
  '    setPickerOpen(open);',
  '    if (!open && !market) setUseAsCollateral(false);',
  '  }}',
  '  title={MARKET_PICKER.title}',
  '  searchPlaceholder={searchMarketsPlaceholder()}',
  '  groups={[',
  '    { label: MARKET_PICKER.existingPositions, tooltip: MARKET_PICKER.existingPositionsTooltip(symbol), options: positions },',
  '    { label: MARKET_PICKER.opportunities, tooltip: MARKET_PICKER.opportunitiesTooltip(symbol), options: opportunities },',
  '  ]}',
  '  onSelect={(option) => {',
  '    setMarket(option);',
  '    setPickerOpen(false);',
  '  }}',
  '/>',
  '',
  '// one option',
  '{',
  "  id, kind: 'market', name: market.name, balanceUSD, apy,",
  '  subtitle: [hub, <HealthFactorNumber value={hf} variant="h5" withHeart />,',
  '    MARKET_PICKER.collateralFactor(cf), <AssetGroup symbols={assets} size={20} animated={false} />],',
  '  keywords: [market.name, hub, `${market.name} ${hub}`],',
  '}',
].join('\n');

const EARN_DESIGN: Options = {
  side: 'earn',
  title: true,
  loading: false,
  width: 'figma',
};

const BORROW_DESIGN: Options = { ...EARN_DESIGN, side: 'borrow' };

const widthFor = (options: Options) =>
  options.width === 'narrow' ? NARROW_WIDTH : options.side === 'earn' ? EARN_WIDTH : BORROW_WIDTH;

const SNIPPET_ROWS: Record<Side, string[]> = {
  earn: [
    "id: 'apy', ...PREVIEW_ROWS.earnApy, v3: <NumberChange value={apy} percent />, v4: …",
    "id: 'exposure', ...collateralExposureRow(hub.name), v3: <AssetGroup … />, v4: <AssetGroup … />",
  ],
  borrow: [
    'id: \'netBalance\', ...PREVIEW_ROWS.netBalance, v3: <NumberChange value={netBalance} symbol="USD" />, v4: …',
    'id: \'borrowingPower\', ...PREVIEW_ROWS.borrowingPower, v3: <NumberChange value={borrowingPower} symbol="USD" />, v4: …',
    "id: 'collateral', ...PREVIEW_ROWS.collateral, v3: <AssetGroup … />, v4: <AssetGroup … />, details: collateral.map((asset) => ({ id: asset.symbol, v3: <ValueChange … />, v4: … }))",
    "id: 'healthFactor', ...PREVIEW_ROWS.healthFactor, v3: …, v4: <HealthFactorNumber … />",
  ],
};

const snippetFor = (options: Options) => {
  const loading = options.loading ? ', loading' : '';

  return [
    '<V4MigrationPreview',
    ...(options.title ? [`  title={PREVIEW_TITLES.${options.side}}`] : []),
    '  rows={[',
    '    {',
    "      id: 'market',",
    '      ...PREVIEW_ROWS.market,',
    '      v3: v3MarketName,',
    '      v4: <PositionName hubName={hub.name} onClick={() => setPickerOpen(true)} />,',
    '    },',
    "    { id: 'curator', ...PREVIEW_ROWS.curator, v4: <CuratorNames curators={hub.curators} /> },",
    ...SNIPPET_ROWS[options.side].map((row) => `    { ${row}${loading} },`),
    '  ]}',
    '/>',
    '',
    '<SelectTargetModal',
    '  open={pickerOpen}',
    '  setOpen={setPickerOpen}',
    '  title={HUB_PICKER.title}',
    `  groups={[{ label: HUB_PICKER.${
      options.side === 'earn' ? 'earnHubs' : 'hubs'
    }, options: hubs }]}`,
    '  onSelect={(hub) => {',
    '    setHub(hub);',
    '    setPickerOpen(false);',
    '  }}',
    '/>',
  ].join('\n');
};

const Playground = () => {
  const [options, set] = usePlaygroundOptions(BORROW_DESIGN);

  return (
    <PlaygroundLayout
      controls={
        <>
          <PropControl label="Side" value={options.side} options={SIDES} onChange={set('side')} />
          <PropControl
            label="Title"
            value={options.title}
            options={ON_OFF}
            onChange={set('title')}
          />
          <PropControl
            label="Loading"
            value={options.loading}
            options={ON_OFF}
            onChange={set('loading')}
          />
          <PropControl
            label="Width"
            value={options.width}
            options={WIDTHS}
            onChange={set('width')}
          />
        </>
      }
      width={widthFor(options)}
      snippet={snippetFor(options)}
    >
      <PreviewDemo key={options.side} options={options} />
    </PlaygroundLayout>
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
    description:
      'The uppercase heading above the card: PREVIEW_TITLES.earn ("Migration preview") or PREVIEW_TITLES.borrow ("Position after migration").',
  },
];

const ROW_PROPS: PropRow[] = [
  { name: 'id', type: 'string', description: 'A stable key for the row.' },
  {
    name: 'label / tooltip',
    type: 'ReactNode',
    description:
      'The left-hand label in base fg-3. tooltip adds the ⓘ after it. Spread the translated pair from PREVIEW_ROWS (src/modules/v4Migration/utils/copy). Detail rows can leave the label out.',
  },
  {
    name: 'v3 / v4',
    type: 'ReactNode',
    description:
      'The two cells, right-aligned in h5 fg-1: text, a FormattedNumber with variant="inherit", a NumberChange for numbers (current → after) or a ValueChange for other cells, an AssetGroup, CuratorNames, PositionName… Leave one out for an fg-4 "—".',
  },
  {
    name: 'loading',
    type: 'boolean',
    description: 'Skeletons in place of both cells, e.g. while the V4 projection loads.',
  },
  {
    name: 'details',
    type: 'V4MigrationPreviewRow[]',
    description:
      'Makes the row expandable: a chevron appears to the left of every label, and clicking the row slides these rows in under it, on a tinted panel. Detail rows are 52px.',
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
      'Shows "{market} · {hub}" (e.g. "Main · Core") with the market icon instead, as the review screens and Aave Pro do. A trailing "Market" or "Hub" is dropped.',
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
  {
    name: 'title',
    type: 'ReactNode',
    description:
      'The heading, e.g. HUB_PICKER.title ("Choose Hub") or MARKET_PICKER.title ("Choose Borrow Market").',
  },
  {
    name: 'groups',
    type: '{ label, tooltip?, options }[]',
    description:
      'Labelled lists, top to bottom. tooltip adds the ⓘ after the label. Empty groups are skipped.',
  },
  {
    name: 'options[]',
    type: '{ id, kind, name, subtitle?, apy, balanceUSD?, disabled?, keywords? }',
    description:
      "kind is 'hub' or 'market' for the 44px icon. name over subtitle on the left; a subtitle array is joined by the 3px dot, 0.5rem apart (a fragment's children are spaced the same way). On the right \"x% APY\", or the compact balanceUSD over it when the user already has a position there. disabled fades the row to 50% and turns it off. keywords are what the search matches.",
  },
  {
    name: 'searchPlaceholder',
    type: 'string',
    description:
      'Adds the large search field under the title, e.g. searchMarketsPlaceholder(). No match shows "No Results Found".',
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
    description="The review step's V3 → V4 comparison card. Rows are generic: each takes a label, a tooltip and any two cells, so the earn and borrow cards are the same component. The hub button opens the hub picker modal, as Aave Pro's flows do. On the borrow card, click the Collateral row to expand it. With Use as Collateral on, the earn card shows the chosen market and its borrow rows; turning it on opens the market picker, and closing that without a pick turns it back off. Mock data only."
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
    <Specimen label="As designed — earn, used as collateral" fullWidth>
      <PlaygroundLayout width={EARN_WIDTH} snippet={COLLATERAL_SNIPPET}>
        <CollateralPreviewDemo />
      </PlaygroundLayout>
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
    <Specimen label="SelectTargetModal props — what the hub and market buttons open" fullWidth>
      <PropsTable rows={SELECT_TARGET_MODAL_PROPS} />
    </Specimen>
    <Specimen label="CuratorNames props" fullWidth>
      <PropsTable rows={CURATOR_NAMES_PROPS} />
    </Specimen>
  </Section>
);
