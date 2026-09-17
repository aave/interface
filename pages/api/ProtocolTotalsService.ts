// The v3 app's own data sources are market-scoped, so whole-protocol figures
// (every Aave version, every chain) come from TokenLogic's markets snapshot.
const TOKEN_LOGIC_URL = 'https://api.tokenlogic.xyz/v1/aave/markets/latest';

// TokenLogic answers in 2-3s when healthy; fetch has no timeout of its own.
const REQUEST_TIMEOUT_MS = 5_000;

export type TokenLogicMarketRow = {
  protocol: string;
  reserve_symbol: string;
  /** Token units, not USD. Only `reserve_price` makes reserves comparable. */
  deposits: number;
  borrows: number;
  /** USD per token unit, serialised as a string. */
  reserve_price: string;
};

export type ProtocolBreakdownEntry = {
  protocol: string;
  deposits: number;
  loans: number;
};

export type ProtocolTotals = {
  deposits: number;
  loans: number;
  /** Per-protocol figures, largest deposits first. */
  breakdown: ProtocolBreakdownEntry[];
};

// Number(null) and Number('') are a finite 0, so emptiness is rejected explicitly.
// A real 0 still passes: many reserves legitimately carry borrows: 0.
const numeric = (raw: unknown, field: string, row: TokenLogicMarketRow) => {
  const where = `${row.protocol}/${row.reserve_symbol}`;
  if (raw == null || (typeof raw === 'string' && raw.trim() === '')) {
    throw new Error(`TokenLogic returned an empty ${field} for ${where}`);
  }
  const value = Number(raw);
  if (!Number.isFinite(value)) {
    throw new Error(`TokenLogic returned a non-numeric ${field} for ${where}: ${raw}`);
  }
  return value;
};

export const aggregateProtocolTotals = (rows: TokenLogicMarketRow[]): ProtocolTotals => {
  if (!rows.length) throw new Error('TokenLogic returned no market rows');

  const byProtocol = new Map<string, ProtocolBreakdownEntry>();
  let deposits = 0;
  let loans = 0;

  for (const row of rows) {
    const price = numeric(row.reserve_price, 'reserve_price', row);
    const rowDeposits = numeric(row.deposits, 'deposits', row) * price;
    const rowLoans = numeric(row.borrows, 'borrows', row) * price;

    deposits += rowDeposits;
    loans += rowLoans;

    const entry = byProtocol.get(row.protocol) ?? { protocol: row.protocol, deposits: 0, loans: 0 };
    entry.deposits += rowDeposits;
    entry.loans += rowLoans;
    byProtocol.set(row.protocol, entry);
  }

  // Zero deposits is not a state a live lending protocol can be in (a zero price on
  // every row would produce it), so it is treated as a failed read, not a figure.
  if (deposits <= 0) throw new Error('TokenLogic returned zero total deposits');

  const breakdown = [...byProtocol.values()].sort((a, b) => b.deposits - a.deposits);
  return { deposits, loans, breakdown };
};

export const fetchProtocolTotals = async (apiKey: string): Promise<ProtocolTotals> => {
  const response = await fetch(TOKEN_LOGIC_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`HTTP error: TokenLogic responded ${response.status}`);
  }

  const body = (await response.json()) as { data?: TokenLogicMarketRow[] };
  return aggregateProtocolTotals(body.data ?? []);
};
