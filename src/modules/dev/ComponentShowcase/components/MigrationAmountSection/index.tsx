import { Box } from '@mui/material';
import { BigNumber } from 'bignumber.js';
import { useState } from 'react';
import { AssetGroup } from 'src/components/AssetGroup';
import { DynamicCard } from 'src/components/DynamicCard';
import { DescriptionItem } from 'src/components/DynamicCard/DescriptionItem';
import { InputRange } from 'src/components/InputRange';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SelectAssetModal } from 'src/components/SelectAssetModal';
import { TokenAmountInput } from 'src/components/TokenAmountInput';
import { MIGRATE_AMOUNT } from 'src/modules/v4Migration/utils/copy';

import { collateralRow, pct, usd } from '../../utils/migrationMocks';
import { PlaygroundLayout, usePlaygroundOptions } from '../PlaygroundLayout';
import { ON_OFF, PropControl } from '../PropControl';
import { PropRow, PropsTable } from '../PropsTable';
import { Section } from '../Section';
import { Specimen } from '../Specimen';

const COLUMN_WIDTH = '33.5rem';
const BORROW_COLUMN_WIDTH = '38.75rem';

interface MockToken {
  symbol: string;
  name: string;
  decimals: number;
  priceUSD: number;
  available: BigNumber;
}

const TOKENS: MockToken[] = [
  { symbol: 'USDC', name: 'USD Coin', decimals: 6, priceUSD: 1, available: new BigNumber(200) },
  { symbol: 'USDT', name: 'Tether', decimals: 6, priceUSD: 1, available: new BigNumber(150) },
  {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    priceUSD: 1,
    available: new BigNumber(320.5),
  },
  {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    priceUSD: 3500,
    available: new BigNumber(1.25),
  },
];

const PICKER_ASSETS = TOKENS.map((token) => ({
  ...token,
  balance: token.available.toString(),
  balanceUSD: token.available.times(token.priceUSD).toNumber(),
}));

const EARN_APY = 0.0348;
const CURRENT_APY = 0.021;

const CollateralRow = () => {
  const [checked, setChecked] = useState(false);

  return collateralRow(checked, setChecked);
};

const lines = (props: (string | false)[]) =>
  props.filter((prop): prop is string => !!prop).map((prop) => `      ${prop}`);

const STATES = [
  { value: 'default', label: 'Default' },
  { value: 'loading', label: 'Loading' },
  { value: 'disabled', label: 'Disabled' },
] as const;

interface Options {
  state: (typeof STATES)[number]['value'];
  tokenPicker: boolean;
  fiat: boolean;
  max: boolean;
  apyChange: boolean;
  updating: boolean;
  collateralRow: boolean;
}

const DEFAULT_OPTIONS: Options = {
  state: 'default',
  tokenPicker: true,
  fiat: true,
  max: true,
  apyChange: false,
  updating: false,
  collateralRow: false,
};

const TOGGLES = [
  ['tokenPicker', 'Token picker'],
  ['fiat', 'USD value'],
  ['max', 'Max'],
  ['apyChange', 'APY change'],
  ['updating', 'Updating'],
  ['collateralRow', 'Collateral row'],
] as const;

const snippetFor = (options: Options) => {
  const loading = options.state === 'loading';

  return [
    '<DynamicCard>',
    '  <DynamicCard.Inner>',
    '    <TokenAmountInput',
    ...lines([
      'title={MIGRATE_AMOUNT.title}',
      'label={MIGRATE_AMOUNT.availableToMigrate}',
      'value={amount}',
      'onValueChange={setAmount}',
      'token={token}',
      options.tokenPicker && 'onChangeToken={() => setPickerOpen(true)}',
      'fiatRate={usdPrice}',
      !options.fiat && 'hideFiat',
      options.max && 'max={availableToMigrate}',
      loading && 'isLoading',
      options.state === 'disabled' && 'disabled',
    ]),
    '    />',
    '    <DynamicCard.Divider />',
    '    <DescriptionItem',
    ...lines([
      'label={MIGRATE_AMOUNT.earnApy.label}',
      'labelTooltip={MIGRATE_AMOUNT.earnApy.tooltip}',
      'value={apy}',
      options.apyChange && 'prevValue={currentApy}',
      loading && 'isLoading',
      options.updating && 'isUpdating',
    ]),
    '    />',
    ...(options.collateralRow
      ? [
          '    <DescriptionItem',
          ...lines([
            'label={MIGRATE_AMOUNT.useAsCollateral.label}',
            'labelTooltip={MIGRATE_AMOUNT.useAsCollateral.tooltip}',
            'value={<Switch checked={useAsCollateral} onChange={toggleCollateral} />}',
          ]),
          '    />',
        ]
      : []),
    '  </DynamicCard.Inner>',
    '</DynamicCard>',
    ...(options.tokenPicker
      ? [
          '',
          '<SelectAssetModal',
          '  open={pickerOpen}',
          '  setOpen={setPickerOpen}',
          '  title={MIGRATE_AMOUNT.chooseAsset}',
          '  supportedLabel={MIGRATE_AMOUNT.availableToMigrate}',
          '  supportedAssets={migratableAssets}',
          '  onSelect={(asset) => {',
          '    setToken(asset);',
          '    setPickerOpen(false);',
          '  }}',
          '/>',
        ]
      : []),
  ].join('\n');
};

const AmountCard = ({ options }: { options: Options }) => {
  const [token, setToken] = useState(TOKENS[0]);
  const [amount, setAmount] = useState<BigNumber | null>(new BigNumber(100));
  const [pickerOpen, setPickerOpen] = useState(false);
  const loading = options.state === 'loading';
  const changeToken = (next: MockToken) => {
    setPickerOpen(false);
    if (next.symbol === token.symbol) return;
    setToken(next);
    setAmount(null);
  };

  return (
    <>
      <DynamicCard>
        <DynamicCard.Inner>
          <TokenAmountInput
            title={MIGRATE_AMOUNT.title}
            label={MIGRATE_AMOUNT.availableToMigrate}
            value={amount}
            onValueChange={setAmount}
            token={token}
            onChangeToken={options.tokenPicker ? () => setPickerOpen(true) : undefined}
            fiatRate={token.priceUSD}
            hideFiat={!options.fiat}
            max={options.max ? token.available : undefined}
            isLoading={loading}
            disabled={options.state === 'disabled'}
            autoFocus={false}
          />
          <DynamicCard.Divider />
          <DescriptionItem
            label={MIGRATE_AMOUNT.earnApy.label}
            labelTooltip={MIGRATE_AMOUNT.earnApy.tooltip}
            value={pct(EARN_APY)}
            prevValue={options.apyChange ? pct(CURRENT_APY) : undefined}
            isLoading={loading}
            isUpdating={options.updating}
          />
          {options.collateralRow && <CollateralRow />}
        </DynamicCard.Inner>
      </DynamicCard>
      <SelectAssetModal
        open={pickerOpen}
        setOpen={setPickerOpen}
        title={MIGRATE_AMOUNT.chooseAsset}
        supportedLabel={MIGRATE_AMOUNT.availableToMigrate}
        supportedAssets={PICKER_ASSETS}
        onSelect={changeToken}
      />
    </>
  );
};

const Playground = () => {
  const [options, set] = usePlaygroundOptions(DEFAULT_OPTIONS);

  return (
    <PlaygroundLayout
      controls={
        <>
          <PropControl
            label="State"
            value={options.state}
            options={STATES}
            onChange={set('state')}
          />
          {TOGGLES.map(([key, label]) => (
            <PropControl
              key={key}
              label={label}
              value={options[key]}
              options={ON_OFF}
              onChange={set(key)}
            />
          ))}
        </>
      }
      width={COLUMN_WIDTH}
      snippet={snippetFor(options)}
    >
      <AmountCard options={options} />
    </PlaygroundLayout>
  );
};

const STOPS = [0, 25, 50, 75, 100];

const BORROW_POSITION = {
  collateral: ['WBTC', 'WETH'],
  collateralUSD: 2100,
  borrowed: 'USDC',
  borrowUSD: 900,
};

const borrowSnippetFor = (disabled: boolean, stops: boolean) =>
  [
    '<DynamicCard>',
    '  <DynamicCard.Inner>',
    '    <InputRange',
    ...lines([
      'label={MIGRATE_AMOUNT.migrateAmount.label}',
      'tooltip={MIGRATE_AMOUNT.migrateAmount.tooltip}',
      'value={percent}',
      'onValueChange={setPercent}',
      stops && `stops={[${STOPS.join(', ')}]}`,
      'unit="%"',
      disabled && 'disabled',
    ]),
    '    />',
    '    <DynamicCard.Divider />',
    '    <DescriptionItem',
    '      label={MIGRATE_AMOUNT.collateralMoving.label}',
    '      labelTooltip={MIGRATE_AMOUNT.collateralMoving.tooltip}',
    '      value={',
    '        <>',
    '          <AssetGroup symbols={collateralSymbols} size={20} />',
    '          <FormattedNumber value={collateralUSD * share} symbol="USD" variant="inherit" />',
    '        </>',
    '      }',
    '    />',
    '    <DescriptionItem label={MIGRATE_AMOUNT.borrowMoving.label} labelTooltip={MIGRATE_AMOUNT.borrowMoving.tooltip} value={…} />',
    '    <DescriptionItem label={MIGRATE_AMOUNT.netMoving.label} labelTooltip={MIGRATE_AMOUNT.netMoving.tooltip} value={…} />',
    '  </DynamicCard.Inner>',
    '</DynamicCard>',
  ].join('\n');

const BorrowSide = () => {
  const [disabled, setDisabled] = useState(false);
  const [stops, setStops] = useState(true);
  const [percent, setPercent] = useState(25);
  const share = percent / 100;
  const { collateral, collateralUSD, borrowed, borrowUSD } = BORROW_POSITION;

  return (
    <PlaygroundLayout
      controls={
        <>
          <PropControl label="Disabled" value={disabled} options={ON_OFF} onChange={setDisabled} />
          <PropControl label="Stops" value={stops} options={ON_OFF} onChange={setStops} />
        </>
      }
      width={BORROW_COLUMN_WIDTH}
      snippet={borrowSnippetFor(disabled, stops)}
    >
      <DynamicCard>
        <DynamicCard.Inner>
          <InputRange
            label={MIGRATE_AMOUNT.migrateAmount.label}
            tooltip={MIGRATE_AMOUNT.migrateAmount.tooltip}
            value={percent}
            onValueChange={setPercent}
            stops={stops ? STOPS : undefined}
            unit="%"
            disabled={disabled}
          />
          <DynamicCard.Divider />
          <DescriptionItem
            label={MIGRATE_AMOUNT.collateralMoving.label}
            labelTooltip={MIGRATE_AMOUNT.collateralMoving.tooltip}
            value={
              <>
                <AssetGroup symbols={collateral} size={20} />
                {usd(collateralUSD * share)}
              </>
            }
          />
          <DescriptionItem
            label={MIGRATE_AMOUNT.borrowMoving.label}
            labelTooltip={MIGRATE_AMOUNT.borrowMoving.tooltip}
            value={
              <>
                <TokenIcon symbol={borrowed} sx={{ fontSize: '1.25rem' }} />
                {usd(borrowUSD * share)}
              </>
            }
          />
          <DescriptionItem
            label={MIGRATE_AMOUNT.netMoving.label}
            labelTooltip={MIGRATE_AMOUNT.netMoving.tooltip}
            value={usd((collateralUSD - borrowUSD) * share)}
          />
        </DynamicCard.Inner>
      </DynamicCard>
    </PlaygroundLayout>
  );
};

const INPUT_RANGE_PROPS: PropRow[] = [
  {
    name: 'label',
    type: 'ReactNode',
    description: 'The text at the top left, e.g. "Migrate Amount".',
  },
  { name: 'tooltip', type: 'ReactNode', description: 'Adds the ⓘ after the label.' },
  {
    name: 'value',
    type: 'number',
    description: 'The current value. The box and the thumb both show it.',
  },
  {
    name: 'onValueChange',
    type: '(value: number) => void',
    description:
      'Called live while dragging, per keyboard step, and when a typed value is committed with Enter or by leaving the box. Escape drops what was typed.',
  },
  {
    name: 'onValueCommit',
    type: '(value: number) => void',
    description:
      'Called once a change settles: on release, per keyboard step, or on a typed commit. Use it for requests.',
  },
  {
    name: 'min / max / step',
    type: 'number',
    description: '0, 100 and 1 by default. Typed values are rounded to the step and kept in range.',
  },
  {
    name: 'stops',
    type: 'number[]',
    description:
      'Labels under the track, e.g. [0, 25, 50, 75, 100]. The ends line up with the track ends; the rest centre on their positions.',
  },
  { name: 'unit', type: 'string', description: 'Suffix for the box and the labels, e.g. "%".' },
  { name: 'disabled', type: 'boolean', description: 'Fades the block to 40% and turns it off.' },
];

const TOKEN_AMOUNT_INPUT_PROPS: PropRow[] = [
  { name: 'title', type: 'ReactNode', description: 'The label above the amount, e.g. "Amount".' },
  {
    name: 'titleAction',
    type: 'ReactNode',
    description: 'An optional element at the right end of the title row.',
  },
  {
    name: 'value',
    type: 'BigNumber | null',
    description:
      'The amount in token units, also while the user types in USD. null while the field is empty.',
  },
  {
    name: 'onValueChange',
    type: '(value: BigNumber | null) => void',
    description:
      "Called as the user types (decimals are capped at the token's, or 2 in USD) and on Max. Typing above max sets max.",
  },
  {
    name: 'token',
    type: '{ symbol, decimals, iconSymbol? }',
    description: 'The token chip and the decimal limit. iconSymbol overrides the icon lookup.',
  },
  {
    name: 'onChangeToken',
    type: '() => void',
    description:
      'Makes the chip a button with a chevron. Called on click, so the page can open the asset picker (SelectAssetModal). Without it the chip is static.',
  },
  {
    name: 'fiatRate',
    type: 'number',
    description:
      'USD per token. The readout under the amount is value × fiatRate; clicking it swaps the field to typing USD and back.',
  },
  { name: 'hideFiat', type: 'boolean', description: 'Hides the USD readout and its swap.' },
  {
    name: 'max',
    type: 'BigNumber',
    description: 'Shows "{label}: {max}" and the Max button, and caps typed amounts.',
  },
  {
    name: 'label',
    type: 'ReactNode',
    description: 'The text before the max, e.g. "Available to Migrate". Defaults to "Balance".',
  },
  {
    name: 'allowExceedMax',
    type: 'boolean',
    description: 'Keeps the Max button but lets the user type above max.',
  },
  { name: 'maxLabel', type: 'ReactNode', description: 'The Max button text. Defaults to "Max".' },
  { name: 'isLoading', type: 'boolean', description: 'A skeleton in place of the USD readout.' },
  {
    name: 'disabled / readOnly',
    type: 'boolean',
    description:
      'Greys the amount and turns off Max and the USD swap. disabled also makes the token chip static.',
  },
  {
    name: 'autoFocus',
    type: 'boolean',
    description: 'Focuses the amount on mount. Defaults to true, as in Aave Pro.',
  },
];

const SELECT_ASSET_MODAL_PROPS: PropRow[] = [
  {
    name: 'open / setOpen',
    type: 'boolean / (open: boolean) => void',
    description: "The modal's state, as for BasicModal. Closing calls setOpen(false).",
  },
  { name: 'title', type: 'ReactNode', description: 'The heading, e.g. "Choose Asset".' },
  {
    name: 'supportedAssets',
    type: '{ symbol, name, iconSymbol?, balance, balanceUSD }[]',
    description:
      'The main list. Each row shows the icon, name over symbol, and the balance over its USD value. Search matches name and symbol.',
  },
  {
    name: 'supportedLabel',
    type: 'ReactNode',
    description: 'The heading above that list. Defaults to "Supported Assets", as in Aave Pro.',
  },
  {
    name: 'otherAssets',
    type: 'same as supportedAssets',
    description: 'An optional second group under "More Tokens".',
  },
  { name: 'loading', type: 'boolean', description: 'Skeleton rows in place of the lists.' },
  {
    name: 'onSelect',
    type: '(asset) => void',
    description: 'Called with the picked asset (your own object back). Close the modal here.',
  },
];

const DESCRIPTION_ITEM_PROPS: PropRow[] = [
  {
    name: 'label',
    type: 'ReactNode',
    description: 'The left-hand label. A skeleton while it is undefined.',
  },
  {
    name: 'labelTooltip',
    type: 'ReactNode',
    description: 'Adds the ⓘ after the label, which opens this.',
  },
  {
    name: 'value',
    type: 'ReactNode',
    description:
      'The right-hand value: a number, a Switch, an icon and a rate… A Switch here takes the Figma look (fg-4 off track). null shows "—".',
  },
  {
    name: 'prevValue',
    type: 'ReactNode',
    description: 'Shows "prevValue → value" when the two differ, for before/after previews.',
  },
  { name: 'isLoading', type: 'boolean', description: 'A skeleton in place of the value.' },
  {
    name: 'isUpdating',
    type: 'boolean',
    description: 'Pulses the value while a new one is being worked out.',
  },
  {
    name: 'valueTone',
    type: "'primary' | 'secondary'",
    description: 'fg-1 or fg-2 value text. Defaults to primary.',
  },
  {
    name: 'forceShowDivider',
    type: 'boolean',
    description: 'Keeps the divider under the last row of a card.',
  },
];

const DYNAMIC_CARD_PARTS: PropRow[] = [
  {
    name: 'DynamicCard',
    type: 'children',
    description: 'A column of cards 1rem apart. It fades in and animates when its position moves.',
  },
  {
    name: 'DynamicCard.Inner',
    type: 'children',
    description:
      'One card surface. Rows fade in and out while its height animates; DescriptionItems get a divider between them.',
  },
  {
    name: 'DynamicCard.Divider',
    type: '—',
    description: 'A border-0 line inset 1.25rem, e.g. between the amount input and the rows.',
  },
];

export const MigrationAmountSection = () => (
  <Section
    title="Migration amount"
    description="The amount step's cards, ported from Aave Pro. A DynamicCard holds a TokenAmountInput or an InputRange, then DescriptionItem rows, one or several per card. Earn mock data: USDC, USDT and DAI at $1 and WETH at $3,500, each with its own amount available. Borrow mock data: $2,100 of collateral against $900 of debt; its tooltip text is placeholder copy. The token chip opens the asset picker modal. Everything only updates this page."
  >
    <Specimen label="As designed — the amount card and the collateral card" fullWidth>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '100%',
          maxWidth: COLUMN_WIDTH,
        }}
      >
        <AmountCard options={DEFAULT_OPTIONS} />
        <DynamicCard>
          <DynamicCard.Inner>
            <CollateralRow />
          </DynamicCard.Inner>
        </DynamicCard>
      </Box>
    </Specimen>
    <Specimen label="Playground — the snippet follows your choices" fullWidth>
      <Playground />
    </Specimen>
    <Specimen label="Borrow side — the migrate amount slider in place of the input" fullWidth>
      <BorrowSide />
    </Specimen>
    <Specimen label="TokenAmountInput props" fullWidth>
      <PropsTable rows={TOKEN_AMOUNT_INPUT_PROPS} />
    </Specimen>
    <Specimen label="SelectAssetModal props — what the token chip opens" fullWidth>
      <PropsTable rows={SELECT_ASSET_MODAL_PROPS} />
    </Specimen>
    <Specimen label="InputRange props" fullWidth>
      <PropsTable rows={INPUT_RANGE_PROPS} />
    </Specimen>
    <Specimen label="DescriptionItem props" fullWidth>
      <PropsTable rows={DESCRIPTION_ITEM_PROPS} />
    </Specimen>
    <Specimen label="DynamicCard parts" fullWidth>
      <PropsTable rows={DYNAMIC_CARD_PARTS} />
    </Specimen>
  </Section>
);
