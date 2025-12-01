/**
 * Makes a GraphQL request to the subgraph via the server-side proxy
 */
export async function subgraphRequest<T>(
  subgraphId: string,
  query: string,
  variables?: Record<string, unknown>,
  gateway: 'arbitrum' | 'default' = 'default'
): Promise<T> {
  const response = await fetch('/api/subgraph-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subgraphId,
      gateway,
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
