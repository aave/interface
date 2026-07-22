/**
 * Governance cache SDK — core fetching mechanism.
 *
 * A thin, typed GraphQL transport over the governance-v3-cache server. Every
 * SDK query function goes through `request()`, so swapping the underlying
 * client (e.g. to graphql-request's GraphQLClient) is a change isolated to
 * this file.
 */
import { gql } from 'graphql-request';

// Re-exported so query modules author documents with the `gql` tag (editor
// highlighting / formatting) without importing graphql-request directly.
export { gql };

/**
 * Governance cache GraphQL endpoint.
 *
 * NOTE: the governance-v3-cache repo serves GraphQL on :3001 by default (see
 * its README). This default stays :3002 for backwards-compat with existing
 * local setups — set NEXT_PUBLIC_GOVERNANCE_CACHE_URL to reconcile.
 */
export const CACHE_ENDPOINT =
  process.env.NEXT_PUBLIC_GOVERNANCE_CACHE_URL || 'http://localhost:3002/graphql';

export interface GraphQLError {
  message: string;
  path?: Array<string | number>;
  extensions?: Record<string, unknown>;
}

/**
 * Error thrown by the governance cache SDK. Distinguishes transport failures
 * (`status` set) from GraphQL-level errors (`graphQLErrors` set) so callers /
 * React Query can branch on the failure mode.
 */
export class GovernanceCacheError extends Error {
  readonly status?: number;
  readonly graphQLErrors?: GraphQLError[];

  constructor(
    message: string,
    options?: { status?: number; graphQLErrors?: GraphQLError[]; cause?: unknown }
  ) {
    super(message);
    this.name = 'GovernanceCacheError';
    this.status = options?.status;
    this.graphQLErrors = options?.graphQLErrors;
    if (options?.cause !== undefined) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }
}

export interface RequestOptions {
  /** Abort signal forwarded to fetch. */
  signal?: AbortSignal;
  /** Override fetch (SSR / testing). Defaults to the global fetch. */
  fetchImpl?: typeof fetch;
}

interface GraphQLResponse<TData> {
  data?: TData;
  errors?: GraphQLError[];
}

/**
 * POST a GraphQL document to the governance cache and return the unwrapped
 * `data`. Throws {@link GovernanceCacheError} on network, HTTP, or GraphQL
 * errors.
 */
export async function request<TData>(
  query: string,
  variables?: Record<string, unknown>,
  options: RequestOptions = {}
): Promise<TData> {
  const fetchImpl = options.fetchImpl ?? fetch;

  let response: Response;
  try {
    response = await fetchImpl(CACHE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: options.signal,
    });
  } catch (cause) {
    throw new GovernanceCacheError('Governance cache request failed (network error)', { cause });
  }

  if (!response.ok) {
    throw new GovernanceCacheError(`Governance cache request failed: ${response.status}`, {
      status: response.status,
    });
  }

  const json = (await response.json()) as GraphQLResponse<TData>;

  if (json.errors?.length) {
    throw new GovernanceCacheError(`Governance cache GraphQL error: ${json.errors[0].message}`, {
      graphQLErrors: json.errors,
    });
  }

  if (!json.data) {
    throw new GovernanceCacheError('Governance cache returned no data');
  }

  return json.data;
}
