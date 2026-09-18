import type { ProtocolBreakdownEntry } from 'src/hooks/useProtocolTotals';

const VERSION_LABELS: Record<string, string> = {
  v1: 'Aave V1',
  v2: 'Aave V2',
  v3: 'Aave V3',
  v4: 'Aave V4',
};

// TokenLogic's protocol ids are free-form; collapse them onto the Aave version they
// name so the breakdown reads "Aave V3 / Aave V4" instead of vendor identifiers.
// `_` counts as a word character, so `\b` can't delimit ids like aave_v4_ethereum.
const VERSION_PATTERN = /(?<![a-z0-9])v[1-4](?![0-9])/;

export const protocolLabel = (protocol: string) => {
  const version = protocol.toLowerCase().match(VERSION_PATTERN)?.[0];
  return (version && VERSION_LABELS[version]) || protocol;
};

/** Sums per-protocol entries into one row per Aave version, largest deposits first. */
export const groupByVersion = (breakdown: ProtocolBreakdownEntry[]) => {
  const grouped = new Map<string, ProtocolBreakdownEntry>();
  for (const entry of breakdown) {
    const label = protocolLabel(entry.protocol);
    const current = grouped.get(label) ?? { protocol: label, deposits: 0, loans: 0 };
    current.deposits += entry.deposits;
    current.loans += entry.loans;
    grouped.set(label, current);
  }
  return [...grouped.values()].sort((a, b) => b.deposits - a.deposits);
};
