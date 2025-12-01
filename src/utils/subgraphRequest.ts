/**
 * Makes a GraphQL request to the subgraph via the server-side proxy
 */
export async function subgraphRequest<T>(
  subgraphType: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch('/api/subgraph-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: subgraphType,
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
