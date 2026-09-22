import { aggregateProtocolTotals, TokenLogicMarketRow } from 'pages/api/ProtocolTotalsService';
import { groupByVersion, protocolLabel } from 'src/modules/markets/protocolTotalsBreakdown';

const row = (overrides: Partial<TokenLogicMarketRow>): TokenLogicMarketRow => ({
  protocol: 'aave-v3',
  reserve_symbol: 'USDC',
  deposits: 0,
  borrows: 0,
  reserve_price: '1',
  ...overrides,
});

describe('aggregateProtocolTotals', () => {
  it('prices token units into USD and groups them by protocol', () => {
    const totals = aggregateProtocolTotals([
      row({
        protocol: 'aave-v3',
        reserve_symbol: 'WETH',
        deposits: 2,
        borrows: 1,
        reserve_price: '3000',
      }),
      row({ protocol: 'aave-v3', reserve_symbol: 'USDC', deposits: 500, borrows: 0 }),
      row({
        protocol: 'aave-v4',
        reserve_symbol: 'WBTC',
        deposits: 1,
        borrows: 0.5,
        reserve_price: '60000',
      }),
    ]);

    expect(totals.deposits).toBe(6000 + 500 + 60000);
    expect(totals.loans).toBe(3000 + 30000);
    expect(totals.breakdown).toEqual([
      { protocol: 'aave-v4', deposits: 60000, loans: 30000 },
      { protocol: 'aave-v3', deposits: 6500, loans: 3000 },
    ]);
  });

  it('accepts a genuine zero borrow figure', () => {
    expect(() => aggregateProtocolTotals([row({ deposits: 10, borrows: 0 })])).not.toThrow();
  });

  it.each([null, undefined, '', '  ', 'n/a'])('rejects %p as a price', (price) => {
    expect(() =>
      aggregateProtocolTotals([row({ deposits: 10, reserve_price: price as unknown as string })])
    ).toThrow(/reserve_price/);
  });

  it('rejects an empty basket and a zero-deposit basket', () => {
    expect(() => aggregateProtocolTotals([])).toThrow(/no market rows/);
    expect(() => aggregateProtocolTotals([row({ deposits: 0, reserve_price: '0' })])).toThrow(
      /zero total deposits/
    );
  });
});

describe('protocolLabel', () => {
  it.each([
    ['aave-v3', 'Aave V3'],
    ['aave_v4_ethereum', 'Aave V4'],
    ['Aave V2 AMM', 'Aave V2'],
    ['aave-v1', 'Aave V1'],
  ])('maps %p to %p', (protocol, label) => {
    expect(protocolLabel(protocol)).toBe(label);
  });

  it('keeps an id it cannot place on a version', () => {
    expect(protocolLabel('aave-arc')).toBe('aave-arc');
    expect(protocolLabel('v42-experimental')).toBe('v42-experimental');
  });
});

describe('groupByVersion', () => {
  it('merges protocols of the same version and orders by deposits', () => {
    expect(
      groupByVersion([
        { protocol: 'aave-v4', deposits: 5, loans: 1 },
        { protocol: 'aave-v3-ethereum', deposits: 60, loans: 20 },
        { protocol: 'aave-v3-arbitrum', deposits: 10, loans: 5 },
        { protocol: 'aave-arc', deposits: 1, loans: 0 },
      ])
    ).toEqual([
      { protocol: 'Aave V3', deposits: 70, loans: 25 },
      { protocol: 'Aave V4', deposits: 5, loans: 1 },
      { protocol: 'aave-arc', deposits: 1, loans: 0 },
    ]);
  });
});
