export const SUBGRAPH_IDS = {
  'ccip-mainnet': 'E11p8T4Ff1DHZbwSUC527hkUb5innVMdTuP6A2s1xtm1',
  'ccip-arbitrum': 'GPpZfiGoDChLsiWoMG5fxXdRNEYrsVDrKJ39moGcbz6i',
  'ccip-base': '7RqaLvSMWBv4Z3xmv4kb6Jq3t59ikYG3wpcsTnLgBWzt',
  'ccip-avax': '7WRSEgg43s2CqpymK2wkHrhQjn4v5fEnufonwRkkokbM',
  'ccip-gnosis': 'CZxebNCRkL9RHpFcQcDnRdQMB4yBM8PFgz5NKEHKtrw6',
  'ccip-sepolia': '8NWTrc4S6xwaBbajongofytQfQisqYm1zR2ghGEtRFSc',
  'ccip-arb-sepolia': '8bpqvL6XBCVhN4heE9rdEwgTketeZ2U5vVGEh5fDoUEH',
  'ccip-base-sepolia': '8bpqvL6XBCVhN4heE9rdEwgTketeZ2U5vVGEh5fDoUEH',
  'ccip-ink': 'CZxebNCRkL9RHpFcQcDnRdQMB4yBM8PFgz5NKEHKtrw6',
  'gov-core': 'A7QMszgomC9cnnfpAcqZVLr2DffvkGNfimD8iUSMiurK',
  'gov-voting-mainnet': '2QPwuCfFtQ8WSCZoN3i9SmdoabMzbq2pmg4kRbrhymBV',
  'gov-voting-polygon': '72ysXwyqW9CvfqD8keWo2fEfdKZQRWGYdgC6cnvTSFKy',
  'gov-voting-avax': 'FngMWWGJV45McvV7GUBkrta9eoEi3sHZoH7MYnFQfZkr',
} as const;

export type SubgraphKey = keyof typeof SUBGRAPH_IDS;

/**
 * Makes a GraphQL request to the subgraph via the server-side proxy
 */
export async function subgraphRequest<T>(
  subgraphKey: SubgraphKey,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch('/api/subgraph-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subgraphKey,
      query,
      variables,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Subgraph request failed: ${response.status} ${response.statusText} - ${JSON.stringify(
        errorData
      )}`
    );
  }

  const data = await response.json();

  if (data.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
  }

  return data.data;
}
